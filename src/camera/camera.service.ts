import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';

import * as dtos from './camera.dtos';

import { generalResponse } from 'src/app.consts';

@Injectable()
export class CameraService {
  constructor(private db: DbService, private readonly axios: HttpService) {}

  async getAll(): Promise<generalResponse> {
    const temp: dtos.cameraDto[] = await this.db.camera.findMany({ include: { camera_info: { select: { key: true, value: true } } } });
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }

  async getSingle(id: string): Promise<generalResponse> {
    const temp: dtos.cameraDto = await this.db.camera.findUnique({ where: { id: id }, include: { camera_info: { select: { key: true, value: true } } } });
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }

  async putSingle(id: string, body: dtos.postCameraDto): Promise<generalResponse> {
    const temp: dtos.cameraDto = await this.db.camera.update({ where: { id: id }, data: body });
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }

  async postPre(body: dtos.postPreCameraDto): Promise<generalResponse> {
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
      throw new UnprocessableEntityException();
    }
  }

  async postSingle(body: dtos.postCameraDto): Promise<generalResponse> {
    // get profiles from onvif service
    const onvif_response = await this.axios.axiosRef.post(process.env.ONVIF_SERVICE + '/camera/profiles', body);
    if (onvif_response.data && onvif_response.data !== 'error' && onvif_response.data.length > 0) {
      const high = onvif_response.data.filter(x => x.token === body.profile_high).map(x => { return x.stream?.rtsp })
      // todo : validate
      const low = onvif_response.data.filter(x => x.token === body.profile_low).map(x => { return x.stream?.rtsp })
      // todo: validate
      // camera service
      // todo : check for camera service limitations
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
                { key: 'profile_high_rtsp', value: high[0] }
              ]
            }
          }});
          // todo : call camera service
          // todo : call recorder
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

  async deleteSingle(id: string): Promise<generalResponse> {
    // delete related data from info table
    await this.db.camera_info.deleteMany({ where: { camera_id: id } });
    // delete camera
    const temp: dtos.cameraDto = await this.db.camera.delete({ where: { id: id } });
    // generate response
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }
}
