import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'
import { jwt_secret } from "src/app.consts";
import { Reflector } from "@nestjs/core";
import { DbService } from "src/db/db.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class accountGaurd implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly db: DbService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // remove expired tokens
    await this.db.user_tokens.deleteMany({ where: { expiration: { lt: new Date(Date.now()) } } })
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

        let user = await this.cacheManager.get(`user_${user_id}`) as any;
        if (!user) {
          user = await this.db.user_accounts.findUnique({ where: { id: user_id }, include: { user_groups: { include: { user_roles: true } }, user_roles: true } });
          await this.cacheManager.set(`user_${user_id}`, user)
        }

        if (!user) { return false }

        let stored_token = await this.cacheManager.get(`user_token_${user_id}`) as any;
        if (!stored_token) {
          stored_token = await this.db.user_tokens.findFirst({ where: { token: token, user_accounts: { some: { id: user.id } } }})
          await this.cacheManager.set(`user_token_${user_id}`, stored_token)
        }

        if (!stored_token) { return false }

        if (user.isSuperAdmin === true) { return true; }
        if (!role) { return true }

        let roles = await this.cacheManager.get(`user_roles_${user_id}_${role}`) as any;
        if (!roles) {
          roles = await this.db.user_roles.findFirst({ where: { name: role, user_accounts: { some: { id: user.id } } } })
          await this.cacheManager.set(`user_roles_${user_id}_${role}`, roles)
        }

        let groups = await this.cacheManager.get(`user_groups_${user_id}_${role}`) as any;
        if (!groups) {
          groups = await this.db.user_groups.findFirst({ where: { user_accounts: { some: { id: user.id } }, user_roles: { some: { name: role } } }, include: { user_roles: true } })
          await this.cacheManager.set(`user_groups_${user_id}_${role}`, groups)
        }

        if (roles || groups) { return true } // role found , direct or nested of group

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