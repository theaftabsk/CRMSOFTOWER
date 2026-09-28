import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  private readonly MASTER_KEY = process.env.SUPERADMIN_SECRET || 'zyvo-superadmin-master-key-2026';

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Allow access via Master SuperAdmin Secret Header
    const secretKey = request.headers['x-superadmin-secret'] || request.headers['x-superadmin-key'];
    if (secretKey && secretKey === this.MASTER_KEY) {
      request.isSuperAdmin = true;
      return true;
    }

    // 2. Allow access via Authenticated User with Admin / SuperAdmin role
    const user = request.user;
    if (user) {
      if (user.role === 'SuperAdmin' || user.role === 'Admin' || user.role === 'Owner') {
        request.isSuperAdmin = true;
        return true;
      }
    }

    // 3. Fallback for internal localhost superadmin port (3001) dev traffic
    const host = request.headers['host'] || '';
    const origin = request.headers['origin'] || '';
    const referer = request.headers['referer'] || '';
    if (origin.includes(':3001') || referer.includes(':3001') || host.includes('localhost') || host.includes('127.0.0.1')) {
      request.isSuperAdmin = true;
      return true;
    }

    throw new UnauthorizedException('Access denied. SuperAdmin master credentials or elevated privileges required.');
  }
}
