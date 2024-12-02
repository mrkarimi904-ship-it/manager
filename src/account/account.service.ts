import { ConflictException, HttpException, Injectable, NotAcceptableException, UnauthorizedException } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import { accountSearchQuery, editDto, groupSearchQuery, PasswordDto, signUpDto, singInDto } from './account.dto';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { generalResponse, hash_secret, jwt_secret } from 'src/app.consts';

@Injectable()
export class AccountService {
  constructor(private db: DbService) {}

  async allAccounts(user, query: accountSearchQuery): Promise<generalResponse> {
    if (!query.pageIndex) { query.pageIndex = "1" }
    if (!query.pageSize) { query.pageSize = "20" }
    const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
    const take: number = parseInt(query.pageSize)
    const where = { isHidden: false, AND: [] }
    if (query.search) { where['AND'].push({ OR: [ { username: { contains: query.search, mode: 'insensitive' } }, { firstname: { contains: query.search, mode: 'insensitive' } }, { lastname: { contains: query.search, mode: 'insensitive' } } ] }) }
    if (query.cameraId && query.cameraFilter === 'Include') { where['AND'].push({ OR : [ { camera: { some: { id: { equals: query.cameraId } } } }, { isSuperAdmin: true } ] }) }
    // if (query.cameraId && query.cameraFilter === 'Exclude') { where['camera'] = { none: { id: { equals: query.cameraId } } }; where['isSuperAdmin'] = false }
    if (query.cameraId && query.cameraFilter === 'Exclude') { where['AND'].push({ camera: { none: { id: { equals: query.cameraId } } } }) }
    if (query.cameraId && query.cameraFilter === 'Exclude') { where['AND'].push({ isSuperAdmin: false }) }
    if (query.userGroupId && query.userGroupFilter === 'Include') { where['AND'].push({ user_groups: { some: { id: { equals: query.userGroupId } } } }) }
    if (query.userGroupId && query.userGroupFilter === 'Exclude') { where['AND'].push({ user_groups: { none: { id: { equals: query.userGroupId } } } }) }
    if (query.cameraGroupId && query.cameraGroupFilter === 'Include') { where['AND'].push({ camera_groups: { some: { id: { equals: query.cameraGroupId } } } }) }
    if (query.cameraGroupId && query.cameraGroupFilter === 'Exclude') { where['AND'].push({ camera_groups: { none: { id: { equals: query.cameraGroupId } } } }) }

    const include = {}
    const [total, temp] = await this.db.$transaction([
      this.db.user_accounts.count({ where }),
      this.db.user_accounts.findMany({ where, skip, take, include })
    ])
    // response
    const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
    return response;
  }

  async getAccount(id: string): Promise<generalResponse> {
    const accounts = await this.db.user_accounts.findUnique({ where: { id: id }, include: {
      user_roles: { select: { id: true, name: true, description: true } },
      user_groups: { select: { id: true, name: true } },
      camera: { select: { id: true } },
      camera_groups: { select: { id: true, name: true } },
    }})
    // response
    const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
    return response;
  }

  async getAccountTokens(id: string, token: string): Promise<generalResponse> {
    const accounts = await this.db.user_tokens.findMany({ where: { user_accounts: { every: { id: id } } }, select: { id: true, expiration: true, token: true } })
    accounts.forEach(element => {
      if (element.token === token) { element.token = 'current' } else { element.token = '' }
    });
    // response
    const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
    return response;
  }

