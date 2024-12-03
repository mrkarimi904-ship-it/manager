import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import * as dtos from './camera_playback.dtos';

import { generalResponse } from 'src/app.consts';

import { RecorderService } from 'src/recorder/recorder.service';
import { LiveService } from 'src/live/live.service';

import { HttpService } from '@nestjs/axios';

@Injectable()
export class CameraPlaybackService {
  constructor(private db: DbService, private recorderservice: RecorderService, private liveService: LiveService, private readonly axios: HttpService) {}

  async getAll(): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraPlaybackDto[] = await this.db.camera_playback.findMany({});
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getSingle(id: string): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraPlaybackDto = await this.db.camera_playback.findUnique({ where: { id: id }});
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postSingle(body: dtos.postCameraPlaybackDto): Promise<generalResponse> {
    try {
      const camerasService: dtos.cameraPlaybackDto = await this.db.camera_playback.upsert({ where: { id: body.id}, update: { port: body.swagger_port, url: body.url }, create: { url: body.url, port: body.swagger_port } })
      // try to start currently registered cameras
      // const allCameraPlaybacks = await this.db.camera_playback.findMany()
      // allCameraPlaybacks.forEach(async element => {
        // const temp_id = element.id;
        // const allCameras = await this.db.camera_playback_camera.findMany({ where: { camera_playback_id: temp_id } })
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
      const camerasService: dtos.cameraPlaybackDto = await this.db.camera_playback.delete({ where: { id: id } })
      const response: generalResponse = { status: true, data: camerasService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
