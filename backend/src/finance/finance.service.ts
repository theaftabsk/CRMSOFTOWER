import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async findProducts() {
    return this.prisma.product.findMany();
  }

  async findQuotes(orgId: string = 'ORG001') {
    return this.prisma.quote.findMany({
      where: { organization_id: orgId },
      include: { items: true },
      orderBy: { created_date: 'desc' },
    });
  }

  async createQuote(data: any, orgId: string = 'ORG001') {
    const quoteNumber = `QT-${Math.floor(1000 + Math.random() * 9000)}`;
    const items = data.items || [];
    let subtotal = 0;
    items.forEach((item: any) => {
      subtotal += (item.unit_price * item.qty);
    });
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    return this.prisma.quote.create({
      data: {
        organization_id: orgId,
        quote_number: quoteNumber,
        account_name: data.account_name || 'Client Corp',
        subtotal,
        tax,
        total,
        status: 'Sent',
        items: {
          create: items.map((i: any) => ({
            product_name: i.product_name,
            qty: i.qty,
            unit_price: i.unit_price,
            total: i.unit_price * i.qty,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findInvoices(orgId: string = 'ORG001') {
    return this.prisma.invoice.findMany({
      where: { organization_id: orgId },
      include: { payments: true },
      orderBy: { issue_date: 'desc' },
    });
  }

  async findPayments() {
    return this.prisma.payment.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async recordPayment(data: { invoiceId: string; amount: number; method: string; notes?: string }, orgId: string = 'ORG001') {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: data.invoiceId } });
    if (!invoice) throw new Error('Invoice not found');

    const paymentNumber = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPaid = invoice.paid_amount + Number(data.amount);
    const newDue = Math.max(0, invoice.total_amount - newPaid);
    const newStatus = newDue === 0 ? 'Paid' : 'Partial';

    const payment = await this.prisma.payment.create({
      data: {
        invoice_id: data.invoiceId,
        payment_number: paymentNumber,
        amount: Number(data.amount),
        payment_date: new Date().toISOString().split('T')[0],
        method: data.method || 'UPI',
        notes: data.notes || '',
      },
    });

    await this.prisma.invoice.update({
      where: { id: data.invoiceId },
      data: {
        paid_amount: newPaid,
        due_amount: newDue,
        status: newStatus,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organization_id: orgId,
        user_name: 'Finance Exec',
        action: 'Recorded Payment',
        entity_type: 'Invoice',
        entity_id: data.invoiceId,
        previous_value: `Paid: ₹${invoice.paid_amount}`,
        new_value: `Paid: ₹${newPaid}`,
        timestamp: new Date().toISOString(),
      },
    });

    return payment;
  }
}
