import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async getStatus(orgId: string) {
    return [
      { name: 'WhatsApp Business API', status: 'Connected', icon: 'MessageSquare', type: 'Communication' },
      { name: 'Google Calendar Sync', status: 'Active', icon: 'Calendar', type: 'Productivity' },
      { name: 'Razorpay Payment Gateway', status: 'Configured', icon: 'CreditCard', type: 'Payments' },
      { name: 'Email Gateway (SMTP)', status: 'Connected', icon: 'Mail', type: 'Email' },
    ];
  }

  async getApiKeys(orgId: string) {
    return this.prisma.apiKey.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }
}
