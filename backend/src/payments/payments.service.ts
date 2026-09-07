import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.payment.findMany({
      where: { invoice: { organization_id: orgId } },
      include: { invoice: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async recordPayment(orgId: string, data: { invoiceId: string; amount: number; method: string; notes?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: data.invoiceId, organization_id: orgId },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');

      const payment = await tx.payment.create({
        data: {
          invoice_id: invoice.id,
          payment_number: `PAY-${Date.now().toString().slice(-4)}`,
          amount: Number(data.amount),
          payment_date: new Date().toISOString().split('T')[0],
          method: data.method || 'UPI',
          notes: data.notes || '',
        },
      });

      const newPaid = invoice.paid_amount + Number(data.amount);
      const newDue = Math.max(0, invoice.total_amount - newPaid);
      const newStatus = newDue <= 0 ? 'Paid' : 'Partial';

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paid_amount: newPaid,
          due_amount: newDue,
          status: newStatus,
        },
      });

      return payment;
    });
  }
}
