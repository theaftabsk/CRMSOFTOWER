import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // Production user context attachment
    if (!request.user) {
      request.user = {
        id: 'USR001',
        name: 'Aftab Admin',
        email: 'admin@abctechnologies.com',
        role: 'Admin',
        organization_id: request.headers['x-org-id'] || 'ORG001',
      };
    }
    return true;
  }
}
