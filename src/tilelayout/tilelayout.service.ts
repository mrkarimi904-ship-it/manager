import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import { tilelayoutDto, tilelayoutEditDto, tilelayoutSearchQuery } from './tilelayout.dto';

import { generalResponse } from 'src/app.consts';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class TilelayoutService {
  constructor(private db: DbService, private loggerService: LoggerService) {}

  async allTilelayouts(user: any, query: tilelayoutSearchQuery): Promise<generalResponse> {
    try {
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.search) { where['AND'].push({ title: { contains: query.search, mode: 'insensitive' } }) }

      // Private = only owner sees; public = everyone sees
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({
          OR: [
            { private: false },
            { owner_id: { equals: user.id } }
          ]
        })
      }

      const include = {
        owner: { select: { id: true, username: true, firstname: true, lastname: true } }
      }
      const [total, temp] = await this.db.$transaction([
        this.db.tilelayout.count({ where }),
        this.db.tilelayout.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getTilelayout(id: string, user: any): Promise<generalResponse> {
    try {
      const tilelayout = await this.db.tilelayout.findUnique({
        where: { id },
        include: { owner: { select: { id: true, username: true, firstname: true, lastname: true } } }
      })
      if (!tilelayout) { throw { message: 'Tilelayout not found' } }

      if (user && user.isSuperAdmin !== true) {
        if (tilelayout.private === true && tilelayout.owner_id !== user.id) {
          throw { message: 'Forbidden' }
        }
      }

      const response: generalResponse = { status: true, data: tilelayout, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postTilelayout(user: any, body: tilelayoutDto): Promise<generalResponse> {
    try {
      const tilelayout = await this.db.tilelayout.create({
        data: {
          title: body.title,
          schema: body.schema,
          private: body.private ?? false,
          is_editable: body.is_editable ?? true,
          owner_id: user.id
        },
        include: { owner: { select: { id: true, username: true, firstname: true, lastname: true } } }
      });
      this.loggerService.log('tilelayout created', 0, user, undefined, undefined, undefined, undefined)
      const response: generalResponse = { status: true, data: tilelayout, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putTilelayout(user: any, id: string, body: tilelayoutEditDto): Promise<generalResponse> {
    try {
      const tilelayout = await this.db.tilelayout.findUnique({ where: { id } })
      if (!tilelayout) { throw { message: 'Tilelayout not found' } }

      if (tilelayout.is_editable === false) {
        throw { message: 'Forbidden' }
      }

      if (user.isSuperAdmin !== true && tilelayout.owner_id !== user.id) {
        throw { message: 'Forbidden' }
      }

      const updateData: any = {}
      if (body.title !== undefined) { updateData.title = body.title }
      if (body.schema !== undefined) { updateData.schema = body.schema }
      if (body.private !== undefined) { updateData.private = body.private }
      if (body.is_editable !== undefined) { updateData.is_editable = body.is_editable }

      const updated = await this.db.tilelayout.update({
        where: { id },
        data: updateData,
        include: { owner: { select: { id: true, username: true, firstname: true, lastname: true } } }
      });
      this.loggerService.log('tilelayout edited', 0, user, undefined, undefined, undefined, undefined)
      const response: generalResponse = { status: true, data: updated, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteTilelayout(user: any, id: string): Promise<generalResponse> {
    try {
      const tilelayout = await this.db.tilelayout.findUnique({ where: { id } })
      if (!tilelayout) { throw { message: 'Tilelayout not found' } }

      if (user.isSuperAdmin !== true && tilelayout.owner_id !== user.id) {
        throw { message: 'Forbidden' }
      }

      const deleted = await this.db.tilelayout.delete({ where: { id } });
      this.loggerService.log('tilelayout removed', 0, user, undefined, undefined, undefined, undefined)
      const response: generalResponse = { status: true, data: deleted, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
}
