import { HttpException, Injectable, Inject } from '@nestjs/common';
import * as dtos from './dtos';import { generalResponse } from 'src/app.consts';
import { DbService } from 'src/db/db.service';
import { LoggerService } from 'src/logger/logger.service';
import { runWithConcurrency } from 'src/app.shared';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const ASSIGN_CONCURRENCY = 15;

@Injectable()
export class AssignService {

  constructor(private db: DbService, private loggerService: LoggerService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}



  async user_to_usergroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { user_groups: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user assigned to user group', 0, user, el_from, el_to)
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { user_groups: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user unassigned from user group', 0, user, el_from, el_to)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_usergroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const usergroups = (await this.db.user_groups.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.user_accounts.findFirst({ where: { id: el_from, isSuperAdmin: false } })
          if (c) {
          await Promise.all(usergroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { user_groups: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user assigned to user group', 0, user, el_from, el_to)
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { user_groups: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user unassigned from user group', 0, user, el_from, el_to)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_camera(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user assigned to camera', 0, user, el_from, undefined, el_to)
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user unassigned from camera', 0, user, el_from, undefined, el_to)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_camera_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const cameras = (await this.db.camera.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.user_accounts.findFirst({ where: { id: el_from, isSuperAdmin: false } })
          if (c) {
          await Promise.all(cameras.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user assigned to camera', 0, user, el_from, undefined, el_to)
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user unassigned from camera', 0, user, el_from, undefined, el_to)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_cameragroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera_groups: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user assigned to camera group', 0, user, el_from, undefined, undefined, el_to)
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera_groups: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user unassigned from camera group', 0, user, el_from, undefined, undefined, el_to)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_cameragroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const cameragroups = (await this.db.camera_groups.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.user_accounts.findFirst({ where: { id: el_from, isSuperAdmin: false } })
          if (c) {
          await Promise.all(cameragroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera_groups: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user assigned to camera group', 0, user, el_from, undefined, undefined, el_to)
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera_groups: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user unassigned from camera group', 0, user, el_from, undefined, undefined, el_to)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }



  async usergroup_to_user(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
              this.loggerService.log('user group assigned to user', 0, user, el_to, el_from)
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
              this.loggerService.log('user group unassigned from user', 0, user, el_to, el_from)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_user_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const users = (await this.db.user_accounts.findMany({ where: { isSuperAdmin: false } })).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.user_groups.findFirst({ where: { id: el_from } })
          if (c) {
          await Promise.all(users.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('user group assigned to user', 0, user, el_to, el_from)
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('user group unassigned from user', 0, user, el_to, el_from)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_camera(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera: { connect: { id: el_to } } } })
              this.loggerService.log('user group assigned to camera', 0, user, undefined, el_from, el_to)
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera: { disconnect: { id: el_to } } } })
              this.loggerService.log('user group unassigned from camera', 0, user, undefined, el_from, el_to)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_camera_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const cameras = (await this.db.camera.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.user_groups.findFirst({ where: { id: el_from } })
          if (c) {
          await Promise.all(cameras.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera: { connect: { id: el_to } } } })
              this.loggerService.log('user group assigned to camera', 0, user, undefined, el_from, el_to)
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera: { disconnect: { id: el_to } } } })
              this.loggerService.log('user group unassigned from camera', 0, user, undefined, el_from, el_to)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_cameragroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera_groups: { connect: { id: el_to } } } })
              this.loggerService.log('user group assigned to camera group', 0, user, undefined, el_from, undefined, el_to)
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera_groups: { disconnect: { id: el_to } } } })
              this.loggerService.log('user group unassigned from camera group', 0, user, undefined, el_from, undefined, el_to)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_cameragroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const cameragroups = (await this.db.camera_groups.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.user_groups.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(cameragroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera_groups: { connect: { id: el_to } } } })
              this.loggerService.log('user group assigned to camera group', 0, user, undefined, el_from, undefined, el_to)
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera_groups: { disconnect: { id: el_to } } } })
              this.loggerService.log('user group unassigned from camera group', 0, user, undefined, el_from, undefined, el_to)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }



  async camera_to_user(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('camera assigned to user', 0, user, el_to, undefined, el_from)
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('camera unassigned from user', 0, user, el_to, undefined, el_from)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_user_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const users = (await this.db.user_accounts.findMany({ where: { isSuperAdmin: false } })).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.camera.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(users.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('camera assigned to user', 0, user, el_to, undefined, el_from)
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('camera unassigned from user', 0, user, el_to, undefined, el_from)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_usergroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
              this.loggerService.log('camera assigned to user group', 0, user, undefined, el_to, el_from)
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
              this.loggerService.log('camera unassigned from user group', 0, user, undefined, el_to, el_from)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_usergroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const usergroups = (await this.db.user_groups.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.camera.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(usergroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
              this.loggerService.log('camera assigned to user group', 0, user, undefined, el_to, el_from)
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
              this.loggerService.log('camera unassigned from user group', 0, user, undefined, el_to, el_from)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_cameragroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { camera_groups: { connect: { id: el_to } } } })
              this.loggerService.log('camera assigned to camera group', 0, user, undefined, undefined, el_from, el_to)
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { camera_groups: { disconnect: { id: el_to } } } })
              this.loggerService.log('camera unassigned from camera group', 0, user, undefined, undefined, el_from, el_to)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_cameragroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const cameragroups = (await this.db.camera_groups.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.camera.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(cameragroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { camera_groups: { connect: { id: el_to } } } })
              this.loggerService.log('camera assigned to camera group', 0, user, undefined, undefined, el_from, el_to)
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { camera_groups: { disconnect: { id: el_to } } } })
              this.loggerService.log('camera unassigned from camera group', 0, user, undefined, undefined, el_from, el_to)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }



  async cameragroup_to_user(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('camera group assigned to user', 0, user, el_to, undefined, undefined, el_from)
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('camera group unassigned from user', 0, user, el_to, undefined, undefined, el_from)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_user_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const users = (await this.db.user_accounts.findMany({ where: { isSuperAdmin: false } })).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.camera_groups.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(users.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('camera group assigned to user', 0, user, el_to, undefined, undefined, el_from)
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('camera group unassigned from user', 0, user, el_to, undefined, undefined, el_from)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_usergroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
              this.loggerService.log('camera group assigned to user group', 0, user, undefined, el_to, undefined, el_from)
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
              this.loggerService.log('camera group unassigned from user group', 0, user, undefined, el_to, undefined, el_from)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_usergroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const usergroups = (await this.db.user_groups.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.camera_groups.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(usergroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
              this.loggerService.log('camera group assigned to user group', 0, user, undefined, el_to, undefined, el_from)
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
              this.loggerService.log('camera group unassigned from user group', 0, user, undefined, el_to, undefined, el_from)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_camera(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { camera: { connect: { id: el_to } } } })
              this.loggerService.log('camera group assigned to camera', 0, user, undefined, undefined, el_to, el_from)
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { camera: { disconnect: { id: el_to } } } })
              this.loggerService.log('camera group unassigned from camera', 0, user, undefined, undefined, el_to, el_from)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_camera_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const camera = (await this.db.camera.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const c = await this.db.camera_groups.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(camera.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { camera: { connect: { id: el_to } } } })
              this.loggerService.log('camera group assigned to camera', 0, user, undefined, undefined, el_to, el_from)
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { camera: { disconnect: { id: el_to } } } })
              this.loggerService.log('camera group unassigned from camera', 0, user, undefined, undefined, el_to, el_from)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }



  async role_to_user(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_roles.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('role assigned to user', 0, user, el_to)
            } else {
              await this.db.user_roles.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_to}`)
              this.loggerService.log('role unassigned from user', 0, user, el_to)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }


  async role_to_usergroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_roles.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
              // Clear cache for all users in this group
              const groupUsers = await this.db.user_accounts.findMany({ where: { user_groups: { some: { id: el_to } } }, select: { id: true } })
              for (const groupUser of groupUsers) {
                await this.cacheManager.del(`user_${groupUser.id}`)
              }
              this.loggerService.log('role assigned to user group', 0, user, undefined, el_to)
            } else {
              await this.db.user_roles.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
              // Clear cache for all users in this group
              const groupUsers = await this.db.user_accounts.findMany({ where: { user_groups: { some: { id: el_to } } }, select: { id: true } })
              for (const groupUser of groupUsers) {
                await this.cacheManager.del(`user_${groupUser.id}`)
              }
              this.loggerService.log('role unassigned from user group', 0, user, undefined, el_to)
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async tileview_to_user(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            const t = await this.db.tileview.findFirst({ where: { id: el_from } })
            if (t) {
              if (data.action === 'add') {
                await this.db.tileview.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
                this.loggerService.log('tileview assigned to user', 0, user, el_to)
              } else {
                await this.db.tileview.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
                this.loggerService.log('tileview unassigned from user', 0, user, el_to)
              }
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async tileview_to_user_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const users = (await this.db.user_accounts.findMany({ where: { isSuperAdmin: false } })).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const t = await this.db.tileview.findFirst({ where: { id: el_from } })
        if (t) {
          await Promise.all(users.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.tileview.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
              this.loggerService.log('tileview assigned to user', 0, user, el_to)
            } else {
              await this.db.tileview.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
              this.loggerService.log('tileview unassigned from user', 0, user, el_to)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async tileview_to_usergroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_groups.findFirst({ where: { id: el_to } })
          if (u) {
            const t = await this.db.tileview.findFirst({ where: { id: el_from } })
            if (t) {
              if (data.action === 'add') {
                await this.db.tileview.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
                this.loggerService.log('tileview assigned to user group', 0, user, undefined, el_to)
              } else {
                await this.db.tileview.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
                this.loggerService.log('tileview unassigned from user group', 0, user, undefined, el_to)
              }
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async tileview_to_usergroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const usergroups = (await this.db.user_groups.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const t = await this.db.tileview.findFirst({ where: { id: el_from } })
        if (t) {
          await Promise.all(usergroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.tileview.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
              this.loggerService.log('tileview assigned to user group', 0, user, undefined, el_to)
            } else {
              await this.db.tileview.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
              this.loggerService.log('tileview unassigned from user group', 0, user, undefined, el_to)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_tileview(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const t = await this.db.tileview.findFirst({ where: { id: el_to } })
          if (t) {
            const u = await this.db.user_accounts.findFirst({ where: { id: el_from, isSuperAdmin: false } })
            if (u) {
              if (data.action === 'add') {
                await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { tileview_user: { connect: { id: el_to } } } })
                this.loggerService.log('user assigned to tileview', 0, user, el_from)
              } else {
                await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { tileview_user: { disconnect: { id: el_to } } } })
                this.loggerService.log('user unassigned from tileview', 0, user, el_from)
              }
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_tileview_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const tileviews = (await this.db.tileview.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const u = await this.db.user_accounts.findFirst({ where: { id: el_from, isSuperAdmin: false } })
        if (u) {
          await Promise.all(tileviews.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { tileview_user: { connect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user assigned to tileview', 0, user, el_from)
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { tileview_user: { disconnect: { id: el_to } } } })
              await this.cacheManager.del(`user_${el_from}`)
              this.loggerService.log('user unassigned from tileview', 0, user, el_from)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_tileview(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const t = await this.db.tileview.findFirst({ where: { id: el_to } })
          if (t) {
            const u = await this.db.user_groups.findFirst({ where: { id: el_from } })
            if (u) {
              if (data.action === 'add') {
                await this.db.user_groups.update({ where: { id: el_from }, data: { tileview: { connect: { id: el_to } } } })
                this.loggerService.log('user group assigned to tileview', 0, user, undefined, el_from)
              } else {
                await this.db.user_groups.update({ where: { id: el_from }, data: { tileview: { disconnect: { id: el_to } } } })
                this.loggerService.log('user group unassigned from tileview', 0, user, undefined, el_from)
              }
            }
          }
        }));
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_tileview_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { throw { message: 'invalid action' }; }
      const tileviews = (await this.db.tileview.findMany()).map(x => { return x.id })
      await runWithConcurrency(data.from, ASSIGN_CONCURRENCY, async (el_from) => {
        const u = await this.db.user_groups.findFirst({ where: { id: el_from } })
        if (u) {
          await Promise.all(tileviews.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { tileview: { connect: { id: el_to } } } })
              this.loggerService.log('user group assigned to tileview', 0, user, undefined, el_from)
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { tileview: { disconnect: { id: el_to } } } })
              this.loggerService.log('user group unassigned from tileview', 0, user, undefined, el_from)
            }
          }));
        }
      });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
