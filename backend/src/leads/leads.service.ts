import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string = 'ORG001') {
    return this.prisma.lead.findMany({
      where: { organization_id: orgId },
      orderBy: { created_date: 'desc' },
    });
  }

  async create(data: any, orgId: string = 'ORG001') {
    const lead = await this.prisma.lead.create({
      data: {
        organization_id: orgId,
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        status: data.status || 'New',
        source: data.source || 'Website',
        assigned_to: data.assigned_to || 'Unassigned',
        expected_value: Number(data.expected_value) || 0,
        notes: data.notes || '',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organization_id: orgId,
        user_name: 'System / User',
        action: 'Created Lead',
        entity_type: 'Lead',
        entity_id: lead.id,
        new_value: lead.name,
        timestamp: new Date().toISOString(),
      },
    });

    return lead;
  }

  async convertLead(data: { leadId: string; dealTitle: string; dealValue: number; dealStage: string }, orgId: string = 'ORG001') {
    const lead = await this.prisma.lead.findUnique({ where: { id: data.leadId } });
    if (!lead) throw new Error('Lead not found');

    // 1. Update Lead Status
    await this.prisma.lead.update({
      where: { id: data.leadId },
      data: { status: 'Converted' },
    });

    // 2. Create Account
    const account = await this.prisma.account.create({
      data: {
        organization_id: orgId,
        name: lead.company,
        industry: 'General Enterprise',
        annual_revenue: data.dealValue,
      },
    });

    // 3. Create Contact
    const contact = await this.prisma.contact.create({
      data: {
        organization_id: orgId,
        account_id: account.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
      },
    });

    // 4. Create Deal
    const deal = await this.prisma.deal.create({
      data: {
        organization_id: orgId,
        account_id: account.id,
        title: data.dealTitle || `${lead.company} Contract`,
        account_name: lead.company,
        stage: data.dealStage || 'Qualification',
        value: Number(data.dealValue) || lead.expected_value,
        closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        owner: lead.assigned_to,
      },
    });

    return { lead, account, contact, deal };
  }
}
