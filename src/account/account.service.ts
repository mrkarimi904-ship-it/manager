import { ConflictException, HttpException, Injectable, NotAcceptableException, UnauthorizedException } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import { editDto, signUpDto, singInDto } from './account.dto';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { generalResponse, hash_secret, jwt_secret } from 'src/app.consts';

@Injectable()
export class AccountService {
  constructor(private db: DbService) {}

  async allAccounts(): Promise<generalResponse> {
    const accounts = await this.db.user_accounts.findMany({ include: {
      user_account_group: { select: { user_groups: { select: { id: true, name: true } } } }
    } });
    // response
    const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
    return response;
  }

  async getAccount(id: string): Promise<generalResponse> {
    const accounts = await this.db.user_accounts.findUnique({ where: { id: id } })
    // response
    const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
    return response;
  }

  async getAccountTokens(id: string, token: string): Promise<generalResponse> {
    const accounts = await this.db.user_account_tokens.findMany({ where: { account_id: id }, select: { id: true, expiration: true, token: true } })
    accounts.forEach(element => {
      if (element.token === token) { element.token = 'current' } else { element.token = '' }
    });
    // response
    const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
    return response;
  }

  async deleteAccountTokens(id: string, tid: string): Promise<generalResponse> {
    const accounts = await this.db.user_account_tokens.delete({ where: { account_id: id, id: tid } })
    // response
    const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
    return response;
  }

