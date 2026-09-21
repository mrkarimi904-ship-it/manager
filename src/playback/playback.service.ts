import { HttpException, Inject, Injectable } from '@nestjs/common';
// import { CreatePlaybackDto } from './playback.dtos';
import { generalResponse } from 'src/app.consts';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';
import { LoggerService } from 'src/logger/logger.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PlaybackService {

  constructor(private db: DbService, private readonly axios: HttpService, private loggerService: LoggerService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async playback_data(id: string): Promise<generalResponse> {
    try {
      const p1 = await this.db.camera_recorder_camera.findFirst({ where: { session: id }, include: { camera_recorder: true } })
      if (!p1) { throw { message: 'invalid recorder session id' } }
      const p2 = p1.camera_recorder[0]
      const base_url = `http://${p2.url}:${p2.port}/camera_recorder/data/` + id
      const results = await this.axios.axiosRef.get(base_url)
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_playback_url(session_id: string) {
    const p = await this.cacheManager.get(`camera_playback_url_${session_id}`) as any;
    if (p) { return p }
    try {
      const p1 = await this.db.camera_recorder_camera.findFirst({ where: { session: session_id }, include: { camera_recorder: true } })
      if (!p1) { throw { message: 'invalid recorder session id' } }
      const p2 = p1.camera_recorder[0]
      if (!p2) { throw { message: 'invalid recorder service' } }
      const p3 = await this.db.camera_playback.findFirst({ where: { url: p2.url } })
      if (!p3) { throw { message: 'invalid playback service' } }
      const base_url = `http://${p3.url}:${p3.port}/camera_playback`
      await this.cacheManager.set(`camera_playback_url_${session_id}`, base_url)
      return base_url;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
    // p = await this.db.camera_playback.findFirst()
    // if (p) {
    //   await this.cacheManager.set(`camera_playback_url_${session_id}`, p)
    //   return `http://${p.url}:${p.port}/camera_playback`
    // } else {
    //   throw new HttpException({ status: false, data: null, error: 'no playback service found', msg: 'no playback service found' }, 406);
    // }
  }

  async playback_create(user: any, recorder_session: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback_url(recorder_session)
      const results = await this.axios.axiosRef.post(base_url, body)
      // prepare url of playback service so client knows where to connect
      const p1 = await this.db.camera_recorder_camera.findFirst({ where: { session: recorder_session }, include: { camera_recorder: true } })
      const p2 = p1.camera_recorder[0]
      const p3 = await this.db.camera_playback.findFirst({ where: { url: p2.url } })
      // return
      this.loggerService.log('camera playback requested', 0, user)
      const result = { status: true, data: { result: results.data, url: p3.url }, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_info(recorder_session: string, id: string): Promise<generalResponse> {
    try {
      let results = await this.cacheManager.get(`camera_playback_${id}`) as any;
      if (!results) {
        const base_url = await this.get_playback_url(recorder_session)
        results = await this.axios.axiosRef.get(base_url + '/' + id)
        await this.cacheManager.set(`camera_playback_${id}`, results)
      }
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_start(recorder_session: string, id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback_url(recorder_session)
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/start', body)
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_speed(recorder_session: string, id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback_url(recorder_session)
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/speed', body)
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_pause(recorder_session: string, id: string): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback_url(recorder_session)
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/pause')
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_resume(recorder_session: string, id: string): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback_url(recorder_session)
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/resume')
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_stop(recorder_session: string, id: string): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback_url(recorder_session)
      const results = await this.axios.axiosRef.delete(base_url + '/' + id + '/stop')
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_list(user: any, from: number, to: number): Promise<generalResponse> {
    try {
      const where: any = {}
      if (user.isSuperAdmin !== true) {
        where['AND'] = [{ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] }]
      }
      const my_cameras: any = await this.db.camera.findMany({ where, include: { camera_info: true, camera_recorder_camera: { include: { camera_recorder: true } } } });
      const final_result = []
      await Promise.all(my_cameras.map(async (cam: any) => {
        cam.record_data = []
        cam.record_result = 'no_session'
        // a camera can be assigned to several recorder sessions - query all of them and merge the records
        await Promise.all((cam.camera_recorder_camera || []).map(async (recorder_camera: any) => {
          const session = recorder_camera.session
          const recorder = recorder_camera.camera_recorder?.[0]
          if (!session || session === 'none' || !recorder) { return }
          const base_url = `http://${recorder.url}:${recorder.port}/camera_recorder/data/` + session + '/' + from + '/' + to
          try {
            const results = await this.axios.axiosRef.get(base_url)
            cam.record_data = cam.record_data.concat(results.data.records || [])
            cam.record_result = results.data.message
          } catch (error2) {
            console.log(error2)
            if (cam.record_result === 'no_session') { cam.record_result = 'error' }
          }
        }))
        delete cam.camera_recorder_camera
        if (cam.record_data.length > 0) { final_result.push(cam) }
      }))
      const result = { status: true, data: final_result, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
