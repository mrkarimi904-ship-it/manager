import { ConflictException, Injectable, NotAcceptableException } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';

import * as dtos from './recorder.dtos';

import { generalResponse } from 'src/app.consts';

@Injectable()
export class RecorderService {
  constructor(private db: DbService, private readonly axios: HttpService) {}

  async status(user, body: dtos.recorderDto): Promise<generalResponse> {
    // check if camera available
    const where = { id: body.cameraId }
    if (user.isSuperAdmin !== true) { where['camera_account'] = { some: { account_id: { equals: user.id } } } }
    const camera = await this.db.camera.findUnique({ where });
    if (!camera) { throw new ConflictException() }
    // get status
    const [cameraInfo, cameraServiceInfo] = await this.db.$transaction([
      this.db.camera_info.findFirst({ where: { camera_id: body.cameraId, key: 'profile_high_rtsp' } }),
      this.db.camera_service_camera.findFirst({ where: { camera_id: body.cameraId, type: 'record' } })
    ])
    const cameraService = await this.db.camera_service.findUnique({ where: { id: cameraServiceInfo.camera_service_id } })
    const cameraServiceUrl = cameraService.url;
    const cameraServicePort = cameraService.port;
    const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`
    const results = await this.axios.axiosRef.get(uurl)
    const result = results.data.data.filter(x => x.cameraId === body.cameraId && x.port === cameraServiceInfo.port).map(x => { return x.subscribers })
    const response: generalResponse = { status: true, data: { status:  cameraServiceInfo.status, port: cameraServiceInfo.port, id: cameraServiceInfo.id, subscribers: result[0], cameraService: cameraService, camera: camera, rtsp: cameraInfo.value }, error: null, msg: null };
    return response;
  }

  async start(user, body: dtos.recorderDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status(user, body);
      // const subscribers = data['subscribers'];
      const port = data['port'];
      const status = data['status'];
      const cameraService = data['cameraService'];
      const cameraServiceInfoId = data['id']
      const camera = data['camera'];
      const cameraRTSPUrl = data['rtsp'];

      // check if already started
      if (port !== 0 && status === true) { return { status: true, data: { status: true, port: port }, error: null, msg: null }; }

      const cameraUsername = camera.username;
      const cameraPassword = camera.password;
      const cameraServiceUrl = cameraService.url;
      const cameraServicePort = cameraService.port;
      const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })
      const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`

      const x1 = await this.axios.axiosRef.post(uurl, { url: completeRTSP, port: port, id: body.cameraId })
      const new_port = x1.data?.data[0]?.port ? x1.data.data[0].port : 0

      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: { status: true, port: new_port } })
      return { status: true, data: { status: true, port: new_port }, error: null, msg: null };
    } catch (error) {
      throw new NotAcceptableException(error)
    }
  }

  async restart(body: dtos.recorderDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status({ isSuperAdmin: true }, body);
      // const subscribers = data['subscribers'];
      const port = data['port'];
      // const status = data['status'];
      const cameraService = data['cameraService'];
      const cameraServiceInfoId = data['id']
      const camera = data['camera'];
      const cameraRTSPUrl = data['rtsp'];

      const cameraUsername = camera.username;
      const cameraPassword = camera.password;
      const cameraServiceUrl = cameraService.url;
      const cameraServicePort = cameraService.port;
      const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })
      const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`

      const x1 = await this.axios.axiosRef.post(uurl, { url: completeRTSP, port: port, id: body.cameraId })
      const new_port = x1.data?.data[0]?.port ? x1.data.data[0].port : 0

      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: { status: true, port: new_port } })
      return { status: true, data: { status: true, port: new_port }, error: null, msg: null };
    } catch (error) {
      throw new NotAcceptableException(error)
    }
  }

  async stop(user, body: dtos.recorderDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status(user, body);
      const subscribers = data['subscribers'];
      const port = data['port'];
      const status = data['status'];
      const cameraService = data['cameraService'];
      const cameraServiceInfoId = data['id']
      const camera = data['camera'];
      const cameraRTSPUrl = data['rtsp'];

      // check if already started
      if (port === 0 && status === false) { return { status: true, data: { status: false, port: 0 }, error: null, msg: null }; }
      // if already have subscribers
      if (parseInt(subscribers) > 1) { return { status: true, data: { status: true, port: port }, error: null, msg: null } }

      const cameraUsername = camera.username;
      const cameraPassword = camera.password;
      const cameraServiceUrl = cameraService.url;
      const cameraServicePort = cameraService.port;
      const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })
      const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service/remove`

      await this.axios.axiosRef.post(uurl, { url: completeRTSP, id: body.cameraId })
      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: { status: false, port: 0 } })
      return { status: true, data: { status: false, port: 0 }, error: null, msg: null };
    } catch (error) {
      throw new NotAcceptableException(error)
    }
  }

}
