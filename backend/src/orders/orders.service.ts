import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    let orders = await this.prisma.order.findMany({
      where: { organization_id: orgId },
      include: { items: true, account: true },
      orderBy: { created_date: 'desc' },
    });

    if (orders.length === 0) {
      try {
        await this.seedDemoOrders(orgId);
        orders = await this.prisma.order.findMany({
          where: { organization_id: orgId },
          include: { items: true, account: true },
          orderBy: { created_date: 'desc' },
        });
      } catch (err) {
        console.warn('Failed to seed demo orders:', err);
      }
    }

    return orders;
  }

  async getStats(orgId: string) {
    const orders = await this.prisma.order.findMany({
      where: { organization_id: orgId },
      include: { items: true },
    });

    const totalCount = orders.length;
    let totalRevenue = 0;
    let deliveredRevenue = 0;
    let confirmedRevenue = 0;
    let shippedRevenue = 0;
    let pendingRevenue = 0;
    let deliveredCount = 0;
    let confirmedCount = 0;
    let shippedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    for (const ord of orders) {
      const amt = ord.total_amount || 0;
      totalRevenue += amt;

      switch (ord.status) {
        case 'Delivered':
          deliveredRevenue += amt;
          deliveredCount++;
          break;
        case 'Confirmed':
          confirmedRevenue += amt;
          confirmedCount++;
          break;
        case 'Shipped':
          shippedRevenue += amt;
          shippedCount++;
          break;
        case 'Pending':
          pendingRevenue += amt;
          pendingCount++;
          break;
        case 'Cancelled':
          cancelledCount++;
          break;
        default:
          pendingRevenue += amt;
          pendingCount++;
          break;
      }
    }

    const avgOrderValue = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;
    const activePipeline = confirmedCount + shippedCount;
    const validOrders = totalCount - cancelledCount;
    const fulfillmentRatePercent = validOrders > 0 ? Math.round((deliveredCount / validOrders) * 100) : 0;

    return {
      totalCount,
      totalRevenue,
      deliveredCount,
      deliveredRevenue,
      confirmedCount,
      confirmedRevenue,
      shippedCount,
      shippedRevenue,
      pendingCount,
      pendingRevenue,
      cancelledCount,
      activePipeline,
      avgOrderValue,
      fulfillmentRatePercent,
    };
  }

  async findOne(orgId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organization_id: orgId },
      include: { items: true, account: true },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async create(orgId: string, data: any) {
    const orderNumber = data.order_number || `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = Array.isArray(data.items)
      ? data.items.map((it: any) => ({
          product_name: it.product_name || 'Item Fulfillment',
          qty: Number(it.qty) || 1,
          unit_price: Number(it.unit_price) || 0,
          total: Number(it.total) || (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
        }))
      : [];

    let totalAmount = Number(data.total_amount);
    if (!totalAmount && items.length > 0) {
      totalAmount = items.reduce((sum: number, it: any) => sum + it.total, 0);
    }
    totalAmount = totalAmount || 0;

    return this.prisma.order.create({
      data: {
        organization_id: orgId,
        order_number: orderNumber,
        account_name: data.account_name || 'Customer Account',
        account_id: data.account_id || null,
        total_amount: totalAmount,
        status: data.status || 'Confirmed',
        items: items.length > 0 ? { create: items } : undefined,
      },
      include: { items: true, account: true },
    });
  }

  async update(orgId: string, id: string, data: any) {
    await this.findOne(orgId, id);

    const updatePayload: any = {
      ...(data.order_number && { order_number: data.order_number }),
      ...(data.account_name && { account_name: data.account_name }),
      ...(data.account_id !== undefined && { account_id: data.account_id }),
      ...(data.total_amount !== undefined && { total_amount: Number(data.total_amount) }),
      ...(data.status && { status: data.status }),
    };

    if (Array.isArray(data.items)) {
      await this.prisma.orderItem.deleteMany({ where: { order_id: id } });
      updatePayload.items = {
        create: data.items.map((it: any) => ({
          product_name: it.product_name || 'Item Fulfillment',
          qty: Number(it.qty) || 1,
          unit_price: Number(it.unit_price) || 0,
          total: Number(it.total) || (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
        })),
      };
    }

    return this.prisma.order.update({
      where: { id },
      data: updatePayload,
      include: { items: true, account: true },
    });
  }

  async updateStatus(orgId: string, id: string, status: string) {
    await this.findOne(orgId, id);
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, account: true },
    });
  }

  async convertToInvoice(orgId: string, id: string) {
    const order = await this.findOne(orgId, id);
    const invoiceNumber = `INV-${order.order_number.replace(/^ORD-?/, '') || Math.floor(1000 + Math.random() * 9000)}`;

    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

    const invoice = await this.prisma.invoice.create({
      data: {
        organization_id: orgId,
        invoice_number: invoiceNumber,
        account_name: order.account_name,
        account_id: order.account_id,
        total_amount: order.total_amount,
        paid_amount: 0,
        due_amount: order.total_amount,
        status: 'Unpaid',
        issue_date: issueDate,
        due_date: dueDate,
        items: order.items as any,
      },
    });

    return {
      success: true,
      message: 'Order successfully billed to Invoice',
      invoice,
    };
  }

  async delete(orgId: string, id: string) {
    await this.findOne(orgId, id);
    await this.prisma.order.delete({
      where: { id },
    });
    return { success: true, message: `Order ${id} deleted successfully` };
  }

  private async seedDemoOrders(orgId: string) {
    const demoOrders = [
      {
        order_number: 'ORD-2026-9001',
        account_name: 'Apex Health Systems',
        total_amount: 147500,
        status: 'Delivered',
        items: [
          { product_name: 'Custom SaaS Portal Development', qty: 2, unit_price: 50000, total: 100000 },
          { product_name: 'Annual Cloud SLA & Maintenance', qty: 1, unit_price: 25000, total: 25000 },
          { product_name: 'Integrated GST (18%)', qty: 1, unit_price: 22500, total: 22500 },
        ],
      },
      {
        order_number: 'ORD-2026-9002',
        account_name: 'Tata Digital Enterprise',
        total_amount: 265500,
        status: 'Shipped',
        items: [
          { product_name: 'Enterprise Multi-Tenant Cloud ERP', qty: 3, unit_price: 75000, total: 225000 },
          { product_name: 'Integrated GST (18%)', qty: 1, unit_price: 40500, total: 40500 },
        ],
      },
      {
        order_number: 'ORD-2026-9003',
        account_name: 'Reliance Retail Logistics',
        total_amount: 94400,
        status: 'Confirmed',
        items: [
          { product_name: 'Supply Chain RFID Integration Tier', qty: 2, unit_price: 40000, total: 80000 },
          { product_name: 'Integrated GST (18%)', qty: 1, unit_price: 14400, total: 14400 },
        ],
      },
      {
        order_number: 'ORD-2026-9004',
        account_name: 'Infosys Cloud Ops',
        total_amount: 41300,
        status: 'Pending',
        items: [
          { product_name: 'Developer Webhooks & API Gateway Access', qty: 1, unit_price: 35000, total: 35000 },
          { product_name: 'Integrated GST (18%)', qty: 1, unit_price: 6300, total: 6300 },
        ],
      },
    ];

    for (const o of demoOrders) {
      await this.prisma.order.create({
        data: {
          organization_id: orgId,
          order_number: o.order_number,
          account_name: o.account_name,
          total_amount: o.total_amount,
          status: o.status,
          items: {
            create: o.items,
          },
        },
      });
    }
  }
}
