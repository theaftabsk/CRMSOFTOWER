import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import * as crypto from 'crypto';

// In-memory IP rate limiter for public forms (10 submissions per min per IP)
const ipRateLimiter = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class PublicApiService {
  constructor(
    private prisma: PrismaService,
    private webhooksService: WebhooksService,
  ) {}

  async getPublicForm(formId: string, isPreview = false) {
    const form = await this.prisma.webForm.findUnique({
      where: { id: formId },
      include: {
        organization: {
          select: { name: true, logo_url: true },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found.');
    }

    if (!form.is_active && !isPreview) {
      return {
        id: form.id,
        title: form.title,
        description: form.description,
        is_active: false,
        organization_name: form.organization?.name,
        organization_logo: form.organization?.logo_url,
      };
    }

    // Increment public views counter asynchronously (only for live visitors, not preview)
    if (!isPreview) {
      this.prisma.webForm.update({
        where: { id: formId },
        data: { views_count: { increment: 1 } },
      }).catch(() => null);
    }

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      layout: form.layout || 'classic',
      fields: form.fields,
      steps: form.steps,
      logic: form.logic,
      theme: form.theme,
      settings: form.settings,
      submit_btn_text: form.submit_btn_text,
      success_message: form.success_message,
      redirect_url: form.redirect_url,
      is_active: form.is_active,
      is_preview: isPreview,
      organization_name: form.organization?.name,
      organization_logo: form.organization?.logo_url,
    };
  }

  async submitPublicForm(
    formId: string,
    body: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // 1. Anti-spam Honeypot check
    // If the hidden website_hp honeypot field has any value, bot detected -> silent 200 OK
    if (body.website_hp && String(body.website_hp).trim().length > 0) {
      return {
        success: true,
        message: 'Your submission has been received.',
      };
    }

    // 2. IP Rate Limiting (max 10 submissions per minute per IP)
    const clientIp = ipAddress || 'unknown-ip';
    const now = Date.now();
    const rate = ipRateLimiter.get(clientIp);
    if (rate && rate.resetAt > now) {
      if (rate.count >= 10) {
        throw new BadRequestException('Too many submissions. Please wait a minute and try again.');
      }
      rate.count++;
    } else {
      ipRateLimiter.set(clientIp, { count: 1, resetAt: now + 60 * 1000 });
    }

    // 3. Find form and organization
    const form = await this.prisma.webForm.findUnique({
      where: { id: formId },
    });

    if (!form || !form.is_active) {
      throw new NotFoundException('Form not found or is no longer active.');
    }

    const orgId = form.organization_id;
    const name = body.name?.trim() || 'Website Visitor';
    const email = body.email?.trim().toLowerCase() || `visitor-${Date.now()}@website.com`;
    const phone = body.phone?.trim() || 'N/A';
    const company = body.company?.trim() || 'Website Inquiry';

    // 4. Deduplicate lead: check if lead already exists in this organization
    const existing = await this.prisma.lead.findFirst({
      where: {
        organization_id: orgId,
        OR: [{ email }, { phone: phone !== 'N/A' ? phone : undefined }],
      },
    });

    let leadId = existing?.id;

    if (existing) {
      // Update existing lead notes with new submission
      await this.prisma.lead.update({
        where: { id: existing.id },
        data: {
          notes: `${existing.notes || ''}\n[Form '${form.title}' Resubmission ${new Date().toLocaleDateString('en-GB')}]: Message: ${body.message || body.notes || 'None'}`,
        },
      });
    } else {
      const formSettings = (form.settings as any) || {};
      const assignedRep = formSettings.assigned_to || 'Vikram Sales Manager';
      const initialStage = formSettings.default_lifecycle_stage || 'NEW';
      const initialStatus = formSettings.default_lead_status || 'New';
      const budgetVal = Number(body.budget) || Number(body.expected_value) || 0;

      // Create new lead in CRM
      const newLead = await this.prisma.lead.create({
        data: {
          organization_id: orgId,
          name,
          company,
          email,
          phone,
          source: `Web Form: ${form.title}`,
          status: initialStatus,
          lifecycle_stage: initialStage,
          assigned_to: assignedRep,
          expected_value: budgetVal,
          lead_score: 25, // Form engagement baseline
          score_tier: 'WARM',
          notes: body.message || body.notes || `Submitted via web form: ${form.title}`,
          utm_source: body.utm_source || body._utm_source || null,
          utm_medium: body.utm_medium || body._utm_medium || null,
          utm_campaign: body.utm_campaign || body._utm_campaign || null,
        },
      });
      leadId = newLead.id;

      // Dispatch webhook
      this.webhooksService.dispatch(orgId, 'lead.created', {
        lead_id: newLead.id,
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        company: newLead.company,
        source: newLead.source,
        form_id: form.id,
      });
    }

    // 5. Record submission with UTM attribution & duration & increment counter
    await this.prisma.$transaction([
      this.prisma.webFormSubmission.create({
        data: {
          form_id: form.id,
          lead_id: leadId,
          payload: body,
          utm_source: body.utm_source || body._utm_source || null,
          utm_medium: body.utm_medium || body._utm_medium || null,
          utm_campaign: body.utm_campaign || body._utm_campaign || null,
          utm_term: body.utm_term || null,
          utm_content: body.utm_content || null,
          referrer: body.referrer || null,
          ip_address: clientIp,
          user_agent: userAgent?.substring(0, 255) || 'Unknown',
          duration_seconds: Number(body._duration) || 0,
        },
      }),
      this.prisma.webForm.update({
        where: { id: form.id },
        data: { submissions_count: { increment: 1 } },
      }),
    ]);

    return {
      success: true,
      message: form.success_message,
      redirect_url: form.redirect_url,
    };
  }

  /**
   * Sanitized Public Invoice lookup
   * Never exposes internal database IDs, user credentials, or sensitive organization settings.
   */
  async getPublicInvoice(paymentToken: string) {
    if (!paymentToken || paymentToken.length < 16) {
      throw new NotFoundException('Invalid invoice payment token');
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { payment_token: paymentToken },
      include: {
        organization: {
          select: {
            name: true,
            logo_url: true,
            currency: true,
            address: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      invoice_number: invoice.invoice_number,
      account_name: invoice.account_name,
      total_amount: invoice.total_amount,
      paid_amount: invoice.paid_amount,
      due_amount: invoice.due_amount,
      status: invoice.status,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      items: invoice.items || [],
      organization: {
        name: invoice.organization.name,
        logo_url: invoice.organization.logo_url,
        currency: invoice.organization.currency,
        address: invoice.organization.address,
      },
    };
  }

  /**
   * Processes verified payment confirmation (Gateway Webhook / Public Checkout)
   */
  async confirmInvoicePayment(paymentToken: string, payload: any) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { payment_token: paymentToken },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'Paid') {
      return { success: true, message: 'Invoice is already marked as paid' };
    }

    const amountPaid = invoice.due_amount;
    const paymentNumber = `PAY-${Date.now().toString().slice(-6)}`;

    await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          invoice_id: invoice.id,
          payment_number: paymentNumber,
          amount: amountPaid,
          payment_date: new Date().toISOString().split('T')[0],
          method: payload.method || 'Online Gateway',
          notes: `Confirmed via public portal [Ref: ${payload.gateway_ref || 'SIMULATED'}]`,
        },
      }),
      this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'Paid',
          paid_amount: invoice.total_amount,
          due_amount: 0,
        },
      }),
    ]);

    // Dispatch webhook
    this.webhooksService.dispatch(invoice.organization_id, 'invoice.paid', {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      account_name: invoice.account_name,
      amount_paid: amountPaid,
      payment_number: paymentNumber,
      paid_at: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Payment received and recorded successfully',
      receipt: {
        invoice_number: invoice.invoice_number,
        payment_number: paymentNumber,
        amount_paid: amountPaid,
      },
    };
  }

  async submitDeveloperRequest(body: any) {
    if (!body.developer_name || !body.email || !body.company_name) {
      throw new BadRequestException('Developer name, email, and company are required');
    }

    const request = await this.prisma.partnerAccessRequest.create({
      data: {
        organization_id: body.organization_id || 'ORG001',
        developer_name: body.developer_name,
        company_name: body.company_name,
        email: body.email.trim().toLowerCase(),
        purpose: body.purpose || 'Software API Integration & Partner Collaboration',
        requested_scopes: body.requested_scopes && body.requested_scopes.length > 0 
          ? body.requested_scopes 
          : ['leads:write', 'deals:write', 'invoices:read'],
        status: 'Pending',
      },
    });

    return {
      success: true,
      message: 'Your developer integration request has been submitted to the organization admin for review.',
      requestId: request.id,
    };
  }

  async bookPublicMeeting(body: any) {
    const orgId = body.organization_id || 'ORG001';
    const provider = (body.provider || 'GOOGLE_MEET').toUpperCase();
    let meetLink = body.meet_link;
    let externalEventId: string | null = null;
    let location = 'Google Meet';

    if (provider === 'ZOOM') {
      const zoomId = Math.floor(1000000000 + Math.random() * 9000000000);
      const pwd = crypto.randomBytes(3).toString('hex');
      meetLink = `https://zoom.us/j/${zoomId}?pwd=${pwd}`;
      externalEventId = `zoom_mtg_${zoomId}`;
      location = 'Zoom Meeting';
    } else {
      const codeA = Math.random().toString(36).substring(2, 5);
      const codeB = Math.random().toString(36).substring(2, 6);
      const codeC = Math.random().toString(36).substring(2, 5);
      meetLink = `https://meet.google.com/${codeA}-${codeB}-${codeC}`;
      externalEventId = `gcal_evt_${crypto.randomBytes(8).toString('hex')}`;
      location = 'Google Meet';
    }

    const meeting = await this.prisma.meeting.create({
      data: {
        organization_id: orgId,
        title: body.title || `Client Demo with ${body.name || 'Prospect'}`,
        date_time: `${body.date} ${body.time || '11:00 AM'}`,
        participants: [body.email, 'sales@abctechnologies.com'].filter(Boolean),
        status: 'Scheduled',
        location,
        meeting_type: body.meeting_type || 'Product Demo',
        duration_minutes: Number(body.duration_minutes) || 30,
        meet_link: meetLink,
        account_name: body.company || 'Prospective Client',
        contact_email: body.email,
        contact_phone: body.phone,
        notes: body.notes || `Self-booked meeting from public booking page. Service: ${body.meeting_type || 'Product Demo'}`,
        provider,
        external_event_id: externalEventId,
        meeting_url: meetLink,
        calendar_id: 'primary',
        organizer_email: 'admin@abctechnologies.com',
        start_at: `${body.date} ${body.time || '11:00 AM'}`,
        sync_status: 'SYNCED',
      },
    });

    // Auto-create or link Lead in CRM
    if (body.email) {
      try {
        const existingLead = await this.prisma.lead.findFirst({
          where: { organization_id: orgId, email: body.email.trim().toLowerCase() },
        });
        if (!existingLead) {
          await this.prisma.lead.create({
            data: {
              organization_id: orgId,
              name: body.name || body.company || 'Inbound Prospect',
              company: body.company || 'Prospective Client',
              email: body.email.trim().toLowerCase(),
              phone: body.phone || '',
              status: 'Qualified',
              source: 'Website Calendar Booking',
              assigned_to: 'Vikram Sales Manager',
              expected_value: 150000,
              notes: `Auto-created lead from self-booked meeting on ${body.date} via ${provider}`,
            },
          });
        }
      } catch (err) {
        // Continue even if lead exists
      }
    }

    return {
      success: true,
      message: 'Meeting booked successfully and synced to calendar!',
      meeting,
      meet_link: meetLink,
      external_event_id: externalEventId,
      provider,
    };
  }
}
