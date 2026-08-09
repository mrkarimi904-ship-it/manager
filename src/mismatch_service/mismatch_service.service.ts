import { HttpException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import * as dtos from './mismatch_service.dtos';
import { generalResponse } from 'src/app.consts';
import { StreamService } from 'src/stream/stream.service';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { LoggerService } from 'src/logger/logger.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MismatchService } from 'src/mismatch/mismatch.service';

@Injectable()
export class MismatchServiceService {
  constructor(private db: DbService, private streamService: StreamService, private readonly axios: HttpService, private loggerService: LoggerService, private eventEmitter: EventEmitter2, private mismatchSrv : MismatchService) {
    this.reInit()
  }

  async getAll(): Promise<generalResponse> {
    try {
      const mismatchService: dtos.mismatchServiceDto[] = await this.db.mismatch_service.findMany({ include: { mismatch: true }, orderBy: [{ created_at: 'desc' }] });
      const response: generalResponse = { status: true, data: mismatchService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getSingle(id: string): Promise<generalResponse> {
    try {
      const mismatchService: dtos.mismatchServiceDto = await this.db.mismatch_service.findUnique({ where: { id: id }, include: { mismatch: true } });
      const response: generalResponse = { status: true, data: mismatchService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postSingle(body: dtos.postMismatchServiceDto): Promise<generalResponse> {
    try {
      const mismatchService: dtos.mismatchServiceDto = await this.db.mismatch_service.upsert({ where: { id: body.id}, update: { port: body.swagger_port, url: body.url }, create: { id: body.id, url: body.url, port: body.swagger_port } })

      this.eventEmitter.emit('background.mismatch_service', body);
      // return
      this.loggerService.log('mismatch service instance registered', 0)
      const response: generalResponse = { status: true, data: mismatchService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteSingle(id: string): Promise<generalResponse> {
    try {
      const mismatchService: dtos.mismatchServiceDto = await this.db.mismatch_service.delete({ where: { id: id } })
      // return
      this.loggerService.log('mismatch service instance removed', 0)
      const response: generalResponse = { status: true, data: mismatchService, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  @Cron('*/2 * * * *')
  async handleCron() {
    if (process.env.NODE_ENV) { return true }
    try {
      console.debug('scanning mismatch service ...', new Date().toString());
      await this.db.mismatch.updateMany({ where: { isActive: true }, data: { status: 'loading ...' } })
      const mismatchService = await this.db.mismatch_service.findMany({ include: { mismatch: true } });
      await Promise.all(mismatchService.map(async (element) => {
        const mismatchServiceId = element.id;
        const mismatchServiceUrl = element.url;
        const mismatchServicePort = element.port;
        const uurl = `http://${mismatchServiceUrl}:${mismatchServicePort}/lpr-mismatch/status`
        try {
          const results = await this.axios.axiosRef.get(uurl)
          await Promise.all(results.data.map(async (elm) => {
            const id = elm.id
            const t1 = await this.db.mismatch.findFirst({ where: { session: id } })
            if (t1 && elm.processing === true) {
              await this.db.mismatch.update({ where: { id: t1.id }, data: { status: 'RUNNING' } })
            }
            if (t1 && elm.processing === false) {
              await this.db.mismatch.update({ where: { id: t1.id }, data: { status: 'STOPPED', session: 'none' } })
            }
          }));
        } catch (err: any) {
          this.loggerService.log_and_notify_admins(`Mismatch service disconnected: ${mismatchServiceUrl}:${mismatchServicePort} - ${err?.message || 'unreachable'}`, 1);
          console.log('error scanning mismatch service', mismatchServiceUrl, err?.message);
        }
      }));
      await this.db.mismatch.updateMany({ where: { status: 'loading ...' },  data: { status: 'STOPPED' } })
    } catch (error) {
      console.log('error scanning mismatch service', error)
    }
  }

  @OnEvent('background.mismatch_service')
  async handleBackgroundTask(body: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('start backgrount task to start mismatches', body)
    const mismatchService = await this.db.mismatch_service.findUnique({ where: { id: body.id} })
    if (!mismatchService) return
    // try to start currently registered mismatches
    const mismatch = await this.db.mismatch.findMany({ where: { mismatch_service: { some: { id: mismatchService.id }}, isActive: true }, include: { camera1: true, camera2: true } })
    void Promise.all(mismatch.map(async (element) => {
      await this.mismatchSrv.start({ isSuperAdmin: true }, element.id);
    })).catch((err) => console.error('background.mismatch_service start error:', err));
  }

  async reInit() {
    try {
      try {
        await this.handleCron()
      } catch (error) {
        console.log('error reInit mismatch services job: ', error)
      }
      const reStart = await this.db.mismatch.findMany({ where: { isActive: true, status: 'STOPPED' }, include: { camera1: true, camera2: true  } })
      await Promise.all(reStart.map(async (element) => {
          try {
            await this.mismatchSrv.start({ isSuperAdmin: true }, element.id)
          } catch (error) {
            console.log('error reInit mismatch services item: ', error)
          }
      }));
    } catch (error) {
      console.log('error reInit mismatch services: ', error)
    }
  }

}
