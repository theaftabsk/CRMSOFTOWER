import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(orgId: string) {
    return this.prisma.user.findMany({
      where: { organization_id: orgId },
      orderBy: { created_date: 'desc' },
    });
  }

  async create(orgId: string, data: any) {
    return this.prisma.user.create({
      data: {
        ...data,
        organization_id: orgId,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
