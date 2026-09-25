import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { CreateDealDto } from './dto/create-deal.dto';
import * as crypto from 'crypto';

@Injectable()
export class DealsService {
  constructor(
    private prisma: PrismaService,
    private webhooksService: WebhooksService,
  ) {}

  async findAll(orgId: string, pipeline?: string) {
    const where: any = { organization_id: orgId };
    if (pipeline && pipeline !== 'All') {
      where.pipeline_name = pipeline;
    }
    return this.prisma.deal.findMany({
      where,
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
    const stageProbabilities: Record<string, number> = {
      'Qualification': 20,
      'Value Proposition': 40,
      'Proposal Sent': 60,
      'Negotiation': 80,
      'Closed Won': 100,
      'Closed Lost': 0,
    };

    const probability = dto.probability !== undefined
      ? Number(dto.probability)
      : (stageProbabilities[dto.stage] ?? 50);

    const deal = await this.prisma.deal.create({
      data: {
        organization_id: orgId,
        title: dto.title,
        account_name: dto.account_name,
        account_id: dto.account_id || null,
        stage: dto.stage,
        value: Number(dto.value) || 0,
        closing_date: dto.closing_date,
        owner: dto.owner,
        probability,
        pipeline_name: dto.pipeline_name || 'Standard Enterprise Pipeline',
        lost_reason: dto.lost_reason || null,
        notes: dto.notes || '',
      },
    });

    await this.webhooksService.dispatch(orgId, 'deal.created', deal);
    return deal;
  }

  async updateStage(orgId: string, id: string, stage: string, lostReason?: string) {
    const existing = await this.prisma.deal.findFirst({
      where: { id, organization_id: orgId },
    });
    if (!existing) throw new NotFoundException('Deal not found');

    let probability = existing.probability;
    if (stage === 'Closed Won') {
      probability = 100;
    } else if (stage === 'Closed Lost') {
      probability = 0;
    } else if (stage === 'Qualification') {
      probability = 20;
    } else if (stage === 'Value Proposition') {
      probability = 40;
    } else if (stage === 'Proposal Sent') {
      probability = 60;
    } else if (stage === 'Negotiation') {
      probability = 80;
    }

    const updateData: any = {
      stage,
      probability,
    };

    if (stage === 'Closed Lost' && lostReason) {
      updateData.lost_reason = lostReason;
    } else if (stage !== 'Closed Lost') {
      updateData.lost_reason = null;
    }

    const deal = await this.prisma.deal.update({
      where: { id },
      data: updateData,
    });

    // Create Audit Log for Deal Stage Change
    await this.prisma.auditLog.create({
      data: {
        organization_id: orgId,
        user_name: deal.owner,
        action: 'DEAL_STAGE_CHANGED',
        entity_type: 'Deal',
        entity_id: deal.id,
        previous_value: existing.stage,
        new_value: stage,
        timestamp: new Date().toISOString(),
      },
    });

    // Dispatch webhook events
    if (stage === 'Closed Won') {
      await this.webhooksService.dispatch(orgId, 'deal.won', deal);
    } else if (stage === 'Closed Lost') {
      await this.webhooksService.dispatch(orgId, 'deal.lost', deal);
    } else {
      await this.webhooksService.dispatch(orgId, 'deal.updated', deal);
    }

    return deal;
  }

  async convertToInvoice(orgId: string, id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, organization_id: orgId },
    });
    if (!deal) throw new NotFoundException('Deal not found');

    const issueDate = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 15);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const paymentToken = `pay_token_${crypto.randomBytes(8).toString('hex')}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        organization_id: orgId,
        account_name: deal.account_name,
        account_id: deal.account_id || null,
        invoice_number: invoiceNumber,
        total_amount: deal.value,
        paid_amount: 0,
        due_amount: deal.value,
        status: 'Unpaid',
        issue_date: issueDate,
        due_date: dueDate,
        payment_token: paymentToken,
        items: [
          {
            description: `Sales Deliverable: ${deal.title}`,
            qty: 1,
            unit_price: deal.value,
            total: deal.value,
          },
        ],
      },
    });

    // If deal wasn't closed won, mark it as Closed Won
    if (deal.stage !== 'Closed Won') {
      await this.updateStage(orgId, id, 'Closed Won');
    }

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        organization_id: orgId,
        user_name: deal.owner,
        action: 'DEAL_CONVERTED_TO_INVOICE',
        entity_type: 'Invoice',
        entity_id: invoice.id,
        new_value: `Invoice ${invoiceNumber} created from Deal ${deal.title}`,
        timestamp: new Date().toISOString(),
      },
    });

    await this.webhooksService.dispatch(orgId, 'invoice.created', invoice);

    return {
      success: true,
      message: 'Invoice created successfully',
      invoice,
      payment_url: `/pay/${paymentToken}`,
    };
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
