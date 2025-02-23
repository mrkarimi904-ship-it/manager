import { HttpException, Inject, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import { accountSearchQuery, editDto, PasswordDto, roleSearchQuery, signUpDto, singInDto } from './account.dto';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { generalResponse, hash_secret, jwt_secret } from 'src/app.consts';
import { SettingsService } from 'src/settings/settings.service';
import { LoggerService } from 'src/logger/logger.service';
import { SchedulerService } from 'src/scheduler/scheduler.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AccountService {
  constructor(private db: DbService, private settings: SettingsService, private loggerService: LoggerService, @Inject(CACHE_MANAGER) private cacheManager: Cache, private scheduler: SchedulerService ) {}

  async allAccounts(user, query: accountSearchQuery): Promise<generalResponse> {
    try {
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { isHidden: false, AND: [] }
      if (query.standardOnly && query.standardOnly === 'true') { where['isSuperAdmin'] = false }
      if (query.search) { where['AND'].push({ OR: [ { username: { contains: query.search, mode: 'insensitive' } }, { id: { contains: query.search, mode: 'insensitive' } }, { firstname: { contains: query.search, mode: 'insensitive' } }, { lastname: { contains: query.search, mode: 'insensitive' } } ] }) }
      if (query.cameraId && query.cameraFilter === 'Include') { where['AND'].push({ OR : [ { camera: { some: { id: { equals: query.cameraId } } } }, { isSuperAdmin: true } ] }) }
      if (query.cameraId && query.cameraFilter === 'Exclude') { where['AND'].push({ camera: { none: { id: { equals: query.cameraId } } } }) }
      if (query.cameraId && query.cameraFilter === 'Exclude') { where['AND'].push({ isSuperAdmin: false }) }
      if (query.userGroupId && query.userGroupFilter === 'Include') { where['AND'].push({ user_groups: { some: { id: { equals: query.userGroupId } } } }) }
      if (query.userGroupId && query.userGroupFilter === 'Exclude') { where['AND'].push({ user_groups: { none: { id: { equals: query.userGroupId } } } }) }
      if (query.cameraGroupId && query.cameraGroupFilter === 'Include') { where['AND'].push({ camera_groups: { some: { id: { equals: query.cameraGroupId } } } }) }
      if (query.cameraGroupId && query.cameraGroupFilter === 'Exclude') { where['AND'].push({ camera_groups: { none: { id: { equals: query.cameraGroupId } } } }) }

      const include = {}
      const [total, temp] = await this.db.$transaction([
        this.db.user_accounts.count({ where }),
        this.db.user_accounts.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }], omit: { password: true } })
      ])
      // response
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getAccount(id: string): Promise<generalResponse> {
    try {
      const accounts = await this.db.user_accounts.findUnique({ where: { id: id }, include: {
        user_roles: { select: { id: true, name: true, description: true } },
        user_groups: { select: { id: true, name: true } },
        camera: { select: { id: true } },
        camera_groups: { select: { id: true, name: true } },
      }, omit: { password: true }})
      // response
      const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getAccountRoles(id: string): Promise<generalResponse> {
    try {
      const roles: any = await this.db.user_roles.findMany({ select: { id: true, name: true, description: true } })
      roles.forEach(element => { element.selected = false })

      const account = await this.db.user_accounts.findUnique({ where: { id: id }, select: { isSuperAdmin: true, user_roles: { select: { id: true, name: true, description: true } } , user_groups: { select: { user_roles: { select: { id: true, name: true, description: true } } } }} })
      account.user_roles.forEach(element => { if (roles.find(x => x.id === element.id)) { roles.find(x => x.id === element.id).selected = true } })
      account.user_groups.forEach(element => { element.user_roles.forEach(element2 => { if (roles.find(x => x.id === element2.id)) { roles.find(x => x.id === element2.id).selected = true } }) })

      // superadmin has all roles
      if (account.isSuperAdmin === true) { roles.forEach(element => { element.selected = true })  }

      // response
      const response: generalResponse = { status: true, data: roles, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getAccountTokens(id: string, token: string): Promise<generalResponse> {
    try {
      const accounts = await this.db.user_tokens.findMany({ where: { user_accounts: { every: { id: id } } }, orderBy: [{ created_at: 'desc' }] })
      accounts.forEach(element => {
        if (element.token === token) { element.token = 'current' } else { element.token = '' }
      });
      // response
      const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteAccountTokens(user: any, id: string, token_id: string): Promise<generalResponse> {
    try {
      const accounts = await this.db.user_tokens.delete({ where: { id: token_id, user_accounts: { every: { id: id } } } })
      // response
      this.loggerService.log('access token revoked', 0, user, id)
      const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putAccount(id: string, body: editDto, user: any): Promise<generalResponse> {
    try {
      const account = await this.db.user_accounts.findUnique({ where: { id: id }, omit: { password: true } })
      if (body.password && body.password !== '' && user.isSuperAdmin === true) { body.password = await bcrypt.hash(body.password, hash_secret); }
      if (body.expireInterval && body.expireInterval !== 0) { body['expire_at'] = new Date(new Date().setDate(new Date().getDate() + body.expireInterval)).toISOString() }
      if (body.expireInterval && body.expireInterval === 0) { body['expire_at'] = null }
      if (body.expired && body.expired === true) { body['expire_at'] = null }
      if (body.isSuperAdmin && user.isSuperAdmin === false) { body.isSuperAdmin = false }
      const account2 = await this.db.user_accounts.update({ where: { id: id }, data: body, omit: { password: true } })
      // response
      this.loggerService.log('user edited', 0, user, account.id)
      const response: generalResponse = { status: true, data: account2, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putAccountExpire(id: string, user: any): Promise<generalResponse> {
    try {
      const account = await this.db.user_accounts.update({ where: { id: id }, data: { expired: true }, omit: { password: true } })
      // response
      this.loggerService.log('user expired', 0, user, account.id)
      const response: generalResponse = { status: true, data: account, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteAccount(user: any, id: string): Promise<generalResponse> {
    try {
      const account = await this.db.user_accounts.delete({ where: { id: id }, omit: { password: true } })
      // response
      this.loggerService.log('user removed', 0, user, account.id)
      const response: generalResponse = { status: true, data: account, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async signUp(body: signUpDto, user: any): Promise<generalResponse> {
    try {
      // check if user already exist
      const existingUser = await this.db.user_accounts.findUnique({ where: { username: body.username } });
      if (existingUser) { throw { message: 'username not valid'  } }
      // check complexity
      if (await this.settings.checkPasswordComplexities(body.password) === false) { throw { message: 'password complexity missmatch' } }
      // prepare password
      body.password = await bcrypt.hash(body.password, hash_secret);
      // check expire date
      if (body.expireInterval !== 0) { body['expire_at'] = new Date(new Date().setDate(new Date().getDate() + body.expireInterval)).toISOString() }
      // prevent creating superadmin by normal user
      if (user.isSuperAdmin === false) { body.isSuperAdmin = false }
      // store in db
      const account = await this.db.user_accounts.create({ data: body, omit: { password: true } });
      // logger
      this.loggerService.log('new user created', 0, user, account.id)
      // response
      const response: generalResponse = { status: true, data: account, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async signIn(req: any, body: singInDto): Promise<generalResponse> {
    try {
      // check if user email is valid
      let account = await this.db.user_accounts.findFirst({ where: { username: body.username, isActive: true } });
      if (!account) { throw { message: 'Unauthorized user' } }
      // check if user password is valid
      const comparePassword = await bcrypt.compare(body.password, account.password);
      if (!comparePassword) { throw { message: 'Unauthorized password' } }
      // check for totp
      if (account.totp_status === true) {
        if (body.totp) {
          const totp_validation = speakeasy.totp.verify({ secret: account.totp_secret, token: body.totp })
          if (!totp_validation) {
            throw { message: 'Invalid TOTP Code' }
          }
        } else {
          throw { message: 'totp' }
        }
      }
      // check scheduler
      const user_id = account.id
      const login_scheduler_result = await this.scheduler.verify_user_account(user_id)
      const login_scheduler = login_scheduler_result.status === true && login_scheduler_result.data['valid'] === true
      if (!login_scheduler) { throw { message: 'Invalid scheduler time' } }
      // check ip / mac
      const ip = req['x-forwarded-for'] ? req['x-forwarded-for'] : body.ip ? body.ip : '-'
      const mac = body.mac ? body.mac : '-'
      const ip_mac_scheduler_result = await this.scheduler.verify_ip_mac(user_id, ip, mac)
      const ip_mac_scheduler = ip_mac_scheduler_result.status === true && ip_mac_scheduler_result.data['valid'] === true
      if (!ip_mac_scheduler) { throw { message: 'Invalid ip or mac' } }
      // check if expired
      if (account.expire_at !== null && account.expire_at < new Date()) {
        account = await this.db.user_accounts.update({ where: { id : account.id}, data: { expired: true } })
      }
      if (account.expired === true) { throw { message: 'expired' } }
      // prepare service
      const service = body.service === 'Configtool'? 'Configtool' : body.service === 'Client' ? 'Client' : 'Other'
      // prepare token
      account.password = null;
      account.totp_secret = null;
      account.totp_url = null;
      let expiresIn = 0
      if (service === 'Configtool' && account.isSuperAdmin === true)  { expiresIn = 8 * 60 * 60 }
      if (service === 'Configtool' && account.isSuperAdmin === false)  { expiresIn = 1 * 60 * 60 }
      if (service === 'Client' && account.isSuperAdmin === true)  { expiresIn = 24 * 60 * 60 * 365 }
      if (service === 'Client' && account.isSuperAdmin === false)  { expiresIn = 24 * 60 * 60 }
      if (service === 'Other')  { expiresIn = 10 * 60 }
      const token = jwt.sign(account, jwt_secret, { expiresIn: expiresIn });
      // prepare for concurrent logins
      if (account.concurrent > 0)
      {
        const concurrent = await this.db.user_tokens.findMany({ where: { user_accounts: { some: { id: account.id } } } , skip: account.concurrent - 1, orderBy: { created_at: 'desc' } });
        const concurrentIds = concurrent.map(item => item.id)
        await this.db.user_tokens.deleteMany({ where: { user_accounts: { some: { id: account.id } }, id: { in: concurrentIds} } })
      }
      // save token to db
      await this.db.user_tokens.create({ data: { token: token, expiration: new Date(Date.now() + expiresIn * 1000), service: service, ip: ip, mac: mac, user_accounts: { connect: { id: account.id } } } })
      // send notif
      this.loggerService.log('user sign in', 0, account)
      // response
      const response: generalResponse = { status: true, data: { token: token }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 401);
    }
  }

  async signOut(req: any, user: any): Promise<generalResponse> {
    try {
      const token = req.authorization?.replace('Bearer ', '')
      await this.db.user_tokens.deleteMany({ where: { token: token } })
      // response
      this.loggerService.log('user signed out', 0, user, user.id)
      const response: generalResponse = { status: true, data: null, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 401);
    }
  }

  async changePass(req: any, body: PasswordDto): Promise<generalResponse> {
    try {
      // check if user email is valid
      let account = await this.db.user_accounts.findFirst({ where: { username: body.username, isActive: true } });
      if (!account) { throw { message: 'Unauthorized' } }
      // check if user password is valid
      const comparePassword = await bcrypt.compare(body.old_password, account.password);
      if (!comparePassword) { throw { message: 'invalid current user password' } }
      // check for totp
      if (account.totp_status === true) {
        if (body.totp) {
          const totp_validation = speakeasy.totp.verify({ secret: account.totp_secret, token: body.totp })
          if (!totp_validation) {
            throw { message: 'Invalid TOTP Code' }
          }
        } else {
          throw { message: 'totp' }
        }
      }
      // check scheduler
      const user_id = account.id
      const login_scheduler_result = await this.scheduler.verify_user_account(user_id)
      const login_scheduler = login_scheduler_result.status === true && login_scheduler_result.data['valid'] === true
      if (!login_scheduler) { throw { message: 'Invalid scheduler time' } }
      // check ip / mac
      const ip = req['x-forwarded-for'] ? req['x-forwarded-for'] : body.ip ? body.ip : '-'
      const mac = body.mac ? body.mac : '-'
      const ip_mac_scheduler_result = await this.scheduler.verify_ip_mac(user_id, ip, mac)
      const ip_mac_scheduler = ip_mac_scheduler_result.status === true && ip_mac_scheduler_result.data['valid'] === true
      if (!ip_mac_scheduler) { throw { message: 'Invalid ip or mac' } }
      // check password complexity
      if (await this.settings.checkPasswordComplexities(body.new_password) === false) { throw { message: 'password complexity missmatch' } }
      // prepare password
      body.new_password = await bcrypt.hash(body.new_password, hash_secret);
      // check if expired
      account = await this.db.user_accounts.update({ where: { id : account.id}, data: { expired: false, expire_at: null, password: body.new_password, mustchangepassword: false } })
      // assign new expire date if needed
      if (account.expireInterval !== 0) {
        const new_expire_date = new Date(new Date().setDate(new Date().getDate() + account.expireInterval)).toISOString()
        account = await this.db.user_accounts.update({ where: { id : account.id}, data: { expire_at: new_expire_date } })
      }
      // prepare service
      const service = body.service === 'Configtool'? 'Configtool' : body.service === 'Client' ? 'Client' : 'Other'
      // prepare token
      account.password = null;
      account.totp_secret = null;
      account.totp_url = null;
      let expiresIn = 0
      if (service === 'Configtool' && account.isSuperAdmin === true)  { expiresIn = 8 * 60 * 60 }
      if (service === 'Configtool' && account.isSuperAdmin === false)  { expiresIn = 1 * 60 * 60 }
      if (service === 'Client' && account.isSuperAdmin === true)  { expiresIn = 24 * 60 * 60 * 365 }
      if (service === 'Client' && account.isSuperAdmin === false)  { expiresIn = 24 * 60 * 60 }
      if (service === 'Other')  { expiresIn = 10 * 60 }
      const token = jwt.sign(account, jwt_secret, { expiresIn: expiresIn });
      // save token to db
      await this.db.user_tokens.create({ data: { token: token, expiration: new Date(Date.now() + expiresIn * 1000), service: service, ip: ip, mac: mac, user_accounts: { connect: { id: account.id } } } })
      // response
      const response: generalResponse = { status: true, data: { token: token }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async generate_password(user, id): Promise<generalResponse> {
    try {
      if (user.isSuperAdmin === false && id !== user.id) { throw { message: 'must be called by user or superadmin'  } }

      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const specialChars = '!@#$%^&*';
      const allChars = lowercase + uppercase + numbers + specialChars;
      let password = '';
      for (let i = 0; i < 10; i++) {
          const randomIndex = Math.floor(Math.random() * allChars.length);
          password += allChars[randomIndex];
      }
      const new_password = await bcrypt.hash(password, hash_secret);
      await this.db.user_accounts.update({ where: { id : id}, data: { password: new_password, mustchangepassword: true } })
      // response
      this.loggerService.log('new password for user generated', 0, user, id)
      const response: generalResponse = { status: true, data: { password: password }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async verifyToken(req) {
    try {
      // enable cors
      if (req['x-forwarded-method'] && req['x-forwarded-method'] === 'OPTIONS') { return true }

      if (!req.authorization) { throw { message: 'Forbidden' } }
      const token = req.authorization.replace('Bearer ', '');

      if (token) {
        const v = jwt.verify(token, jwt_secret, { complete: true })
        const user_token: any = v.payload;
        const user_id = user_token.id;

        let user = await this.cacheManager.get(`user_${user_id}`) as any;
        if (!user) {
          user = await this.db.user_accounts.findUnique({ where: { id: user_id } });
          await this.cacheManager.set(`user_${user_id}`, user)
        }
        if (!user) { throw { message: 'Forbidden' } }

        let stored_token = await this.cacheManager.get(`user_token_${user_id}`) as any;
        if (!stored_token) {
          stored_token = await this.db.user_tokens.findFirst({ where: { token: token, user_accounts: { some: { id: user.id } } }})
          await this.cacheManager.set(`user_token_${user_id}`, stored_token)
        }
        if (!stored_token) { throw { message: 'Forbidden' } }

        let login_scheduler = await this.cacheManager.get(`user_scheduler_${user_id}`) as any;
        if (!login_scheduler) {
          const login_scheduler_result = await this.scheduler.verify_user_account(user_id)
          login_scheduler = login_scheduler_result.status === true && login_scheduler_result.data['valid'] === true
          await this.cacheManager.set(`user_scheduler_${user_id}`, login_scheduler)
        }
        if (!login_scheduler) { throw { message: 'Invalid scheduler time' } }

        return user_id
      } else {
        throw { message: 'Forbidden' }
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 403);
    }
  }

  async allRoles(user: any, query: roleSearchQuery): Promise<generalResponse> {
    try {
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.search) { where['AND'].push({ OR: [ { name: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } } ] }) }
      if (query.userId && query.userFilter === 'Include') { where['AND'].push({ OR : [ { user_accounts: { some: { id: { equals: query.userId } } } } ] }) }
      if (query.userId && query.userFilter === 'Exclude') { where['AND'].push({ user_accounts: { none: { id: { equals: query.userId } } } }) }
      if (query.userGroupId && query.userGroupFilter === 'Include') { where['AND'].push({ OR : [ { user_groups: { some: { id: { equals: query.userGroupId } } } } ] }) }
      if (query.userGroupId && query.userGroupFilter === 'Exclude') { where['AND'].push({ user_groups: { none: { id: { equals: query.userGroupId } } } }) }

      const include = {}
      const [total, temp] = await this.db.$transaction([
        this.db.user_roles.count({ where }),
        this.db.user_roles.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      // response
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getAccountTotp (id: string, user: any) : Promise<generalResponse> {
    try {
      if (user.isSuperAdmin === false && id !== user.id) { throw { message: 'must be called by user or superadmin'  } }
      const account = await this.db.user_accounts.findUnique({ where: { id: id } })
      const result = {}
      if (account.totp_status === true) {
        result["enable"] = true
        result["qr"] = await qrcode.toDataURL(account.totp_url)
        result["secret"] = account.totp_secret
      } else {
        result["enable"] = false
      }
      // response
      const response: generalResponse = { status: true, data: result, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
  async putAccountTotp (id: string, user: any) : Promise<generalResponse> {
    try {
      if (user.isSuperAdmin === false && id !== user.id) { throw { message: 'must be called by user or superadmin'  } }
      const account = await this.db.user_accounts.findUnique({ where: { id: id } })
      const result = {}
      if (account.totp_status === true) {
        await this.db.user_accounts.update({ where: { id: id }, data: { totp_status: false, totp_url: '', totp_secret: '' }})
        result["enable"] = false
      } else {
        const secret = speakeasy.generateSecret();
        const url = speakeasy.otpauthURL({ secret: secret.base32, label: 'SGI VMS ' + account.username});
        const account2 = await this.db.user_accounts.update({ where: { id: id }, data: { totp_status: true, totp_url: url, totp_secret: secret.base32 }})
        result["enable"] = true
        result["qr"] = await qrcode.toDataURL(account2.totp_url)
        result["secret"] = account2.totp_secret
        console.log(url)
      }
      // response
      this.loggerService.log('user totp status changed', 0, user, account.id)
      const response: generalResponse = { status: true, data: result, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
}
