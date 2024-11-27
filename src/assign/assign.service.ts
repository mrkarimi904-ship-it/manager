import { Injectable } from '@nestjs/common';
import * as dtos from './dtos';import { generalResponse } from 'src/app.consts';
import { DbService } from 'src/db/db.service';
;

@Injectable()
export class AssignService {

  constructor(private db: DbService) {}

  async camera_to_account(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to } })
          if (u && u.isSuperAdmin === false) {
            if (data.action === 'add') {
              const t = await this.db.camera_account.findFirst({ where: { camera_id: el_from, account_id: el_to } })
              if (!t) {
                await this.db.camera_account.create({ data: { camera_id: el_from, account_id: el_to } })
              }
            } else {
              await this.db.camera_account.deleteMany({ where: { camera_id: el_from, account_id: el_to } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      return { status: false, data: null, error: error, msg: error.message };
    }
  }

  async camera_to_account_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (user.isSuperAdmin !== true) { return { status: false, data: null, error: 'only available for superadmin', msg: 'only available for superadmin' }; }
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const users = (await this.db.user_accounts.findMany({ where: { isSuperAdmin: false } })).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(users.map(async (el_to) => {
          const c = await this.db.camera.findFirst({ where: { id: el_from } })
          if (c) {
            if (data.action === 'add') {
              const t = await this.db.camera_account.findFirst({ where: { camera_id: el_from, account_id: el_to } })
              if (!t) {
                await this.db.camera_account.create({ data: { camera_id: el_from, account_id: el_to } })
              }
            } else {
              await this.db.camera_account.deleteMany({ where: { camera_id: el_from, account_id: el_to } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      return { status: false, data: null, error: error, msg: error.message };
    }
  }

  async camera_all_to_account(data: dtos.assignFromAllDto, user: any): Promise<generalResponse> {
    try {
      if (user.isSuperAdmin !== true) { return { status: false, data: null, error: 'only available for superadmin', msg: 'only available for superadmin' }; }
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const cameras = (await this.db.camera.findMany()).map(x => { return x.id })
      await Promise.all(cameras.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            if (data.action === 'add') {
              const t = await this.db.camera_account.findFirst({ where: { camera_id: el_from, account_id: el_to } })
              if (!t) {
                await this.db.camera_account.create({ data: { camera_id: el_from, account_id: el_to } })
              }
            } else {
              await this.db.camera_account.deleteMany({ where: { camera_id: el_from, account_id: el_to } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      return { status: false, data: null, error: error, msg: error.message };
    }
  }

}
