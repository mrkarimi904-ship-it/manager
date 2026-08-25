import { ConflictException, HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';

import * as dtos from './stream.dtos';

import { generalResponse } from 'src/app.consts';
import { LoggerService } from 'src/logger/logger.service';
import {
  IDLE_KAFKA_TOPIC,
  IDLE_STREAM_FIELDS,
  isActiveStreamAssignment,
  parseWorkerStreamAssignment,
  toCameraServiceStartBody,
  toDbStreamFields,
  toStreamClientData,
  toStreamConnectionFields,
  workerListItemMatchesDbRow,
} from './stream.worker';

@Injectable()
export class StreamService {
  constructor(private db: DbService, private readonly axios: HttpService, private loggerService: LoggerService, private eventEmitter: EventEmitter2) {}

  private buildClientData(cameraServiceInfo: {
    status: boolean;
    kafka_topic: string;
    use_kafka: boolean;
    use_service_ip: boolean;
    zmq_port: number;
    service_ip: string | null;
    kafka_server: string | null;
  }, cameraService: object) {
    return toStreamClientData(cameraServiceInfo, cameraService);
  }

  async status(user, body: dtos.streamDto): Promise<generalResponse> {
    try {
      // check if camera available
      const where: any = { id: body.cameraId, deleted: false, AND: [] }
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

      let streamOnService = false;
      let subscribers = 0;
      try {
        const results = await this.axios.axiosRef.get(uurl)
        const workerItems = Array.isArray(results.data?.data) ? results.data.data : [];
        const matching = workerItems.filter((item) =>
          workerListItemMatchesDbRow(item as Record<string, unknown>, body.cameraId, cameraServiceInfo.kafka_topic),
        );
        streamOnService = matching.length > 0 && isActiveStreamAssignment(cameraServiceInfo)
        subscribers = matching[0]?.subscribers ?? 0
      } catch (workerError) {
        this.loggerService.log(`Camera service worker unreachable during status: ${cameraServiceUrl}:${cameraServicePort}`, 1, undefined, undefined, undefined, body.cameraId, undefined);
      }

      const response: generalResponse = {
        status: true,
        data: {
          ...this.buildClientData(cameraServiceInfo, cameraService),
          id: cameraServiceInfo.id,
          subscribers,
          streamOnService,
          camera: camera,
          rtsp: cameraInfo.value,
        },
        error: null,
        msg: null,
      };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async start(user, body: dtos.streamDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status(user, body);
      const kafkaTopic = data['kafka_topic'];
      const zmqPort = data['zmq_port'];
      const streamOnService = data['streamOnService'];
      const cameraService = data['cameraService'];
      const cameraServiceInfoId = data['id']
      const camera = data['camera'];
      const cameraRTSPUrl = data['rtsp'];

      // only treat as already started when stream is verified on camera service
      if (streamOnService && isActiveStreamAssignment({ kafka_topic: kafkaTopic, zmq_port: data['zmq_port'] })) {
        return { status: true, data: this.buildClientData(data as any, cameraService), error: null, msg: null };
      }

      const cameraUsername = camera.username;
      const cameraPassword = camera.password;
      const cameraServiceUrl = cameraService.url;
      const cameraServicePort = cameraService.port;
      const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })
      const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`

      const x1 = await this.axios.axiosRef.post(uurl, toCameraServiceStartBody({
        url: completeRTSP,
        zmqPort,
        cameraId: body.cameraId,
        tcp: camera.tcp,
      }))
      const assignment = parseWorkerStreamAssignment(x1.data);
      if (!assignment) {
        throw new HttpException({ status: false, data: null, error: 'Invalid stream service response', msg: 'Invalid stream service response' }, 406);
      }

      this.loggerService.log(`Stream ${body.type} started`, 0, user, undefined, undefined, body.cameraId, undefined)

      const dbFields = toDbStreamFields(assignment);
      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: dbFields })

      // check if current running recorders need to be updated
      if (kafkaTopic !== assignment.kafka_topic || zmqPort !== assignment.zmq_port) {
        const current_running_recorders = await this.db.camera_recorder_camera.findMany({ where: { camera: { some: { id: camera.id }}, status: 'RUNNING' }, include: { camera_recorder: true, camera: true } })
        if (current_running_recorders.length > 0) {
          this.loggerService.log(`error detected in steam port and recorder port`, 0, user, undefined, undefined, body.cameraId, undefined)
        }
      }

      return { status: true, data: this.buildClientData(dbFields, cameraService), error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async restart(body: dtos.streamDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status({ isSuperAdmin: true }, body);
      const kafkaTopic = data['kafka_topic'];
      const zmqPort = data['zmq_port'];
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

      const x1 = await this.axios.axiosRef.post(uurl, toCameraServiceStartBody({
        url: completeRTSP,
        zmqPort,
        cameraId: body.cameraId,
        tcp: camera.tcp,
      }))
      const assignment = parseWorkerStreamAssignment(x1.data);
      if (!assignment) {
        throw new HttpException({ status: false, data: null, error: 'Invalid stream service response', msg: 'Invalid stream service response' }, 406);
      }

      const dbFields = toDbStreamFields(assignment);
      await this.db.camera_service_camera.update({ where: { id: cameraServiceInfoId }, data: dbFields })

      // check if current running recorders need to be updated
      if (kafkaTopic !== assignment.kafka_topic || zmqPort !== assignment.zmq_port) {
        const current_running_recorders = await this.db.camera_recorder_camera.findMany({ where: { camera: { some: { id: camera.id }}, status: 'RUNNING' }, include: { camera_recorder: true, camera: true } })
        if (current_running_recorders.length > 0) {
          await Promise.all(current_running_recorders.map(async (item) => {
            const recorderSvc = item.camera_recorder?.[0]
            const cam = item.camera?.[0]
            if (!recorderSvc || !cam) return
            const temp_url = recorderSvc.url
            const temp_port = recorderSvc.port
            const session = item.session
            const temp_u1 = `http://${temp_url}:${temp_port}/camera_recorder/recorder/` + session
            const temp_u2 = `http://${temp_url}:${temp_port}/camera_recorder/recorder/` + session + `/start`
            await this.axios.axiosRef.delete(temp_u1)
            await new Promise(resolve => setTimeout(resolve, 500));
            const stream_service = await this.db.camera_service_camera.findFirst({ where: { camera: { some: { id: cam.id } }, type: 'record' } })
            if (!stream_service || !isActiveStreamAssignment(stream_service)) return
            const cc = await this.axios.axiosRef.post(temp_u2, {
              ...toStreamConnectionFields(stream_service),
              rotation: item.enable_rotation,
            })
            await this.db.camera_recorder_camera.update({ where: { id: item.id }, data: { status: cc.data?.recorder.status, session: cc.data?.recorder.session_id } })
          }));
        }
      }
      // notify LPRs to restart whenever record stream is restarted
      if (body.type === 'HIGH') {
        this.eventEmitter.emit('stream.record_restarted', { cameraId: body.cameraId });
      }

      return { status: true, data: this.buildClientData(dbFields, cameraService), error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async stop(user, body: dtos.streamDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status(user, body);
      const subscribers = data['subscribers'];
      const kafkaTopic = data['kafka_topic'];
      const status = data['status'];
      const cameraService = data['cameraService'];
      const cameraServiceInfoId = data['id']
      const camera = data['camera'];
      const cameraRTSPUrl = data['rtsp'];

      // check if already started
      if (kafkaTopic === IDLE_KAFKA_TOPIC && status === false) {
        return { status: true, data: this.buildClientData(data as any, cameraService), error: null, msg: null };
      }
      if (parseInt(subscribers) > 1) {
        return { status: true, data: this.buildClientData(data as any, cameraService), error: null, msg: null };
      }

      const cameraUsername = camera.username;
      const cameraPassword = camera.password;
      const cameraServiceUrl = cameraService.url;
      const cameraServicePort = cameraService.port;
      const completeRTSP = cameraRTSPUrl.includes('username') && cameraRTSPUrl.includes('password') ? cameraRTSPUrl : cameraRTSPUrl.replace("rtsp://", function() { return `rtsp://${cameraUsername}:${cameraPassword}@` })
      const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service/remove`

      try {
        await this.axios.axiosRef.post(uurl, { url: completeRTSP, id: body.cameraId })
      } catch (workerError) {
        this.loggerService.log(`Camera service worker unreachable during stop: ${cameraServiceUrl}:${cameraServicePort}`, 1, undefined, undefined, undefined, body.cameraId, undefined);
      }

      this.loggerService.log(`Stream ${body.type} stopped`, 0, user, undefined, undefined, body.cameraId, undefined)

      await this.db.camera_service_camera.update({
        where: { id: cameraServiceInfoId },
        data: { status: false, ...IDLE_STREAM_FIELDS },
      })
      return { status: true, data: this.buildClientData({ status: false, ...IDLE_STREAM_FIELDS }, cameraService), error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async force_stop(user, body: dtos.streamDto): Promise<generalResponse> {
    try {
      // check if camera available
      const { data } = await this.status(user, body);
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
      try {
        await this.axios.axiosRef.post(uurl, { url: completeRTSP, id: body.cameraId })
      } catch (workerError) {
        this.loggerService.log(`Camera service worker unreachable during force_stop: ${cameraServiceUrl}:${cameraServicePort}`, 1, undefined, undefined, undefined, body.cameraId, undefined);
      }

      this.loggerService.log(`Stream ${body.type} force stopped`, 0, undefined, undefined, undefined, body.cameraId, undefined)

      await this.db.camera_service_camera.update({
        where: { id: cameraServiceInfoId },
        data: { status: false, ...IDLE_STREAM_FIELDS },
      })
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
