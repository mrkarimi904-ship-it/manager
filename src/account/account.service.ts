import { HttpException, Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import { accountSearchQuery, editDto, PasswordDto, signUpDto, singInDto } from './account.dto';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { generalResponse, hash_secret, jwt_secret } from 'src/app.consts';
import { SettingsService } from 'src/settings/settings.service';
import { LoggerGateway } from 'src/logger/logger.gateway';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class AccountService {
  constructor(private db: DbService, private settings: SettingsService, private loggerGateway: LoggerGateway, private loggerService: LoggerService ) {}

  async allAccounts(user, query: accountSearchQuery): Promise<generalResponse> {
    try {
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { isHidden: false, AND: [] }
      if (query.search) { where['AND'].push({ OR: [ { username: { contains: query.search, mode: 'insensitive' } }, { firstname: { contains: query.search, mode: 'insensitive' } }, { lastname: { contains: query.search, mode: 'insensitive' } } ] }) }
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
        this.db.user_accounts.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
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
      }})
      // response
      const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getAccountTokens(id: string, token: string): Promise<generalResponse> {
    try {
      const accounts = await this.db.user_tokens.findMany({ where: { user_accounts: { every: { id: id } } }, select: { id: true, expiration: true, token: true }, orderBy: [{ created_at: 'desc' }] })
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

  async deleteAccountTokens(id: string, token_id: string): Promise<generalResponse> {
    try {
      const accounts = await this.db.user_tokens.delete({ where: { id: token_id, user_accounts: { every: { id: id } } } })
      // response
      const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putAccount(id: string, body: editDto, user: any): Promise<generalResponse> {
    try {
      const account = await this.db.user_accounts.findUnique({ where: { id: id } })
      if (body.password && body.password !== '') { body.password = await bcrypt.hash(body.password, hash_secret); }
      if (account.expired === true && body.expired === false && body.expireInterval !== 0) { body['expire_at'] = new Date(new Date().setDate(new Date().getDate() + body.expireInterval)).toISOString() }
      if (account.expired === false && body.expired === true && body.expireInterval !== 0) { body['expire_at'] = null }
      if (body.expireInterval === 0) { body['expire_at'] = null }
      if (user.isSuperAdmin === false) { body.isSuperAdmin = false }
      const account2 = await this.db.user_accounts.update({ where: { id: id }, data: body })
      // response
      const response: generalResponse = { status: true, data: account2, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putAccountExpire(id: string, user: any): Promise<generalResponse> {
    try {
      const account = await this.db.user_accounts.update({ where: { id: id }, data: { expired: true } })
      // response
      const response: generalResponse = { status: true, data: account, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteAccount(id: string): Promise<generalResponse> {
    try {
      const account = await this.db.user_accounts.delete({ where: { id: id } })
      // response
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
      if (!this.settings.checkPasswordComplexities(body.password)) { throw { message: 'password complexity missmatch' } }
      // prepare password
      body.password = await bcrypt.hash(body.password, hash_secret);
      // check expire date
      if (body.expireInterval !== 0) { body['expire_at'] = new Date(new Date().setDate(new Date().getDate() + body.expireInterval)).toISOString() }
      // prevent creating superadmin by normal user
      if (user.isSuperAdmin === false) { body.isSuperAdmin = false }
      // store in db
      const account = await this.db.user_accounts.create({ data: body });
      account.password = null;
      // logger
      this.loggerService.log('new user created', 0, user, account.id)
      // response
      const response: generalResponse = { status: true, data: account, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async signIn(body: singInDto): Promise<generalResponse> {
    try {
      // check if user email is valid
      let account = await this.db.user_accounts.findFirst({ where: { username: body.username, isActive: true } });
      if (!account) { throw { message: 'Unauthorized' } }
      // check if user password is valid
      const comparePassword = await bcrypt.compare(body.password, account.password);
      if (!comparePassword) { throw { message: 'Unauthorized' } }
      // check if expired
      if (account.expire_at !== null && account.expire_at < new Date()) {
        account = await this.db.user_accounts.update({ where: { id : account.id}, data: { expired: true } })
      }
      // prepare token
      account.password = null;
      const token = jwt.sign(account, jwt_secret, { expiresIn: 24 * 60 * 60 });
      // save token to db
      await this.db.user_tokens.create({ data: { token: token, expiration: new Date(Date.now() + 24*60*60*1000), user_accounts: { connect: { id: account.id } } } })
      // send notif
      this.loggerService.log('user sign in', 0, account)
      this.loggerGateway.notify_admins(`${account.firstname} ${account.lastname} signed in`)
      // response
      const response: generalResponse = { status: true, data: { token: token }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 401);
    }
  }

  async changePass(body: PasswordDto): Promise<generalResponse> {
    try {
      // check if user email is valid
      let account = await this.db.user_accounts.findFirst({ where: { username: body.username, isActive: true } });
      if (!account) { throw { message: 'Unauthorized' } }
      // check if user password is valid
      const comparePassword = await bcrypt.compare(body.old_password, account.password);
      if (!comparePassword) { throw { message: 'invalid current user password' } }
      // check password complexity
      if (!this.settings.checkPasswordComplexities(body.new_password)) { throw { message: 'password complexity missmatch' } }
      // prepare password
      body.new_password = await bcrypt.hash(body.new_password, hash_secret);
      // check if expired
      account = await this.db.user_accounts.update({ where: { id : account.id}, data: { expired: false, expire_at: null, password: body.new_password, mustchangepassword: false } })
      // assign new expire date if needed
      if (account.expireInterval !== 0) {
        const new_expire_date = new Date(new Date().setDate(new Date().getDate() + account.expireInterval)).toISOString()
        account = await this.db.user_accounts.update({ where: { id : account.id}, data: { expire_at: new_expire_date } })
      }
      // prepare token
      account.password = null;
      const token = jwt.sign(account, jwt_secret, { expiresIn: 24 * 60 * 60 });
      // save token to db
      await this.db.user_tokens.create({ data: { token: token, expiration: new Date(Date.now() + 24*60*60*1000), user_accounts: { connect: { id: account.id } } } })
      // response
      const response: generalResponse = { status: true, data: { token: token }, error: null, msg: null };
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

        const user = await this.db.user_accounts.findUnique({ where: { id: user_id } });
        if (!user) { throw { message: 'Forbidden' } }

        const stored_token = await this.db.user_tokens.findFirst({ where: { token: token, user_accounts: { every: { id: user.id } } }})
        if (!stored_token) { throw { message: 'Forbidden' } }

        return user_id
      } else {
        throw { message: 'Forbidden' }
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 403);
    }
  }

  async allRoles(): Promise<generalResponse> {
    try {
      const roles = await this.db.user_roles.findMany({});
      // response
      const response: generalResponse = { status: true, data: roles, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
}
