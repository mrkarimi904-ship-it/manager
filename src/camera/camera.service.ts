import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';
import { CameraServiceService } from 'src/camera_service/camera_service.service';

import * as dtos from './camera.dtos';

import { generalResponse } from 'src/app.consts';
import { RecorderService } from 'src/recorder/recorder.service';
import { LiveService } from 'src/live/live.service';

@Injectable()
export class CameraService {
  constructor(private db: DbService, private readonly axios: HttpService, private cameraservice: CameraServiceService, private recorderservice: RecorderService, private liveService: LiveService) {}

  async getAll(user, query: dtos.cameraSearchQuery): Promise<generalResponse> {
    try {
      // limit query if user is not superadmin
      if (user.isSuperAdmin !== true) { query.userId = user.id; query.userFilter = 'Include' }
      // create where
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = {}
      if (query.search) { where['camera_info'] = { some: { key: { equals: 'name' }, value: { contains: query.search, mode: 'insensitive' } } } }
      if (query.userId && query.userFilter === 'Include') { where['camera_account'] = { some: { account_id: { equals: query.userId } } } }
      if (query.userId && query.userFilter === 'Exclude') { where['camera_account'] = { none: { account_id: { equals: query.userId } } } }
      const include = { camera_info: { select: { key: true, value: true } }, camera_service_camera: { select: { type: true,  status: true, port: true } } }
      // run query
      const [total, temp] = await this.db.$transaction([
        this.db.camera.count({ where }),
        this.db.camera.findMany({ where, skip, take, include })
      ])
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      return { status: false, data: null, error: error, msg: error.message };
    }

  }

  async getSingle(user, id: string): Promise<generalResponse> {
    // prepare where
    const where = { id: id }
    // check if user is limited
    if (user.isSuperAdmin !== true) { where['camera_account'] = { some: { account_id: { equals: user.id } } } }
    // db include
    const include = { camera_info: { select: { key: true, value: true } }, camera_service_camera: { select: { type: true,  status: true, port: true } } }
    // get results
    const temp: dtos.cameraDto = await this.db.camera.findUnique({ where , include });
    // check resuts
    if (!temp) { return { status: false, data: null, error: null, msg: null }; }
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }

  async getHealth(user, id: string): Promise<generalResponse> {
    // prepare where
    const where = { id: id }
    // check if user is limited
    if (user.isSuperAdmin !== true) { where['camera_account'] = { some: { account_id: { equals: user.id } } } }
    // get results
    const temp: dtos.cameraDto = await this.db.camera.findUnique({ where });
    // check resuts
    if (!temp) { return { status: false, data: null, error: null, msg: null }; }
    // get health
    const health = await this.axios.axiosRef.post(process.env.ONVIF_SERVICE + '/camera', temp);
    const response: generalResponse = { status: true, data: health.data, error: null, msg: null };
    return response;
  }

  async putSingle(id: string, body: dtos.postCameraDto): Promise<generalResponse> {
    const temp: dtos.cameraDto = await this.db.camera.update({ where: { id: id }, data: body });
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }

  async postPre(body: dtos.postPreCameraDto): Promise<generalResponse> {
    // get profiles from onvif service
    console.log(body)
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
      throw new UnprocessableEntityException();
    }
  }

  async postSingle(body: dtos.postCameraDto): Promise<generalResponse> {
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
                { key: 'profile_low_rtsp', value: low[0] },
                { key: 'profile_high', value: body.profile_high },
                { key: 'profile_high_rtsp', value: high[0] },
                { key: 'ptz_pan_tilt', value: ptzPanTilt ? 'true' : 'false' },
                { key: 'ptz_zoom', value: ptzZoom? 'true' : 'false' }
              ]
            }
          }});
        // add info to camera service
        await this.db.camera_service_camera.createMany({ data: [
          { camera_service_id: cameraserviceID, camera_id: temp.id, type: 'live', port: 0, status: false },
          { camera_service_id: cameraserviceID, camera_id: temp.id, type: 'record', port: 0, status: false },
        ] })
        // start live
        this.liveService.start({ isSuperAdmin: true }, { cameraId: temp.id })
        // start recorder
        this.recorderservice.start({ isSuperAdmin: true }, { cameraId: temp.id })
        // generate response
        const response: generalResponse = { status: true, data: temp, error: null, msg: null };
        return response;
      } catch (error) {
        // generate response
        const response: generalResponse = { status: false, data: null, error: 'error_adding_camera', msg: error };
        return response;
      }
    } else {
      throw new UnprocessableEntityException();
    }
  }

  async deleteSingle(user, id: string): Promise<generalResponse> {
    // prepare where
    const where = { id: id }
    // check if user is limited
    if (user.isSuperAdmin !== true) { where['camera_account'] = { some: { account_id: { equals: user.id } } } }
    // get results
    const camOk: dtos.cameraDto = await this.db.camera.findUnique({ where });
    // check resuts
    if (!camOk) { return { status: false, data: null, error: null, msg: null }; }
    // stop live
    await this.liveService.stop({ isSuperAdmin: true }, { cameraId: id })
    // stop recorder
    await this.recorderservice.stop({ isSuperAdmin: true }, { cameraId: id })
    // delete related data from other tables
    await this.db.$transaction([
      this.db.camera_account.deleteMany({ where: { camera_id: id } }),
      this.db.camera_info.deleteMany({ where: { camera_id: id } }),
      this.db.camera_service_camera.deleteMany({ where: { camera_id: id } })
    ])
    // delete camera
    const temp: dtos.cameraDto = await this.db.camera.delete({ where: { id: id } });
    // generate response
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }
}
