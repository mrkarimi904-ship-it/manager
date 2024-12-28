import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';
import { CameraServiceService } from 'src/camera_service/camera_service.service';

import * as dtos from './camera_group.dtos';

import { generalResponse } from 'src/app.consts';
import { RecorderService } from 'src/recorder/recorder.service';
import { StreamService } from 'src/stream/stream.service';

@Injectable()
export class CameraGroupService {
  constructor(private db: DbService, private readonly axios: HttpService, private cameraservice: CameraServiceService, private recorderservice: RecorderService, private streamService: StreamService) {}

  async allGroups(user: any, query: dtos.groupSearchQuery): Promise<generalResponse> {
    try {
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.search) { where['AND'].push({ OR: [ { name: { contains: query.search, mode: 'insensitive' } } ] }) }
      if (query.cameraId && query.cameraFilter === 'Include') { where['AND'].push({ camera: { some: { id: { equals: query.cameraId } } } }) }
      if (query.cameraId && query.cameraFilter === 'Exclude') { where['AND'].push({ camera: { none: { id: { equals: query.cameraId } } } }) }
      if (query.userId && query.userFilter === 'Include') { where['AND'].push({ user_accounts: { some: { id: { equals: query.userId } } } }) }
      if (query.userId && query.userFilter === 'Exclude') { where['AND'].push({ user_accounts: { none: { id: { equals: query.userId } } } }) }
      if (query.userGroupId && query.userGroupFilter === 'Include') { where['AND'].push({ user_groups: { some: { id: { equals: query.userGroupId } } } }) }
      if (query.userGroupId && query.userGroupFilter === 'Exclude') { where['AND'].push({ user_groups: { none: { id: { equals: query.userGroupId } } } }) }

      const include = {}
      const [total, temp] = await this.db.$transaction([
        this.db.camera_groups.count({ where }),
        this.db.camera_groups.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      // response
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postGroups(body): Promise<generalResponse> {
    try {
      const roles = await this.db.camera_groups.create({ data: { name: body.name } });
      // response
      const response: generalResponse = { status: true, data: roles, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getGroups(group_id: string): Promise<generalResponse> {
    try {
      const roles = await this.db.camera_groups.findUnique({ where: { id: group_id }, include: {
        user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_groups: { select: { id: true, name: true } },
        camera: { select: { id: true } },
      } });
      // response
      const response: generalResponse = { status: true, data: roles, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putGroups(group_id: string, body): Promise<generalResponse> {
    try {
      const roles = await this.db.camera_groups.update({ where:{ id: group_id }, data: { name: body.name }, include: { camera: { select: { id: true } } } });
      // response
      const response: generalResponse = { status: true, data: roles, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteGroups(group_id: string): Promise<generalResponse> {
    try {
      const roles = await this.db.camera_groups.delete({ where: { id: group_id } });
      // response
      const response: generalResponse = { status: true, data: roles, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
}
