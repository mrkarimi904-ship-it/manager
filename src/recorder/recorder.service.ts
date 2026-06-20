import { ConflictException, forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';

import * as dtos from './recorder.dtos';

import { generalResponse } from 'src/app.consts';
import { LoggerService } from 'src/logger/logger.service';
import { CameraRecorderService } from 'src/camera_recorder/camera_recorder.service';
import { StreamService } from 'src/stream/stream.service';
import { LicenseService } from 'src/license/license.service';
import { RecorderScheduleService } from './recorder_schedule.service';

function normalizeRecorderStatus(status: string | null | undefined): string {
  return (status || 'none').trim().toUpperCase();
}

@Injectable()
export class RecorderService {
  constructor(
    private db: DbService,
    private readonly axios: HttpService,
    private loggerService: LoggerService,
    private camera_recorder_service: CameraRecorderService,
    private steamService: StreamService,
    private licenseService: LicenseService,
    @Inject(forwardRef(() => RecorderScheduleService))
    private recorderScheduleService: RecorderScheduleService,
  ) {}

  async get_list(user: any, camera_id: string): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] }
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_recorder_camera.findMany({ where: { camera: { some: { id: camera_id }} } })
      return { status: true, data: list, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async check_storage(user: any, camera_id: string, body: dtos.recorderStorageCheckDto): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] };
      if (user.isSuperAdmin !== true) {
        where['AND'].push({
          OR: [
            { user_accounts: { some: { id: { equals: user.id } } } },
            { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
            { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
            { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } },
          ],
        });
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) {
        throw new ConflictException();
      }

      const recorderServer = await this.db.camera_recorder.findUnique({ where: { id: body.recorder } });
      if (!recorderServer) {
        throw new ConflictException('Recorder service not found');
      }

      const service = `http://${recorderServer.url}:${recorderServer.port}/camera_recorder/storage`;
      const response = await this.axios.axiosRef.post(service, { path: body.path });

      const data = response.data?.data ?? response.data;
      const status = response.data?.status === 'OK' && response.data?.code === 200;
      return {
        status: !!status,
        data,
        error: status ? null : (response.data?.message ?? 'Storage check failed'),
        msg: response.data?.message ?? null,
      };
    } catch (error) {
      if (error.response?.data) {
        const msg = error.response.data?.message ?? error.response.data?.error ?? error.message;
        throw new HttpException(
          { status: false, data: null, error: msg, msg },
          error.response.status >= 400 ? error.response.status : 406,
        );
      }
      throw new HttpException({ status: false, data: null, error: error.message, msg: error.message }, 406);
    }
  }

  async add_item(user: any, camera_id: string, body: dtos.recorderPostDto): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] }
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const server = body.recorder
      delete body.recorder

      const item = await this.db.camera_recorder_camera.create({ data: { ...body, camera: { connect: { id: camera_id } }, camera_recorder: { connect: { id: server }} } })
      this.loggerService.log(`Recorder added`, 0, user, undefined, undefined, camera_id, undefined)
      return { status: true, data: item, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_item(user: any, camera_id: string, recorder_id: string): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] }
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_recorder_camera.findUnique({ where: { id: recorder_id, camera: { some: { id: camera_id }} }, include: { camera_recorder: true } })
      if (!list) { throw new ConflictException() }

      if (list.status === 'RUNNING') { return { status: true, data: list, error: null, msg: null } }

      const service_url = list.camera_recorder[0].url
      const service_port = list.camera_recorder[0].port
      const service = `http://${service_url}:${service_port}/camera_recorder/`

      // const stream_service = await this.db.camera_service_camera.findFirst({ where: { camera: { some: { id: camera_id } }, type: 'record' }, include: { camera_service: true } })
      // const stream = await this.db.camera_service.findUnique({ where: { id: stream_service.camera_service[0].id } })
      // const stream_url = stream.url
      // const stream_port = stream_service.port

      const uurl = service + `recorder`
      const results = await this.axios.axiosRef.get(uurl)
      const result = results.data.recorders.filter(x => x.session_id === list.session).map(x => { return { status: x.status, session: x.session_id } })
      return { status: true, data: {result: result, ...list }, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async put_item(user: any, camera_id: string, recorder_id: string, body: dtos.recorderPutDto): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] }
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_recorder_camera.findUnique({ where: { id: recorder_id, camera: { some: { id: camera_id }} } })
      if (!list) { throw new ConflictException() }

      if (list.status === 'RUNNING') { await this.stop_item(user, camera_id, recorder_id, { fromSchedule: true }) }

      const list2 = await this.db.camera_recorder_camera.update({ where: { id: recorder_id }, data: { title: body.title, enable_rotation: body.enable_rotation } })

      if (list.status === 'RUNNING') { await this.start_item(user, camera_id, recorder_id, { fromSchedule: true }) }

      this.loggerService.log(`Recorder edited`, 0, user, undefined, undefined, camera_id, undefined)
      return { status: true, data: list2, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async put_schedule(user: any, camera_id: string, recorder_id: string, body: dtos.recorderScheduleDto): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] }
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_recorder_camera.findUnique({ where: { id: recorder_id, camera: { some: { id: camera_id }} } })
      if (!list) { throw new ConflictException() }

      if (body.schedule_enabled && !/^[01]{168}$/.test(body.schedule_slots || '')) {
        throw { message: 'schedule_slots must be exactly 168 characters of 0 or 1' };
      }

      const list2 = await this.db.camera_recorder_camera.update({
        where: { id: recorder_id },
        data: { schedule_enabled: body.schedule_enabled, schedule_slots: body.schedule_slots }
      })

      if (list2.schedule_enabled) {
        await this.recorderScheduleService.applyForRecorder(recorder_id);
      }

      this.loggerService.log(`Recorder schedule updated`, 0, user, undefined, undefined, camera_id, undefined)
      return { status: true, data: list2, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async delete_item(user: any, camera_id: string, recorder_id: string): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] }
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_recorder_camera.findUnique({ where: { id: recorder_id, camera: { some: { id: camera_id }} } })
      if (!list) { throw new ConflictException() }

      await this.stop_item(user, camera_id, recorder_id, { fromSchedule: true })
      await this.clear_item(user, camera_id, recorder_id)

      const list2 = await this.db.camera_recorder_camera.delete({ where: { id: recorder_id, camera: { some: { id: camera_id } } } })

      this.loggerService.log(`Recorder removed`, 0, user, undefined, undefined, camera_id, undefined)
      return { status: true, data: list2, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async start_item(user: any, camera_id: string, recorder_id: string, options?: { fromSchedule?: boolean }): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] }
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_recorder_camera.findUnique({ where: { id: recorder_id, camera: { some: { id: camera_id }} }, include: { camera_recorder: true } })
      if (!list) { throw new ConflictException() }

      if (!options?.fromSchedule && list.schedule_enabled) {
        throw { message: 'Disable recorder schedule to manually control start/stop' };
      }

      if (list.isActive && normalizeRecorderStatus(list.status) === 'RUNNING') {
        return { status: true, data: list, error: null, msg: null };
      }

      // check license for active recorder count limit (exclude current recorder so restart after manager_improved restart does not hit limit)
      if (await this.licenseService.can_add_new_active_recorder(recorder_id) === false) { throw { message: 'License limit: active recorder limit reached' }; }

      const streamResult = await this.steamService.start(user, { cameraId: camera_id, type: 'HIGH' })
      const streamData = streamResult?.data as { port?: string; cameraService?: { url?: string } } | null | undefined
      const streamPort = streamData?.port
      const streamService = streamData?.cameraService
      if (!streamPort || streamPort === '0' || !streamService?.url) {
        throw { message: 'Stream not available: cannot start recorder' };
      }

      const service_url = list.camera_recorder[0].url
      const service_port = list.camera_recorder[0].port
      const service = `http://${service_url}:${service_port}/camera_recorder/`

      const stream_url = streamService.url
      const stream_port = streamPort

      if (list.session === 'none')
      {
        const newurl = service + `recorder/start`
        const cc = await this.axios.axiosRef.post(newurl, { name: list.title, camera_id: camera_id, storage_path: list.storage_path, quota: list.quota, block_size:list.block_size, stream_host: stream_url, stream_port:stream_port, rotation: list.enable_rotation })
        await this.db.camera_recorder_camera.update({ where: { id: list.id }, data: { status: cc.data?.recorder.status, session: cc.data?.recorder.session_id, isActive: true } })
        this.loggerService.log('Recorder started', 0, user, undefined, undefined, camera_id, undefined)
        return { status: true, data: { status: true, session: cc.data?.recorder.session_id }, error: null, msg: null };
      } else {
        const newurl = service + `recorder/` + list.session + `/start`
        const cc = await this.axios.axiosRef.post(newurl, { stream_host: stream_url, stream_port:stream_port, rotation: list.enable_rotation })
        await this.db.camera_recorder_camera.update({ where: { id: list.id }, data: { status: cc.data?.recorder.status, session: cc.data?.recorder.session_id, isActive: true } })
        this.loggerService.log('Recorder started', 0, user, undefined, undefined, camera_id, undefined)
        return { status: true, data: { status: true, session: cc.data?.recorder.session_id }, error: null, msg: null };
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async stop_item(user: any, camera_id: string, recorder_id: string, options?: { fromSchedule?: boolean }): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] }
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_recorder_camera.findUnique({ where: { id: recorder_id, camera: { some: { id: camera_id }} }, include: { camera_recorder: true } })
      if (!list) { throw new ConflictException() }

      if (!options?.fromSchedule && list.schedule_enabled) {
        throw { message: 'Disable recorder schedule to manually control start/stop' };
      }

      if (normalizeRecorderStatus(list.status) === 'STOPPED') {
        await this.db.camera_recorder_camera.update({ where: { id: list.id }, data: { isActive: false } });
        return { status: true, data: { ...list, isActive: false }, error: null, msg: null };
      }

      const service_url = list.camera_recorder[0].url
      const service_port = list.camera_recorder[0].port
      const service = `http://${service_url}:${service_port}/camera_recorder/`

      // const stream_service = await this.db.camera_service_camera.findFirst({ where: { camera: { some: { id: camera_id } }, type: 'record' }, include: { camera_service: true } })
      // const stream = await this.db.camera_service.findUnique({ where: { id: stream_service.camera_service[0].id } })
      // const stream_url = stream.url
      // const stream_port = stream_service.port

      const newurl = service + `recorder/` + list.session
      const cc = await this.axios.axiosRef.delete(newurl)
      const list2 = await this.db.camera_recorder_camera.update({ where: { id: list.id }, data: { status: 'STOPPED', isActive: false } })
      this.loggerService.log('Recorder stopped', 0, user, undefined, undefined, camera_id, undefined)
      return { status: true, data: list2, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async clear_item(user: any, camera_id: string, recorder_id: string): Promise<generalResponse> {
    try {
      const where = { id: camera_id, AND: [] }
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_recorder_camera.findUnique({ where: { id: recorder_id, camera: { some: { id: camera_id }} }, include: { camera_recorder: true } })
      if (!list) { throw new ConflictException() }

      await this.stop_item(user, camera_id, recorder_id, { fromSchedule: true })

      const service_url = list.camera_recorder[0].url
      const service_port = list.camera_recorder[0].port
      const service = `http://${service_url}:${service_port}/camera_recorder/`

      const newurl = service + `data/` + list.session
      const cc = await this.axios.axiosRef.delete(newurl)

      this.loggerService.log('Recorder records removed', 0, user, undefined, undefined, camera_id, undefined)

      await this.db.camera_recorder_camera.update({ where: { id: list.id }, data: { session: 'none' } })

      return { status: true, data: list, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  // async start_after_restart(recorder_id: string): Promise<generalResponse> {
  //   try {
  //     const list = await this.db.camera_recorder_camera.findUnique({ where: { id: recorder_id }, include: { camera_recorder: true, camera: true } })
  //     if (list.status === 'RUNNING') {
  //       const service_url = list.camera_recorder[0].url
  //       const service_port = list.camera_recorder[0].port
  //       const service = `http://${service_url}:${service_port}/camera_recorder/`

  //       const stream_service = await this.db.camera_service_camera.findFirst({ where: { camera: { some: { id: list.camera[0].id } }, type: 'record' }, include: { camera_service: true } })
  //       const stream = await this.db.camera_service.findUnique({ where: { id: stream_service.camera_service[0].id } })
  //       const stream_url = stream.url
  //       const stream_port = stream_service.port

  //       const newurl = service + `recorder/` + list.session + `/start`
  //       const cc = await this.axios.axiosRef.post(newurl, { stream_host: stream_url, stream_port:stream_port, rotation: list.enable_rotation })
  //       await this.db.camera_recorder_camera.update({ where: { id: list.id }, data: { status: cc.data?.recorder.status, session: cc.data?.recorder.session_id } })
  //     }
  //     return { status: true, data: null, error: null, msg: null }
  //   } catch (error) {
  //     throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
  //   }
  // }

  async delete_all(user: any, camera_id: string): Promise<generalResponse> {
    try {

      const list = await this.db.camera_recorder_camera.findMany({ where: { camera: { some: { id: camera_id }} }, include: { camera_recorder: true } })

      await Promise.all(list.map(async (item) => {
        await this.stop_item(user, camera_id, item.id)
        await this.clear_item(user, camera_id, item.id)
        await this.delete_item(user, camera_id, item.id)
      }));

      return { status: true, data: null, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  @OnEvent('recorder.restart')
  async handleRestart(payload: { cameraId: string; recorderId: string }) {
    try {
      await this.start_item({ isSuperAdmin: true }, payload.cameraId, payload.recorderId);
    } catch (error) {
      console.log('error restarting recorder', payload.recorderId, error?.message || error);
    }
  }
}
