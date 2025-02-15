import { HttpException, Injectable } from '@nestjs/common';
// import { CreatePlaybackDto } from './playback.dtos';
import { generalResponse } from 'src/app.consts';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PlaybackService {

  constructor(private db: DbService, private readonly axios: HttpService) {}

  async get_playback() {
    const p = await this.db.camera_playback.findFirst()
    if (p) {
      return `http://${p.url}:${p.port}/camera_playback`
    } else {
      throw new HttpException({ status: false, data: null, error: 'no playback service found', msg: 'no playback service found' }, 406);
    }
  }

  async playback_create(body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.post(base_url, body)
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_info(id: string): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.get(base_url + '/' + id)
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

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

  async playback_start(id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/start', body)
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_speed(id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/speed', body)
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_pause(id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/pause', body)
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_resume(id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/resume', body)
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_stop(id: string): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.delete(base_url + '/' + id + '/stop')
      const result = { status: true, data: results.data, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_list(user: any, from: number, to: number): Promise<generalResponse> {
    try {

      const where = {}
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const my_cameras: any = await this.db.camera.findMany({ where, include: { camera_info: true, camera_recorder_camera: { include: { camera_recorder: true } } } });
      const final_result = []
      await Promise.all(my_cameras.map(async (cam: any) => {
        const session = cam.camera_recorder_camera.map((x: any) => x.session).length > 0 ? cam.camera_recorder_camera.map((x: any) => x.session)[0] : null
        if (session) {
          const url = cam.camera_recorder_camera.map((x: any) => x.camera_recorder.map((y: any) => y.url)[0])[0]
          const port = cam.camera_recorder_camera.map((x: any) => x.camera_recorder.map((y: any) => y.port)[0])[0]
          const base_url = `http://${url}:${port}/camera_recorder/data/` + session + '/' + from + '/' + to
          cam.record_data = []
          cam.record_result = 'pending'
          try {
            const results = await this.axios.axiosRef.get(base_url)
            cam.record_data = results.data.records
            cam.record_result = results.data.message
          } catch (error2) {
            cam.record_result = 'error'
          }
        } else {
          cam.record_data = []
          cam.record_result = 'no_session'
        }
        delete cam.camera_recorder_camera
        final_result.push(cam)
      }))
      const result = { status: true, data: final_result, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
