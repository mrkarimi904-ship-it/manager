import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import * as dtos from './lpr_service.dtos';

import { generalResponse } from 'src/app.consts';

import { StreamService } from 'src/stream/stream.service';

import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { LoggerService } from 'src/logger/logger.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { LprService } from 'src/lpr/lpr.service';
import { LicenseService } from 'src/license/license.service';

@Injectable()
export class LprServiceService {
  constructor(private db: DbService, private streamService: StreamService, private readonly axios: HttpService, private loggerService: LoggerService, private eventEmitter: EventEmitter2, private lprSrv : LprService, private licenseService: LicenseService) {
    this.reInit()
  }

  async getAll(): Promise<generalResponse> {
    try {
      const lprService: dtos.lprServiceDto[] = await this.db.camera_lpr.findMany({ include: { camera_lpr_camera: true }, orderBy: [{ created_at: 'desc' }] });
      const response: generalResponse = { status: true, data: lprService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getSingle(id: string): Promise<generalResponse> {
    try {
      const lprService: dtos.lprServiceDto = await this.db.camera_lpr.findUnique({ where: { id: id }, include: { camera_lpr_camera: true } });
      const response: generalResponse = { status: true, data: lprService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postSingle(body: dtos.postLprServiceDto): Promise<generalResponse> {
    try {
      // check license
      if (await this.licenseService.can_add_new_lpr_service() === false) { throw { message: 'License limit: lpr service not available' }; }
      const lprService: dtos.lprServiceDto = await this.db.camera_lpr.upsert({ where: { id: body.id}, update: { port: body.swagger_port, url: body.url }, create: { id: body.id, url: body.url, port: body.swagger_port } })
      this.eventEmitter.emit('background.camera_lpr', body);
      // return
      this.loggerService.log('lpr service instance registered', 0)
      const response: generalResponse = { status: true, data: lprService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteSingle(id: string): Promise<generalResponse> {
    try {
      const lprService: dtos.lprServiceDto = await this.db.camera_lpr.delete({ where: { id: id } })
      // return
      this.loggerService.log('lpr service instance removed', 0)
      const response: generalResponse = { status: true, data: lprService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getStatus(): Promise<generalResponse> {
    try {
      const lprService = await this.db.camera_lpr.findMany({ include: { camera_lpr_camera: true } });
      const statusData = [];
      await Promise.all(lprService.map(async (element) => {
        const cameraServiceUrl = element.url;
        const cameraServicePort = element.port;
        const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/lpr_service`;
        try {
          const results = await this.axios.axiosRef.get(uurl);
          const externalStatuses = results.data.data || [];
          const serviceStatus = {
            lpr_service_id: element.id,
            lpr_service_url: cameraServiceUrl,
            lpr_service_port: cameraServicePort,
            instances: []
          };
          await Promise.all(externalStatuses.map(async (elm: any) => {
            const externalId = elm.lpr_id;
            const externalStatus = elm.lpr_status;
            const externalStatusCode = elm.lpr_status_code;
            const t1 = await this.db.camera_lpr_camera.findFirst({ where: { id: externalId } });
            if (t1) {
              await this.db.camera_lpr_camera.update({ where: { id: t1.id }, data: { status: externalStatus } });
              serviceStatus.instances.push({
                id: t1.id,
                title: t1.title,
                external_id: externalId,
                external_status: externalStatus,
                external_status_code: externalStatusCode,
                db_status: externalStatus,
                isActive: t1.isActive
              });
            } else {
              serviceStatus.instances.push({
                id: null,
                title: null,
                external_id: externalId,
                external_status: externalStatus,
                external_status_code: externalStatusCode,
                db_status: null,
                isActive: null
              });
            }
          }));
          statusData.push(serviceStatus);
        } catch (error) {
          const errorMsg = error.response && error.response.status >= 500 ? 'LPR service unavailable' : 'Failed to get status'
          statusData.push({
            lpr_service_id: element.id,
            lpr_service_url: cameraServiceUrl,
            lpr_service_port: cameraServicePort,
            error: errorMsg,
            instances: []
          });
        }
      }));
      return { status: true, data: statusData, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  @Cron('*/2 * * * *')
  async handleCron() {
    if (process.env.NODE_ENV) { return true }
    try {
      console.debug('scanning lprservice ...', new Date().toString());
      await this.db.camera_lpr_camera.updateMany({ where: { isActive: true }, data: { status: 'loading ...' } })
      const lprService = await this.db.camera_lpr.findMany({ include: { camera_lpr_camera: true } });
      await Promise.all(lprService.map(async (element) => {
        const cameraServiceUrl = element.url;
        const cameraServicePort = element.port;
        const uurl = `http://${cameraServiceUrl}:${cameraServicePort}/lpr_service`
        try {
          const results = await this.axios.axiosRef.get(uurl)
          await Promise.all(results.data.data.map(async (elm: any) => {
            const id = elm.lpr_id
            const externalStatus = elm.lpr_status
            // only sync active rows, so a locally stopped instance (e.g. FAILED) is not resurrected
            const t1 = await this.db.camera_lpr_camera.findFirst({ where: { id: id, isActive: true } })
            if (t1) {
              await this.db.camera_lpr_camera.update({ where: { id: t1.id }, data: { status: externalStatus } })
            }
          }));
        } catch (error: any) {
          this.loggerService.log_and_notify_admins(`LPR service disconnected: ${element.url}:${element.port} - ${error?.message || 'unreachable'}`, 1);
          console.log('error scanning lprservice for', element.id, error.message)
        }
      }));
      await this.db.camera_lpr_camera.updateMany({ where: { status: 'loading ...' },  data: { status: 'STOPPED' } })
    } catch (error) {
      console.log('error scanning lprservice', error)
    }
  }

  @OnEvent('stream.record_restarted')
  async handleStreamRecordRestarted(payload: { cameraId: string }) {
    try {
      const activeLprs = await this.db.camera_lpr_camera.findMany({
        where: { camera: { some: { id: payload.cameraId } }, isActive: true },
        include: { camera: true },
      });
      for (const item of activeLprs) {
        try {
          const camId = item.camera?.[0]?.id;
          if (!camId) continue;
          // Stop first to clean up old instance (was using dead stream)
          try {
            await this.lprSrv.stop({ isSuperAdmin: true }, camId, item.id);
          } catch (_) {
            // may already be stopped or in transitional state
          }
          await new Promise((r) => setTimeout(r, 2000)); // LPR needs time before restart
          await this.lprSrv.start({ isSuperAdmin: true }, camId, item.id);
          await new Promise((r) => setTimeout(r, 2000)); // stagger next LPR; LPR stays PENDING before RUNNING
        } catch (err) {
          console.log('error restarting LPR after stream restart', item.id, err?.message || err);
        }
      }
    } catch (err) {
      console.log('error in stream.record_restarted handler', err?.message || err);
    }
  }

  @OnEvent('background.camera_lpr')
  async handleBackgroundTask(body: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('start backgrount task to start lprs', body)
    const lprService = await this.db.camera_lpr.findUnique({ where: { id: body.id} })
    if (!lprService) return
    // try to start currently registered lprs
    const camera_lpr_camera = await this.db.camera_lpr_camera.findMany({ where: { camera_lpr: { some: { id: lprService.id }}, isActive: true }, include: { camera: true } })
    void Promise.all(camera_lpr_camera.map(async (element) => {
      const allCameras = element.camera;
      await this.lprSrv.start({ isSuperAdmin: true }, allCameras[0].id, element.id);
    })).catch((err) => console.error('background.camera_lpr start error:', err));
  }

  async reInit() {
    try {
      try {
        await this.handleCron()
      } catch (error) {
        console.log('error reInit lpr services job: ', error)
      }
      const reStart = await this.db.camera_lpr_camera.findMany({ where: { isActive: true, status: 'STOPPED' }, include: { camera: true  } })
      await Promise.all(reStart.map(async (element) => {
          try {
            await this.lprSrv.start({ isSuperAdmin: true }, element.camera[0].id, element.id)
          } catch (error) {
            console.log('error reInit lpr services item: ', error)
          }
      }));
    } catch (error) {
      console.log('error reInit lpr services: ', error)
    }
  }

  // async postRestart(id: string): Promise<generalResponse> {
  //   try {
  //     this.eventEmitter.emit('background.camera_lpr_restart', id);
  //     const response: generalResponse = { status: true, data: null, error: null, msg: null };
  //     return response;
  //   } catch (error) {
  //     throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
  //   }
  // }

  // @OnEvent('background.camera_lpr_restart')
  // async handleBackgroundTaskRestart(id: string) {
  //   console.log('restart lpr service initiated', id)
  //   await this.loggerService.log_and_notify_all(`LPR instances on LPR Service ${id} are restarting due to memory limit`, 2)
  //   const reStart = await this.db.camera_lpr_camera.findMany({ where: { isActive: true }, include: { camera: true  } })
  //   await Promise.all(reStart.map(async (element) => {
  //       try {
  //         await this.lprSrv.stop({ isSuperAdmin: true }, element.camera[0].id, element.id)
  //         await new Promise(r => setTimeout(r, 1000))
  //         await this.lprSrv.start({ isSuperAdmin: true }, element.camera[0].id, element.id)
  //       } catch (error) {
  //         console.log('error restarting lpr services item: ', error)
  //       }
  //   }));
  // }

}
