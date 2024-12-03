import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import * as dtos from './camera_recorder.dtos';

import { generalResponse } from 'src/app.consts';

import { RecorderService } from 'src/recorder/recorder.service';
import { LiveService } from 'src/live/live.service';

import { HttpService } from '@nestjs/axios';

@Injectable()
export class CameraRecorderService {
  constructor(private db: DbService, private recorderservice: RecorderService, private liveService: LiveService, private readonly axios: HttpService) {}

  async getAll(): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraRecorderDto[] = await this.db.camera_recorder.findMany({ include: { camera_recorder_camera: true } });
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
      const camerasService: dtos.cameraRecorderDto = await this.db.camera_recorder.upsert({ where: { id: body.id}, update: { port: body.swagger_port, url: body.url }, create: { url: body.url, port: body.swagger_port } })
      // try to start currently registered cameras
      // const allCameraRecorders = await this.db.camera_recorder.findMany()
      // allCameraRecorders.forEach(async element => {
        // const temp_id = element.id;
        // const allCameras = await this.db.camera_recorder_camera.findMany({ where: { camera_recorder_id: temp_id } })
        // allCameras.forEach(element => {
        //   if (element.type === 'live') { this.liveService.restart({ cameraId: element.camera_id }) } else { this.recorderservice.restart({ cameraId: element.camera_id }) }
        // });
      // });
      // return
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteSingle(id: string): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraRecorderDto = await this.db.camera_recorder.delete({ where: { id: id } })
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getAvailable(): Promise<generalResponse> {
    try {
      let result = 0
      const camerasService: dtos.cameraRecorderDto[] = await this.db.camera_recorder.findMany();
      const camerasServiceCameras = await this.db.camera_recorder_camera.findMany();
      camerasService.forEach(element => {
        const id = element.id
        const used_ports = camerasServiceCameras.filter(x => x.camera_recorder_id === id).length
        const available_ports = 20
        result = result + available_ports - used_ports;
      });
      const response: generalResponse = { status: true, data: { count: result }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getFreeCameraRecorderId(): Promise<string> {
    try {
      let result = null
      const camerasService: dtos.cameraRecorderDto[] = await this.db.camera_recorder.findMany();
      const camerasServiceCameras = await this.db.camera_recorder_camera.findMany();
      camerasService.forEach(element => {
        const id = element.id
        const used_ports = camerasServiceCameras.filter(x => x.camera_recorder_id === id).length
        const available_ports = 20
        if (used_ports < available_ports) { result = id; return true }
      });
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
