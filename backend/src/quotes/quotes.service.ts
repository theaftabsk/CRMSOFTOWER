import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    let quotes = await this.prisma.quote.findMany({
      where: { organization_id: orgId },
      include: { items: true, account: true },
      orderBy: { created_date: 'desc' },
    });

    if (quotes.length === 0) {
      // Seed enterprise demo quotes if catalog is empty
      try {
        await this.seedDemoQuotes(orgId);
        quotes = await this.prisma.quote.findMany({
          where: { organization_id: orgId },
          include: { items: true, account: true },
          orderBy: { created_date: 'desc' },
        });
      } catch (err) {
        console.warn('Failed to seed demo quotes:', err);
      }
    }

    return quotes;
  }

  async getStats(orgId: string) {
    const quotes = await this.prisma.quote.findMany({
      where: { organization_id: orgId },
      include: { items: true },
    });

    const totalCount = quotes.length;
    let totalValue = 0;
    let acceptedValue = 0;
    let sentValue = 0;
    let draftValue = 0;
    let acceptedCount = 0;
    let sentCount = 0;
    let draftCount = 0;
    let rejectedCount = 0;

    for (const q of quotes) {
      const val = q.total || 0;
      totalValue += val;
      if (q.status === 'Accepted') {
        acceptedValue += val;
        acceptedCount++;
      } else if (q.status === 'Sent') {
        sentValue += val;
        sentCount++;
      } else if (q.status === 'Draft') {
        draftValue += val;
        draftCount++;
      } else if (q.status === 'Rejected') {
        rejectedCount++;
      }
    }

    const avgValue = totalCount > 0 ? Math.round(totalValue / totalCount) : 0;
    const winRatePercent = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      totalValue,
      acceptedCount,
      acceptedValue,
      sentCount,
      sentValue,
      draftCount,
      draftValue,
      rejectedCount,
      avgValue,
      winRatePercent,
    };
  }

  async findOne(orgId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, organization_id: orgId },
      include: { items: true, account: true },
    });
    if (!quote) {
      throw new NotFoundException(`Quote ${id} not found`);
    }
    return quote;
  }

  async create(orgId: string, data: any) {
    const quoteNumber = data.quote_number || `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = Array.isArray(data.items)
      ? data.items.map((it: any) => ({
          product_name: it.product_name || 'Standard Service',
          qty: Number(it.qty) || 1,
          unit_price: Number(it.unit_price) || 0,
          total: Number(it.total) || (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
        }))
      : [];

    let subtotal = Number(data.subtotal);
    if (!subtotal && items.length > 0) {
      subtotal = items.reduce((sum: number, it: any) => sum + it.total, 0);
    }
    subtotal = subtotal || 0;

    const tax = Number(data.tax) || Math.round(subtotal * 0.18);
    const total = Number(data.total) || (subtotal + tax);

    return this.prisma.quote.create({
      data: {
        organization_id: orgId,
        quote_number: quoteNumber,
        account_name: data.account_name || 'Unnamed Client',
        account_id: data.account_id || null,
        subtotal,
        tax,
        total,
        status: data.status || 'Draft',
        items: items.length > 0 ? { create: items } : undefined,
      },
      include: { items: true, account: true },
    });
  }

  async update(orgId: string, id: string, data: any) {
    await this.findOne(orgId, id);

    const updatePayload: any = {
      ...(data.quote_number && { quote_number: data.quote_number }),
      ...(data.account_name && { account_name: data.account_name }),
      ...(data.account_id !== undefined && { account_id: data.account_id }),
      ...(data.subtotal !== undefined && { subtotal: Number(data.subtotal) }),
      ...(data.tax !== undefined && { tax: Number(data.tax) }),
      ...(data.total !== undefined && { total: Number(data.total) }),
      ...(data.status && { status: data.status }),
    };

    if (Array.isArray(data.items)) {
      // Re-link items cleanly
      await this.prisma.quoteItem.deleteMany({ where: { quote_id: id } });
      updatePayload.items = {
        create: data.items.map((it: any) => ({
          product_name: it.product_name || 'Item',
          qty: Number(it.qty) || 1,
          unit_price: Number(it.unit_price) || 0,
          total: Number(it.total) || (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
        })),
      };
    }

    return this.prisma.quote.update({
      where: { id },
      data: updatePayload,
      include: { items: true, account: true },
    });
  }

  async updateStatus(orgId: string, id: string, status: string) {
    await this.findOne(orgId, id);
    return this.prisma.quote.update({
      where: { id },
      data: { status },
      include: { items: true, account: true },
    });
  }

  async convertToOrder(orgId: string, id: string) {
    const quote = await this.findOne(orgId, id);

    const orderNumber = `ORD-${quote.quote_number.replace(/^QT-?/, '') || Math.floor(1000 + Math.random() * 9000)}`;

    const order = await this.prisma.order.create({
      data: {
        organization_id: orgId,
        order_number: orderNumber,
        account_name: quote.account_name,
        account_id: quote.account_id,
        total_amount: quote.total,
        status: 'Confirmed',
        items: {
          create: quote.items.map((it) => ({
            product_name: it.product_name,
            qty: it.qty,
            unit_price: it.unit_price,
            total: it.total,
          })),
        },
      },
      include: { items: true },
    });

    // Mark quote as Accepted
    await this.prisma.quote.update({
      where: { id },
      data: { status: 'Accepted' },
    });

    return {
      success: true,
      message: 'Quote converted to Order successfully',
      order,
    };
  }

  async delete(orgId: string, id: string) {
    await this.findOne(orgId, id);
    await this.prisma.quote.delete({
      where: { id },
    });
    return { success: true, message: `Quote ${id} deleted successfully` };
  }

  private async seedDemoQuotes(orgId: string) {
    const sampleQuotes = [
      {
        quote_number: 'QT-2026-8801',
        account_name: 'Apex Health Systems',
        subtotal: 125000,
        tax: 22500,
        total: 147500,
        status: 'Sent',
        items: [
          { product_name: 'Custom SaaS Portal Development', qty: 2, unit_price: 50000, total: 100000 },
          { product_name: 'Annual Cloud SLA & Maintenance', qty: 1, unit_price: 25000, total: 25000 },
        ],
      },
      {
        quote_number: 'QT-2026-8802',
        account_name: 'Tata Digital Enterprise',
        subtotal: 225000,
        tax: 40500,
        total: 265500,
        status: 'Accepted',
        items: [
          { product_name: 'Enterprise Multi-Tenant Cloud ERP', qty: 3, unit_price: 75000, total: 225000 },
        ],
      },
      {
        quote_number: 'QT-2026-8803',
        account_name: 'Infosys Cloud Ops',
        subtotal: 35000,
        tax: 6300,
        total: 41300,
        status: 'Draft',
        items: [
          { product_name: 'Developer Webhooks & API Gateway Access', qty: 1, unit_price: 35000, total: 35000 },
        ],
      },
      {
        quote_number: 'QT-2026-8804',
        account_name: 'Reliance Retail Logistics',
        subtotal: 80000,
        tax: 14400,
        total: 94400,
        status: 'Sent',
        items: [
          { product_name: 'Supply Chain RFID Integration Tier', qty: 2, unit_price: 40000, total: 80000 },
        ],
      },
    ];

    for (const q of sampleQuotes) {
      await this.prisma.quote.create({
        data: {
          organization_id: orgId,
          quote_number: q.quote_number,
          account_name: q.account_name,
          subtotal: q.subtotal,
          tax: q.tax,
          total: q.total,
          status: q.status,
          items: {
            create: q.items,
          },
        },
      });
    }
  }
}