  async putAccount(id: string, body: editDto): Promise<generalResponse> {
    try {
      const account = await this.db.user_accounts.findUnique({ where: { id: id } })
      if (body.password && body.password !== '') { body.password = await bcrypt.hash(body.password, hash_secret); }
      if (body.expireInterval !== 0 && account.expire_at === null) { body['expire_at'] = new Date(new Date().setDate(new Date().getDate() + account.expireInterval)).toISOString() }
      if (body.expireInterval === 0) { body['expire_at'] = null }
      const account2 = await this.db.user_accounts.update({ where: { id: id }, data: body })
      // response
      const response: generalResponse = { status: true, data: account2, error: null, msg: null };
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


  async signUp(body: signUpDto): Promise<generalResponse> {
    // check if user already exist
    const existingUser = await this.db.user_accounts.findUnique({ where: { username: body.username } });
    if (existingUser) { throw new ConflictException(); }
    // prepare password
    body.password = await bcrypt.hash(body.password, hash_secret);
    // store in db
    const account = await this.db.user_accounts.create({ data: body });
    // response
    const response: generalResponse = { status: true, data: account, error: null, msg: null };
    return response;
  }

  async signIn(body: singInDto): Promise<generalResponse> {
    // check if user email is valid
    let account = await this.db.user_accounts.findFirst({ where: { username: body.username } });
    if (!account) { throw new UnauthorizedException(); }
    // check if user password is valid
    const comparePassword = await bcrypt.compare(body.password, account.password);
    if (!comparePassword) { throw new UnauthorizedException(); }
    // check if expired
    if (account.expire_at < new Date()) {
      account = await this.db.user_accounts.update({ where: { id : account.id}, data: { expired: true } })
    }
    // prepare token
    account.password = null;
    const token = jwt.sign(account, jwt_secret, { expiresIn: 24 * 60 * 60 });
    // save token to db
    await this.db.user_account_tokens.create({ data: { account_id: account.id, token: token, expiration: new Date(Date.now() + 24*60*60*1000) } })
    // response
    const response: generalResponse = { status: true, data: { token: token }, error: null, msg: null };
    return response;
  }

  async verifyToken(req) {
    try {
      // enable cors
      if (req['x-forwarded-method'] && req['x-forwarded-method'] === 'OPTIONS') { return true }

      // const method = req['x-forwarded-method'] ? req['x-forwarded-method'] : ''
      // let role = req['x-forwarded-uri'] ? req['x-forwarded-uri'] : ''
      // if (role.includes('?')) { [role] = role.split('?') }
      // if (role.startsWith('/manager/')) { role = role.slice(9) }
      // if (method === 'POST') { role = role + '_create' }
      // if (method === 'PUT') { role = role + '_edit' }
      // if (method === 'DELETE') { role = role + '_delete' }
      // if (method === 'GET') { role = role + '_list' }

      if (!req.authorization) { throw new HttpException('Forbidden', 403); }
      const token = req.authorization.replace('Bearer ', '');

      if (token) {
        const v = jwt.verify(token, jwt_secret, { complete: true })
        const user_token: any = v.payload;
        const user_id = user_token.id;

        const user = await this.db.user_accounts.findUnique({ where: { id: user_id } });
        if (!user) { throw new HttpException('Forbidden', 403); }

        const stored_token = await this.db.user_account_tokens.findFirst({ where: { account_id: user.id, token: token }})
        if (!stored_token) { throw new HttpException('Forbidden', 403); }

        return user_id

        // if (user.isSuperAdmin === true) { return user_id }
        // const roles = await this.db.user_roles.findFirst({ where: { name: role } })
        // if (!roles) { throw new HttpException('Forbidden', 403); } // role not found !!!
        // const account = await this.db.user_accounts.findMany({ include: { user_account_group: { include: { user_groups: { include: { user_group_roles: { include: { user_roles: true } } } } } } }, where: { id: user.id, user_account_group: { some: { user_groups: { is: { user_group_roles: { some: { user_roles: { is: { name: role } } } } } } } } }})
        // if (!account) { throw new HttpException('Forbidden', 403); } // group not found
        // const role_default = account[0]?.user_account_group[0]?.user_groups?.user_group_roles[0]?.user_roles?.default;
        // const role_value = account[0]?.user_account_group[0]?.user_groups?.user_group_roles[0]?.value;
        // if (role_value === 1) { return user_id }
        // if (role_value === -1) { throw new HttpException('Forbidden', 403); }
        // if (role_value === 0) {
        //   if (role_default === true) { return user_id } else { throw new HttpException('Forbidden', 403); }
        // }
        // throw new HttpException('Forbidden', 403);
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

  async allGroups(): Promise<generalResponse> {
    const roles = await this.db.user_groups.findMany({ include: {
      user_group_roles: { select: { user_roles: { select: { id: true, name: true, description: true } } } },
      user_account_group: { select: { user_accounts: { select: {id: true, username: true, firstname: true, lastname: true, isSuperAdmin: true} } } }
    } });
    // response
    const response: generalResponse = { status: true, data: roles, error: null, msg: null };
    return response;
  }

  async postGroups(body): Promise<generalResponse> {
    const roles = await this.db.user_groups.create({ data: { name: body.name } });
    // response
    const response: generalResponse = { status: true, data: roles, error: null, msg: null };
    return response;
  }

  async getGroups(id): Promise<generalResponse> {
    const roles = await this.db.user_groups.findUnique({ where: { id: id }, include: {
      user_group_roles: { select: { user_roles: { select: { id: true, name: true, description: true } } } },
      user_account_group: { select: { user_accounts: { select: {id: true, username: true, firstname: true, lastname: true, isSuperAdmin: true} } } }
    } });
    // response
    const response: generalResponse = { status: true, data: roles, error: null, msg: null };
    return response;
  }

  async putGroups(id, body): Promise<generalResponse> {
    const roles = await this.db.user_groups.update({ where:{ id: id }, data: { name: body.name }, include: {
      user_group_roles: { select: { user_roles: { select: { id: true, name: true, description: true } } } },
      user_account_group: { select: { user_accounts: { select: {id: true, username: true, firstname: true, lastname: true, isSuperAdmin: true} } } }
    } });
    // response
    const response: generalResponse = { status: true, data: roles, error: null, msg: null };
    return response;
  }

  async deleteGroups(id): Promise<generalResponse> {
    const roles = await this.db.user_groups.delete({ where: { id: id } });
    // response
    const response: generalResponse = { status: true, data: roles, error: null, msg: null };
    return response;
  }

  async postGroupsRoles(id, rid): Promise<generalResponse> {
    const temp = await this.db.user_group_roles.create({ data: { group_id: id, role_id: rid } });
    // response
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }

  async deleteGroupsRoles(id, rid): Promise<generalResponse> {
    const temp = await this.db.user_group_roles.deleteMany({ where: { group_id: id, role_id: rid } });
    // response
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }

  async postGroupsUser(id, rid): Promise<generalResponse> {
    const temp = await this.db.user_account_group.create({ data: { group_id: id, account_id: rid } });
    // response
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }

  async deleteGroupsUser(id, rid): Promise<generalResponse> {
    const temp = await this.db.user_account_group.deleteMany({ where: { group_id: id, account_id: rid } });
    // response
    const response: generalResponse = { status: true, data: temp, error: null, msg: null };
    return response;
  }

}
