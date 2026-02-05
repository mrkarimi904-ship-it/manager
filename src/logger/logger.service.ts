import { HttpException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import * as dtos from './logger.dtos'
import { generalResponse } from 'src/app.consts';
import { LoggerGateway } from './logger.gateway';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LoggerService {

  constructor(private readonly db: DbService, private readonly loggerGateway: LoggerGateway) {}

  async log(text: string, level: number = 0, by: any = null, user: string = null, user_group: string = null, camera: string = null, camera_group: string = null ) {
    await this.db.logger_logs.create({ data: { log: text, level: level, by: by?.id, user: user, user_group: user_group, camera: camera, camera_group: camera_group } })
  }

  async log_and_notify_me(text: string, level: number = 0, by: any = null, user: string = null, user_group: string = null, camera: string = null, camera_group: string = null ) {
    await this.log(text, level, by, user, user_group, camera, camera_group)
    this.loggerGateway.notify_user(by.id, text)
  }

  async log_and_notify_admins(text: string, level: number = 0, by: any = null, user: string = null, user_group: string = null, camera: string = null, camera_group: string = null ) {
    await this.log(text, level, by, user, user_group, camera, camera_group)
    this.loggerGateway.notify_admins(text)
  }

  async log_and_notify_all(text: string, level: number = 0, by: any = null, user: string = null, user_group: string = null, camera: string = null, camera_group: string = null ) {
    await this.log(text, level, by, user, user_group, camera, camera_group)
    this.loggerGateway.notify_all(text)
  }

  async getAll(user: any, query: dtos.logSearchDto): Promise<generalResponse> {
    try {
      // limit query if user is not superadmin
      if (user.isSuperAdmin !== true) { query.byId = user.id }
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.level) { where['AND'].push({ level: { equals: parseInt(query.level) } }) }
      if (query.search) { where['AND'].push({ log: { contains: query.search, mode: 'insensitive' } }) }
      if (query.byId) { where['AND'].push({ by: { equals: query.byId } }) }
      if (query.userId) { where['AND'].push({ user: { equals: query.userId } }) }
      if (query.userGroupId) { where['AND'].push({ user_group: { equals: query.userGroupId } }) }
      if (query.cameraId) { where['AND'].push({ camera: { equals: query.cameraId } }) }
      if (query.cameraGroupId) { where['AND'].push({ camera_group: { equals: query.cameraGroupId } }) }
      if (query.from) { where['AND'].push({ created_at: { gte: new Date(query.from) } }) }
      if (query.to) { where['AND'].push({ created_at: { lte: new Date(query.to) } }) }
      // run query
      const [total, temp] = await this.db.$transaction([
        this.db.logger_logs.count({ where }),
        this.db.logger_logs.findMany({ where, skip, take, orderBy: [{ created_at: 'desc' }] })
      ])
      // inject extra data
      await Promise.all(temp.map(async (rr) => {
        if (rr.by) { rr['by_info'] = await this.db.user_accounts.findFirst({ where: { id: rr.by }, select: { username: true, firstname: true, lastname: true } }) }
        if (rr.user) { rr['user_info'] = await this.db.user_accounts.findFirst({ where: { id: rr.user }, select: { username: true, firstname: true, lastname: true } }) }
        if (rr.user_group) { rr['user_group_info'] = await this.db.user_groups.findFirst({ where: { id: rr.user_group }, select: { name: true } }) }
        if (rr.camera) { rr['camera_info'] = await this.db.camera.findFirst({ where: { id: rr.camera }, include: { camera_info: true } }) }
        if (rr.camera_group) { rr['camera_group_info'] = await this.db.camera_groups.findFirst({ where: { id: rr.camera_group }, select: { name: true } }) }
      }));
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  /**
   * Cleans up the logger logs by deleting older records while keeping the most recent ones.
   *
   * This function performs the following steps:
   * 1. Retrieves the 100,000 most recent log entries.
   * 2. Extracts the IDs of these recent entries.
   * 3. Deletes all log entries that are not in this set of recent IDs.
   */
  async cleanUp(): Promise<generalResponse> {
    try {
      const garbage = await this.db.logger_logs.findMany({ orderBy: { created_at: 'desc' }, take: 100, select: { id: true } })
      const recentIds = garbage.map(record => record.id);
      await this.db.logger_logs.deleteMany({ where: { NOT: { id: { in: recentIds, }, }, }, });
      const response: generalResponse = { status: true, data: null, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  // @Cron('0 0 * * * *')
  //   async handleCron() {
  //     if (process.env.NODE_ENV) { return true }
  //     try {
  //       console.debug('cleaning logger ...', new Date().toString());
  //       await this.cleanUp()
  //     } catch (error) {
  //       console.log('error cleaning logger', error)
  //     }
  //   }
}
