import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.lead.findMany({
      where: { organization_id: orgId },
      orderBy: { created_date: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, organization_id: orgId },
    });
    if (!lead) throw new NotFoundException(`Lead #${id} not found`);
    return lead;
  }

  async create(orgId: string, dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        organization_id: orgId,
        name: dto.name,
        company: dto.company,
        email: dto.email,
        phone: dto.phone,
        status: dto.status || 'New',
        source: dto.source || 'Website',
        assigned_to: dto.assigned_to || 'Sales Team',
        expected_value: Number(dto.expected_value) || 0,
        notes: dto.notes || '',
      },
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        organization_id: orgId,
        user_name: 'Current User',
        action: 'CREATED',
        entity_type: 'Lead',
        entity_id: lead.id,
        new_value: JSON.stringify({ name: lead.name, company: lead.company }),
        timestamp: new Date().toISOString(),
      },
    });

    return lead;
  }

  async update(orgId: string, id: string, data: any) {
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }

  // Lead Conversion Transaction
  async convert(orgId: string, dto: ConvertLeadDto) {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findFirst({
        where: { id: dto.leadId, organization_id: orgId },
      });
      if (!lead) throw new NotFoundException('Lead not found');

      // 1. Account
      let account = await tx.account.findFirst({
        where: { name: lead.company, organization_id: orgId },
      });
      if (!account) {
        account = await tx.account.create({
          data: {
            organization_id: orgId,
            name: lead.company,
            industry: 'General Enterprise',
            annual_revenue: dto.dealValue * 2,
          },
        });
      }

      // 2. Contact
      const contact = await tx.contact.create({
        data: {
          organization_id: orgId,
          account_id: account.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          status: 'Active',
        },
      });

      // 3. Deal
      const deal = await tx.deal.create({
        data: {
          organization_id: orgId,
          account_id: account.id,
          title: dto.dealTitle,
          account_name: lead.company,
          stage: dto.dealStage || 'Proposal Sent',
          value: Number(dto.dealValue),
          closing_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          owner: lead.assigned_to,
          probability: 70,
        },
      });

      // 4. Mark Lead as Converted
      await tx.lead.update({
        where: { id: lead.id },
        data: { status: 'Converted' },
      });

      return { account, contact, deal };
    });
  }
}
