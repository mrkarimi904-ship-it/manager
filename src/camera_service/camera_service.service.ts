import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import * as dtos from './camera_service.dtos';

import { generalResponse } from 'src/app.consts';

import { RecorderService } from 'src/recorder/recorder.service';
import { StreamService } from 'src/stream/stream.service';

import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CameraServiceService {
  constructor(private db: DbService, private recorderservice: RecorderService, private streamService: StreamService, private readonly axios: HttpService) {}

  async getAll(): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraServiceDto[] = await this.db.camera_service.findMany({ include: { camera_service_camera: true }, orderBy: [{ created_at: 'desc' }] });
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getSingle(id: string): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraServiceDto = await this.db.camera_service.findUnique({ where: { id: id }, include: { camera_service_camera: true } });
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postSingle(body: dtos.postCameraServiceDto): Promise<generalResponse> {
    try {
      if (parseInt(body.port_to) - parseInt(body.port_from) <= 0 ) { throw new HttpException({ status: false, data: null, error: 'invalid port', msg: 'invalid port' }, 406) }
      const camerasService: dtos.cameraServiceDto = await this.db.camera_service.upsert({ where: { id: body.id}, update: { port_from: body.port_from, port_to: body.port_to, port: body.swagger_port, url: body.url }, create: { id: body.id, url: body.url, port_from: body.port_from, port_to: body.port_to, port: body.swagger_port } })
      // try to start currently registered cameras
      // TODO : ...
      const camera_service_camera = await this.db.camera_service_camera.findMany({ where: { camera_service: { some: { id: camerasService.id }}, status: true }, include: { camera: true } })
      camera_service_camera.forEach(async element => {
        const allCameras = element.camera
        allCameras.forEach(cam => {
          if (element.type === 'live') { this.streamService.restart({ cameraId: cam.id, type: 'LOW' }) } else { this.streamService.restart({ cameraId: cam.id, type: 'HIGH' }) }
        });
      });
      // return
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteSingle(id: string): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraServiceDto = await this.db.camera_service.delete({ where: { id: id } })
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getAvailable(): Promise<generalResponse> {
    try {
      let result = 0
      const camerasService: dtos.cameraServiceDto[] = await this.db.camera_service.findMany();
      await Promise.all(camerasService.map(async (element) => {
        const id = element.id
        const camerasServiceCameras = await this.db.camera_service_camera.findMany({ where: { camera_service: { some: { id: id } } }, include: { camera: true } });
        const used_ports = camerasServiceCameras.length
        const available_ports = parseInt(element.port_to) - parseInt(element.port_from) + 1
        result = result + available_ports - used_ports;
      }));
      const response: generalResponse = { status: true, data: { count: result }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getFreeCameraServiceId(): Promise<string> {
    try {
      let result = null
      const camerasService: dtos.cameraServiceDto[] = await this.db.camera_service.findMany();
      await Promise.all(camerasService.map(async (element) => {
        const id = element.id
        const camerasServiceCameras = await this.db.camera_service_camera.findMany({ where: { camera_service: { some: { id: id } } }, include: { camera: true } });
        const used_ports = camerasServiceCameras.length
        const available_ports = parseInt(element.port_to) - parseInt(element.port_from) + 1
        if (used_ports < available_ports) { result = id; return true }
      }));
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  @Cron('0 */5 * * * *')
  async handleCron() {
    if (process.env.NODE_ENV) { return true }
    try {
      console.debug('scanning cameraservices ...', new Date().toString());
      await this.db.camera_service_camera.updateMany({ data: { state: 'loading ...' } })
      const camerasService = await this.db.camera_service.findMany({ include: { camera_service_camera: true } });
      await Promise.all(camerasService.map(async (element) => {
        const cameraServiceId = element.id;
        const cameraServiceUrl = element.url;
        const cameraServicePort = element.port;
        const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/camera_service`
        const results = await this.axios.axiosRef.get(uurl)
        await Promise.all(results.data.data.map(async (elm) => {
          if (elm.subscribers === 0) {
            await this.axios.axiosRef.post(uurl + '/remove', { url: elm.rtspUrl, id: elm.cameraId })
            await this.db.camera_service_camera.updateMany({ where: { camera_service: { some: { id: cameraServiceId } } , camera: { some: { id: elm.cameraId } }, port: elm.port }, data: { status: false, port: 0, state: 'none' } })
          } else {
            await this.db.camera_service_camera.updateMany({ where: { camera_service: { some: { id: cameraServiceId } } , camera: { some: { id: elm.cameraId } }, port: elm.port }, data: { status: true, state: elm.subscribers.toString() } })
          }
        }));
      }));
      await this.db.camera_service_camera.updateMany({ where: { state: 'loading ...' },  data: { port: 0, status: false, state: 'none' } })
    } catch (error) {
      console.log('error scanning cameraservices', error)
    }
  }
}
