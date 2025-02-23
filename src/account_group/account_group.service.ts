import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import { groupSearchQuery } from './account_group.dto';

import { generalResponse } from 'src/app.consts';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class AccountGroupService {
  constructor(private db: DbService, private loggerService: LoggerService) {}

  async allGroups(user: any, query: groupSearchQuery): Promise<generalResponse> {
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
      if (query.cameraGroupId && query.cameraGroupFilter === 'Include') { where['AND'].push({ camera_groups: { some: { id: { equals: query.cameraGroupId } } } }) }
      if (query.cameraGroupId && query.cameraGroupFilter === 'Exclude') { where['AND'].push({ camera_groups: { none: { id: { equals: query.cameraGroupId } } } }) }

      const include = {}
      const [total, temp] = await this.db.$transaction([
        this.db.user_groups.count({ where }),
        this.db.user_groups.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      // response
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postGroups(user: any, body): Promise<generalResponse> {
    try {
      const usergroup = await this.db.user_groups.create({ data: { name: body.name } });
      // response
      this.loggerService.log('user group created', 0, user, undefined, usergroup.id)
      const response: generalResponse = { status: true, data: usergroup, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getGroups(group_id: string): Promise<generalResponse> {
    try {
      const usergroups = await this.db.user_groups.findUnique({ where: { id: group_id }, include: {
        user_roles: { select: { id: true, name: true, description: true } },
        user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
        camera: { select: { id: true } },
        camera_groups: { select: { id: true, name: true } },
      } });
      // response
      const response: generalResponse = { status: true, data: usergroups, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putGroups(user: any, group_id: string, body): Promise<generalResponse> {
    try {
      const usergroup = await this.db.user_groups.update({ where:{ id: group_id }, data: { name: body.name }, include: {
        user_roles: { select: { id: true, name: true, description: true } },
        user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
      } });
      // response
      this.loggerService.log('user group edited', 0, user, undefined, usergroup.id)
      const response: generalResponse = { status: true, data: usergroup, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteGroups(user: any, group_id: string): Promise<generalResponse> {
    try {
      const usergroup = await this.db.user_groups.delete({ where: { id: group_id } });
      // response
      this.loggerService.log('user group removed', 0, user, undefined, usergroup.id)
      const response: generalResponse = { status: true, data: usergroup, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getGroupRoles(id: string): Promise<generalResponse> {
    try {
      const roles: any = await this.db.user_roles.findMany({ select: { id: true, name: true, description: true } })
      roles.forEach(element => { element.selected = false })

      const userg = await this.db.user_groups.findUnique({ where: { id: id }, select: { user_roles: { select: { id: true, name: true, description: true } } } })
      userg.user_roles.forEach(element => { if (roles.find(x => x.id === element.id)) { roles.find(x => x.id === element.id).selected = true } })

      // response
      const response: generalResponse = { status: true, data: roles, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
