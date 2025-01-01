import { HttpException, Injectable } from '@nestjs/common';
import * as dtos from './dtos';import { generalResponse } from 'src/app.consts';
import { DbService } from 'src/db/db.service';
;

@Injectable()
export class AssignService {

  constructor(private db: DbService) {}



  async user_to_usergroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { user_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { user_groups: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_usergroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const usergroups = (await this.db.user_groups.findMany()).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.user_accounts.findFirst({ where: { id: el_from, isSuperAdmin: false } })
          if (c) {
          await Promise.all(usergroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { user_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { user_groups: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_camera(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera: { connect: { id: el_to } } } })
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_camera_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const cameras = (await this.db.camera.findMany()).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.user_accounts.findFirst({ where: { id: el_from, isSuperAdmin: false } })
          if (c) {
          await Promise.all(cameras.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera: { connect: { id: el_to } } } })
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_cameragroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera_groups: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async user_to_cameragroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const cameragroups = (await this.db.camera_groups.findMany()).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.user_accounts.findFirst({ where: { id: el_from, isSuperAdmin: false } })
          if (c) {
          await Promise.all(cameragroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.user_accounts.update({ where: { id: el_from, isSuperAdmin: false }, data: { camera_groups: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }



  async usergroup_to_user(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_user_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const users = (await this.db.user_accounts.findMany({ where: { isSuperAdmin: false } })).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.user_groups.findFirst({ where: { id: el_from } })
          if (c) {
          await Promise.all(users.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_camera(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera: { connect: { id: el_to } } } })
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_camera_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const cameras = (await this.db.camera.findMany()).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.user_groups.findFirst({ where: { id: el_from } })
          if (c) {
          await Promise.all(cameras.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera: { connect: { id: el_to } } } })
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_cameragroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera_groups: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async usergroup_to_cameragroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const cameragroups = (await this.db.camera_groups.findMany()).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.user_groups.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(cameragroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.user_groups.update({ where: { id: el_from }, data: { camera_groups: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }



  async camera_to_user(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_user_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const users = (await this.db.user_accounts.findMany({ where: { isSuperAdmin: false } })).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.camera.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(users.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_usergroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_usergroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const usergroups = (await this.db.user_groups.findMany()).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.camera.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(usergroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_cameragroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { camera_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { camera_groups: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async camera_to_cameragroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const cameragroups = (await this.db.camera_groups.findMany()).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.camera.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(cameragroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera.update({ where: { id: el_from }, data: { camera_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.camera.update({ where: { id: el_from }, data: { camera_groups: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }



  async cameragroup_to_user(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_user_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const users = (await this.db.user_accounts.findMany({ where: { isSuperAdmin: false } })).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.camera_groups.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(users.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_usergroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_usergroup_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const usergroups = (await this.db.user_groups.findMany()).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.camera_groups.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(usergroups.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_camera(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.camera.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { camera: { connect: { id: el_to } } } })
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { camera: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async cameragroup_to_camera_all(data: dtos.assignToAllDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      const camera = (await this.db.camera.findMany()).map(x => { return x.id })
      await Promise.all(data.from.map(async (el_from) => {
        const c = await this.db.camera_groups.findFirst({ where: { id: el_from } })
        if (c) {
          await Promise.all(camera.map(async (el_to) => {
            if (data.action === 'add') {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { camera: { connect: { id: el_to } } } })
            } else {
              await this.db.camera_groups.update({ where: { id: el_from }, data: { camera: { disconnect: { id: el_to } } } })
            }
          }));
        }
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }



  async role_to_user(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_accounts.findFirst({ where: { id: el_to, isSuperAdmin: false } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_roles.update({ where: { id: el_from }, data: { user_accounts: { connect: { id: el_to } } } })
            } else {
              await this.db.user_roles.update({ where: { id: el_from }, data: { user_accounts: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }


  async role_to_usergroup(data: dtos.assignDto, user: any): Promise<generalResponse> {
    try {
      if (data.action !== 'add' && data.action !== 'remove') { return { status: false, data: null, error: 'invalid action', msg: 'invalid action' }; }
      await Promise.all(data.from.map(async (el_from) => {
        await Promise.all(data.to.map(async (el_to) => {
          const u = await this.db.user_groups.findFirst({ where: { id: el_to } })
          if (u) {
            if (data.action === 'add') {
              await this.db.user_roles.update({ where: { id: el_from }, data: { user_groups: { connect: { id: el_to } } } })
            } else {
              await this.db.user_roles.update({ where: { id: el_from }, data: { user_groups: { disconnect: { id: el_to } } } })
            }
          }
        }));
      }));
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}
