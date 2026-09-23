import { HttpException, Injectable, Inject } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';
import { CameraServiceService } from 'src/camera_service/camera_service.service';
import { CameraRecorderService } from '../camera_recorder/camera_recorder.service';

import * as dtos from './camera.dtos';

import { generalResponse } from 'src/app.consts';
import { RecorderService } from 'src/recorder/recorder.service';
import { StreamService } from 'src/stream/stream.service';
import { Cron } from '@nestjs/schedule';
import { LoggerService } from 'src/logger/logger.service';
import { LicenseService } from 'src/license/license.service';
import { LprService } from 'src/lpr/lpr.service';
import { MismatchService } from 'src/mismatch/mismatch.service';
import { buildUserPermissionWhere, runWithConcurrency } from 'src/app.shared';

import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const superadminUser = { isSuperAdmin: true };

const cameraServiceCameraInclude = {
  select: {
    type: true,
    status: true,
    kafka_topic: true,
    use_kafka: true,
    use_service_ip: true,
    zmq_port: true,
    service_ip: true,
    kafka_server: true,
    state: true,
    camera_service: { select: { id: true, url: true, port: true } },
  },
};

@Injectable()
export class CameraService {
  constructor(
    private db: DbService,
    private readonly axios: HttpService,
    private cameraservice: CameraServiceService,
    private camerarecorder: CameraRecorderService,
    private recorderservice: RecorderService,
    private streamService: StreamService,
    private loggerService: LoggerService,
    private licenseService: LicenseService,
    private lprService: LprService,
    private mismatchService: MismatchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /** ONVIF service base URL without trailing slash (same as onvif.service proxy). */
  private getOnvifBase(): string {
    return (process.env.ONVIF_SERVICE || '').replace(/\/$/, '');
  }

  /** Snapshot service base URL without trailing slash. */
  private getSnapshotBase(): string {
    return (process.env.SNAPSHOT_SERVICE || '').replace(/\/$/, '');
  }

  /** Payload for ONVIF service: url, username, password (matches onvif.service proxy structure). */
  private onvifConnection(camera: { url: string; username: string; password: string }): { url: string; username: string; password: string } {
    return { url: camera.url, username: camera.username, password: camera.password };
  }

  /** Build an HttpException that passes through the ONVIF/snapshot service's
   * status code and error message so 401/502/504 reach the frontend as-is. */
  private onvifErrorResponse(error: any): HttpException {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const msg = data && typeof data === 'object' && data.error ? data.error : error?.message;
    return new HttpException({ status: false, data: null, error: data?.error ?? msg, msg }, status && status >= 400 && status <= 504 ? status : 406);
  }

  async getAll(user, query: dtos.cameraSearchQuery): Promise<generalResponse> {
    try {
      // limit query if user is not superadmin
      if (user.isSuperAdmin !== true) { query.userId = user.id; query.userFilter = 'Include' }
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = Math.min(parseInt(query.pageSize), 100) // Max 100 records per page for performance
      const where: any = { AND: [] }
      if (user.isSuperAdmin !== true) { where.deleted = false }
      if (query.search) { where['AND'].push({ OR: [
        { camera_info: { some: { key: { in: ['name', 'description', ] }, value: { contains: query.search, mode: 'insensitive' } } } },
        { url: { contains: query.search, mode: 'insensitive' } },
        { id: { contains: query.search, mode: 'insensitive' } },
      ] }) }
      if (query.userId && query.userFilter === 'Include') {
        if (query.directOnly && query.directOnly === 'true') {
          where['AND'].push({ OR: [
            { user_accounts: { some: { id: { equals: query.userId } } } }
          ] })
        } else {
          where['AND'].push({ OR: [
            { user_accounts: { some: { id: { equals: query.userId } } } },
            { user_groups: { some: { user_accounts: { some: { id: { equals: query.userId } } } } } },
            { camera_groups: { some: { user_accounts: { some: { id: { equals: query.userId } } } } } },
            { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: query.userId } } } } } } } }
          ] })
        }
      }
      if (query.userId && query.userFilter === 'Exclude') {
        if (query.directOnly && query.directOnly === 'true') {
          where['AND'].push({ AND: [
            { user_accounts: { none: { id: { equals: query.userId } } } },
          ] })
        } else {
          where['AND'].push({ AND: [
            { user_accounts: { none: { id: { equals: query.userId } } } },
            { user_groups: { none: { user_accounts: { some: { id: { equals: query.userId } } } } } },
            { camera_groups: { none: { user_accounts: { some: { id: { equals: query.userId } } } } } },
            { camera_groups: { none: { user_groups: { some: { user_accounts: { some: { id: { equals: query.userId } } } } } } } }
          ] })
        }
      }
      if (query.userGroupId && query.userGroupFilter === 'Include') { where['AND'].push({ user_groups: { some: { id: { equals: query.userGroupId } } } }) }
      if (query.userGroupId && query.userGroupFilter === 'Exclude') { where['AND'].push({ user_groups: { none: { id: { equals: query.userGroupId } } } }) }
      if (query.cameraGroupId && query.cameraGroupFilter === 'Include') { where['AND'].push({ camera_groups: { some: { id: { equals: query.cameraGroupId } } } }) }
      if (query.cameraGroupId && query.cameraGroupFilter === 'Exclude') { where['AND'].push({ camera_groups: { none: { id: { equals: query.cameraGroupId } } } }) }
      if (query.deletedIncluded && query.deletedIncluded === 'true') { where['AND'].push({}) } else { where['AND'].push({ deleted: false }) }

      if (query.cameraType?.trim()) {
        const types = query.cameraType.split(',').map((s) => s.trim().toUpperCase().replace(/^UNSPECIFIED$/, 'UNKNOWN'));
        if (types.length) { where['AND'].push({ camera_info: { some: { key: 'type', value: { in: types } } } }); }
      }
      if (query.connectionType === 'Local') { where['AND'].push({ thirdParty: false }); }
      if (query.connectionType === 'ThirdParty') { where['AND'].push({ thirdParty: true }); }
      if (query.connectionStatus === 'Connected') { where['AND'].push({ status: 'ok' }); }
      if (query.connectionStatus === 'Disconnected') { where['AND'].push({ status: { not: 'ok' } }); }
      if (query.cameraProfileType === 'Low') { where['AND'].push({ camera_info: { some: { key: 'profile_low', value: { not: '' } } } }); }
      if (query.cameraProfileType === 'High') { where['AND'].push({ camera_info: { some: { key: 'profile_high', value: { not: '' } } } }); }
      if (query.hasProfile === 'true') { where['AND'].push({ AND: [{ camera_info: { some: { key: 'profile_low', value: { not: '' } } } }, { camera_info: { some: { key: 'profile_high', value: { not: '' } } } }] }); }
      if (query.hasProfile === 'false') { where['AND'].push({ OR: [{ camera_info: { none: { key: 'profile_low', value: { not: '' } } } }, { camera_info: { none: { key: 'profile_high', value: { not: '' } } } }] }); }
      if (query.recorderStatus?.trim()) {
        const statuses = query.recorderStatus.split(',').map((s) => s.trim());
        const recorderOr: any[] = [];
        if (statuses.includes('Recording')) { recorderOr.push({ camera_recorder_camera: { some: { status: 'RUNNING' } } }); }
        if (statuses.includes('NotRecording')) { recorderOr.push({ AND: [{ camera_recorder_camera: { some: {} } }, { camera_recorder_camera: { none: { status: 'RUNNING' } } }] }); }
        if (statuses.includes('NoRecorder')) { recorderOr.push({ camera_recorder_camera: { none: {} } }); }
        if (recorderOr.length) { where['AND'].push({ OR: recorderOr }); }
      }
      if (query.ptzType?.trim()) {
        const ptzTypes = query.ptzType.split(',').map((s) => s.trim());
        const ptzOr: any[] = [];
        if (ptzTypes.includes('Fixed')) { ptzOr.push({ AND: [{ camera_info: { none: { key: 'ptz_pan_tilt', value: 'true' } } }, { camera_info: { none: { key: 'ptz_zoom', value: 'true' } } }] }); }
        if (ptzTypes.includes('Motorized')) { ptzOr.push({ camera_info: { some: { key: 'ptz_pan_tilt', value: 'true' } } }); }
        if (ptzTypes.includes('PTZ')) { ptzOr.push({ camera_info: { some: { key: 'ptz_zoom', value: 'true' } } }); }
        if (ptzOr.length) { where['AND'].push({ OR: ptzOr }); }
      }
      if (query.lprStatus?.trim()) {
        const statuses = query.lprStatus.split(',').map((s) => s.trim());
        const lprOr: any[] = [];
        if (statuses.includes('Running')) { lprOr.push({ camera_lpr_camera: { some: { status: 'RUNNING' } } }); }
        if (statuses.includes('NotRunning')) { lprOr.push({ AND: [{ camera_lpr_camera: { some: {} } }, { camera_lpr_camera: { none: { status: 'RUNNING' } } }] }); }
        if (statuses.includes('NoLpr')) { lprOr.push({ camera_lpr_camera: { none: {} } }); }
        if (lprOr.length) { where['AND'].push({ OR: lprOr }); }
      }

      const include = { camera_info: { select: { key: true, value: true } }, camera_service_camera: cameraServiceCameraInclude, camera_lpr_camera: { select: { status: true, session: true } }, camera_recorder_camera: { select: { status: true, session: true } } }
      // run query
      const [total, temp] = await this.db.$transaction([
        this.db.camera.count({ where }),
        this.db.camera.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }

  }

  async getSingle(user, id: string): Promise<generalResponse> {
    try {
      // prepare where
      const where: any = { id: id, AND: [] }
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        buildUserPermissionWhere(user, where);
        where.deleted = false
      }
      // db include
      const include = {
        camera_info: { select: { key: true, value: true } },
        camera_service_camera: cameraServiceCameraInclude,
        user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_groups: { select: { id: true, name: true } },
        camera_groups: { select: { id: true, name: true } },
      }
      // get results
      const temp: dtos.cameraDto = await this.db.camera.findUnique({ where , include });
      // check resuts
      if (!temp) { throw { message: 'Camera not found' }; }
      const response: generalResponse = { status: true, data: temp, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getHealth(user, id: string): Promise<generalResponse> {
    try {
      // prepare where
      const where = { id: id, AND: [] }
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      // get results
      const temp = await this.db.camera.findUnique({ where });
      // check resuts
      if (!temp) { throw { message: 'Camera not found' }; }
      // check for deleted
      if (temp.deleted === true) { return { status: true, data: { status: 'deleted' }, error: null, msg: null } }
      // get health (same path and payload structure as onvif.service proxy)
      const health = await this.axios.axiosRef.post(this.getOnvifBase() + '/camera', this.onvifConnection(temp), { timeout: 60 * 1000 });
      const response: generalResponse = { status: true, data: health.data, error: null, msg: null };
      return response;
    } catch (error) {
      throw this.onvifErrorResponse(error);
    }
  }

  async getProfiles(user, id: string): Promise<generalResponse> {
    try {
      // prepare where
      const where = { id: id, deleted: false, AND: [] }
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        buildUserPermissionWhere(user, where);
      }
      // get results
      const temp: dtos.cameraDto = await this.db.camera.findUnique({ where });
      // check resuts
      if (!temp) { throw { message: 'Camera not found' }; }
      // get health
      const response: generalResponse = await this.postPre(temp)
      return response;
    } catch (error) {
      // postPre already throws a proper HttpException (401/502/504 from the onvif service) — keep it
      if (error instanceof HttpException) { throw error; }
      throw this.onvifErrorResponse(error);
    }
  }

  async getSnapshot(user, id: string): Promise<generalResponse> {
    try {
      // prepare where
      const where: any = { id: id, deleted: false, AND: [] }
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      // get results
      const temp = await this.db.camera.findUnique({ where });
      if (!temp) { throw { message: 'Camera not found' }; }
      // serve a cached snapshot when one was captured recently (the frontend
      // polls every 5 seconds per open modal, this keeps camera load flat)
      const cacheKey = `camera_snapshot_${temp.id}`;
      const cached = await this.cacheManager.get<{ ext: string; data: string }>(cacheKey);
      if (cached && cached.data) {
        const response: generalResponse = { status: true, data: cached, error: null, msg: null }
        return response;
      }
      // prepare fallback RTSP url for the snapshot service
      const tempInfp = await this.db.camera_info.findMany({ where: { camera: { some: { id: temp.id } }, key: 'profile_live_rtsp' } })
      const cameraUsername = temp.username;
      const cameraPassword = temp.password;
      const cameraRTSPUrl = tempInfp[0]?.value;
      if (!cameraRTSPUrl) { throw { message: 'Camera has no live RTSP profile configured' }; }
      const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", () => `rtsp://${cameraUsername}:${cameraPassword}@`);
      // get snapshot (ONVIF first, fallback to SNAPSHOT_SERVICE)
      let snapshot: { ext: string; data: string } = null;
      try {
        const onvif_response = await this.axios.axiosRef.post(this.getOnvifBase() + '/camera/snapshot', this.onvifConnection(temp), { timeout: 60 * 1000 });
        if (onvif_response.data && onvif_response.data.data) {
          snapshot = { ext: onvif_response.data.ext ?? 'jpeg', data: onvif_response.data.data };
        } else { throw { message: 'invalid snapshot data' } }
      } catch (error) {
        if (!this.getSnapshotBase()) { throw { message: 'Snapshot service is not configured' }; }
        const snapshot_response = await this.axios.axiosRef.post(this.getSnapshotBase() + '/snapshot', { url: completeRTSP }, { timeout: 60 * 1000 });
        if (snapshot_response.data && snapshot_response.data.data) {
          snapshot = { ext: snapshot_response.data.ext ?? 'jpeg', data: snapshot_response.data.data };
        } else { throw { message: 'invalid snapshot data' } }
      }
      // cache briefly so repeated viewers share one capture
      await this.cacheManager.set(cacheKey, snapshot, 4000);
      const response: generalResponse = { status: true, data: snapshot, error: null, msg: null }
      return response;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      const msg = data && typeof data === 'object' && data.error ? data.error : error.message;
      throw new HttpException({ status: false, data: null, error: data?.error ?? msg, msg }, status >= 400 && status <= 504 ? status : 406);
    }
  }

  async putSingle(id: string, body: dtos.editCameraDto, user: any): Promise<generalResponse> {
    try {
      // prepare where
      const where = { id: id, deleted: false, AND: [] }
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        buildUserPermissionWhere(user, where);
      }
      // get results
      const temp: dtos.cameraDto = await this.db.camera.findUnique({ where });
      // check resuts
      if (!temp) { throw { message: 'Camera not found' }; }

      // Check if URL changed (IP address change)
      const urlChanged = temp.url !== body.url || temp.username !== body.username || temp.password !== body.password;
      const oldUrl = temp.url;

      await this.db.$transaction([
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'name' }, data: { value: body.name } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'type' }, data: { value: body.type } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'description' }, data: { value: body.description } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'address' }, data: { value: body.address } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'brand' }, data: { value: body.brand } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'partnumber' }, data: { value: body.partnumber } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'map_lat' }, data: { value: body.map_lat } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'map_lng' }, data: { value: body.map_lng } }),
      ])
      await this.db.camera.update({ where: { id: id }, data: { url: body.url, username: body.username, password: body.password, tcp: body.tcp }});

      const cacheKey = `camera_info_${id}`;
      await this.cacheManager.del(cacheKey)

      // If URL changed, update profiles and restart all services
      if (urlChanged) {
        try {
          // Get updated camera data for ONVIF service
          const updatedCamera = await this.db.camera.findUnique({ where: { id: id } });
          // Get profiles from ONVIF service (same path and payload as onvif.service proxy)
          const conn = this.onvifConnection(updatedCamera);
          const [onvif_response, onvif_info] = await Promise.all([
            this.axios.axiosRef.post(this.getOnvifBase() + '/camera/profiles', conn, { timeout: 60 * 1000 }),
            this.axios.axiosRef.post(this.getOnvifBase() + '/camera/info', conn, { timeout: 60 * 1000 })
          ]);
          if (onvif_response.data && onvif_response.data !== 'error' && onvif_response.data.length > 0) {
            const profiles = [];
            onvif_response.data.forEach(element => {
              profiles.push({
                profile: element.token,
                rtsp: element.stream.rtsp,
                video: element.video?.source ? true : false,
                video_framerate: element.video?.encoder?.framerate,
                video_bitrate: element.video?.encoder?.bitrate,
                video_encoding: element.video?.encoder?.encoding,
                video_width: element.video?.encoder?.resolution?.width,
                video_height: element.video?.encoder?.resolution?.height,
                audio: element.audio? true : false,
                audio_samplerate: element.audio?.encoder?.samplerate,
                audio_bitrate: element.audio?.encoder?.bitrate,
                audio_encoding: element.audio?.encoder?.encoding,
                ptz: element.ptz ? true : false
              });
            });
            // find min and max width
            const video_profiles = profiles.filter(x => { return x.video === true })
            const sorted = video_profiles.sort((a,b) => { return a.video_width < b.video_width ? 1 : -1 })
            const high = sorted.length > 0 ? sorted[0] : null
            const low = sorted.length > 0 ? sorted[sorted.length - 1] : null
            // check
            if (sorted.length < 1) { throw { message: 'no profile found on camera' } }
            // prepare
            const high_profile = high.profile
            const low_profile = low.profile
            const high_rtsp = high.rtsp
            const low_rtsp = low.rtsp
            // get ptz info
            const ptzPanTilt = onvif_info.data.PTZ.true
            const ptzZoom = onvif_info.data.PTZ.zoom
            // update
            await this.db.$transaction([
              this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_low' }, data: { value: low_profile } }),
              this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_live_rtsp' }, data: { value: low_rtsp } }),
              this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_high' }, data: { value: high_profile } }),
              this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_record_rtsp' }, data: { value: high_rtsp } }),
              this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'ptz_pan_tilt' }, data: { value: ptzPanTilt ? 'true' : 'false' } }),
              this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'ptz_zoom' }, data: { value: ptzZoom ? 'true' : 'false' } }),
            ])
          }
        } catch (error) {
          console.error('Error updating camera profiles:', error);
          // Continue even if profile update fails
        }

        // Check and restart all running services
        // 1. Stream services
        const streamServices = await this.db.camera_service_camera.findMany({ where: { camera: { some: { id: id } } } });
        const is_restart_required_live = streamServices.find(x => x.type === 'live')?.status;
        const is_restart_required_record = streamServices.find(x => x.type === 'record')?.status;

        try {
          if (is_restart_required_live) {
            await this.streamService.force_stop({ isSuperAdmin: true }, { cameraId: id, type: 'LOW' });
            await new Promise(r => setTimeout(r, 1000));
            await this.streamService.start({ isSuperAdmin: true }, { cameraId: id, type: 'LOW' });
          }
          if (is_restart_required_record) {
            await this.streamService.force_stop({ isSuperAdmin: true }, { cameraId: id, type: 'HIGH' });
            await new Promise(r => setTimeout(r, 1000));
            await this.streamService.start({ isSuperAdmin: true }, { cameraId: id, type: 'HIGH' });
          }
        } catch (streamError) {
          this.loggerService.log(`Could not restart streams after camera edit — stream worker may be down`, 1, user, undefined, undefined, id, undefined);
        }

        // 2. Recorder services
        const recorderServices = await this.db.camera_recorder_camera.findMany({ where: { camera: { some: { id: id } }, status: 'RUNNING' } });
        for (const recorder of recorderServices) {
          try {
            await this.recorderservice.stop_item({ isSuperAdmin: true }, id, recorder.id);
            await new Promise(r => setTimeout(r, 1000));
            await this.recorderservice.start_item({ isSuperAdmin: true }, id, recorder.id);
          } catch (error) {
            console.error(`Error restarting recorder ${recorder.id}:`, error);
          }
        }

        // 3. LPR services
        const lprServices = await this.db.camera_lpr_camera.findMany({ where: { camera: { some: { id: id } }, isActive: true } });
        for (const lpr of lprServices) {
          try {
            await this.lprService.stop({ isSuperAdmin: true }, id, lpr.id);
            await new Promise(r => setTimeout(r, 1000));
            await this.lprService.start({ isSuperAdmin: true }, id, lpr.id);
          } catch (error) {
            console.error(`Error restarting LPR ${lpr.id}:`, error);
          }
        }
      } else {
        // URL didn't change, only restart streams if needed (existing logic)
        const temp2 = await this.db.camera_service_camera.findMany({ where: { camera: { some: { id: id } } } });
        const is_restart_required_live = temp2.find(x => x.type === 'live')?.status;
        const is_restart_required_record = temp2.find(x => x.type === 'record')?.status;
        try {
          if (is_restart_required_live) {
            await this.streamService.force_stop({ isSuperAdmin: true }, { cameraId: id, type: 'LOW' });
            await new Promise(r => setTimeout(r, 1000));
            await this.streamService.start({ isSuperAdmin: true }, { cameraId: id, type: 'LOW' });
          }
          if (is_restart_required_record) {
            await this.streamService.force_stop({ isSuperAdmin: true }, { cameraId: id, type: 'HIGH' });
            await new Promise(r => setTimeout(r, 1000));
            await this.streamService.start({ isSuperAdmin: true }, { cameraId: id, type: 'HIGH' });
          }
        } catch (streamError) {
          this.loggerService.log(`Could not restart streams after camera edit — stream worker may be down`, 1, user, undefined, undefined, id, undefined);
        }
      }

      const cam = await this.getSingle(user, id)
      // return
      this.loggerService.log('camera edited', 0, user, undefined, undefined, id)
      return { status: true, data: cam, error: null, msg: null };
    } catch (error) {
      throw this.onvifErrorResponse(error);
    }
  }

  // POST /camera/:id/sync-capabilities - Re-read ONVIF capabilities and verify stored
  // profile selections. PTZ flags are always refreshed; a stored profile is kept when it
  // still exists on the camera, otherwise it is replaced with the auto (lowest/highest
  // resolution) profile. Never touches the camera row, credentials or running services.
  async syncCapabilities(id: string, user: any): Promise<generalResponse> {
    try {
      // prepare where
      const where = { id: id, deleted: false, AND: [] }
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        buildUserPermissionWhere(user, where);
      }
      // get results
      const camera: any = await this.db.camera.findUnique({ where });
      // check resuts
      if (!camera) { throw { message: 'Camera not found' }; }
      if (camera.thirdParty === true) { throw { message: 'Capabilities sync is not available for third-party cameras' }; }

      // Get profiles + info from ONVIF service (read-only, no side effects)
      const conn = this.onvifConnection(camera);
      const [onvif_response, onvif_info] = await Promise.all([
        this.axios.axiosRef.post(this.getOnvifBase() + '/camera/profiles', conn, { timeout: 60 * 1000 }),
        this.axios.axiosRef.post(this.getOnvifBase() + '/camera/info', conn, { timeout: 60 * 1000 })
      ]);
      if (!onvif_response.data || onvif_response.data === 'error' || onvif_response.data.length === 0) {
        throw { message: 'No profiles returned from camera' };
      }

      const profiles = [];
      onvif_response.data.forEach(element => {
        profiles.push({
          profile: element.token,
          rtsp: element.stream.rtsp,
          video: element.video?.source ? true : false,
          video_framerate: element.video?.encoder?.framerate,
          video_bitrate: element.video?.encoder?.bitrate,
          video_encoding: element.video?.encoder?.encoding,
          video_width: element.video?.encoder?.resolution?.width,
          video_height: element.video?.encoder?.resolution?.height,
          audio: element.audio ? true : false,
          audio_samplerate: element.audio?.encoder?.samplerate,
          audio_bitrate: element.audio?.encoder?.bitrate,
          audio_encoding: element.audio?.encoder?.encoding,
          ptz: element.ptz ? true : false
        });
      });

      // auto fallback values: lowest resolution = live/low, highest = record/high
      const video_profiles = profiles.filter(x => { return x.video === true })
      const sorted = video_profiles.sort((a, b) => { return a.video_width < b.video_width ? 1 : -1 })
      if (sorted.length < 1) { throw { message: 'no profile found on camera' } }
      const autoHigh = sorted[0]
      const autoLow = sorted[sorted.length - 1]

      // current stored selections
      const infoRows = await this.db.camera_info.findMany({ where: { camera: { some: { id: id } } } });
      const getInfo = (key: string) => infoRows.find(x => x.key === key)?.value || '';

      // keep a stored profile only when it still exists on the camera
      const storedLow = getInfo('profile_low');
      const lowValid = storedLow !== '' && profiles.some(x => x.profile === storedLow);
      const lowRow: any = lowValid ? profiles.find(x => x.profile === storedLow) : null;
      const low_profile = lowRow ? lowRow.profile : autoLow.profile;
      const low_rtsp = lowRow ? (lowRow.rtsp || autoLow.rtsp) : autoLow.rtsp;

      const storedHigh = getInfo('profile_high');
      const highValid = storedHigh !== '' && profiles.some(x => x.profile === storedHigh);
      const highRow: any = highValid ? profiles.find(x => x.profile === storedHigh) : null;
      const high_profile = highRow ? highRow.profile : autoHigh.profile;
      const high_rtsp = highRow ? (highRow.rtsp || autoHigh.rtsp) : autoHigh.rtsp;

      // ptz capabilities straight from the camera
      const ptz = onvif_info.data && onvif_info.data.PTZ;
      if (!ptz) { throw { message: 'Camera info returned no PTZ capability data' }; }
      const ptzPanTilt = ptz.true === true;
      const ptzZoom = ptz.zoom === true;

      await this.db.$transaction([
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_low' }, data: { value: low_profile } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_live_rtsp' }, data: { value: low_rtsp } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_high' }, data: { value: high_profile } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_record_rtsp' }, data: { value: high_rtsp } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'ptz_pan_tilt' }, data: { value: ptzPanTilt ? 'true' : 'false' } }),
        this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'ptz_zoom' }, data: { value: ptzZoom ? 'true' : 'false' } }),
      ])

      // bust cached camera info so the UI reflects the fresh values
      const cacheKey = `camera_info_${id}`;
      await this.cacheManager.del(cacheKey)

      this.loggerService.log('camera capabilities synced', 0, user, undefined, undefined, id)

      return {
        status: true,
        data: {
          ptz_pan_tilt: ptzPanTilt,
          ptz_zoom: ptzZoom,
          profile_low: low_profile,
          profile_high: high_profile,
          profiles_replaced: { low: !lowValid, high: !highValid },
        },
        error: null,
        msg: null,
      };
    } catch (error) {
      throw this.onvifErrorResponse(error);
    }
  }

  async putSingleProfile(id: string, body: dtos.editCameraProfileDto, user: any): Promise<generalResponse> {
    try {
      // prepare where
      const where = { id: id, deleted: false, AND: [] }
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        buildUserPermissionWhere(user, where);
      }
      // get results
      const temp: dtos.cameraDto = await this.db.camera.findUnique({ where });
      // check resuts
      if (!temp) { throw { message: 'camera not found or user has no access to camera' }; }
      // check if restart is required
      const temp2 = await this.db.camera_service_camera.findMany({ where: { camera: { some: { id: temp.id } } } })
      // Optimize: Use find() instead of filter+map chains
      const is_restart_required_live = temp2.find(x => x.type === 'live')?.status
      const is_restart_required_record = temp2.find(x => x.type === 'record')?.status
      // get profiles from onvif service (same path and payload as onvif.service proxy)
      const conn = this.onvifConnection(temp);
      const [ onvif_response, onvif_info ] = await Promise.all([
        this.axios.axiosRef.post(this.getOnvifBase() + '/camera/profiles', conn, { timeout: 60 * 1000 }),
        this.axios.axiosRef.post(this.getOnvifBase() + '/camera/info', conn, { timeout: 60 * 1000 })
      ]);
      if (onvif_response.data && onvif_response.data !== 'error' && onvif_response.data.length > 0) {
        // get profile rtsp data
        const high = onvif_response.data.filter(x => x.token === body.profile_high).map(x => { return x.stream?.rtsp })
        if (high.length < 1) { throw { message: 'High profile is not valid' }; }
        const low = onvif_response.data.filter(x => x.token === body.profile_low).map(x => { return x.stream?.rtsp })
        if (low.length < 1) { throw { message: 'Low profile is not valid' }; }
        // add camera to db
        try {
          if (is_restart_required_live) {
            await this.streamService.force_stop({ isSuperAdmin: true }, { cameraId: id, type: 'LOW' })
            await new Promise(r => setTimeout(r, 1000))
          }
          if (is_restart_required_record) {
            await this.streamService.force_stop({ isSuperAdmin: true }, { cameraId: id, type: 'HIGH' })
            await new Promise(r => setTimeout(r, 1000))
          }
          // update
          await this.db.$transaction([
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_low' }, data: { value: body.profile_low } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_live_rtsp' }, data: { value: low[0] } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_high' }, data: { value: body.profile_high } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_record_rtsp' }, data: { value: high[0] } }),
          ])
          try {
            if (is_restart_required_live || is_restart_required_record) {
              // start stream
              await this.streamService.start({ isSuperAdmin: true }, { cameraId: id, type: 'LOW' })
              await this.streamService.start({ isSuperAdmin: true }, { cameraId: id, type: 'HIGH' })
            }
          } catch (streamError) {
            this.loggerService.log(`Could not restart streams after profile edit — stream worker may be down`, 1, user, undefined, undefined, id, undefined);
          }
          // reset cache
          const cacheKey = `camera_info_${id}`;
          await this.cacheManager.del(cacheKey)
          const cam = await this.getSingle(user, id)
          // generate response
          this.loggerService.log('camera profile edited', 0, user, undefined, undefined, id)
          const response: generalResponse = { status: true, data: cam, error: null, msg: null };
          return response;
        } catch (error) {
          throw { message: error.message || 'Error updating camera' };
        }
      } else {
        throw { message: 'invalid onvif data' }
      }
    } catch (error) {
      throw this.onvifErrorResponse(error);
    }
  }

  async isAdded(body: dtos.postPreCameraDto): Promise<generalResponse> {
    try {
      const c = await this.db.camera.findMany({ where: { url: body.url, deleted: false } })
      // generate response
      const response: generalResponse = { status: c.length > 0 ? true : false, data: null, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postPre(body: dtos.postPreCameraDto): Promise<generalResponse> {
    try {
      // get profiles from onvif service (body has url, username, password; same path as onvif.service proxy)
      const onvif_response = await this.axios.axiosRef.post(this.getOnvifBase() + '/camera/profiles', body, { timeout: 60 * 1000 });
      if (onvif_response.data && onvif_response.data !== 'error' && onvif_response.data.length > 0) {
        const profiles = [];
        onvif_response.data.forEach(element => {
          profiles.push({
            profile: element.token,
            rtsp: element.stream.rtsp,
            video: element.video?.source ? true : false,
            video_framerate: element.video?.encoder?.framerate,
            video_bitrate: element.video?.encoder?.bitrate,
            video_encoding: element.video?.encoder?.encoding,
            video_width: element.video?.encoder?.resolution?.width,
            video_height: element.video?.encoder?.resolution?.height,
            audio: element.audio? true : false,
            audio_samplerate: element.audio?.encoder?.samplerate,
            audio_bitrate: element.audio?.encoder?.bitrate,
            audio_encoding: element.audio?.encoder?.encoding,
            ptz: element.ptz ? true : false
          });
        });
        // find min and max width
        const video_profiles = profiles.filter(x => { return x.video === true })
        const sorted = video_profiles.sort((a,b) => { return a.video_width < b.video_width ? 1 : -1 })
        const high = sorted.length > 0 ? sorted[0] : null
        const low = sorted.length > 0 ? sorted[sorted.length - 1] : null
        // generate response
        const response: generalResponse = { status: true, data: { high, low, all: profiles }, error: null, msg: null };
        return response;

      } else {
        throw { message: 'invalid onfiv data' }
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.response?.data?.error ? error.response?.data?.error : error.message }, 406);
    }
  }

  async postSingle(user: any, body: dtos.postCameraDto): Promise<generalResponse> {
    try {
      // check license
      if (await this.licenseService.can_add_new_camera() === false) { throw { message: 'License limit' }; }
      // get profiles from onvif service (body has url, username, password; same path as onvif.service proxy)
      const [ onvif_response, onvif_info ] = await Promise.all([
        this.axios.axiosRef.post(this.getOnvifBase() + '/camera/profiles', body, { timeout: 60 * 1000 }),
        this.axios.axiosRef.post(this.getOnvifBase() + '/camera/info', body, { timeout: 60 * 1000 })
      ]);
      if (onvif_response.data && onvif_response.data !== 'error' && onvif_response.data.length > 0) {
        const profiles = [];
        onvif_response.data.forEach(element => {
          profiles.push({
            profile: element.token,
            rtsp: element.stream.rtsp,
            video: element.video?.source ? true : false,
            video_framerate: element.video?.encoder?.framerate,
            video_bitrate: element.video?.encoder?.bitrate,
            video_encoding: element.video?.encoder?.encoding,
            video_width: element.video?.encoder?.resolution?.width,
            video_height: element.video?.encoder?.resolution?.height,
            audio: element.audio? true : false,
            audio_samplerate: element.audio?.encoder?.samplerate,
            audio_bitrate: element.audio?.encoder?.bitrate,
            audio_encoding: element.audio?.encoder?.encoding,
            ptz: element.ptz ? true : false
          });
        });
        // find min and max width
        const video_profiles = profiles.filter(x => { return x.video === true })
        const sorted = video_profiles.sort((a,b) => { return a.video_width < b.video_width ? 1 : -1 })
        const high = sorted.length > 0 ? sorted[0] : null
        const low = sorted.length > 0 ? sorted[sorted.length - 1] : null
        // check
        if (sorted.length < 1) { throw { message: 'no profile found on camera' } }
        // prepare
        const high_profile = high.profile
        const low_profile = low.profile
        const high_rtsp = high.rtsp
        const low_rtsp = low.rtsp
        const cameraserviceID = await this.cameraservice.resolveCameraServiceIdForAdd({
          cameraServiceId: body.cameraServiceId,
          autoAssign: body.autoAssign,
        })
        // get ptz info
        const ptzPanTilt = onvif_info.data.PTZ.true
        const ptzZoom = onvif_info.data.PTZ.zoom
        // make sure port is included in url to prevent duplication
        if (body.url.includes(':')) { body.url = body.url } else { body.url = body.url + ':80' }
        // check for duplicate camera (excluding deleted cameras)
        if (await this.db.camera.count({ where: { url: body.url, deleted: false } })) { throw { message: 'Camera already added.' } }
        // add camera to db
        try {
          const temp: dtos.cameraDto = await this.db.camera.create({
            data: {
              url: body.url, username: body.username, password: body.password, tcp: body.tcp,
              camera_info: {
                create: [
                  { key: 'name', value: body.name },
                  { key: 'type', value: body.type },
                  { key: 'description', value: body.description },
                  { key: 'address', value: body.address },
                  { key: 'brand', value: body.brand },
                  { key: 'partnumber', value: body.partnumber },
                  { key: 'map_lat', value: body.map_lat },
                  { key: 'map_lng', value: body.map_lng },
                  { key: 'profile_low', value: low_profile },
                  { key: 'profile_live_rtsp', value: low_rtsp },
                  { key: 'profile_high', value: high_profile },
                  { key: 'profile_record_rtsp', value: high_rtsp },
                  { key: 'ptz_pan_tilt', value: ptzPanTilt ? 'true' : 'false' },
                  { key: 'ptz_zoom', value: ptzZoom? 'true' : 'false' }
                ]
              }
            }});
          await this.cameraservice.assignCameraToService(temp.id, cameraserviceID)
          // generate response
          this.loggerService.log('camera added', 0, user, undefined, undefined, temp.id)
          const response: generalResponse = { status: true, data: temp, error: null, msg: null };
          return response;
        } catch (error) {
          throw { message: error.message || 'Error adding camera' };
        }
      } else {
        throw { message: 'invalid onvif data' }
      }
    } catch (error) {
      throw this.onvifErrorResponse(error);
    }
  }

  async postFastRegister(user: any, body: dtos.postPreCameraDto): Promise<generalResponse> {
    try {
      // check license
      if (await this.licenseService.can_add_new_camera() === false) { throw { message: 'License limit' }; }
      // get profiles from onvif service (body has url, username, password; same path as onvif.service proxy)
      const [ onvif_response, onvif_info ] = await Promise.all([
        this.axios.axiosRef.post(this.getOnvifBase() + '/camera/profiles', body, { timeout: 60 * 1000 }),
        this.axios.axiosRef.post(this.getOnvifBase() + '/camera/info', body, { timeout: 60 * 1000 })
      ]);
      if (onvif_response.data && onvif_response.data !== 'error' && onvif_response.data.length > 0) {
        const profiles = [];
        onvif_response.data.forEach(element => {
          profiles.push({
            profile: element.token,
            rtsp: element.stream.rtsp,
            video: element.video?.source ? true : false,
            video_framerate: element.video?.encoder?.framerate,
            video_bitrate: element.video?.encoder?.bitrate,
            video_encoding: element.video?.encoder?.encoding,
            video_width: element.video?.encoder?.resolution?.width,
            video_height: element.video?.encoder?.resolution?.height,
            audio: element.audio? true : false,
            audio_samplerate: element.audio?.encoder?.samplerate,
            audio_bitrate: element.audio?.encoder?.bitrate,
            audio_encoding: element.audio?.encoder?.encoding,
            ptz: element.ptz ? true : false
          });
        });
        // find min and max width
        const video_profiles = profiles.filter(x => { return x.video === true })
        const sorted = video_profiles.sort((a,b) => { return a.video_width < b.video_width ? 1 : -1 })
        const high = sorted.length > 0 ? sorted[0] : null
        const low = sorted.length > 0 ? sorted[sorted.length - 1] : null
        // check
        if (sorted.length < 1) { throw { message: 'no profile found on camera' } }
        // prepare
        const high_profile = high.profile
        const low_profile = low.profile
        const high_rtsp = high.rtsp
        const low_rtsp = low.rtsp
        const cameraserviceID = await this.cameraservice.resolveCameraServiceIdForAdd({
          cameraServiceId: body.cameraServiceId,
          autoAssign: body.autoAssign,
        })
        // get ptz info
        const ptzPanTilt = onvif_info.data.PTZ.true
        const ptzZoom = onvif_info.data.PTZ.zoom
        // make sure port is included in url to prevent duplication
        if (body.url.includes(':')) { body.url = body.url } else { body.url = body.url + ':80' }
        // check for duplicate camera (excluding deleted cameras)
        if (await this.db.camera.count({ where: { url: body.url, deleted: false } })) { throw { message: 'Camera already added.' } }
        // add
        const temp: dtos.cameraDto = await this.db.camera.create({
            data: {
              url: body.url, username: body.username, password: body.password, tcp: true,
            camera_info: {
              create: [
                { key: 'name', value: body.url },
                { key: 'type', value: 'UNKNOWN' },
                { key: 'description', value: '' },
                { key: 'address', value: '' },
                { key: 'brand', value: '' },
                { key: 'partnumber', value: '' },
                { key: 'map_lat', value: '' },
                { key: 'map_lng', value: '' },
                { key: 'profile_low', value: low_profile },
                { key: 'profile_live_rtsp', value: low_rtsp },
                { key: 'profile_high', value: high_profile },
                { key: 'profile_record_rtsp', value: high_rtsp },
                { key: 'ptz_pan_tilt', value: ptzPanTilt ? 'true' : 'false' },
                { key: 'ptz_zoom', value: ptzZoom? 'true' : 'false' }
              ]
            }
          }});
        await this.cameraservice.assignCameraToService(temp.id, cameraserviceID)
        // generate response
        this.loggerService.log('camera addeed', 0, user, undefined, undefined, temp.id)
        const response: generalResponse = { status: true, data: temp, error: null, msg: null };
        return response;

      } else {
        throw { message: 'invalid onfiv data' }
      }
    } catch (error) {
      throw this.onvifErrorResponse(error);
    }
  }

  async postRegisterByRtsp(user: any, body: dtos.postCameraDto): Promise<generalResponse> {
    try {
      // check license
      if (await this.licenseService.can_add_new_camera() === false) { throw { message: 'License limit' }; }
      const cameraserviceID = await this.cameraservice.resolveCameraServiceIdForAdd({
        cameraServiceId: body.cameraServiceId,
        autoAssign: body.autoAssign,
      })
      // make sure port is included in url to prevent duplication
      if (body.url.includes(':')) { body.url = body.url } else { body.url = body.url + ':80' }
      // check for duplicate camera
      if (await this.db.camera.count({ where: { url: body.url, deleted: false } })) { throw { message: 'Camera already added.' } }
      // add camera to db
      try {
        const temp: dtos.cameraDto = await this.db.camera.create({
          data: {
            url: body.url, username: body.username, password: body.password, tcp: body.tcp, thirdParty: true,
            camera_info: {
              create: [
                { key: 'name', value: body.name },
                { key: 'type', value: body.type },
                { key: 'description', value: body.description },
                { key: 'address', value: body.address },
                { key: 'brand', value: body.brand },
                { key: 'partnumber', value: body.partnumber },
                { key: 'map_lat', value: body.map_lat },
                { key: 'map_lng', value: body.map_lng },
                { key: 'profile_low', value: 'Locked' },
                { key: 'profile_live_rtsp', value: body.profile_low },
                { key: 'profile_high', value: 'Locked' },
                { key: 'profile_record_rtsp', value: body.profile_high },
                { key: 'ptz_pan_tilt', value: 'false' },
                { key: 'ptz_zoom', value: 'false' }
              ]
            }
          }});
        await this.cameraservice.assignCameraToService(temp.id, cameraserviceID)
        // generate response
        this.loggerService.log('camera added', 0, user, undefined, undefined, temp.id)
        const response: generalResponse = { status: true, data: temp, error: null, msg: null };
        return response;
      } catch (error) {
        // generate response
        const response: generalResponse = { status: false, data: null, error: 'error_adding_camera', msg: error };
        return response;
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putCameraService(user: any, id: string, body: dtos.reassignCameraServiceDto): Promise<generalResponse> {
    try {
      const where = { id, deleted: false, AND: [] as any[] };
      if (user.isSuperAdmin !== true) {
        buildUserPermissionWhere(user, where);
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw { message: 'camera not found or user has no access to camera' }; }

      const rows = await this.db.camera_service_camera.findMany({
        where: { camera: { some: { id } } },
        include: { camera_service: { select: { id: true } } },
      });
      const liveRow = rows.find((x) => x.type === 'live');
      const recordRow = rows.find((x) => x.type === 'record');
      if (!liveRow || !recordRow) { throw { message: 'Stream service not configured for this camera' }; }

      const currentServiceId = liveRow.camera_service[0]?.id;
      if (currentServiceId === body.cameraServiceId) {
        return this.getSingle(user, id);
      }

      const wasLiveActive = liveRow.status;
      const wasRecordActive = recordRow.status;
      const restartActiveStreams = body.restartActiveStreams !== false;

      await this.streamService.force_stop(superadminUser, { cameraId: id, type: 'LOW' });
      await this.streamService.force_stop(superadminUser, { cameraId: id, type: 'HIGH' });
      await new Promise((r) => setTimeout(r, 1000));

      await this.cameraservice.reassignCameraServiceRows(liveRow.id, recordRow.id, body.cameraServiceId);

      if (restartActiveStreams) {
        if (wasLiveActive) {
          await this.streamService.restart({ cameraId: id, type: 'LOW' });
        }
        if (wasRecordActive) {
          await this.streamService.restart({ cameraId: id, type: 'HIGH' });
        }
      }

      this.loggerService.log('camera service reassigned', 0, user, undefined, undefined, id);
      return this.getSingle(user, id);
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteSingle(user, id: string, query?: dtos.cameraDeleteQuery): Promise<generalResponse> {
    try {
      const mode = query?.mode === 'soft' ? 'soft' : 'hard'
      // prepare where
      const where: any = { id: id, AND: [] }
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      // get results
      const camOk: any = await this.db.camera.findUnique({ where });
      // check resuts
      if (!camOk) { throw { message: 'Camera not found' }; }
      // check for double soft delete
      if (mode === 'soft' && camOk.deleted === true) { throw { message: 'Camera already deleted' }; }

      let lprSessionIds: string[] = []
      // stop operational services only for cameras that are not yet soft-deleted
      if (camOk.deleted !== true) {
        // stop live
        await this.streamService.stop({ isSuperAdmin: true }, { cameraId: id, type: 'LOW' })
        // stop high
        await this.streamService.stop({ isSuperAdmin: true }, { cameraId: id, type: 'HIGH' })
        // stop recorder
        await this.recorderservice.delete_all(user, id)

        // LPR and mismatch reference this camera (FK RESTRICT); stop them then delete in transaction
        const lprList = await this.db.camera_lpr_camera.findMany({
          where: { camera: { some: { id } } },
          select: { id: true, session: true }
        })
        for (const lpr of lprList) {
          try {
            await this.lprService.stop(superadminUser, id, lpr.id)
          } catch {
            // continue so we still remove DB rows
          }
        }

        const mismatchList = await this.db.mismatch.findMany({
          where: { OR: [{ camera1_id: id }, { camera2_id: id }] },
          select: { id: true }
        })
        for (const m of mismatchList) {
          try {
            await this.mismatchService.stop(superadminUser, m.id)
          } catch {
            // continue so we still remove DB rows
          }
        }

        lprSessionIds = lprList.map((s) => s.session).filter(Boolean)
      }

      if (mode === 'soft') {
        // soft delete: remove operational links but keep camera row, camera_info, bookmarks and lpr_result history
        await this.db.$transaction([
          this.db.camera_service_camera.deleteMany({ where: { camera: { some: { id } } } }),
          this.db.camera_recorder_camera.deleteMany({ where: { camera: { some: { id } } } }),
          this.db.mismatch.deleteMany({ where: { OR: [{ camera1_id: id }, { camera2_id: id }] } }),
          this.db.camera_lpr_camera.deleteMany({ where: { camera: { some: { id } } } }),
        ])
        // soft delete camera: free the unique url for re-registration, blank credentials and drop all assignments
        const temp: dtos.cameraDto = await this.db.camera.update({ where: { id }, data: {
          deleted: true,
          url: id,
          username: '',
          password: '',
          user_accounts: { set: [] },
          user_groups: { set: [] },
          camera_groups: { set: [] },
        } });
        this.loggerService.log('camera soft deleted', 0, user, undefined, undefined, id)
        // reset cache
        await this.cacheManager.del(`camera_info_${id}`)
        for (const sessionId of lprSessionIds) {
          await this.cacheManager.del(`camera_lpr_session_${sessionId}`)
        }
        const response: generalResponse = { status: true, data: temp, error: null, msg: null };
        return response;
      }

      // hard delete: remove all related data (mismatch has RESTRICT, join tables CASCADE on camera)
      await this.db.$transaction([
        this.db.camera_info.deleteMany({ where: { camera: { some: { id } } } }),
        this.db.camera_service_camera.deleteMany({ where: { camera: { some: { id } } } }),
        this.db.camera_recorder_camera.deleteMany({ where: { camera: { some: { id } } } }),
        this.db.mismatch.deleteMany({ where: { OR: [{ camera1_id: id }, { camera2_id: id }] } }),
        this.db.camera_lpr_camera.deleteMany({ where: { camera: { some: { id } } } }),
      ])
      // delete camera
      const temp: dtos.cameraDto = await this.db.camera.delete({ where: { id } });
      // reset cache
      await this.cacheManager.del(`camera_info_${id}`)
      for (const sessionId of lprSessionIds) {
        await this.cacheManager.del(`camera_lpr_session_${sessionId}`)
      }
      // generate response
      this.loggerService.log('camera removed', 0, user, undefined, undefined, id)
      const response: generalResponse = { status: true, data: temp, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }


  @Cron('*/2 * * * *')
  async handleCron() {
    if (process.env.NODE_ENV) { return true }
    try {
      console.debug('scanning cameras ...', new Date().toString());
      const cameras = await this.db.camera.findMany({ where: { deleted: false } });
      await this.db.camera.updateMany({ where: { deleted: false }, data: { status: 'loading' } })
      const concurrencyLimit = 15;
      await runWithConcurrency(cameras, concurrencyLimit, async (element: { id: string; url: string; username: string; password: string; status?: string }) => {
        try {
          const health = await this.axios.axiosRef.post(this.getOnvifBase() + '/camera', this.onvifConnection(element), { timeout: 60 * 1000 });
          if (health.data.status === 'up') {
            await this.db.camera.update({ where: { id: element.id }, data: { status: 'ok' } })
            if (element.status.includes('error')) {
              this.loggerService.log(`Camera connected`, 1, undefined, undefined, undefined, element.id, undefined);
            }
          } else {
            await this.db.camera.update({ where: { id: element.id }, data: { status: 'error: ' + health.data.error } })
            if (element.status === 'ok') {
              this.loggerService.log_and_notify_admins(`Camera disconnected: ${health.data.error || 'unknown error'}`, 1, undefined, undefined, undefined, element.id, undefined);
            }
          }
        } catch (e2) {
          await this.db.camera.update({ where: { id: element.id }, data: { status: 'error: Network error' } })
          if (element.status === 'ok') {
            this.loggerService.log_and_notify_admins(`Camera disconnected: Network error`, 1, undefined, undefined, undefined, element.id, undefined);
          }
          if (e2 === 1) { console.log(true) }
        }
      });
      await this.db.camera.updateMany({ where: { deleted: false, status: 'loading' },  data: { status: 'error' } })
    } catch (error) {
      console.log('error scanning cameras', error)
    }
  }

}
