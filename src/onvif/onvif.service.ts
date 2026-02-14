import { HttpException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';
import { generalResponse } from 'src/app.consts';
import { buildUserPermissionWhere } from 'src/app.shared';

@Injectable()
export class OnvifService {
  constructor(private db: DbService, private readonly axios: HttpService) {}

  private getBaseUrl(): string {
    const base = process.env.ONVIF_SERVICE;
    if (!base) {
      throw new HttpException({ status: false, data: null, error: 'ONVIF_SERVICE not configured', msg: 'ONVIF_SERVICE not configured' }, 500);
    }
    return base.replace(/\/$/, '');
  }

  async getCameraForUser(user: any, cameraId: string): Promise<{ id: string; url: string; username: string; password: string }> {
    const where: any = { id: cameraId, deleted: false, AND: [] };
    if (user.isSuperAdmin !== true) {
      buildUserPermissionWhere(user, where);
    }
    const camera = await this.db.camera.findFirst({
      where,
      select: { id: true, url: true, username: true, password: true },
    });
    if (!camera) {
      throw new HttpException({ status: false, data: null, error: 'Camera not found or access denied', msg: 'Camera not found or access denied' }, 404);
    }
    return camera;
  }

  async proxy(user: any, cameraId: string, method: string, path: string, body?: any): Promise<generalResponse> {
    try {
      const camera = await this.getCameraForUser(user, cameraId);
      const baseUrl = this.getBaseUrl();
      const targetPath = path.startsWith('/') ? path : `/${path}`;
      const url = `${baseUrl}${targetPath}`;

      const connection = { url: camera.url, username: camera.username, password: camera.password };
      const payload = {
        ...(body && typeof body === 'object' ? body : {}),
        ...connection,
        camera_connection: connection,
      };

      let response: any;
      const config = { timeout: 60 * 1000 }; // 60 seconds

      if (method === 'GET') {
        response = await this.axios.axiosRef.get(url, config);
      } else if (method === 'POST') {
        response = await this.axios.axiosRef.post(url, payload, config);
      } else if (method === 'DELETE') {
        response = await this.axios.axiosRef.delete(url, { ...config, data: payload });
      } else if (method === 'PUT') {
        response = await this.axios.axiosRef.put(url, payload, config);
      } else {
        throw new HttpException({ status: false, data: null, error: `Method ${method} not allowed`, msg: `Method ${method} not allowed` }, 405);
      }

      if (response.data && typeof response.data === 'object' && 'error' in response.data && response.data.error) {
        return {
          status: false,
          data: null,
          error: response.data.error,
          msg: response.data.error,
        };
      }

      return {
        status: true,
        data: response.data,
        error: null,
        msg: null,
      };
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const msg = typeof data === 'object' && data?.error ? data.error : error.message;
        throw new HttpException(
          { status: false, data: null, error: data?.error ?? msg, msg },
          status >= 400 ? status : 406,
        );
      }
      throw new HttpException(
        { status: false, data: null, error: error.message || 'ONVIF request failed', msg: error.message || 'ONVIF request failed' },
        406,
      );
    }
  }

  async discovery(user: any): Promise<generalResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/camera/discovery`;
      const response = await this.axios.axiosRef.get(url, { timeout: 60 * 1000 }); // 60 seconds
      return { status: true, data: response.data, error: null, msg: null };
    } catch (error) {
      if (error.response) {
        const data = error.response.data;
        const msg = typeof data === 'object' && data?.error ? data.error : error.message;
        throw new HttpException({ status: false, data: null, error: data?.error ?? msg, msg }, error.response.status >= 400 ? error.response.status : 406);
      }
      throw new HttpException(
        { status: false, data: null, error: error.message || 'ONVIF discovery failed', msg: error.message || 'ONVIF discovery failed' },
        406,
      );
    }
  }
}
