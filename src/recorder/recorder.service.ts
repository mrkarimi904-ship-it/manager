import { ConflictException, HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';

import * as dtos from './recorder.dtos';

import { generalResponse } from 'src/app.consts';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class RecorderService {
  constructor(private db: DbService, private readonly axios: HttpService, private loggerService: LoggerService ) {}

  async status(user, body: dtos.recorderDto): Promise<generalResponse> {
    try {
      // check if camera available
      const where = { id: body.cameraId }
      if (user.isSuperAdmin !== true) { where['camera_account'] = { some: { account_id: { equals: user.id } } } }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }
      // get status
      const cameraServiceInfo = await this.db.camera_service_camera.findFirst({ where: { camera: { some: { id: body.cameraId } }, type: 'record' }, include: { camera_service: true } })
      const cameraService = await this.db.camera_service.findUnique({ where: { id: cameraServiceInfo.camera_service[0].id } })
      const cameraRecorderCamera = await this.db.camera_recorder_camera.findFirst({ where: { camera: { some: { id: body.cameraId }}  }, include: { camera_recorder: true } })
      const cameraRecorder = await this.db.camera_recorder.findUnique({ where: { id: cameraRecorderCamera.camera_recorder[0].id } })

      const cameraRecorderUrl = cameraRecorder.url;
      const cameraRecorderPort = cameraRecorder.port;
      const uurl = `http://${cameraRecorderUrl}:${cameraRecorderPort}/camera_recorder/recorder`
      const results = await this.axios.axiosRef.get(uurl)
      const result = results.data.recorders.filter(x => x.session_id === cameraRecorderCamera.session).map(x => { return { status: x.status, session: x.session_id } })
      const response: generalResponse = { status: true, data: {
        status: result.length > 0 ? result[0].status : null,
        session: result.length > 0 ? result[0].session : null,
        cameraServiceInfo: cameraServiceInfo,
        cameraService: cameraService,
        cameraRecorderCamera: cameraRecorderCamera,
        cameraRecorder: cameraRecorder,
        camera: camera,
      }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async start(user, body: dtos.recorderDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status(user, body);

      const cameraService = data['cameraService']
      const cameraServiceInfo = data['cameraServiceInfo']
      const cameraRecorderCamera = data['cameraRecorderCamera']
      const cameraRecorder = data['cameraRecorder']

      // check if already started
      if (cameraRecorderCamera.status === 'RUNNING') { return { status: true, data: { status: true, session: cameraRecorderCamera.session }, error: null, msg: null }; }

      const cameraRecorderUrl = cameraRecorder.url;
      const cameraRecorderPort = cameraRecorder.port;

      if (cameraRecorderCamera.session === '')
      {
        const newurl = `http://${cameraRecorderUrl}:${cameraRecorderPort}/camera_recorder/recorder/start`
        const cc = await this.axios.axiosRef.post(newurl, { storage_path: '/storage', quota: 1000, block_size:100, stream_ip: cameraService.url, stream_port: cameraServiceInfo.port, enable_rotation: true })
        await this.db.camera_recorder_camera.update({ where: { id: cameraRecorderCamera.id }, data: { status: cc.data?.recorder.status, session: cc.data?.recorder.session_id } })
        this.loggerService.log('Recorder started', 0, user, undefined, undefined, body.cameraId, undefined)
        return { status: true, data: { status: true, session: cc.data?.recorder.session_id }, error: null, msg: null };
      } else {
        const newurl = `http://${cameraRecorderUrl}:${cameraRecorderPort}/camera_recorder/recorder/` + cameraRecorderCamera.session + `/start`
        const cc = await this.axios.axiosRef.post(newurl, { stream_ip: cameraService.url, stream_port: cameraServiceInfo.port, enable_rotation: true })
        await this.db.camera_recorder_camera.update({ where: { id: cameraRecorderCamera.id }, data: { status: cc.data?.recorder.status, session: cc.data?.recorder.session_id } })
        this.loggerService.log('Recorder started', 0, user, undefined, undefined, body.cameraId, undefined)
        return { status: true, data: { status: true, session: cc.data?.recorder.session_id }, error: null, msg: null };
      }

    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async restart(body: dtos.recorderDto): Promise<generalResponse> {
    // try {
    //   // check if camera available
    //   const { data } = await this.status({ isSuperAdmin: true }, body);
    //   // const subscribers = data['subscribers'];
    //   const port = data['port'];
    //   // const status = data['status'];
    //   const cameraService = data['cameraService'];
    //   const cameraServiceInfoId = data['id']
    //   const camera = data['camera'];
    //   const cameraRTSPUrl = data['rtsp'];

    //   const cameraUsername = camera.username;
    //   const cameraPassword = camera.password;
    //   const cameraServiceUrl = cameraService.url;
    //   const cameraServicePort = cameraService.port;
    //   const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })
    //   const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`

    //   const x1 = await this.axios.axiosRef.post(uurl, { url: completeRTSP, port: port, id: body.cameraId })
    //   const new_port = x1.data?.data[0]?.port ? x1.data.data[0].port : 0

    //   await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: { status: true, port: new_port } })
    //   return { status: true, data: { status: true, port: new_port }, error: null, msg: null };
    // } catch (error) {
      throw new HttpException({ status: false, data: null, error: null, msg: null }, 406);
    // }
  }

  async stop(user, body: dtos.recorderDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status(user, body);

      const cameraService = data['cameraService']
      const cameraServiceInfo = data['cameraServiceInfo']
      const cameraRecorderCamera = data['cameraRecorderCamera']
      const cameraRecorder = data['cameraRecorder']

      // check if already started
      if (cameraRecorderCamera.session === 'STOPPED') { return { status: true, data: { status: false, session: cameraRecorderCamera.session }, error: null, msg: null }; }

      const cameraRecorderUrl = cameraRecorder.url;
      const cameraRecorderPort = cameraRecorder.port;

      const newurl = `http://${cameraRecorderUrl}:${cameraRecorderPort}/camera_recorder/recorder/` + cameraRecorderCamera.session
      const cc = await this.axios.axiosRef.delete(newurl)
      await this.db.camera_recorder_camera.update({ where: { id: cameraRecorderCamera.id }, data: { status: 'STOPPED' } })

      this.loggerService.log('Recorder stopped', 0, user, undefined, undefined, body.cameraId, undefined)

      return { status: true, data: { status: false, session: cameraRecorderCamera.session }, error: null, msg: null };

    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async force_stop(user, body: dtos.recorderDto): Promise<generalResponse> {
    // try {
    //   // check if camera available
    //   const { data } = await this.status(user, body);
    //   // const subscribers = data['subscribers'];
    //   // const port = data['port'];
    //   // const status = data['status'];
    //   const cameraService = data['cameraService'];
    //   const cameraServiceInfoId = data['id']
    //   const camera = data['camera'];
    //   const cameraRTSPUrl = data['rtsp'];

    //   const cameraUsername = camera.username;
    //   const cameraPassword = camera.password;
    //   const cameraServiceUrl = cameraService.url;
    //   const cameraServicePort = cameraService.port;
    //   const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })

    //   const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service/remove`
    //   await this.axios.axiosRef.post(uurl, { url: completeRTSP, id: body.cameraId })

    //   await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: { status: false } })
    //   return { status: true, data: null, error: null, msg: null };
    // } catch (error) {
      throw new HttpException({ status: false, data: null, error: null, msg: null }, 406);
    // }
  }
}