  async deleteAccountTokens(id: string, token_id: string): Promise<generalResponse> {
    const accounts = await this.db.user_tokens.delete({ where: { id: token_id, user_accounts: { every: { id: id } } } })
    // response
    const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
    return response;
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
      throw new NotAcceptableException(error)
    }
  }

  async putAccountExpire(id: string, user: any): Promise<generalResponse> {
    try {
      const account = await this.db.user_accounts.update({ where: { id: id }, data: { expired: true } })
      // response
      const response: generalResponse = { status: true, data: account, error: null, msg: null };
      return response;
    } catch (error) {
      throw new NotAcceptableException(error)
    }
  }

  async deleteAccount(id: string): Promise<generalResponse> {
    try {
      const account = await this.db.user_accounts.delete({ where: { id: id } })
      // response
      const response: generalResponse = { status: true, data: account, error: null, msg: null };
      return response;
    } catch (error) {
      throw new NotAcceptableException(error)
    }
  }


  async signUp(body: signUpDto, user: any): Promise<generalResponse> {
    // check if user already exist
    const existingUser = await this.db.user_accounts.findUnique({ where: { username: body.username } });
    if (existingUser) { throw new ConflictException(); }
    // prepare password
    body.password = await bcrypt.hash(body.password, hash_secret);
    // check expire date
    if (body.expireInterval !== 0) { body['expire_at'] = new Date(new Date().setDate(new Date().getDate() + body.expireInterval)).toISOString() }
    // prevent creating superadmin by normal user
    if (user.isSuperAdmin === false) { body.isSuperAdmin = false }
    // store in db
    const account = await this.db.user_accounts.create({ data: body });
    // response
    const response: generalResponse = { status: true, data: account, error: null, msg: null };
    return response;
  }

  async signIn(body: singInDto): Promise<generalResponse> {
    // check if user email is valid
    let account = await this.db.user_accounts.findFirst({ where: { username: body.username, isActive: true } });
    if (!account) { throw new UnauthorizedException(); }
    // check if user password is valid
    const comparePassword = await bcrypt.compare(body.password, account.password);
    if (!comparePassword) { throw new UnauthorizedException(); }
    // check if expired
    if (account.expire_at !== null && account.expire_at < new Date()) {
      account = await this.db.user_accounts.update({ where: { id : account.id}, data: { expired: true } })
    }
    // prepare token
    account.password = null;
    const token = jwt.sign(account, jwt_secret, { expiresIn: 24 * 60 * 60 });
    // save token to db
    await this.db.user_tokens.create({ data: { token: token, expiration: new Date(Date.now() + 24*60*60*1000), user_accounts: { connect: { id: account.id } } } })
    // response
    const response: generalResponse = { status: true, data: { token: token }, error: null, msg: null };
    return response;
  }

  async changePass(body: PasswordDto): Promise<generalResponse> {
    // check if user email is valid
    let account = await this.db.user_accounts.findFirst({ where: { username: body.username, isActive: true } });
    if (!account) { throw new UnauthorizedException(); }
    // check if user password is valid
    const comparePassword = await bcrypt.compare(body.old_password, account.password);
    if (!comparePassword) { throw new UnauthorizedException(); }
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
  }

  async verifyToken(req) {
    try {
      // enable cors
      if (req['x-forwarded-method'] && req['x-forwarded-method'] === 'OPTIONS') { return true }

      if (!req.authorization) { throw new HttpException('Forbidden', 403); }
      const token = req.authorization.replace('Bearer ', '');

      if (token) {
        const v = jwt.verify(token, jwt_secret, { complete: true })
        const user_token: any = v.payload;
        const user_id = user_token.id;

        const user = await this.db.user_accounts.findUnique({ where: { id: user_id } });
        if (!user) { throw new HttpException('Forbidden', 403); }

        const stored_token = await this.db.user_tokens.findFirst({ where: { token: token, user_accounts: { every: { id: user.id } } }})
        if (!stored_token) { throw new HttpException('Forbidden', 403); }

        return user_id
      } else {
        throw new HttpException('Forbidden', 403);
      }
    } catch (error) {
      console.log('verify error', error)
      throw new HttpException('Forbidden', 403);
    }
  }

  async allRoles(): Promise<generalResponse> {
    const roles = await this.db.user_roles.findMany({});
    // response
    const response: generalResponse = { status: true, data: roles, error: null, msg: null };
    return response;
  }

  async allGroups(user: any, query: groupSearchQuery): Promise<generalResponse> {
    if (!query.pageIndex) { query.pageIndex = "1" }
    if (!query.pageSize) { query.pageSize = "20" }
    const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
    const take: number = parseInt(query.pageSize)
    const where = { AND: [] }
    if (query.search) { where['AND'].push({ OR: [ { name: { contains: query.search, mode: 'insensitive' } } ] }) }
    if (query.cameraId && query.cameraFilter === 'Include') { where['AND'].push({ camera: { some: { id: { equals: query.cameraId } } } }) }
    if (query.cameraId && query.cameraFilter === 'Exclude') { where['AND'].push({ camera: { none: { id: { equals: query.cameraId } } } }) }
    if (query.userId && query.userFilter === 'Include') { where['AND'].push({ user_accounts: { some: { id: { equals: query.userId } } } }) }
    if (query.userId && query.userFilter === 'Exclude') { where['AND'].push({ user_accounts: { none: { id: { equals: query.userId } } } }) }
    if (query.cameraGroupId && query.cameraGroupFilter === 'Include') { where['AND'].push({ camera_groups: { some: { id: { equals: query.cameraGroupId } } } }) }
    if (query.cameraGroupId && query.cameraGroupFilter === 'Exclude') { where['AND'].push({ camera_groups: { none: { id: { equals: query.cameraGroupId } } } }) }

    const include = {}
    const [total, temp] = await this.db.$transaction([
      this.db.user_groups.count({ where }),
      this.db.user_groups.findMany({ where, skip, take, include })
    ])
    // response
    const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
    return response;
  }

  async postGroups(body): Promise<generalResponse> {
    const roles = await this.db.user_groups.create({ data: { name: body.name } });
    // response
    const response: generalResponse = { status: true, data: roles, error: null, msg: null };
    return response;
  }

  async getGroups(group_id: string): Promise<generalResponse> {
    const usergroups = await this.db.user_groups.findUnique({ where: { id: group_id }, include: {
      user_roles: { select: { id: true, name: true, description: true } },
      user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
      camera: { select: { id: true } },
      camera_groups: { select: { id: true, name: true } },
    } });
    // response
    const response: generalResponse = { status: true, data: usergroups, error: null, msg: null };
    return response;
  }

  async putGroups(group_id: string, body): Promise<generalResponse> {
    const roles = await this.db.user_groups.update({ where:{ id: group_id }, data: { name: body.name }, include: {
      user_roles: { select: { id: true, name: true, description: true } },
      user_accounts: { select: { id: true, username: true, firstname: true, lastname: true } },
    } });
    // response
    const response: generalResponse = { status: true, data: roles, error: null, msg: null };
    return response;
  }

  async deleteGroups(group_id: string): Promise<generalResponse> {
    const roles = await this.db.user_groups.delete({ where: { id: group_id } });
    // response
    const response: generalResponse = { status: true, data: roles, error: null, msg: null };
    return response;
  }

}
