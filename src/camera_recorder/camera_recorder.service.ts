import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import * as dtos from './camera_recorder.dtos';

import { generalResponse } from 'src/app.consts';

import { StreamService } from 'src/stream/stream.service';

import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { LoggerService } from 'src/logger/logger.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { LicenseService } from 'src/license/license.service';

@Injectable()
export class CameraRecorderService implements OnModuleInit {
  constructor(private db: DbService, private streamService: StreamService, private readonly axios: HttpService, private loggerService: LoggerService, private eventEmitter: EventEmitter2, private licenseService: LicenseService) {}

  async onModuleInit() {
    await this.reInitRecorders();
  }

  private async reInitRecorders() {
    try {
      await this.syncRecorderStatuses();
      const toRestart = await this.db.camera_recorder_camera.findMany({
        where: { isActive: true, status: { not: 'RUNNING' } },
        include: { camera: true },
      });
      toRestart.forEach((item) => {
        this.eventEmitter.emit('recorder.restart', { cameraId: item.camera[0].id, recorderId: item.id });
      });
    } catch (err) {
      console.log('error reInit recorders', err?.message || err);
    }
  }

  private async syncRecorderStatuses() {
    const cameraRecorders = await this.db.camera_recorder.findMany({ include: { camera_recorder_camera: { include: { camera: true } } } });
    await Promise.all(cameraRecorders.map(async (element) => {
      const cameraRecorderId = element.id;
      const cameraRecorderUrl = element.url;
      const cameraRecorderPort = element.port;
      const uurl = `http://${cameraRecorderUrl}:${cameraRecorderPort}/camera_recorder/recorder`;
      try {
        const results = await this.axios.axiosRef.get(uurl);
        await this.db.camera_recorder_camera.updateMany({ where: { camera_recorder: { some: { id: cameraRecorderId } } }, data: { status: 'loading ...' } });
        const revordes = element.camera_recorder_camera;
        await Promise.all(revordes.map(async (rev) => {
          const db_session = rev.session;
          const rr = results.data.recorders.filter((x: any) => x.session_id === db_session);
          if (rr && rr.length > 0) {
            await this.db.camera_recorder_camera.updateMany({ where: { camera_recorder: { some: { id: cameraRecorderId } }, camera: { some: { id: rev.camera[0].id } }, session: db_session }, data: { status: rr[0].status } });
          } else {
            await this.db.camera_recorder_camera.updateMany({ where: { camera_recorder: { some: { id: cameraRecorderId } }, camera: { some: { id: rev.camera[0].id } }, session: db_session }, data: { status: 'STOPPED' } });
          }
        }));
      } catch (err: any) {
        this.loggerService.log_and_notify_admins(`Recorder service disconnected: ${cameraRecorderUrl}:${cameraRecorderPort} - ${err?.message || 'unreachable'}`, 1);
      }
    }));
  }

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
      // check license
      if (await this.licenseService.can_add_new_recorder_service() === false) { throw { message: 'License limit: recorder service not available' }; }
      const cameraRecorder: dtos.cameraRecorderDto = await this.db.camera_recorder.upsert({ where: { id: body.id}, update: { port: body.swagger_port, url: body.url }, create: { id: body.id, url: body.url, port: body.swagger_port } })
      this.eventEmitter.emit('background.recorder_service', body);
      // return
      this.loggerService.log('camera recorder instance registered', 0)
      const response: generalResponse = { status: true, data: cameraRecorder, error: null, msg: null };
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

  @Cron('30 */5 * * * *')
  async handleCron() {
    if (process.env.NODE_ENV) { return true }
    try {
      console.debug('scanning camerarecorders ...', new Date().toString());
      await this.syncRecorderStatuses();
      const toRestart = await this.db.camera_recorder_camera.findMany({
        where: { isActive: true, status: { not: 'RUNNING' } },
        include: { camera: true },
      });
      if (toRestart.length > 0) {
        this.loggerService.log_and_notify_admins(`${toRestart.length} recorder(s) not running, attempting restart`, 1);
      }
      toRestart.forEach((item) => {
        this.eventEmitter.emit('recorder.restart', { cameraId: item.camera[0].id, recorderId: item.id });
      });
    } catch (error) {
      console.log('error scanning camerarecorders', error);
    }
  }

  @OnEvent('background.recorder_service')
  async handleBackgroundTask(body: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('start background task to start recorders', body);
    const cameraRecorder = await this.db.camera_recorder.findUnique({ where: { id: body.id } });
    if (!cameraRecorder) return;
    const active_recorders = await this.db.camera_recorder_camera.findMany({
      where: { camera_recorder: { some: { id: cameraRecorder.id } }, isActive: true },
      include: { camera: true },
    });
    active_recorders.forEach((item) => {
      this.eventEmitter.emit('recorder.restart', { cameraId: item.camera[0].id, recorderId: item.id });
    });
  }
}
