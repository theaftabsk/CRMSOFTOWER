import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.deal.findMany({
      where: { organization_id: orgId },
      include: { account: true },
      orderBy: { created_date: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, organization_id: orgId },
      include: { account: true },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async create(orgId: string, dto: CreateDealDto) {
    return this.prisma.deal.create({
      data: {
        organization_id: orgId,
        title: dto.title,
        account_name: dto.account_name,
        account_id: dto.account_id || null,
        stage: dto.stage,
        value: Number(dto.value),
        closing_date: dto.closing_date,
        owner: dto.owner,
        probability: dto.probability ? Number(dto.probability) : 50,
      },
    });
  }

  async updateStage(orgId: string, id: string, stage: string) {
    const deal = await this.prisma.deal.update({
      where: { id },
      data: { stage },
    });

    // Create Audit Log for Deal Stage Change
    await this.prisma.auditLog.create({
      data: {
        organization_id: orgId,
        user_name: deal.owner,
        action: 'STAGE_UPDATED',
        entity_type: 'Deal',
        entity_id: deal.id,
        new_value: stage,
        timestamp: new Date().toISOString(),
      },
    });

    return deal;
  }

  async update(orgId: string, id: string, data: any) {
    return this.prisma.deal.update({
      where: { id },
      data,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.deal.delete({
      where: { id },
    });
  }
}
