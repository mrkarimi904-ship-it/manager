import { ConflictException, Injectable, NotAcceptableException } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';

import * as dtos from './live.dtos';

import { generalResponse } from 'src/app.consts';

@Injectable()
export class LiveService {
  constructor(private db: DbService, private readonly axios: HttpService) {}

  async status(body: dtos.liveDto): Promise<generalResponse> {
    // todo : check if camera available
    const cameraServiceInfo = await this.db.camera_service_camera.findFirst({ where: { camera_id: body.cameraId, type: 'live' } })
    const cameraServiceId = cameraServiceInfo.camera_service_id;
    const cameraService = await this.db.camera_service.findUnique({ where: { id: cameraServiceId } })
    const cameraServiceUrl = cameraService.url;
    const cameraServicePort = cameraService.port;
    const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`
    const results = await this.axios.axiosRef.get(uurl)
    const result = results.data.data.filter(x => x.cameraId === body.cameraId && x.port === cameraServiceInfo.port).map(x => { return x.subscribers })
    const response: generalResponse = { status: true, data: { status:  cameraServiceInfo.status, port: cameraServiceInfo.port, subscribers: result }, error: null, msg: null };
    return response;
  }

  async start(body: dtos.liveDto): Promise<generalResponse> {
    // todo : check if camera available
    const camera = await this.db.camera.findFirst({ where: { id: body.cameraId } })
    if (!camera) { throw new ConflictException() }
    // todo : check if already started
    const cameraServiceInfo = await this.db.camera_service_camera.findFirst({ where: { camera_id: body.cameraId, type: 'live' } })
    if (cameraServiceInfo.port !== 0 && cameraServiceInfo.status === true) { return { status: true, data: { status: true, port: cameraServiceInfo.port }, error: null, msg: null }; }
    // todo : validate service
    const cameraInfo = await this.db.camera_info.findFirst({ where: { camera_id: body.cameraId, key: 'profile_low_rtsp' } })
    const cameraRTSPUrl = cameraInfo.value;

    const cameraUsername = camera.username;
    const cameraPassword = camera.password;

    const cameraServiceId = cameraServiceInfo.camera_service_id;
    const cameraService = await this.db.camera_service.findUnique({ where: { id: cameraServiceId } })
    const cameraServiceUrl = cameraService.url;
    const cameraServicePort = cameraService.port;

    const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })

    let returnPort = 0

    const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`
    try {
      const x1 = await this.axios.axiosRef.post(uurl, { url: completeRTSP, port: cameraServiceInfo.port, id: body.cameraId })
      returnPort = x1.data.data[0].port
      // todo : call camera service
      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfo.id }, data: { status: true, port: returnPort } })
      return { status: true, data: { status: true, port: returnPort }, error: null, msg: null };
    } catch (error) {
      throw new NotAcceptableException(error)
    }
  }

  async restart(body: dtos.liveDto): Promise<generalResponse> {
    // todo : check if camera available
    const camera = await this.db.camera.findFirst({ where: { id: body.cameraId } })
    if (!camera) { throw new ConflictException() }
    // todo : check if already started
    const cameraServiceInfo = await this.db.camera_service_camera.findFirst({ where: { camera_id: body.cameraId, type: 'live' } })
    // if (cameraServiceInfo.port !== 0 && cameraServiceInfo.status === true) { return { status: true, data: { status: true, port: cameraServiceInfo.port }, error: null, msg: null }; }
    // todo : validate service
    const cameraInfo = await this.db.camera_info.findFirst({ where: { camera_id: body.cameraId, key: 'profile_low_rtsp' } })
    const cameraRTSPUrl = cameraInfo.value;

    const cameraUsername = camera.username;
    const cameraPassword = camera.password;

    const cameraServiceId = cameraServiceInfo.camera_service_id;
    const cameraService = await this.db.camera_service.findUnique({ where: { id: cameraServiceId } })
    const cameraServiceUrl = cameraService.url;
    const cameraServicePort = cameraService.port;

    const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })

    let returnPort = 0

    const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`
    try {
      const x1 = await this.axios.axiosRef.post(uurl, { url: completeRTSP, port: cameraServiceInfo.port, id: body.cameraId })
      returnPort = x1.data.data[0].port
      // todo : call camera service
      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfo.id }, data: { status: true, port: returnPort } })
      return { status: true, data: { status: true, port: returnPort }, error: null, msg: null };
    } catch (error) {
      throw new NotAcceptableException(error)
    }
  }

  async stop(body: dtos.liveDto): Promise<generalResponse> {
    // todo : check if camera available
    const camera = await this.db.camera.findFirst({ where: { id: body.cameraId } })
    if (!camera) { throw new ConflictException() }
    // todo : check if already started
    const cameraServiceInfo = await this.db.camera_service_camera.findFirst({ where: { camera_id: body.cameraId, type: 'live' } })
    if (cameraServiceInfo.port === 0 && cameraServiceInfo.status === false) { return { status: true, data: { status: false, port: 0 }, error: null, msg: null }; }
    // todo : validate service
    const cameraInfo = await this.db.camera_info.findFirst({ where: { camera_id: body.cameraId, key: 'profile_low_rtsp' } })

    const cameraUsername = camera.username;
    const cameraPassword = camera.password;
    const cameraRTSPUrl = cameraInfo.value;

    const cameraServiceId = cameraServiceInfo.camera_service_id;
    const cameraService = await this.db.camera_service.findUnique({ where: { id: cameraServiceId } })
    const cameraServiceUrl = cameraService.url;
    const cameraServicePort = cameraService.port;

    const uurl0 = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`
    const results = await this.axios.axiosRef.get(uurl0)
    const subscribers = results.data.data.filter(x => x.cameraId === body.cameraId && x.port === cameraServiceInfo.port).map(x => { return x.subscribers })
    if (parseInt(subscribers) > 0) { return { status: true, data: { status: true }, error: null, msg: null } }

    const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })

    const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service/remove`
    try {
      await this.axios.axiosRef.post(uurl, { url: completeRTSP, id: body.cameraId })
      // todo : call camera service
      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfo.id }, data: { status: false, port: 0 } })
      return { status: true, data: { status: false }, error: null, msg: null };
    } catch (error) {
      throw new NotAcceptableException(error)
    }
  }

}
