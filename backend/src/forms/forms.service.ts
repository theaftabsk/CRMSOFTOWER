import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    const forms = await this.prisma.webForm.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    return forms.map((f) => {
      const views = f.views_count || 0;
      const starts = f.starts_count || 0;
      const submissions = f.submissions_count || f._count.submissions || 0;
      const conversionRate = views > 0 ? Number(((submissions / views) * 100).toFixed(2)) : 0;
      return {
        ...f,
        conversion_rate: conversionRate,
      };
    });
  }

  async findOne(orgId: string, id: string) {
    const form = await this.prisma.webForm.findFirst({
      where: { id, organization_id: orgId },
      include: {
        submissions: {
          take: 100,
          orderBy: { created_at: 'desc' },
        },
      },
    });
    if (!form) throw new NotFoundException('Form not found');

    const views = form.views_count || 0;
    const starts = form.starts_count || 0;
    const submissions = form.submissions_count || form.submissions.length || 0;
    const conversionRate = views > 0 ? Number(((submissions / views) * 100).toFixed(2)) : 0;

    return {
      ...form,
      conversion_rate: conversionRate,
    };
  }

  async create(orgId: string, data: any) {
    const defaultFields = [
      { id: 'fld_name', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Rahul Sharma', mapping: 'Lead.name' },
      { id: 'fld_email', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'e.g. rahul@company.com', mapping: 'Lead.email' },
      { id: 'fld_phone', name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: 'e.g. +91 9876543210', mapping: 'Lead.phone' },
      { id: 'fld_company', name: 'company', label: 'Company / Organization', type: 'text', required: false, placeholder: 'e.g. Acme Corp', mapping: 'Lead.company' },
      { id: 'fld_budget', name: 'budget', label: 'Estimated Budget', type: 'number', required: false, placeholder: '50000', mapping: 'Lead.expected_value' },
      { id: 'fld_message', name: 'message', label: 'Specific Requirements', type: 'textarea', required: false, placeholder: 'How can our solution help your team?', mapping: 'Lead.notes' },
    ];

    const defaultTheme = {
      preset: 'minimal_monochrome',
      layout: data.layout || 'classic',
      font: 'Inter',
      primary_color: '#111111',
      background_color: '#FFFFFF',
      surface_color: '#F8F8F8',
      border_color: '#E5E5E5',
      radius: '12px',
      button_radius: '8px',
      show_logo: true,
      logo_url: '',
      custom_css: '',
    };

    const defaultSettings = {
      auto_create_lead: true,
      assigned_to: 'Vikram Sales Manager',
      routing_strategy: 'SPECIFIC_REP', // SPECIFIC_REP, ROUND_ROBIN
      default_lead_status: 'New',
      default_lifecycle_stage: 'NEW',
      lead_score_bonus: 20,
      notify_email: 'sales@yourcompany.com',
      send_notification_email: true,
      auto_responder: true,
      auto_responder_subject: 'Thank you for reaching out to us!',
      auto_responder_body: 'We have received your request and our enterprise sales engineer will connect with you shortly.',
      enable_honeypot: true,
      enable_rate_limit: true,
      success_action: 'THANK_YOU', // THANK_YOU, REDIRECT, BOOK_MEETING
    };

    return this.prisma.webForm.create({
      data: {
        organization_id: orgId,
        title: data.title || 'Inbound Lead Capture Form',
        description: data.description || 'Fill out the form below and our team will get in touch.',
        layout: data.layout || 'classic',
        status: 'PUBLISHED',
        version: 1,
        fields: data.fields || defaultFields,
        steps: data.steps || null,
        logic: data.logic || [],
        theme: data.theme || defaultTheme,
        settings: data.settings || defaultSettings,
        submit_btn_text: data.submit_btn_text || 'Submit Inquiry',
        success_message: data.success_message || 'Thank you! Our sales team will get back to you shortly.',
        redirect_url: data.redirect_url || null,
        is_active: true,
      },
    });
  }

  async update(orgId: string, id: string, data: any) {
    await this.findOne(orgId, id);
    return this.prisma.webForm.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        layout: data.layout,
        status: data.status,
        version: data.version ? data.version + 1 : undefined,
        fields: data.fields,
        steps: data.steps,
        logic: data.logic,
        theme: data.theme,
        settings: data.settings,
        submit_btn_text: data.submit_btn_text,
        success_message: data.success_message,
        redirect_url: data.redirect_url,
        is_active: data.is_active,
      },
    });
  }

  async duplicate(orgId: string, id: string) {
    const original = await this.findOne(orgId, id);
    return this.prisma.webForm.create({
      data: {
        organization_id: orgId,
        title: `${original.title} (Copy)`,
        description: original.description,
        layout: original.layout,
        status: 'DRAFT',
        version: 1,
        fields: original.fields as any,
        steps: original.steps as any,
        logic: original.logic as any,
        theme: original.theme as any,
        settings: original.settings as any,
        submit_btn_text: original.submit_btn_text,
        success_message: original.success_message,
        redirect_url: original.redirect_url,
        is_active: true,
      },
    });
  }

  async toggleActive(orgId: string, id: string) {
    const form = await this.findOne(orgId, id);
    return this.prisma.webForm.update({
      where: { id },
      data: { is_active: !form.is_active },
    });
  }

  async delete(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.webForm.delete({ where: { id } });
  }

  async getSubmissions(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.webFormSubmission.findMany({
      where: { form_id: id },
      orderBy: { created_at: 'desc' },
      take: 200,
    });
  }

  async getAnalytics(orgId: string, id: string) {
    const form = await this.findOne(orgId, id);
    const submissions = await this.prisma.webFormSubmission.findMany({
      where: { form_id: id },
      select: {
        id: true,
        utm_source: true,
        utm_campaign: true,
        duration_seconds: true,
        created_at: true,
      },
    });

    const views = form.views_count || 0;
    const starts = form.starts_count || 0;
    const completed = submissions.length;
    const conversionRate = views > 0 ? Number(((completed / views) * 100).toFixed(2)) : 0;
    const startRate = views > 0 ? Number(((starts / views) * 100).toFixed(2)) : 0;
    const completionRate = starts > 0 ? Number(((completed / starts) * 100).toFixed(2)) : 0;

    // UTM Breakdown
    const utmSourceCounts: Record<string, number> = {};
    submissions.forEach((s) => {
      const src = s.utm_source || 'Direct / Organic';
      utmSourceCounts[src] = (utmSourceCounts[src] || 0) + 1;
    });

    // Average duration
    const totalDuration = submissions.reduce((acc, s) => acc + (s.duration_seconds || 45), 0);
    const avgDurationSeconds = submissions.length > 0 ? Math.round(totalDuration / submissions.length) : 45;

    return {
      views,
      starts,
      completed,
      conversionRate,
      startRate,
      completionRate,
      avgDurationSeconds,
      utmSources: utmSourceCounts,
    };
  }
}
