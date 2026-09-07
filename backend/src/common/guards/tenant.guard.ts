import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const orgId = request.user?.organization_id || request.headers['x-org-id'];
    if (!orgId) {
      throw new ForbiddenException('Tenant organization context is required');
    }
    return true;
  }
}
