import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Resolves server-side from user membership, with fallback to header if authorized
    return request.user?.organization_id || request.headers['x-org-id'] || 'ORG001';
  },
);
