import { HttpException, Injectable, ConflictException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import * as dtos from './scheduler.dtos';
import * as cronParser from 'cron-parser'
import { generalResponse } from 'src/app.consts';

@Injectable()
export class SchedulerService {

  constructor(private db: DbService) {}

  async post_user_account(user: any, scheduleBody: dtos.scheduleDto): Promise<generalResponse> {
    try {
      cronParser.parseExpression(scheduleBody.from);
      cronParser.parseExpression(scheduleBody.to);
      const temp = await this.db.scheduler_user_account.create({ data: { title: scheduleBody.title, from: scheduleBody.from, to: scheduleBody.to, user_accounts: { connect: { id: scheduleBody.parentId } } } })
      return { status: true, data: temp, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_user_accounts(user: any, query: dtos.scheduleSearchDto): Promise<generalResponse> {
    try {
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.search) { where['AND'].push({ title: { contains: query.search, mode: 'insensitive' } }) }
      if (query.parentId) { where['AND'].push({ user_accounts: { some: { id: { equals: query.parentId } } } }) }
      // include
      const include = { user_accounts: true }
      // run query
      const [total, temp] = await this.db.$transaction([
        this.db.scheduler_user_account.count({ where }),
        this.db.scheduler_user_account.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_user_account(user: any, id: string): Promise<generalResponse> {
    try {
      const temp = await this.db.scheduler_user_account.findUnique({ where: { id: id } });
      return { status: true, data: temp, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async put_user_account(user: any, id: string, scheduleBody: dtos.scheduleEditDto): Promise<generalResponse> {
    try {
      cronParser.parseExpression(scheduleBody.from);
      cronParser.parseExpression(scheduleBody.to);
      const temp = await this.db.scheduler_user_account.update({ where: { id: id }, data: { title: scheduleBody.title, from: scheduleBody.from, to: scheduleBody.to} })
      return { status: true, data: temp, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async delete_user_account(user: any, id: string): Promise<generalResponse> {
    try {
      await this.db.scheduler_user_account.delete({ where: { id: id } });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async verify_user_account(user_id: string): Promise<generalResponse> {
    // const options = {
    //   currentDate: new Date(),
    //   // endDate: new Date('Wed, 26 Dec 2025 14:40:00 UTC'),
    //   // iterator: true
    // };
    // const interval = cronParser.parseExpression('*/10 * * * * *', options);
    // console.log('Date: ', interval.next().toString());
    // console.log('Date: ', interval.next().toString());
    // console.log('Date: ', interval.next().toString());
    // console.log('Date: ', interval.next().toString());
    try {
      let overAll = false
      const list = await this.db.scheduler_user_account.findMany({ where: { user_accounts: { some: { id: { equals: user_id } } } } })
      list.forEach(element => {
        const cronStart = element.from
        const cronStop = element.to
        const now = new Date()
        const startInterval = cronParser.parseExpression(cronStart)
        const stopInterval = cronParser.parseExpression(cronStop)
        const prevStart = new Date(startInterval.prev().toDate())
        const prevStop = new Date(stopInterval.prev().toDate())
        if (now.getTime() - prevStart.getTime() < now.getTime() - prevStop.getTime()) { overAll = true }
      })
      if (list.length == 0) { overAll = true }
      return { status: true, data: { valid: overAll }, error: null, msg: null };
    } catch (error) {
      return { status: false, data: null, error: error, msg: error.message };
    }
  }
}
