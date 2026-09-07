import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.webhook.findMany({
      where: { organization_id: orgId },
      include: { logs: { take: 10, orderBy: { executed_at: 'desc' } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(orgId: string, data: any) {
    return this.prisma.webhook.create({
      data: {
        organization_id: orgId,
        target_url: data.target_url,
        events: data.events || ['lead.created', 'deal.won'],
        secret_token: data.secret_token || `whsec_${Date.now()}`,
      },
    });
  }
}
