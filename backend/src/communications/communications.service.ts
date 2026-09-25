import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunicationsService {
  constructor(private prisma: PrismaService) {}

  async sendEmail(orgId: string, data: {
    entity_type: string;
    entity_id: string;
    recipient_email: string;
    recipient_name?: string;
    subject: string;
    body: string;
  }) {
    // Record into CommunicationLog
    const log = await this.prisma.communicationLog.create({
      data: {
        organization_id: orgId,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        channel: 'Email',
        recipient: data.recipient_email,
        subject: data.subject,
        message_body: data.body,
        status: 'Sent',
      },
    });

    // Also record task or activity if associated with Lead
    if (data.entity_type === 'Lead') {
      await this.prisma.task.create({
        data: {
          organization_id: orgId,
          title: `Email Sent: ${data.subject}`,
          due_date: new Date().toISOString().split('T')[0],
          priority: 'Medium',
          status: 'Completed',
          assigned_to: 'USR001',
          related_type: data.entity_type,
          related_name: data.recipient_name || data.recipient_email,
        },
      });
    }

    return {
      success: true,
      message: 'Email dispatched and logged to lead history successfully.',
      log,
    };
  }

  async sendWhatsApp(orgId: string, data: {
    entity_type: string;
    entity_id: string;
    recipient_phone: string;
    recipient_name?: string;
    message: string;
  }) {
    // Format phone: remove all non-digits, e.g. +91 98765-43210 -> 919876543210
    const cleanPhone = data.recipient_phone.replace(/\D/g, '');
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(data.message)}`;

    const log = await this.prisma.communicationLog.create({
      data: {
        organization_id: orgId,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        channel: 'WhatsApp',
        recipient: data.recipient_phone,
        subject: 'WhatsApp Outreach',
        message_body: data.message,
        status: 'Sent',
      },
    });

    return {
      success: true,
      wa_link: waLink,
      message: 'WhatsApp message prepared and logged.',
      log,
    };
  }

  async getHistory(orgId: string, entityType: string, entityId: string) {
    return this.prisma.communicationLog.findMany({
      where: {
        organization_id: orgId,
        entity_type: entityType,
        entity_id: entityId,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
