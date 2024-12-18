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
      const result = { status: false, data: results, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_info(id: string): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.get(base_url + '/' + id)
      const result = { status: false, data: results, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_data(id: string): Promise<generalResponse> {
    try {
      const p1 = this.db.camera_recorder_camera.findFirst({ where: { session: id }, include: { camera_recorder: true } })
      if (!p1) { throw { message: 'invalid recorder session id' } }
      const p2 = p1.camera_recorder[0]
      const base_url = `http://${p2.url}:${p2.port}/camera_recorder/data/` + id
      const results = await this.axios.axiosRef.get(base_url)
      const result = { status: false, data: results, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_start(id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/start', body)
      const result = { status: false, data: results, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_speed(id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/speed', body)
      const result = { status: false, data: results, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_pause(id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/pause', body)
      const result = { status: false, data: results, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_resume(id: string, body: any): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.post(base_url + '/' + id + '/resume', body)
      const result = { status: false, data: results, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async playback_stop(id: string): Promise<generalResponse> {
    try {
      const base_url = await this.get_playback()
      const results = await this.axios.axiosRef.delete(base_url + '/' + id + '/stop')
      const result = { status: false, data: results, error: null, msg: null }
      return result;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
