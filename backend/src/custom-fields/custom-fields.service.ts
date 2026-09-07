import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomFieldsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.customField.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(orgId: string, data: any) {
    return this.prisma.customField.create({
      data: {
        organization_id: orgId,
        entity_type: data.entity_type,
        field_name: data.field_name,
        field_type: data.field_type || 'Text',
        options: data.options || [],
      },
    });
  }
}
