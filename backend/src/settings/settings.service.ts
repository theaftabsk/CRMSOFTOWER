import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getOrganization(orgId: string = 'ORG001') {
    return this.prisma.organization.findUnique({
      where: { id: orgId },
    });
  }

  async getCustomFields(orgId: string = 'ORG001') {
    return this.prisma.customField.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async addCustomField(data: any, orgId: string = 'ORG001') {
    const cf = await this.prisma.customField.create({
      data: {
        organization_id: orgId,
        entity_type: data.entity_type,
        field_name: data.field_name,
        field_type: data.field_type || 'Text',
        options: data.options || [],
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organization_id: orgId,
        user_name: 'Admin User',
        action: 'Added Custom Field',
        entity_type: data.entity_type,
        entity_id: cf.id,
        new_value: `${data.field_name} (${data.field_type})`,
        timestamp: new Date().toISOString(),
      },
    });

    return cf;
  }

  async getAuditLogs(orgId: string = 'ORG001') {
    return this.prisma.auditLog.findMany({
      where: { organization_id: orgId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
