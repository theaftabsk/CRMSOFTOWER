import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string = 'ORG001') {
    return this.prisma.deal.findMany({
      where: { organization_id: orgId },
      orderBy: { created_date: 'desc' },
    });
  }

  async create(data: any, orgId: string = 'ORG001') {
    return this.prisma.deal.create({
      data: {
        organization_id: orgId,
        account_id: data.account_id,
        title: data.title,
        account_name: data.account_name,
        stage: data.stage || 'Qualification',
        value: Number(data.value) || 0,
        closing_date: data.closing_date || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
        owner: data.owner || 'Vikram Sales Manager',
        probability: Number(data.probability) || 50,
      },
    });
  }

  async updateStage(dealId: string, stage: string, orgId: string = 'ORG001') {
    const updated = await this.prisma.deal.update({
      where: { id: dealId },
      data: { stage },
    });

    await this.prisma.auditLog.create({
      data: {
        organization_id: orgId,
        user_name: 'Sales Manager',
        action: `Moved Deal Stage to ${stage}`,
        entity_type: 'Deal',
        entity_id: dealId,
        new_value: stage,
        timestamp: new Date().toISOString(),
      },
    });

    return updated;
  }
}
