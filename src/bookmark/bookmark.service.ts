import { ConflictException, HttpException, Injectable, Query } from '@nestjs/common';
import * as dtos from './bookmark.dtos';
import { generalResponse } from 'src/app.consts';
import { DbService } from 'src/db/db.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class BookmarkService {
  constructor(private db: DbService, private loggerService: LoggerService) {}

  async get_list(user: any, camera_id: string, query: dtos.bookmarkSearchQuery): Promise<generalResponse> {
    try {
      const where0: any = { id: camera_id, deleted: false, AND: [] }
      if (user.isSuperAdmin !== true) {
        where0['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where: where0 });
      if (!camera) { throw new ConflictException() }

      const where = { AND: [] }
      if (query.search) { where['AND'].push({ OR: [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ] }) }
      if (query.type) {
        where['AND'].push({ type: query.type })
      }
      if (query.lock) {
        where['AND'].push({ lock: query.lock === 'true' ? true : false })
      }
      if (query.from) {
        where['AND'].push({ from: { gte: parseInt(query.from.toString())} })
      }
      if (query.to) {
        where['AND'].push({ to: { lte: parseInt(query.to.toString())} })
      }
      const list = await this.db.camera_bookmark.findMany({ where: { ...where, camera: { some: { id: camera_id } } }, orderBy: [{ from: 'asc' }] })

      return { status: true, data: list, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async add_item(user: any, camera_id: string, body: dtos.bookmarkDto): Promise<generalResponse> {
    try {
      const where: any = { id: camera_id, deleted: false, AND: [] }
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

      const item = await this.db.camera_bookmark.create({ data: { ...body, camera: { connect: { id: camera_id } } } })
      this.loggerService.log(`bookmark added`, 0, user, undefined, undefined, camera_id, undefined)
      return { status: true, data: item, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_item(user: any, camera_id: string, bookmark_id: string): Promise<generalResponse> {
    try {
      const where: any = { id: camera_id, deleted: false, AND: [] }
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

      const item = await this.db.camera_bookmark.findUnique({ where: { id: bookmark_id } })
      return { status: true, data: item, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async delete_item(user: any, camera_id: string, bookmark_id: string): Promise<generalResponse> {
    try {
      const where: any = { id: camera_id, deleted: false, AND: [] }
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

      const item = await this.db.camera_bookmark.delete({ where: { id: bookmark_id } })
      this.loggerService.log(`bookmark removed`, 0, user, undefined, undefined, camera_id, undefined)
      return { status: true, data: item, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
