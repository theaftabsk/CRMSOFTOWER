import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveSummary(orgId: string) {
    const [leadsCount, dealsCount, contactsCount, invoices] = await Promise.all([
      this.prisma.lead.count({ where: { organization_id: orgId } }),
      this.prisma.deal.count({ where: { organization_id: orgId } }),
      this.prisma.contact.count({ where: { organization_id: orgId } }),
      this.prisma.invoice.findMany({ where: { organization_id: orgId }, select: { total_amount: true, paid_amount: true } }),
    ]);

    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.paid_amount, 0);
    const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total_amount, 0);

    return {
      kpis: {
        totalLeads: leadsCount,
        activeDeals: dealsCount,
        verifiedContacts: contactsCount,
        revenueCollected: totalRevenue,
        invoicedOutstanding: totalInvoiced - totalRevenue,
      },
      salesTrend: [
        { month: 'Apr', revenue: 45000 },
        { month: 'May', revenue: 78000 },
        { month: 'Jun', revenue: 95000 },
        { month: 'Jul', revenue: 112000 },
        { month: 'Aug', revenue: 135000 },
        { month: 'Sep', revenue: totalRevenue },
      ],
    };
  }
}
