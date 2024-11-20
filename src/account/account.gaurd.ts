import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'
import { jwt_secret } from "src/app.consts";
import { Reflector } from "@nestjs/core";
import { DbService } from "src/db/db.service";

@Injectable()
export class accountGaurd implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly db: DbService ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // remove expired tokens
    await this.db.account_tokens.deleteMany({ where: { expiration: { lt: new Date(Date.now()) } } })
    // get role of this route
    const role = this.reflector.getAllAndOverride('role', [ context.getHandler(), context.getClass() ])
    // prepare tokens
    const req = context.switchToHttp().getRequest()
    if (!req?.headers?.authorization) { return false }
    const token = req?.headers?.authorization.replace('Bearer ', '')
    if (token) {
      try {
        const v = jwt.verify(token, jwt_secret, { complete: true })
        const user_token: any = v.payload;
        const user_id = user_token.id;

        const user = await this.db.account.findUnique({ where: { id: user_id } });
        if (!user) { return false }

        const stored_token = await this.db.account_tokens.findFirst({ where: { account_id: user.id, token: token }})
        if (!stored_token) { return false }

        if (user.isSuperAdmin === true) { return true; }
        if (!role) { return true }

        const roles = await this.db.roles.findFirst({ where: { name: role } })
        if (!roles) { return false } // role not found !!!

        const account = await this.db.account.findMany({ include: { account_group: { include: { groups: { include: { group_roles: { include: { roles: true } } } } } } }, where: { id: user.id, account_group: { some: { groups: { is: { group_roles: { some: { roles: { is: { name: role } } } } } } } } }})
        if (!account) { return false } // group not found

        const role_default = account[0]?.account_group[0]?.groups?.group_roles[0]?.roles?.default;
        const role_value = account[0]?.account_group[0]?.groups?.group_roles[0]?.value;
        if (role_value === 1) { return true }
        if (role_value === -1) { return false }
        if (role_value === 0) {
          if (role_default === true) { return true } else { return false }
        }

        return false
      } catch (error) {
        console.log(error)
        return false
      }
    } else {
      return false
    }
  }
}