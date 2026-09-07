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

  async create(orgId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        organization_id: orgId,
        name: dto.name,
        industry: dto.industry,
        website: dto.website || '',
        annual_revenue: Number(dto.annual_revenue) || 0,
        employee_count: Number(dto.employee_count) || 0,
        billing_address: dto.billing_address || '',
      },
    });
  }

  async update(orgId: string, id: string, data: any) {
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.account.delete({
      where: { id },
    });
  }
}
