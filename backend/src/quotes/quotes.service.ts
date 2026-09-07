import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.quote.findMany({
      where: { organization_id: orgId },
      include: { items: true, account: true },
      orderBy: { created_date: 'desc' },
    });
  }

  async create(orgId: string, data: any) {
    return this.prisma.quote.create({
      data: {
        organization_id: orgId,
        quote_number: data.quote_number || `QT-${Date.now().toString().slice(-4)}`,
        account_name: data.account_name,
        account_id: data.account_id || null,
        subtotal: Number(data.subtotal) || 0,
        tax: Number(data.tax) || 0,
        total: Number(data.total) || 0,
        status: data.status || 'Draft',
      },
    });
  }
}
