import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || {
      id: 'USR001',
      name: 'Aftab Admin',
      email: 'admin@abctechnologies.com',
      role: 'Admin',
      organization_id: 'ORG001',
    };
  },
);
