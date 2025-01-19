import { HttpException, Injectable } from '@nestjs/common';

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

@Injectable()
export class CameraService {
  constructor(private db: DbService, private readonly axios: HttpService, private cameraservice: CameraServiceService, private camerarecorder: CameraRecorderService, private recorderservice: RecorderService, private streamService: StreamService, private loggerService: LoggerService ) {}

  async getAll(user, query: dtos.cameraSearchQuery): Promise<generalResponse> {
    try {
      // limit query if user is not superadmin
      if (user.isSuperAdmin !== true) { query.userId = user.id; query.userFilter = 'Include' }
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
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

      const include = { camera_info: { select: { key: true, value: true } }, camera_service_camera: { select: { type: true,  status: true, port: true } }, camera_recorder_camera: { select: { status: true, session: true } } }
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
      // db include
      const include = {
        camera_info: { select: { key: true, value: true } },
        camera_service_camera: { select: { type: true,  status: true, port: true } },
        user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_groups: { select: { id: true, name: true } },
        camera_groups: { select: { id: true, name: true } },
      }
      // get results
      const temp: dtos.cameraDto = await this.db.camera.findUnique({ where , include });
      // check resuts
      if (!temp) { return { status: false, data: null, error: null, msg: null }; }
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
      const temp: dtos.cameraDto = await this.db.camera.findUnique({ where });
      // check resuts
      if (!temp) { return { status: false, data: null, error: null, msg: null }; }
      // get health
      const health = await this.axios.axiosRef.post(process.env.ONVIF_SERVICE + '/camera', temp);
      const response: generalResponse = { status: true, data: health.data, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getProfiles(user, id: string): Promise<generalResponse> {
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
      const temp: dtos.cameraDto = await this.db.camera.findUnique({ where });
      // check resuts
      if (!temp) { return { status: false, data: null, error: null, msg: null }; }
      // get health
      const response: generalResponse = await this.postPre(temp)
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putSingle(id: string, body: dtos.postCameraDto, user: any): Promise<generalResponse> {
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
      const temp: dtos.cameraDto = await this.db.camera.findUnique({ where });
      // check resuts
      if (!temp) { return { status: false, data: null, error: null, msg: null }; }
      // check if restart is required
      const temp2 = await this.db.camera_service_camera.findMany({ where: { camera: { some: { id: temp.id } } } })
      const is_restart_required = temp2.filter(x => x.type === 'live').map(x => { return x.status })[0] || temp2.filter(x => x.type === 'record').map(x => { return x.status })[0]
      // get profiles from onvif service
      const [ onvif_response, onvif_info ] = await Promise.all([this.axios.axiosRef.post(process.env.ONVIF_SERVICE + '/camera/profiles', body), this.axios.axiosRef.post(process.env.ONVIF_SERVICE + '/camera/info', body)]);
      if (onvif_response.data && onvif_response.data !== 'error' && onvif_response.data.length > 0) {
        // get profile rtsp data
        const high = onvif_response.data.filter(x => x.token === body.profile_high).map(x => { return x.stream?.rtsp })
        if (high.length < 1) { return { status: false, data: null, error: 'error_adding_camera', msg: 'High profile is not valid' }; }
        const low = onvif_response.data.filter(x => x.token === body.profile_low).map(x => { return x.stream?.rtsp })
        if (low.length < 1) { return { status: false, data: null, error: 'error_adding_camera', msg: 'Low profile is not valid' }; }
        // camera service
        const cameraserviceID = await this.cameraservice.getFreeCameraServiceId()
        if (!cameraserviceID) { return { status: false, data: null, error: 'error_adding_camera', msg: 'No free camera serive available' }; }
        // get ptz info
        const ptzPanTilt = onvif_info.data.ptz.range.x.min !== onvif_info.data.ptz.range.x.max && onvif_info.data.ptz.range.y.min !== onvif_info.data.ptz.range.y.max
        const ptzZoom = onvif_info.data.ptz.range.z.min !== onvif_info.data.ptz.range.z.max
        // add camera to db
        try {
          if (is_restart_required) {
            // stop stream
            await this.streamService.force_stop({ isSuperAdmin: true }, { cameraId: id, type: 'LOW' })
            await this.streamService.force_stop({ isSuperAdmin: true }, { cameraId: id, type: 'HIGH' })
            // wait
            await new Promise(r => setTimeout(r, 1000))
          }
          // update
          await this.db.$transaction([
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'name' }, data: { value: body.name } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'type' }, data: { value: body.type } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'description' }, data: { value: body.description } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'address' }, data: { value: body.address } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'brand' }, data: { value: body.brand } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'partnumber' }, data: { value: body.partnumber } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'map_lat' }, data: { value: body.map_lat } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'map_lng' }, data: { value: body.map_lng } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_low' }, data: { value: body.profile_low } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_live_rtsp' }, data: { value: low[0] } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_high' }, data: { value: body.profile_high } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'profile_record_rtsp' }, data: { value: high[0] } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'ptz_pan_tilt' }, data: { value: ptzPanTilt ? 'true' : 'false' } }),
            this.db.camera_info.updateMany({ where: { camera: { some: { id: id } }, key: 'ptz_zoom' }, data: { value: ptzZoom? 'true' : 'false' } }),
          ])
          const temp2: dtos.cameraDto = await this.db.camera.update({
            where: { id: id },
            data: { url: body.url, username: body.username, password: body.password }});
          if (is_restart_required) {
            // start stream
            await this.streamService.start({ isSuperAdmin: true }, { cameraId: temp2.id, type: 'LOW' })
            await this.streamService.start({ isSuperAdmin: true }, { cameraId: temp2.id, type: 'HIGH' })
          }
          // generate response
          const response: generalResponse = { status: true, data: temp2, error: null, msg: null };
          return response;
        } catch (error) {
          // generate response
          const response: generalResponse = { status: false, data: null, error: 'error_updating_camera', msg: error };
          return response;
        }
      } else {
        throw { message: 'invalid onvif data' }
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async isAdded(body: dtos.postPreCameraDto): Promise<generalResponse> {
    try {
      const c = await this.db.camera.findMany({ where: { url: body.url } })
      // generate response
      const response: generalResponse = { status: c.length > 0 ? true : false, data: null, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postPre(body: dtos.postPreCameraDto): Promise<generalResponse> {
    try {
      // get profiles from onvif service
      const onvif_response = await this.axios.axiosRef.post(process.env.ONVIF_SERVICE + '/camera/profiles', body);
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
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postSingle(body: dtos.postCameraDto): Promise<generalResponse> {
    try {
      // get profiles from onvif service
      const [ onvif_response, onvif_info ] = await Promise.all([this.axios.axiosRef.post(process.env.ONVIF_SERVICE + '/camera/profiles', body), this.axios.axiosRef.post(process.env.ONVIF_SERVICE + '/camera/info', body)]);
      if (onvif_response.data && onvif_response.data !== 'error' && onvif_response.data.length > 0) {
        // get profile rtsp data
        const high = onvif_response.data.filter(x => x.token === body.profile_high).map(x => { return x.stream?.rtsp })
        if (high.length < 1) { return { status: false, data: null, error: 'error_adding_camera', msg: 'High profile is not valid' }; }
        const low = onvif_response.data.filter(x => x.token === body.profile_low).map(x => { return x.stream?.rtsp })
        if (low.length < 1) { return { status: false, data: null, error: 'error_adding_camera', msg: 'Low profile is not valid' }; }
        // camera service
        const cameraserviceID = await this.cameraservice.getFreeCameraServiceId()
        if (!cameraserviceID) { return { status: false, data: null, error: 'error_adding_camera', msg: 'No free camera serive available' }; }
        // camera recorder
        const cameraRecorderID = await this.camerarecorder.getFreeCameraRecorderId()
        if (!cameraRecorderID) { return { status: false, data: null, error: 'error_adding_camera', msg: 'No free camera recorder available' }; }
        // get ptz info
        const ptzPanTilt = onvif_info.data.ptz.range.x.min !== onvif_info.data.ptz.range.x.max && onvif_info.data.ptz.range.y.min !== onvif_info.data.ptz.range.y.max
        const ptzZoom = onvif_info.data.ptz.range.z.min !== onvif_info.data.ptz.range.z.max
        // make sure port is included in url to prevent duplication
        if (body.url.includes(':')) { body.url = body.url } else { body.url = body.url + ':80' }
        // add camera to db
        try {
          const temp: dtos.cameraDto = await this.db.camera.create({
            data: {
              url: body.url, username: body.username, password: body.password,
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
                  { key: 'profile_low', value: body.profile_low },
                  { key: 'profile_live_rtsp', value: low[0] },
                  { key: 'profile_high', value: body.profile_high },
                  { key: 'profile_record_rtsp', value: high[0] },
                  { key: 'ptz_pan_tilt', value: ptzPanTilt ? 'true' : 'false' },
                  { key: 'ptz_zoom', value: ptzZoom? 'true' : 'false' }
                ]
              }
            }});
          // add info to camera service
          await this.db.camera_service_camera.create({ data: { type: 'live', port: 0, status: false, camera_service: { connect: { id: cameraserviceID } }, camera: { connect: { id: temp.id } }  } })
          await this.db.camera_service_camera.create({ data: { type: 'record', port: 0, status: false, camera_service: { connect: { id: cameraserviceID } }, camera: { connect: { id: temp.id } }  } })
          await this.db.camera_recorder_camera.create({ data: { status: '', session: '', camera: { connect: { id: temp.id } }, camera_recorder: { connect: { id: cameraRecorderID } } } })
          // start stream
          // todo : start camera streams and recorder if needed
          // await this.streamService.start({ isSuperAdmin: true }, { cameraId: temp.id, type: 'LOW' })
          // await this.streamService.start({ isSuperAdmin: true }, { cameraId: temp.id, type: 'HIGH' })
          // await this.recorderservice.start({ isSuperAdmin: true }, { cameraId: temp.id })
          // generate response
          const response: generalResponse = { status: true, data: temp, error: null, msg: null };
          return response;
        } catch (error) {
          // generate response
          const response: generalResponse = { status: false, data: null, error: 'error_adding_camera', msg: error };
          return response;
        }
      } else {
        throw { message: 'invalid onvif data' }
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteSingle(user, id: string): Promise<generalResponse> {
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
      const camOk: dtos.cameraDto = await this.db.camera.findUnique({ where });
      // check resuts
      if (!camOk) { return { status: false, data: null, error: null, msg: null }; }
      // stop live
      await this.streamService.stop({ isSuperAdmin: true }, { cameraId: id, type: 'LOW' })
      // stop recorder
      await this.streamService.stop({ isSuperAdmin: true }, { cameraId: id, type: 'HIGH' })
      // delete related data from other tables
      await this.db.$transaction([
        this.db.camera_info.deleteMany({ where: { camera: { some: { id: id } } } }),
        this.db.camera_service_camera.deleteMany({ where: { camera: { some: { id: id } } } })
      ])
      // delete camera
      const temp: dtos.cameraDto = await this.db.camera.delete({ where: { id: id } });
      // generate response
      const response: generalResponse = { status: true, data: temp, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }


  @Cron('0 */5 * * * *')
  async handleCron() {
    if (process.env.NODE_ENV) { return true }
    try {
      console.debug('scanning cameras ...', new Date().toString());
      const cameras = await this.db.camera.findMany();
      await this.db.camera.updateMany({ data: { status: 'loading' } })
      await Promise.all(cameras.map(async (element) => {
        // const cam_id = element.id;
        // const cam_fullurl = element.url;
        // const cam_username = element.username;
        // const cam_password = element.password;
        // const old_status = element.status;
        // let cam_ip = '';
        // let cam_port = '';
        // if (cam_fullurl.includes(':')) {
        //   cam_ip = cam_fullurl.split(':')[0];
        //   cam_port = cam_fullurl.split(':')[1];
        // } else {
        //   cam_ip = cam_fullurl;
        //   cam_port = '80';
        // }
        // const temp = { username: cam_username, password: cam_password, ip: cam_ip, port: cam_port }
        // const health = await this.axios.axiosRef.post(process.env.HEALTH_SERVICE + '/check_camera', temp);
        // if (health.data.status === 'true') {
        //   if (old_status !== 'ok' && old_status !== 'loading') {
        //     await this.db.camera.update({ where: { id: cam_id }, data: { status: 'ok' } })
        //     this.loggerService.log(`Camera connected`, 1, undefined, undefined, undefined, cam_id, undefined);
        //   }
        // } else {
        //   await this.db.camera.update({ where: { id: cam_id }, data: { status: health.data.error } })
        //   if (old_status === 'ok' || old_status === 'loading') {
        //     this.loggerService.log(`Camera disconnected`, 1, undefined, undefined, undefined, cam_id, undefined);
        //   }
        // }
        try {
          const health = await this.axios.axiosRef.post(process.env.ONVIF_SERVICE + '/camera', element);
          if (health.data.status === 'up') {
            await this.db.camera.update({ where: { id: element.id }, data: { status: 'ok' } })
            if (element.status.includes('error')) {
              this.loggerService.log(`Camera connected`, 1, undefined, undefined, undefined, element.id, undefined);
            }
          } else {
            await this.db.camera.update({ where: { id: element.id }, data: { status: 'error: ' + health.data.error } })
            if (element.status === 'ok') {
              this.loggerService.log(`Camera disconnected`, 1, undefined, undefined, undefined, element.id, undefined);
            }
          }
        } catch (e2) {
          await this.db.camera.update({ where: { id: element.id }, data: { status: 'error: Network error' } })
          if (element.status === 'ok') {
            this.loggerService.log(`Camera disconnected`, 1, undefined, undefined, undefined, element.id, undefined);
          }
          if (e2 === 1) { console.log(true) }
        }
      }));
      await this.db.camera.updateMany({ where: { status: 'loading' },  data: { status: 'error' } })
    } catch (error) {
      console.log('error scanning cameras', error)
    }
  }

}
