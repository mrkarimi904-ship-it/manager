import { HttpException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import * as dtos from './logger.dtos'
import { generalResponse } from 'src/app.consts';

@Injectable()
export class LoggerService {

  constructor(private db: DbService) {}

  async log(text: string, level: number = 0, user: string = null, user_group: string = null, camera: string = null, camera_group: string = null ) {
    await this.db.logger_logs.create({ data: { log: text, level: level, user: user, user_group: user_group, camera: camera, camera_group: camera_group } })
  }

  async getAll(user: any, query: dtos.logSearchDto): Promise<generalResponse> {
    try {
      // limit query if user is not superadmin
      if (user.isSuperAdmin !== true) { query.userId = user.id; query.userFilter = 'Include' }
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.level) { where['AND'].push({ level: { equals: parseInt(query.level) } }) }
      if (query.search) { where['AND'].push({ log: { contains: query.search, mode: 'insensitive' } }) }
      if (query.userId && query.userFilter === 'Include') { where['AND'].push({ OR: [ { user: {  equals: query.userId }} ] }) }
      if (query.userId && query.userFilter === 'Exclude') { where['AND'].push({ OR: [ { user: {  notEqual: query.userId }} ] }) }
      if (query.userGroupId && query.userGroupFilter === 'Include') { where['AND'].push({ OR: [ { user_group: {  equals: query.userGroupId }} ] }) }
      if (query.userGroupId && query.userGroupFilter === 'Exclude') { where['AND'].push({ OR: [ { user_group: {  notEqual: query.userGroupId }} ] }) }
      if (query.cameraId && query.cameraFilter === 'Include') { where['AND'].push({ OR: [ { camera: {  equals: query.cameraId }} ] }) }
      if (query.cameraId && query.cameraFilter === 'Exclude') { where['AND'].push({ OR: [ { camera: {  notEqual: query.cameraId }} ] }) }
      if (query.cameraGroupId && query.cameraGroupFilter === 'Include') { where['AND'].push({ OR: [ { camera_group: {  equals: query.cameraGroupId }} ] }) }
      if (query.cameraGroupId && query.cameraGroupFilter === 'Exclude') { where['AND'].push({ OR: [ { camera_group: {  notEqual: query.cameraGroupId }} ] }) }
      // run query
      const [total, temp] = await this.db.$transaction([
        this.db.logger_logs.count({ where }),
        this.db.logger_logs.findMany({ where, skip, take })
      ])
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
}
