import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import { tileviewDto, tileviewEditDto, tileviewSearchQuery } from './tileview.dto';

import { generalResponse } from 'src/app.consts';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class TileviewService {
  constructor(private db: DbService, private loggerService: LoggerService) {}

  async allTileviews(user: any, query: tileviewSearchQuery): Promise<generalResponse> {
    try {
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.search) { where['AND'].push({ OR: [ { title: { contains: query.search, mode: 'insensitive' } } ] }) }
      if (query.userId && query.userFilter === 'Include') { where['AND'].push({ user_accounts: { some: { id: { equals: query.userId } } } }) }
      if (query.userId && query.userFilter === 'Exclude') { where['AND'].push({ user_accounts: { none: { id: { equals: query.userId } } } }) }
      if (query.userGroupId && query.userGroupFilter === 'Include') { where['AND'].push({ user_groups: { some: { id: { equals: query.userGroupId } } } }) }
      if (query.userGroupId && query.userGroupFilter === 'Exclude') { where['AND'].push({ user_groups: { none: { id: { equals: query.userGroupId } } } }) }

      // Privacy filter: if user is not superadmin, filter by privacy rules
      if (user && user.isSuperAdmin !== true) {
        const userGroups = await this.db.user_groups.findMany({ where: { user_accounts: { some: { id: { equals: user.id } } } }, select: { id: true } })
        const userGroupIds = userGroups.map(g => g.id)
        where['AND'].push({
          OR: [
            { private: false },
            { owner_id: { equals: user.id } },
            { user_accounts: { some: { id: { equals: user.id } } } },
            { user_groups: { some: { id: { in: userGroupIds } } } }
          ]
        })
      }

      const include = {
        owner: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_groups: { select: { id: true, name: true } }
      }
      const [total, temp] = await this.db.$transaction([
        this.db.tileview.count({ where }),
        this.db.tileview.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      // response
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getTileview(id: string, user: any): Promise<generalResponse> {
    try {
      const tileview = await this.db.tileview.findUnique({ where: { id: id }, include: {
        owner: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_groups: { select: { id: true, name: true } }
      }})
      if (!tileview) { throw { message: 'Tileview not found' } }

      // Privacy check: if user is not superadmin, check if they can see this tileview
      if (user && user.isSuperAdmin !== true) {
        if (tileview.private === true) {
          const isOwner = tileview.owner_id === user.id
          const isAssignedUser = tileview.user_accounts.some(u => u.id === user.id)
          const userGroups = await this.db.user_groups.findMany({ where: { user_accounts: { some: { id: { equals: user.id } } } }, select: { id: true } })
          const userGroupIds = userGroups.map(g => g.id)
          const isAssignedGroup = tileview.user_groups.some(g => userGroupIds.includes(g.id))

          if (!isOwner && !isAssignedUser && !isAssignedGroup) {
            throw { message: 'Forbidden' }
          }
        }
      }

      // response
      const response: generalResponse = { status: true, data: tileview, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postTileview(user: any, body: tileviewDto): Promise<generalResponse> {
    try {
      const tileview = await this.db.tileview.create({ data: { title: body.title, schema: body.schema, private: body.private || false, is_editable: body.is_editable ?? true, owner_id: user.id }, include: {
        owner: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_groups: { select: { id: true, name: true } }
      }});
      // response
      this.loggerService.log('tileview created', 0, user, undefined, undefined, undefined, undefined)
      const response: generalResponse = { status: true, data: tileview, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putTileview(user: any, id: string, body: tileviewEditDto): Promise<generalResponse> {
    try {
      const tileview = await this.db.tileview.findUnique({ where: { id: id } })
      if (!tileview) { throw { message: 'Tileview not found' } }

      if (tileview.is_editable === false) {
        throw { message: 'Forbidden' }
      }

      // Check if user is owner or superadmin
      if (user.isSuperAdmin !== true && tileview.owner_id !== user.id) {
        throw { message: 'Forbidden' }
      }

      const updateData: any = {}
      if (body.title !== undefined) { updateData.title = body.title }
      if (body.schema !== undefined) { updateData.schema = body.schema }
      if (body.private !== undefined) { updateData.private = body.private }
      if (body.is_editable !== undefined) { updateData.is_editable = body.is_editable }

      const updatedTileview = await this.db.tileview.update({ where: { id: id }, data: updateData, include: {
        owner: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
        user_groups: { select: { id: true, name: true } }
      }});
      // response
      this.loggerService.log('tileview edited', 0, user, undefined, undefined, undefined, undefined)
      const response: generalResponse = { status: true, data: updatedTileview, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteTileview(user: any, id: string): Promise<generalResponse> {
    try {
      const tileview = await this.db.tileview.findUnique({ where: { id: id } })
      if (!tileview) { throw { message: 'Tileview not found' } }

      // Only owner or superadmin can delete (is_editable does not block delete)
      if (user.isSuperAdmin !== true && tileview.owner_id !== user.id) {
        throw { message: 'Forbidden' }
      }

      const deletedTileview = await this.db.tileview.delete({ where: { id: id } });
      // response
      this.loggerService.log('tileview removed', 0, user, undefined, undefined, undefined, undefined)
      const response: generalResponse = { status: true, data: deletedTileview, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}

