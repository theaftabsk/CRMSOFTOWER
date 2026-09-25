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

  async getStats(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { organization_id: orgId },
      include: { payments: true },
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const totalCount = invoices.length;
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;
    let overdueCount = 0;

    for (const inv of invoices) {
      const tot = inv.total_amount || 0;
      const paid = inv.paid_amount || 0;
      const due = inv.due_amount || 0;

      totalInvoiced += tot;
      totalCollected += paid;
      totalOutstanding += due;

      if (inv.status === 'Paid' || due <= 0) {
        paidCount++;
      } else if (inv.status === 'Partial') {
        partialCount++;
        if (inv.due_date && inv.due_date < todayStr) {
          overdueCount++;
        }
      } else {
        unpaidCount++;
        if (inv.due_date && inv.due_date < todayStr) {
          overdueCount++;
        }
      }
    }

    const collectionRatePercent = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

    return {
      totalCount,
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      paidCount,
      partialCount,
      unpaidCount,
      overdueCount,
      collectionRatePercent,
    };
  }

  async findOne(orgId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organization_id: orgId },
      include: { payments: true, account: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }

  async create(orgId: string, data: any) {
    const invoiceNumber = data.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = Number(data.total_amount) || 0;
    const paid = Number(data.paid_amount) || 0;
    const due = Math.max(0, total - paid);
    const status = due <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
    const paymentToken = `pay_token_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString().slice(-4)}`;

    return this.prisma.invoice.create({
      data: {
        organization_id: orgId,
        invoice_number: invoiceNumber,
        account_name: data.account_name || 'Customer Account',
        account_id: data.account_id || null,
        total_amount: total,
        paid_amount: paid,
        due_amount: due,
        status: data.status || status,
        issue_date: data.issue_date || new Date().toISOString().split('T')[0],
        due_date: data.due_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        payment_token: paymentToken,
        items: data.items || [],
      },
      include: { payments: true, account: true },
    });
  }

  async update(orgId: string, id: string, data: any) {
    const existing = await this.findOne(orgId, id);

    const total = data.total_amount !== undefined ? Number(data.total_amount) : existing.total_amount;
    const paid = data.paid_amount !== undefined ? Number(data.paid_amount) : existing.paid_amount;
    const due = Math.max(0, total - paid);
    const status = data.status || (due <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid');

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...(data.invoice_number && { invoice_number: data.invoice_number }),
        ...(data.account_name && { account_name: data.account_name }),
        ...(data.account_id !== undefined && { account_id: data.account_id }),
        total_amount: total,
        paid_amount: paid,
        due_amount: due,
        status,
        ...(data.issue_date && { issue_date: data.issue_date }),
        ...(data.due_date && { due_date: data.due_date }),
        ...(data.items && { items: data.items }),
      },
      include: { payments: true, account: true },
    });
  }

  async updateStatus(orgId: string, id: string, status: string) {
    await this.findOne(orgId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: { status },
      include: { payments: true, account: true },
    });
  }

  async recordPayment(orgId: string, id: string, paymentData: any) {
    const invoice = await this.findOne(orgId, id);
    const amount = Number(paymentData.amount) || 0;
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    const newPaid = (invoice.paid_amount || 0) + amount;
    const newDue = Math.max(0, (invoice.total_amount || 0) - newPaid);
    const newStatus = newDue <= 0 ? 'Paid' : 'Partial';

    const paymentNumber = `PAY-${Date.now().toString().slice(-6)}`;
    const paymentDate = paymentData.payment_date || new Date().toISOString().split('T')[0];

    // Create payment and update invoice in transaction
    const [payment, updatedInvoice] = await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          invoice_id: id,
          payment_number: paymentNumber,
          amount,
          payment_date: paymentDate,
          method: paymentData.method || 'UPI',
          notes: paymentData.notes || '',
        },
      }),
      this.prisma.invoice.update({
        where: { id },
        data: {
          paid_amount: newPaid,
          due_amount: newDue,
          status: newStatus,
        },
        include: { payments: true, account: true },
      }),
    ]);

    return {
      success: true,
      payment,
      invoice: updatedInvoice,
    };
  }

  async delete(orgId: string, id: string) {
    await this.findOne(orgId, id);
    await this.prisma.invoice.delete({
      where: { id },
    });
    return { success: true, message: `Invoice ${id} deleted successfully` };
  }
}
