import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string = 'ORG001') {
    return this.prisma.account.findMany({
      where: { organization_id: orgId },
      include: {
        contacts: true,
        deals: true,
      },
      orderBy: { created_date: 'desc' },
    });
  }

  async create(data: any, orgId: string = 'ORG001') {
    return this.prisma.account.create({
      data: {
        organization_id: orgId,
        name: data.name,
        industry: data.industry || 'Enterprise Technology',
        website: data.website || '',
        annual_revenue: Number(data.annual_revenue) || 0,
        employee_count: Number(data.employee_count) || 10,
        billing_address: data.billing_address || '',
      },
    });
  }
}
