import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.auditLog.findMany({
      where: { organization_id: orgId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}
