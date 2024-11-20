import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'

export class accountInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const req = context.switchToHttp().getRequest()
    const token = req?.headers?.authorization?.replace('Bearer ', '')
    if (token) {
      try {
        const data = await jwt.decode(token)
        req.user = data;
      } catch (error) {
        console.log(error);
      }
    }
    return next.handle()
  }
}