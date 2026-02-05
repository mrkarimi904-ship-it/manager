import { ConflictException, HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';

import * as dtos from './stream.dtos';

import { generalResponse } from 'src/app.consts';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class StreamService {
  constructor(private db: DbService, private readonly axios: HttpService, private loggerService: LoggerService ) {}

  async status(user, body: dtos.streamDto): Promise<generalResponse> {
    try {
      // check if camera available
      const where = { id: body.cameraId, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }
      // get status
      const profile_key = body.type === "LOW" ? 'profile_live_rtsp' : 'profile_record_rtsp'
      const profile_name = body.type === "LOW" ? 'live' : 'record'
      const [cameraInfo, cameraServiceInfo] = await this.db.$transaction([
        this.db.camera_info.findFirst({ where: { camera: { some: { id: body.cameraId } }, key: profile_key } }),
        this.db.camera_service_camera.findFirst({ where: { camera: { some: { id: body.cameraId } } , type: profile_name }, include: { camera_service: true } })
      ])
      if (!cameraServiceInfo?.camera_service?.length) {
        throw new HttpException({ status: false, data: null, error: 'Stream service not configured', msg: 'Stream service not configured for this camera' }, 406);
      }
      if (!cameraInfo?.value || String(cameraInfo.value).trim() === '') {
        const profileLabel = body.type === 'LOW' ? 'live' : 'record';
        throw new HttpException({ status: false, data: null, error: 'No RTSP profile', msg: `Camera profile has no RTSP URL for ${profileLabel} stream. Please set or update the camera stream profile.` }, 406);
      }
      const cameraService = cameraServiceInfo.camera_service[0];
      const cameraServiceUrl = cameraService.url;
      const cameraServicePort = cameraService.port;
      const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`
      const results = await this.axios.axiosRef.get(uurl)
      const result = results.data.data.filter(x => x.cameraId === body.cameraId && x.port === cameraServiceInfo.port).map(x => { return x.subscribers })
      const response: generalResponse = { status: true, data: { status:  cameraServiceInfo.status, port: cameraServiceInfo.port, id: cameraServiceInfo.id, subscribers: result[0], cameraService: cameraService, camera: camera, rtsp: cameraInfo.value }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async start(user, body: dtos.streamDto): Promise<generalResponse> {
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
      if (port !== 0 && status === true) { return { status: true, data: { status: true, port: port, cameraService: cameraService }, error: null, msg: null }; }

      const cameraUsername = camera.username;
      const cameraPassword = camera.password;
      const cameraServiceUrl = cameraService.url;
      const cameraServicePort = cameraService.port;
      const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })
      const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`

      const x1 = await this.axios.axiosRef.post(uurl, { url: completeRTSP, port: port, id: body.cameraId, tcp: camera.tcp })
      const new_port = x1.data?.data[0]?.port ? x1.data.data[0].port : 0

      this.loggerService.log(`Stream ${body.type} started`, 0, user, undefined, undefined, body.cameraId, undefined)

      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: { status: true, port: new_port } })

      // check if current running recorders need to be updated
      if (port !== new_port) {
        const current_running_recorders = await this.db.camera_recorder_camera.findMany({ where: { camera_recorder: { some: { id: camera.id }}, status: 'RUNNING' }, include: { camera_recorder: true, camera: true } })
        if (current_running_recorders.length > 0) {
          this.loggerService.log(`error detected in steam port and recorder port`, 0, user, undefined, undefined, body.cameraId, undefined)
        }
      }

      return { status: true, data: { status: true, port: new_port, cameraService: cameraService }, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async restart(body: dtos.streamDto): Promise<generalResponse> {
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

      const x1 = await this.axios.axiosRef.post(uurl, { url: completeRTSP, port: port, id: body.cameraId, tcp: camera.tcp })
      const new_port = x1.data?.data[0]?.port ? x1.data.data[0].port : 0

      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: { status: true, port: new_port } })

      // check if current running recorders need to be updated
      if (port !== new_port) {
        const current_running_recorders = await this.db.camera_recorder_camera.findMany({ where: { camera_recorder: { some: { id: camera.id }}, status: 'RUNNING' }, include: { camera_recorder: true, camera: true } })
        if (current_running_recorders.length > 0) {
          await Promise.all(current_running_recorders.map(async (item) => {
            // get recorder url and port
            const temp_url = item.camera_recorder[0].url
            const temp_port = item.camera_recorder[0].port
            // get recorder session
            const session = item.session
            const temp_u1 = `http://${temp_url}:${temp_port}/camera_recorder/recorder/` + session
            const temp_u2 = `http://${temp_url}:${temp_port}/camera_recorder/recorder/` + session + `/start`
            // stop
            await this.axios.axiosRef.delete(temp_u1)
            // wait
            await new Promise(resolve => setTimeout(resolve, 500));
            // start
            const stream_service = await this.db.camera_service_camera.findFirst({ where: { camera: { some: { id: item.camera[0].id } }, type: 'record' }, include: { camera_service: true } })
            const stream = await this.db.camera_service.findUnique({ where: { id: stream_service.camera_service[0].id } })
            const stream_url = stream.url
            const stream_port = stream_service.port
            const cc = await this.axios.axiosRef.post(temp_u2, { stream_host: stream_url, stream_port:stream_port, rotation: item.enable_rotation })
            await this.db.camera_recorder_camera.update({ where: { id: item.id }, data: { status: cc.data?.recorder.status, session: cc.data?.recorder.session_id } })
          }));
        }
      }

      return { status: true, data: { status: true, port: new_port, cameraService: cameraService }, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async stop(user, body: dtos.streamDto): Promise<generalResponse> {
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
      if (port === 0 && status === false) { return { status: true, data: { status: false, port: 0, cameraService: cameraService }, error: null, msg: null }; }
      // if already have subscribers
      if (parseInt(subscribers) > 1) { return { status: true, data: { status: true, port: port, cameraService: cameraService }, error: null, msg: null } }

      const cameraUsername = camera.username;
      const cameraPassword = camera.password;
      const cameraServiceUrl = cameraService.url;
      const cameraServicePort = cameraService.port;
      const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })
      const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service/remove`

      await this.axios.axiosRef.post(uurl, { url: completeRTSP, id: body.cameraId })

      this.loggerService.log(`Stream ${body.type} stopped`, 0, user, undefined, undefined, body.cameraId, undefined)

      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: { status: false } })
      return { status: true, data: { status: false, port: port, cameraService: cameraService }, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async force_stop(user, body: dtos.streamDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status(user, body);
      // const subscribers = data['subscribers'];
      // const port = data['port'];
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

      const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service/remove`
      await this.axios.axiosRef.post(uurl, { url: completeRTSP, id: body.cameraId })

      this.loggerService.log(`Stream ${body.type} force stopped`, 0, undefined, undefined, undefined, body.cameraId, undefined)

      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: { status: false } })
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
