import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";

export const User = createParamDecorator((data, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest()
  return req.user;
})

// add new decorator to inject roles to metadatas
export const AccountRoles = ( role: string = null ) => SetMetadata('role', role)