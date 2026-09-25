import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { ExternalLeadDto } from './dto/external-lead.dto';
import * as crypto from 'crypto';

@Injectable()
export class ExternalApiService {
  constructor(
    private prisma: PrismaService,
    private webhooksService: WebhooksService,
  ) {}

  async verifyAuth(orgId: string, apiKeyMeta: any) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, currency: true, timezone: true },
    });

    return {
      authenticated: true,
      organization: org,
      key_name: apiKeyMeta.name,
      key_prefix: apiKeyMeta.prefix,
      authorized_scopes: apiKeyMeta.scopes,
      timestamp: new Date().toISOString(),
    };
  }

  async createLead(orgId: string, dto: ExternalLeadDto, apiKeyName?: string) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // 1. Deduplication check: Lead with this email or phone in the same organization
    const existing = await this.prisma.lead.findFirst({
      where: {
        organization_id: orgId,
        OR: [{ email: normalizedEmail }, { phone: dto.phone.trim() }],
      },
    });

    if (existing) {
      // Update existing lead notes and return with deduplication flag
      const updated = await this.prisma.lead.update({
        where: { id: existing.id },
        data: {
          notes: `${existing.notes || ''}\n[Partner Sync ${new Date().toLocaleDateString('en-GB')}]: Repeated submission. Notes: ${dto.notes || 'None'}`,
          expected_value: dto.expected_value ? Math.max(existing.expected_value, dto.expected_value) : existing.expected_value,
        },
      });

      return {
        action: 'deduplicated_updated',
        lead: updated,
        notice: 'Lead already existed in organization and was updated rather than duplicated.',
      };
    }

    // 2. Create new Lead
    const newLead = await this.prisma.lead.create({
      data: {
        organization_id: orgId,
        name: dto.name.trim(),
        company: dto.company?.trim() || 'Not Specified',
        email: normalizedEmail,
        phone: dto.phone.trim(),
        source: dto.source?.trim() || `API Partner (${apiKeyName || 'External'})`,
        status: 'New',
        assigned_to: 'USR001',
        expected_value: dto.expected_value || 0,
        notes: dto.notes || `Created via External API on ${new Date().toISOString()}`,
      },
    });

    // 3. Dispatch 'lead.created' webhook with retry
    this.webhooksService.dispatch(orgId, 'lead.created', {
      lead_id: newLead.id,
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      company: newLead.company,
      expected_value: newLead.expected_value,
      source: newLead.source,
      created_at: newLead.created_date,
    });

    return {
      action: 'created',
      lead: newLead,
    };
  }

  async getLeads(orgId: string, limit = 50, offset = 0) {
    return this.prisma.lead.findMany({
      where: { organization_id: orgId },
      take: Math.min(limit, 100),
      skip: offset,
      orderBy: { created_date: 'desc' },
    });
  }

  async createDeal(orgId: string, data: any) {
    const deal = await this.prisma.deal.create({
      data: {
        organization_id: orgId,
        account_id: data.account_id || null,
        title: data.title,
        account_name: data.account_name || 'Standard Account',
        value: data.value || 0,
        stage: data.stage || 'Qualification',
        probability: data.probability || 50,
        closing_date: data.closing_date || new Date().toISOString().split('T')[0],
        owner: data.owner || 'Aftab Admin',
      },
    });

    this.webhooksService.dispatch(orgId, 'deal.created', deal);
    return deal;
  }

  async getDeals(orgId: string, limit = 50) {
    return this.prisma.deal.findMany({
      where: { organization_id: orgId },
      take: Math.min(limit, 100),
      orderBy: { created_date: 'desc' },
    });
  }

  async createInvoice(orgId: string, data: any) {
    // Generate high-entropy cryptographic payment token
    const paymentToken = crypto.randomBytes(24).toString('hex');
    const invoiceNumber = data.invoice_number || `INV-${Date.now().toString().slice(-6)}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        organization_id: orgId,
        account_id: data.account_id || null,
        invoice_number: invoiceNumber,
        account_name: data.account_name,
        total_amount: data.total_amount,
        paid_amount: 0,
        due_amount: data.total_amount,
        status: 'Unpaid',
        issue_date: data.issue_date || new Date().toISOString().split('T')[0],
        due_date: data.due_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        payment_token: paymentToken,
        items: data.items || [],
      },
    });

    this.webhooksService.dispatch(orgId, 'invoice.created', {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      account_name: invoice.account_name,
      total_amount: invoice.total_amount,
      payment_url: `http://localhost:3000/pay/${invoice.payment_token}`,
    });

    return {
      ...invoice,
      public_payment_url: `http://localhost:3000/pay/${invoice.payment_token}`,
    };
  }

  async getInvoices(orgId: string, limit = 50) {
    return this.prisma.invoice.findMany({
      where: { organization_id: orgId },
      take: Math.min(limit, 100),
      orderBy: { invoice_number: 'desc' },
    });
  }
}
