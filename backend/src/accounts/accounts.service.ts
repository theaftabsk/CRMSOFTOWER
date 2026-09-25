import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.account.findMany({
      where: { organization_id: orgId },
      include: {
        _count: {
          select: { contacts: true, deals: true, invoices: true },
        },
      },
      orderBy: { created_date: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, organization_id: orgId },
      include: { contacts: true, deals: true, invoices: true },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async getStats(orgId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { organization_id: orgId },
      include: {
        deals: { select: { value: true, stage: true } },
        contacts: { select: { id: true } },
      },
    });

    const totalAccounts = accounts.length;
    const tier1Enterprise = accounts.filter(a => a.tier === 'TIER_1_ENTERPRISE').length;
    const totalRevenue = accounts.reduce((acc, a) => acc + (a.annual_revenue || 0), 0);
    const avgHealthScore = totalAccounts > 0
      ? Math.round(accounts.reduce((acc, a) => acc + (a.health_score || 85), 0) / totalAccounts)
      : 88;
    
    let totalPipelineValue = 0;
    let totalLinkedContacts = 0;

    for (const a of accounts) {
      totalLinkedContacts += a.contacts.length;
      for (const d of a.deals) {
        if (d.stage !== 'Closed Lost') {
          totalPipelineValue += (d.value || 0);
        }
      }
    }

    return {
      totalAccounts,
      tier1Enterprise,
      totalRevenue,
      avgHealthScore,
      totalPipelineValue,
      totalLinkedContacts,
    };
  }

  async create(orgId: string, dto: any) {
    return this.prisma.account.create({
      data: {
        organization_id: orgId,
        name: dto.name,
        industry: dto.industry || 'Technology',
        website: dto.website || '',
        phone: dto.phone || '',
        city: dto.city || 'Mumbai',
        country: dto.country || 'India',
        tier: dto.tier || 'TIER_2_GROWTH',
        type: dto.type || 'CUSTOMER',
        annual_revenue: Number(dto.annual_revenue) || 0,
        employee_count: Number(dto.employee_count) || 0,
        billing_address: dto.billing_address || '',
        owner_name: dto.owner_name || 'Senior Account Executive',
        health_score: Number(dto.health_score) || 88,
        notes: dto.notes || '',
      },
    });
  }

  async update(orgId: string, id: string, data: any) {
    const { id: _, organization_id: __, contacts: ___, deals: ____, invoices: _____, _count: ______, ...updateData } = data;
    if (updateData.annual_revenue !== undefined) {
      updateData.annual_revenue = Number(updateData.annual_revenue) || 0;
    }
    if (updateData.employee_count !== undefined) {
      updateData.employee_count = Number(updateData.employee_count) || 0;
    }
    if (updateData.health_score !== undefined) {
      updateData.health_score = Number(updateData.health_score) || 85;
    }
    return this.prisma.account.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.account.delete({
      where: { id },
    });
  }
}
