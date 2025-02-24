import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import * as dtos from './camera_recorder.dtos';

import { generalResponse } from 'src/app.consts';

import { StreamService } from 'src/stream/stream.service';

import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class CameraRecorderService {
  constructor(private db: DbService, private streamService: StreamService, private readonly axios: HttpService, private loggerService: LoggerService) {}

  async getAll(): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraRecorderDto[] = await this.db.camera_recorder.findMany({ include: { camera_recorder_camera: true }, orderBy: [{ created_at: 'desc' }] });
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getSingle(id: string): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraRecorderDto = await this.db.camera_recorder.findUnique({ where: { id: id }, include: { camera_recorder_camera: true } });
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postSingle(body: dtos.postCameraRecorderDto): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraRecorderDto = await this.db.camera_recorder.upsert({ where: { id: body.id}, update: { port: body.swagger_port, url: body.url }, create: { id: body.id, url: body.url, port: body.swagger_port } })

      // try to start currently registered cameras
      const active_recorders = await this.db.camera_recorder_camera.findMany({ where: { camera_recorder: { some: { id: camerasService.id }}, status: 'RUNNING' }, include: { camera_recorder: true, camera: true } })
      await Promise.all(active_recorders.map(async (item) => {

        await this.streamService.start(null, { cameraId: item.camera[0].id, type: 'HIGH' })

        const service_url = item.camera_recorder[0].url
        const service_port = item.camera_recorder[0].port
        const service = `http://${service_url}:${service_port}/camera_recorder/`

        const stream_service = await this.db.camera_service_camera.findFirst({ where: { camera: { some: { id: item.camera[0].id } }, type: 'record' }, include: { camera_service: true } })
        const stream = await this.db.camera_service.findUnique({ where: { id: stream_service.camera_service[0].id } })
        const stream_url = stream.url
        const stream_port = parseInt(stream.port)

        const newurl = service + `recorder/` + item.session + `/start`
        const cc = await this.axios.axiosRef.post(newurl, { stream_host: stream_url, stream_port:stream_port, enable_rotation: item.enable_rotation })
        await this.db.camera_recorder_camera.update({ where: { id: item.id }, data: { status: cc.data?.recorder.status, session: cc.data?.recorder.session_id } })
      }));

      // return
      this.loggerService.log('camera recorder instance registered', 0)
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteSingle(id: string): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraRecorderDto = await this.db.camera_recorder.delete({ where: { id: id } })
      // return
      this.loggerService.log('camera recorder instance removed', 0)
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getAvailable(): Promise<generalResponse> {
    try {
      let result = 0
      const cameraRecorder: dtos.cameraRecorderDto[] = await this.db.camera_recorder.findMany({ include: { camera_recorder_camera: true } });
      await Promise.all(cameraRecorder.map(async (element) => {
        const id = element.id
        const used_ports = await this.db.camera_recorder_camera.findMany({ where: { camera_recorder: { some: { id: id } } } });
        const available_ports = 100
        result = result + available_ports - used_ports.length;
      }));
      const response: generalResponse = { status: true, data: { count: result }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getFreeCameraRecorderId(): Promise<string> {
    try {
      let result = null
      const cameraRecorder: dtos.cameraRecorderDto[] = await this.db.camera_recorder.findMany();
      await Promise.all(cameraRecorder.map(async (element) => {
        const id = element.id
        const used_ports = await this.db.camera_recorder_camera.findMany({ where: { camera_recorder: { some: { id: id } } } });
        const available_ports = 100
        if (used_ports.length < available_ports) { result = id; return true }
      }));
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  @Cron('30 */5 * * * *')
  async handleCron() {
    if (process.env.NODE_ENV) { return true }
    try {
      console.debug('scanning camerarecorders ...', new Date().toString());
      await this.db.camera_recorder_camera.updateMany({ data: { status: 'loading ...' } })
      const cameraRecorders = await this.db.camera_recorder.findMany({ include: { camera_recorder_camera: { include: { camera: true } } } });
      await Promise.all(cameraRecorders.map(async (element) => {
        const cameraRecorderId = element.id;
        const cameraRecorderUrl = element.url;
        const cameraRecorderPort = element.port;
        const uurl = `http://${cameraRecorderUrl}:${cameraRecorderPort}/camera_recorder/recorder`
        const results = await this.axios.axiosRef.get(uurl)

        const revordes = element.camera_recorder_camera
        await Promise.all(revordes.map(async (rev) => {
          const db_session = rev.session
          const rr = results.data.recorders.filter(x => x.session_id === db_session)
          if (rr && rr.length > 0) {
            await this.db.camera_recorder_camera.updateMany({ where: { camera_recorder: { some: { id: cameraRecorderId } } , camera: { some: { id: rev.camera[0].id } }, session: db_session }, data: { status: rr[0].status } })
          } else {
            await this.db.camera_recorder_camera.updateMany({ where: { camera_recorder: { some: { id: cameraRecorderId } } , camera: { some: { id: rev.camera[0].id } }, session: db_session }, data: { status: 'STOPPED' } })
          }
        }));
      }));
      await this.db.camera_recorder_camera.updateMany({ where: { status: 'loading ...' },  data: { status: '' } })
    } catch (error) {
      console.log('error scanning camerarecorders', error)
    }
  }
}
