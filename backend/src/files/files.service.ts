import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async list(orgId: string) {
    return this.prisma.fileRecord.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }
}
