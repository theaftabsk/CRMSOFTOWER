import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async list(orgId: string) {
    return this.prisma.role.findMany({
      where: { organization_id: orgId },
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { module: 'asc' },
    });
  }
}
