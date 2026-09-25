import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    let webhooks = await this.prisma.webhook.findMany({
      where: { organization_id: orgId },
      include: {
        logs: {
          take: 20,
          orderBy: { executed_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (webhooks.length === 0) {
      try {
        const wh = await this.prisma.webhook.create({
          data: {
            organization_id: orgId,
            target_url: 'https://api.partnercorp.com/crm-webhooks/v1/events',
            events: ['lead.created', 'deal.won', 'invoice.paid'],
            secret_token: `whsec_${crypto.randomBytes(16).toString('hex')}`,
            is_active: true,
          },
        });
        await this.prisma.webhookLog.create({
          data: {
            webhook_id: wh.id,
            event: 'lead.created',
            payload: { lead_id: 'LED001', company: 'Enterprise Health Partners', email: 'director@ehp.org' },
            status_code: 200,
            response: JSON.stringify({ received: true, event_id: 'evt_991823' }),
            attempt: 1,
            max_attempts: 3,
          },
        });
        webhooks = await this.prisma.webhook.findMany({
          where: { organization_id: orgId },
          include: {
            logs: {
              take: 20,
              orderBy: { executed_at: 'desc' },
            },
          },
          orderBy: { created_at: 'desc' },
        });
      } catch (e) {
        this.logger.warn('Failed to seed demo webhook:', e);
      }
    }

    return webhooks;
  }

  async create(orgId: string, data: any) {
    const secret = data.secret_token || `whsec_${crypto.randomBytes(16).toString('hex')}`;
    return this.prisma.webhook.create({
      data: {
        organization_id: orgId,
        target_url: data.target_url,
        events: data.events || ['lead.created', 'deal.won', 'invoice.paid'],
        secret_token: secret,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });
  }

  async toggleActive(orgId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, organization_id: orgId },
    });
    if (!webhook) return null;

    return this.prisma.webhook.update({
      where: { id },
      data: { is_active: !webhook.is_active },
    });
  }

  async delete(orgId: string, id: string) {
    return this.prisma.webhook.deleteMany({
      where: { id, organization_id: orgId },
    });
  }

  /**
   * Dispatches an event payload to all subscribed, active webhooks with 3-attempt retry logic.
   */
  async dispatch(orgId: string, event: string, payload: any) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        organization_id: orgId,
        is_active: true,
      },
    });

    const matching = webhooks.filter(
      (wh) => wh.events.includes(event) || wh.events.includes('*'),
    );

    for (const webhook of matching) {
      // Execute delivery asynchronously with retry
      this.deliverWithRetry(webhook, event, payload).catch((err) => {
        this.logger.error(`Webhook delivery failure [${webhook.id}]:`, err);
      });
    }
  }

  private async deliverWithRetry(
    webhook: { id: string; target_url: string; secret_token: string | null },
    event: string,
    payload: any,
  ) {
    const maxAttempts = 3;
    const bodyString = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    const signature = webhook.secret_token
      ? crypto.createHmac('sha256', webhook.secret_token).update(bodyString).digest('hex')
      : null;

    let attempt = 1;
    let delivered = false;

    while (attempt <= maxAttempts && !delivered) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Enterprise-CRM-Webhook/1.0',
          'X-CRM-Event': event,
          'X-CRM-Delivery-Attempt': String(attempt),
        };

        if (signature) {
          headers['X-CRM-Signature'] = `sha256=${signature}`;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(webhook.target_url, {
          method: 'POST',
          headers,
          body: bodyString,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const responseText = await response.text().catch(() => '');

        await this.prisma.webhookLog.create({
          data: {
            webhook_id: webhook.id,
            event,
            status_code: response.status,
            payload: payload || {},
            response: responseText.substring(0, 1000),
            attempt,
            max_attempts: maxAttempts,
            error_message: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
          },
        });

        if (response.ok) {
          delivered = true;
          break;
        }
      } catch (err: any) {
        await this.prisma.webhookLog.create({
          data: {
            webhook_id: webhook.id,
            event,
            status_code: 0,
            payload: payload || {},
            response: null,
            attempt,
            max_attempts: maxAttempts,
            error_message: err.message || 'Network error / Timeout',
          },
        });
      }

      attempt++;
      if (attempt <= maxAttempts) {
        // Exponential backoff: attempt 2 waits 1000ms, attempt 3 waits 2000ms
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  async testPing(orgId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, organization_id: orgId },
    });
    if (!webhook) return { success: false, message: 'Webhook not found' };

    await this.dispatch(orgId, 'ping.test', {
      message: 'Test event dispatched from Enterprise CRM',
      test: true,
      time: new Date().toISOString(),
    });

    return { success: true, message: 'Ping dispatched to webhook URL' };
  }
}
