import { ConflictException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import { signUpDto, singInDto } from './account.dto';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { generalResponse, hash_secret, jwt_secret } from 'src/app.consts';

@Injectable()
export class AccountService {
  constructor(private db: DbService) {}

  async allAccounts(): Promise<generalResponse> {
    const accounts = await this.db.account.findMany();
    // response
    const response: generalResponse = { status: true, data: accounts, error: null, msg: null };
    return response;
  }

  async signUp(body: signUpDto): Promise<generalResponse> {
    // check if user already exist
    const existingUser = await this.db.account.findUnique({ where: { username: body.username } });
    if (existingUser) { throw new ConflictException(); }
    // prepare password
    const cryptPassword = await bcrypt.hash(body.password, hash_secret);
    // store in db
    const account = await this.db.account.create({ data: { username: body.username, password: cryptPassword, firstname: body.firstname, lastname: body.lastname, description: body.description } });
    // response
    const response: generalResponse = { status: true, data: account, error: null, msg: null };
    return response;
  }

  async signIn(body: singInDto): Promise<generalResponse> {
    // check if user email is valid
    const account = await this.db.account.findFirst({ where: { username: body.username } });
    if (!account) { throw new UnauthorizedException(); }
    // check if user password is valid
    const comparePassword = await bcrypt.compare(body.password, account.password);
    if (!comparePassword) { throw new UnauthorizedException(); }
    // prepare token
    account.password = null;
    const token = jwt.sign(account, jwt_secret, { expiresIn: 24 * 60 * 60 });
    // save token to db
    await this.db.account_tokens.create({ data: { account_id: account.id, token: token, expiration: new Date(Date.now() + 24*60*60*1000) } })
    // response
    const response: generalResponse = { status: true, data: { token: token }, error: null, msg: null };
    return response;
  }

  async verifyToken(req) {
    try {
      // enable cors
      if (req['x-forwarded-method'] && req['x-forwarded-method'] === 'OPTIONS') { return true }

      const role = req['x-forwarded-uri'] ? req['x-forwarded-uri'] : ''
      if (!req.authorization) { throw new HttpException('Forbidden', 403); }
      const token = req.authorization.replace('Bearer ', '');

      if (token) {
        const v = jwt.verify(token, jwt_secret, { complete: true })
        const user_token: any = v.payload;
        const user_id = user_token.id;

        const user = await this.db.account.findUnique({ where: { id: user_id } });
        if (!user) { throw new HttpException('Forbidden', 403); }

        const stored_token = await this.db.account_tokens.findFirst({ where: { account_id: user.id, token: token }})
        if (!stored_token) { throw new HttpException('Forbidden', 403); }

        if (user.isSuperAdmin === true) { return user_id }

        const roles = await this.db.roles.findFirst({ where: { name: role } })
        if (!roles) { throw new HttpException('Forbidden', 403); } // role not found !!!

        const account = await this.db.account.findMany({ include: { account_group: { include: { groups: { include: { group_roles: { include: { roles: true } } } } } } }, where: { id: user.id, account_group: { some: { groups: { is: { group_roles: { some: { roles: { is: { name: role } } } } } } } } }})
        if (!account) { throw new HttpException('Forbidden', 403); } // group not found

        const role_default = account[0]?.account_group[0]?.groups?.group_roles[0]?.roles?.default;
        const role_value = account[0]?.account_group[0]?.groups?.group_roles[0]?.value;

        if (role_value === 1) { return user_id }
        if (role_value === -1) { throw new HttpException('Forbidden', 403); }
        if (role_value === 0) {
          if (role_default === true) { return user_id } else { throw new HttpException('Forbidden', 403); }
        }

        throw new HttpException('Forbidden', 403);
      } else {
        throw new HttpException('Forbidden', 403);
      }
    } catch (error) {
      console.log('verify error', error)
      throw new HttpException('Forbidden', 403);
    }
  }

}
