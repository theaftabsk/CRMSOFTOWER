import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { ExternalLeadDto } from './dto/external-lead.dto';
import * as crypto from 'crypto';

interface SsoTicketData {
  orgId: string;
  email: string;
  name: string;
  externalUserId: string;
  redirectPath: string;
  createdAt: number;
}

// In-memory store for single-use SSO tickets with 5 minute expiration
const ssoTicketStore = new Map<string, SsoTicketData>();

@Injectable()
export class ExternalApiService {
  constructor(
    private prisma: PrismaService,
    private webhooksService: WebhooksService,
  ) {}

  async verifyAuth(orgId: string, apiKeyMeta: any) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        currency: true,
        timezone: true,
        logo_url: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Associated organization not found');
    }

    return {
      authenticated: true,
      status: 'connected',
      organization: org,
      key_info: {
        id: apiKeyMeta.id,
        name: apiKeyMeta.name,
        prefix: apiKeyMeta.prefix,
        authorized_scopes: apiKeyMeta.scopes,
      },
      capabilities: {
        lead_ingestion: apiKeyMeta.scopes.includes('leads:write'),
        lead_reading: apiKeyMeta.scopes.includes('leads:read'),
        deal_management: apiKeyMeta.scopes.includes('deals:write'),
        invoice_generation: apiKeyMeta.scopes.includes('invoices:write'),
        single_sign_on: apiKeyMeta.scopes.includes('auth:sso') || apiKeyMeta.scopes.includes('leads:write'),
      },
      endpoints: {
        lead_ingest: 'POST /api/v1/external/leads',
        leads_list: 'GET /api/v1/external/leads',
        deals_create: 'POST /api/v1/external/deals',
        invoices_create: 'POST /api/v1/external/invoices',
        sso_token: 'POST /api/v1/external/auth/sso-token',
        stats: 'GET /api/v1/external/stats',
      },
      timestamp: new Date().toISOString(),
    };
  }

  async createLead(orgId: string, dto: ExternalLeadDto, apiKeyName?: string) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const phoneTrimmed = dto.phone.trim();
    const leadSource = dto.source?.trim() || `Website Inquiry (${apiKeyName || 'External API'})`;

    // Format comprehensive notes combining inquiry message, interest, and marketing UTMs
    const noteFragments: string[] = [];
    if (dto.message) {
      noteFragments.push(`[Website Inquiry Message]:\n${dto.message.trim()}`);
    }
    if (dto.service_interest) {
      noteFragments.push(`[Service / Product Interest]: ${dto.service_interest.trim()}`);
    }
    if (dto.website_url) {
      noteFragments.push(`[Submitted From Page]: ${dto.website_url.trim()}`);
    }
    if (dto.referrer) {
      noteFragments.push(`[Referrer URL]: ${dto.referrer.trim()}`);
    }
    if (dto.utm_source || dto.utm_medium || dto.utm_campaign) {
      noteFragments.push(
        `[Marketing Attribution]: utm_source=${dto.utm_source || 'direct'}, utm_medium=${dto.utm_medium || 'none'}, utm_campaign=${dto.utm_campaign || 'none'}`
      );
    }
    if (dto.notes) {
      noteFragments.push(`[Additional Notes]: ${dto.notes.trim()}`);
    }

    const compiledNotes = noteFragments.length > 0 
      ? noteFragments.join('\n\n') 
      : `Lead submitted via Developer API (${apiKeyName || 'External'}) on ${new Date().toLocaleString('en-IN')}`;

    // 1. Deduplication check: Lead with this email or phone in the same organization
    const existing = await this.prisma.lead.findFirst({
      where: {
        organization_id: orgId,
        OR: [{ email: normalizedEmail }, { phone: phoneTrimmed }],
      },
    });

    if (existing) {
      // Append new inquiry note to existing lead history
      const updatedNotes = `${existing.notes || ''}\n\n--- [New Website Enquiry Received: ${new Date().toLocaleDateString('en-GB')}] ---\n${compiledNotes}`;
      
      const updated = await this.prisma.lead.update({
        where: { id: existing.id },
        data: {
          notes: updatedNotes,
          expected_value: dto.expected_value 
            ? Math.max(existing.expected_value, dto.expected_value) 
            : existing.expected_value,
        },
      });

      // Record lead activity trail
      try {
        await this.prisma.leadActivity.create({
          data: {
            organization_id: orgId,
            lead_id: existing.id,
            type: 'NOTE',
            title: 'Website Enquiry Received',
            description: `Repeated inquiry received via ${leadSource}. Message: ${dto.message || 'Updated inquiry submission'}`,
            source: 'API',
            direction: 'INBOUND',
          },
        });
      } catch {}

      // Dispatch webhook
      this.webhooksService.dispatch(orgId, 'lead.updated', {
        lead_id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        source: existing.source,
        action: 'enquiry_appended',
        timestamp: new Date().toISOString(),
      });

      return {
        action: 'deduplicated_updated',
        lead: updated,
        notice: 'Existing lead found in CRM; new website enquiry appended to activity history.',
      };
    }

    // 2. Create new Lead
    const newLead = await this.prisma.lead.create({
      data: {
        organization_id: orgId,
        name: dto.name.trim(),
        company: dto.company?.trim() || 'Website Visitor',
        email: normalizedEmail,
        phone: phoneTrimmed,
        source: leadSource,
        status: 'New',
        assigned_to: 'USR001',
        expected_value: dto.expected_value || 0,
        notes: compiledNotes,
        utm_source: dto.utm_source || null,
        utm_medium: dto.utm_medium || null,
        utm_campaign: dto.utm_campaign || null,
        landing_page: dto.website_url || null,
        referrer_url: dto.referrer || null,
      },
    });

    // 3. Create initial lead activity
    try {
      await this.prisma.leadActivity.create({
        data: {
          organization_id: orgId,
          lead_id: newLead.id,
          type: 'NOTE',
          title: 'Lead Ingestion',
          description: `Captured from ${leadSource}. Website: ${dto.website_url || 'Direct Form'}`,
          source: 'API',
          direction: 'INBOUND',
        },
      });
    } catch {}

    // 4. Dispatch 'lead.created' webhook
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
      notice: 'New lead successfully ingested into CRM pipeline.',
    };
  }

  async getLeads(orgId: string, limit = 50, offset = 0, sourceFilter?: string) {
    const where: any = { organization_id: orgId };
    if (sourceFilter) {
      where.source = { contains: sourceFilter, mode: 'insensitive' };
    }

    return this.prisma.lead.findMany({
      where,
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

  // --- Partner Single Sign-On (SSO) & User Handshake ---
  async generateSsoToken(
    orgId: string,
    apiKeyMeta: any,
    payload: {
      external_user_id: string;
      email: string;
      name?: string;
      redirect_path?: string;
    }
  ) {
    if (!payload.email) {
      throw new ConflictException('User email is required to issue SSO session');
    }

    const randomTicket = `sso_ticket_${crypto.randomBytes(24).toString('hex')}`;
    const ttlMs = 5 * 60 * 1000; // 5 minutes

    ssoTicketStore.set(randomTicket, {
      orgId,
      email: payload.email.trim().toLowerCase(),
      name: payload.name?.trim() || 'Partner User',
      externalUserId: payload.external_user_id || 'ext_user',
      redirectPath: payload.redirect_path || '/dashboard',
      createdAt: Date.now(),
    });

    // Cleanup expired tickets after 5 minutes
    setTimeout(() => {
      ssoTicketStore.delete(randomTicket);
    }, ttlMs);

    return {
      success: true,
      ticket: randomTicket,
      sso_redirect_url: `http://localhost:3000/api/auth/sso?ticket=${randomTicket}`,
      expires_in_seconds: 300,
      partner_app: apiKeyMeta.name,
      target_user: payload.email,
    };
  }

  async redeemSsoTicket(ticket: string) {
    const data = ssoTicketStore.get(ticket);
    if (!data) {
      throw new UnauthorizedException('Invalid or expired SSO ticket');
    }

    // Check 5-minute TTL
    if (Date.now() - data.createdAt > 5 * 60 * 1000) {
      ssoTicketStore.delete(ticket);
      throw new UnauthorizedException('SSO ticket has expired. Please initiate new handshake.');
    }

    // Single-use: delete immediately
    ssoTicketStore.delete(ticket);

    // Find or create the user in the target organization
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { organization: true },
    });

    if (!user) {
      // Auto-provision partner user in the organization
      user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          organization_id: data.orgId,
          role: 'Manager',
          department: 'Partner Integration',
          status: 'Active',
        },
        include: { organization: true },
      });
    }

    const accessToken = `crm_token_${user.id}_${Date.now()}`;

    return {
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organizationId: user.organization_id,
        organizationName: user.organization?.name || 'ABC Technologies',
      },
      redirectPath: data.redirectPath,
    };
  }

  // --- Developer Dashboard Analytics & Stats ---
  async getStats(orgId: string) {
    const [totalLeads, totalDeals, totalInvoices, apiKeysCount, webhooksCount, recentLeads] = await Promise.all([
      this.prisma.lead.count({ where: { organization_id: orgId } }),
      this.prisma.deal.count({ where: { organization_id: orgId } }),
      this.prisma.invoice.count({ where: { organization_id: orgId } }),
      this.prisma.apiKey.count({ where: { organization_id: orgId, is_revoked: false } }),
      this.prisma.webhook.count({ where: { organization_id: orgId, is_active: true } }),
      this.prisma.lead.findMany({
        where: { organization_id: orgId },
        take: 5,
        orderBy: { created_date: 'desc' },
        select: {
          id: true,
          name: true,
          company: true,
          source: true,
          status: true,
          created_date: true,
        },
      }),
    ]);

    return {
      total_leads: totalLeads,
      total_deals: totalDeals,
      total_invoices: totalInvoices,
      active_api_keys: apiKeysCount,
      active_webhooks: webhooksCount,
      recent_leads: recentLeads,
    };
  }
}

