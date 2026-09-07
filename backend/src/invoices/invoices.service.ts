import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.invoice.findMany({
      where: { organization_id: orgId },
      include: { payments: true, account: true },
      orderBy: { issue_date: 'desc' },
    });
  }

  async create(orgId: string, data: any) {
    const total = Number(data.total_amount) || 0;
    const paid = Number(data.paid_amount) || 0;
    return this.prisma.invoice.create({
      data: {
        organization_id: orgId,
        invoice_number: data.invoice_number || `INV-${Date.now().toString().slice(-4)}`,
        account_name: data.account_name,
        account_id: data.account_id || null,
        total_amount: total,
        paid_amount: paid,
        due_amount: total - paid,
        status: paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid',
        issue_date: data.issue_date || new Date().toISOString().split('T')[0],
        due_date: data.due_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      },
    });
  }
}
