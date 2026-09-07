import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.saaSPlan.findMany({
      orderBy: { price_per_user_month: 'asc' },
    });
  }

  async getUsage(orgId: string) {
    const [leadsCount, usersCount, contactsCount] = await Promise.all([
      this.prisma.lead.count({ where: { organization_id: orgId } }),
      this.prisma.user.count({ where: { organization_id: orgId } }),
      this.prisma.contact.count({ where: { organization_id: orgId } }),
    ]);

    return {
      currentPlan: 'PROFESSIONAL',
      pricePerUserMonth: 999,
      usersUsed: usersCount,
      usersLimit: 25,
      leadsCount,
      contactsCount,
      storageUsedMb: 1240,
      storageLimitMb: 25000,
      renewalDate: '2026-10-01',
    };
  }
}
