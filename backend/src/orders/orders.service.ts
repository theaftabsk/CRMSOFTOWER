import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.order.findMany({
      where: { organization_id: orgId },
      include: { items: true, account: true },
      orderBy: { created_date: 'desc' },
    });
  }

  async create(orgId: string, data: any) {
    return this.prisma.order.create({
      data: {
        organization_id: orgId,
        order_number: data.order_number || `ORD-${Date.now().toString().slice(-4)}`,
        account_name: data.account_name,
        account_id: data.account_id || null,
        total_amount: Number(data.total_amount) || 0,
        status: data.status || 'Pending',
      },
    });
  }
}
