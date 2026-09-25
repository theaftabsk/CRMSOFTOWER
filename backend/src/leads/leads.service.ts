import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringEngine } from './scoring.engine';
import { DeduplicationService, DuplicateCheckInput, MergeInput } from './deduplication.service';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private deduplicationService: DeduplicationService,
  ) {}

  /**
   * Returns leads with advanced Saved Views filtering and intelligence metrics
   */
  async findAll(orgId: string, query?: { saved_view?: string; owner?: string; status?: string; search?: string }) {
    const whereClause: any = { organization_id: orgId };

    if (query?.status && query.status !== 'ALL') {
      whereClause.status = query.status;
    }

    if (query?.owner) {
      whereClause.assigned_to = query.owner;
    }

    const now = new Date();

    // Saved Views Filter logic (HubSpot Style)
    if (query?.saved_view) {
      const view = query.saved_view.toLowerCase();
      if (view === 'hot') {
        whereClause.lead_score = { gte: 75 };
        whereClause.status = { not: 'Converted' };
      } else if (view === 'stale') {
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        whereClause.OR = [
          { last_activity_at: { lt: fourteenDaysAgo } },
          { last_activity_at: null, created_date: { lt: fourteenDaysAgo } },
        ];
        whereClause.status = { not: 'Converted' };
      } else if (view === 'followup_today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        whereClause.next_follow_up_date = { gte: startOfDay, lte: endOfDay };
      } else if (view === 'unassigned') {
        whereClause.OR = [
          { assigned_to: 'Unassigned' },
          { assigned_to: 'Sales Team' },
          { assigned_to: '' },
        ];
      } else if (view === 'high_value') {
        whereClause.expected_value = { gte: 100000 };
      }
    }

    if (query?.search) {
      const search = query.search.trim().toLowerCase();
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      include: {
        activities: { take: 5, orderBy: { created_at: 'desc' } },
      },
      orderBy: { created_date: 'desc' },
    });

    // Compute real aging and inactivity metrics
    return leads.map(lead => {
      const created = new Date(lead.created_date).getTime();
      const lastActivity = lead.last_activity_at ? new Date(lead.last_activity_at).getTime() : created;
      const ageDays = Math.max(0, Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24)));
      const inactiveDays = Math.max(0, Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24)));

      return {
        ...lead,
        age_days: ageDays,
        inactivity_days: inactiveDays,
        is_stale: inactiveDays >= 14 && lead.status !== 'Converted',
      };
    });
  }

  async findOne(orgId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, organization_id: orgId },
      include: {
        activities: { orderBy: { created_at: 'desc' } },
      },
    });
    if (!lead) throw new NotFoundException(`Lead #${id} not found`);

    const created = new Date(lead.created_date).getTime();
    const lastActivity = lead.last_activity_at ? new Date(lead.last_activity_at).getTime() : created;
    const ageDays = Math.max(0, Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24)));
    const inactiveDays = Math.max(0, Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24)));

    return {
      ...lead,
      age_days: ageDays,
      inactivity_days: inactiveDays,
      is_stale: inactiveDays >= 14 && lead.status !== 'Converted',
    };
  }

  /**
   * Creates a lead with automatic Scoring calculation and Deduplication check
   */
  async create(orgId: string, dto: any) {
    // 1. Calculate dynamic Fit & Initial Score
    const scoreResult = ScoringEngine.calculateScore({
      job_title: dto.job_title,
      budget: dto.budget || dto.expected_value,
      budget_verified: dto.budget_verified || false,
      authority_level: dto.authority_level || 'DECISION_MAKER',
      authority_verified: dto.authority_verified || false,
      industry: dto.industry,
      website: dto.website,
      city: dto.city,
      activities: [],
    });

    const lead = await this.prisma.lead.create({
      data: {
        organization_id: orgId,
        name: dto.name,
        company: dto.company,
        email: dto.email,
        phone: dto.phone,
        job_title: dto.job_title || null,
        industry: dto.industry || null,
        city: dto.city || null,
        state: dto.state || null,
        country: dto.country || null,
        website: dto.website || null,
        linkedin_url: dto.linkedin_url || null,
        status: dto.status || 'New',
        lifecycle_stage: dto.lifecycle_stage || 'NEW',
        activity_status: dto.activity_status || 'NOT_CONTACTED',
        qualification_status: dto.qualification_status || 'UNQUALIFIED',
        fit_score: scoreResult.fit_score,
        engagement_score: scoreResult.engagement_score,
        lead_score: scoreResult.lead_score,
        score_tier: scoreResult.score_tier,
        lead_health: 'GOOD',
        source: dto.source || 'Website',
        first_touch_source: dto.first_touch_source || dto.source || 'Website',
        latest_touch_source: dto.latest_touch_source || dto.source || 'Website',
        assigned_to: dto.assigned_to || 'Sales Team',
        expected_value: Number(dto.expected_value) || 0,
        budget: dto.budget ? Number(dto.budget) : (dto.expected_value ? Number(dto.expected_value) : null),
        budget_verified: !!dto.budget_verified,
        authority_level: dto.authority_level || 'DECISION_MAKER',
        authority_verified: !!dto.authority_verified,
        need: dto.need || null,
        timeline: dto.timeline || '1_3_MONTHS',
        ai_summary: scoreResult.ai_summary,
        next_best_action: scoreResult.next_best_action,
        next_action_priority: scoreResult.next_action_priority,
        notes: dto.notes || '',
        utm_source: dto.utm_source || null,
        utm_medium: dto.utm_medium || null,
        utm_campaign: dto.utm_campaign || null,
        tags: dto.tags || [],
      },
    });

    // Create Initial Lead Activity
    await this.prisma.leadActivity.create({
      data: {
        organization_id: orgId,
        lead_id: lead.id,
        type: 'STAGE_CHANGE',
        title: 'Lead Captured',
        description: `Prospect entered pipeline via ${lead.source}. Initial Lead Score: ${lead.lead_score} (${lead.score_tier}).`,
        source: 'SYSTEM',
        status: 'COMPLETED',
        metadata: { score: lead.lead_score, fit: lead.fit_score },
      },
    });

    return lead;
  }

  async update(orgId: string, id: string, data: any) {
    const existing = await this.prisma.lead.findFirst({
      where: { id, organization_id: orgId },
      include: { activities: true },
    });
    if (!existing) throw new NotFoundException('Lead not found');

    // Recalculate score with updated attributes
    const scoreResult = ScoringEngine.calculateScore({
      job_title: data.job_title !== undefined ? data.job_title : existing.job_title,
      budget: data.budget !== undefined ? data.budget : existing.budget,
      budget_verified: data.budget_verified !== undefined ? data.budget_verified : existing.budget_verified,
      authority_level: data.authority_level !== undefined ? data.authority_level : existing.authority_level,
      authority_verified: data.authority_verified !== undefined ? data.authority_verified : existing.authority_verified,
      industry: data.industry !== undefined ? data.industry : existing.industry,
      website: data.website !== undefined ? data.website : existing.website,
      city: data.city !== undefined ? data.city : existing.city,
      activities: existing.activities,
    });

    return this.prisma.lead.update({
      where: { id },
      data: {
        ...data,
        fit_score: scoreResult.fit_score,
        engagement_score: scoreResult.engagement_score,
        lead_score: scoreResult.lead_score,
        score_tier: scoreResult.score_tier,
        ai_summary: scoreResult.ai_summary,
        next_best_action: scoreResult.next_best_action,
        next_action_priority: scoreResult.next_action_priority,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Logs a multi-channel interaction (Call, WhatsApp, Email, Meeting, Note) and updates engagement score
   */
  async logActivity(orgId: string, leadId: string, dto: {
    type: string;
    title: string;
    description?: string;
    source?: string;
    direction?: string;
    status?: string;
    metadata?: any;
    author?: string;
  }) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, organization_id: orgId },
      include: { activities: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const activity = await this.prisma.leadActivity.create({
      data: {
        organization_id: orgId,
        lead_id: leadId,
        type: dto.type,
        title: dto.title,
        description: dto.description || null,
        source: dto.source || 'MANUAL',
        direction: dto.direction || 'OUTBOUND',
        status: dto.status || 'COMPLETED',
        metadata: dto.metadata || {},
        created_by: dto.author || 'Sales Rep',
      },
    });

    // Add new activity into scoring input
    const allActivities = [...lead.activities, activity];
    const scoreResult = ScoringEngine.calculateScore({
      job_title: lead.job_title,
      budget: lead.budget,
      budget_verified: lead.budget_verified,
      authority_level: lead.authority_level,
      authority_verified: lead.authority_verified,
      industry: lead.industry,
      website: lead.website,
      city: lead.city,
      activities: allActivities,
    });

    // Update activity status based on interaction
    let newActivityStatus = lead.activity_status;
    if (dto.type === 'CALL') {
      newActivityStatus = dto.status === 'CONNECTED' ? 'CONTACTED' : 'ATTEMPTED';
    } else if (dto.type === 'MEETING') {
      newActivityStatus = 'MEETING_SCHEDULED';
    } else if (dto.type === 'WHATSAPP' || dto.type === 'EMAIL') {
      if (lead.activity_status === 'NOT_CONTACTED') newActivityStatus = 'CONTACTED';
    }

    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        last_activity_at: new Date(),
        activity_status: newActivityStatus,
        fit_score: scoreResult.fit_score,
        engagement_score: scoreResult.engagement_score,
        lead_score: scoreResult.lead_score,
        score_tier: scoreResult.score_tier,
        ai_summary: scoreResult.ai_summary,
        next_best_action: scoreResult.next_best_action,
        next_action_priority: scoreResult.next_action_priority,
      },
    });

    return activity;
  }

  /**
   * Enterprise 3-in-1 Conversion Wizard (Salesforce style):
   * Supports:
   * - Account: Create New vs Link Existing vs No Account
   * - Contact: Create New vs Link Existing
   * - Deal: Create Deal vs Don't Create
   * - Preserves lead record and links all historical activities!
   */
  async convertEnterprise(orgId: string, leadId: string, dto: {
    accountMode: 'CREATE_NEW' | 'EXISTING' | 'NONE';
    existingAccountId?: string;
    accountName?: string;
    contactMode: 'CREATE_NEW' | 'EXISTING';
    existingContactId?: string;
    contactName?: string;
    createDeal: boolean;
    dealTitle?: string;
    dealValue?: number;
    pipelineStage?: string;
    expectedCloseDate?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findFirst({
        where: { id: leadId, organization_id: orgId },
        include: { activities: true },
      });
      if (!lead) throw new NotFoundException('Lead not found');

      // 1. Resolve Account
      let accountId: string | null = null;
      let accountName = lead.company;
      if (dto.accountMode === 'EXISTING' && dto.existingAccountId) {
        accountId = dto.existingAccountId;
      } else if (dto.accountMode === 'CREATE_NEW') {
        accountName = dto.accountName || lead.company;
        const newAcc = await tx.account.create({
          data: {
            organization_id: orgId,
            name: accountName,
            industry: lead.industry || 'Enterprise',
            website: lead.website || null,
            billing_address: lead.city || null,
            annual_revenue: (dto.dealValue || lead.expected_value || 50000) * 2,
          },
        });
        accountId = newAcc.id;
      }

      // 2. Resolve Contact
      let contactId: string | null = null;
      if (dto.contactMode === 'EXISTING' && dto.existingContactId) {
        contactId = dto.existingContactId;
      } else if (dto.contactMode === 'CREATE_NEW') {
        const newContact = await tx.contact.create({
          data: {
            organization_id: orgId,
            account_id: accountId,
            name: dto.contactName || lead.name,
            email: lead.email,
            phone: lead.phone,
            designation: lead.job_title || 'Decision Maker',
            company: accountName,
            city: lead.city || null,
            status: 'Active',
          },
        });
        contactId = newContact.id;
      }

      // 3. Resolve Deal (Opportunity)
      let dealId: string | null = null;
      if (dto.createDeal) {
        const dealValue = Number(dto.dealValue) || Number(lead.expected_value) || 50000;
        const newDeal = await tx.deal.create({
          data: {
            organization_id: orgId,
            account_id: accountId,
            title: dto.dealTitle || `${accountName} Opportunity`,
            value: dealValue,
            stage: (dto.pipelineStage as any) || 'Qualification',
            account_name: accountName,
            closing_date: dto.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60000).toISOString().split('T')[0],
            probability: 60,
            owner: lead.assigned_to || 'Sales Team',
          },
        });
        dealId = newDeal.id;
      }

      // 4. Update Lead Record (Never Delete on Conversion)
      const convertedLead = await tx.lead.update({
        where: { id: leadId },
        data: {
          status: 'Converted',
          lifecycle_stage: 'CONVERTED',
          qualification_status: 'OPPORTUNITY_READY',
          converted_at: new Date(),
          converted_account_id: accountId,
          converted_contact_id: contactId,
          converted_deal_id: dealId,
        },
      });

      // 5. Log Conversion Event in Lead Timeline
      await tx.leadActivity.create({
        data: {
          organization_id: orgId,
          lead_id: leadId,
          type: 'STAGE_CHANGE',
          title: 'Lead Successfully Converted',
          description: `Converted to ${accountId ? 'Account (' + accountName + ')' : ''} ${contactId ? '+ Contact' : ''} ${dealId ? '+ Deal (' + (dto.dealTitle || 'Opportunity') + ')' : ''}`,
          source: 'SYSTEM',
          status: 'COMPLETED',
          metadata: {
            converted_at: new Date().toISOString(),
            account_id: accountId,
            contact_id: contactId,
            deal_id: dealId,
          },
        },
      });

      return {
        success: true,
        message: 'Lead converted successfully without data loss!',
        converted_lead: convertedLead,
        account_id: accountId,
        contact_id: contactId,
        deal_id: dealId,
      };
    });
  }

  // Duplicate Check
  async checkDuplicates(orgId: string, input: DuplicateCheckInput) {
    return this.deduplicationService.findDuplicates(orgId, input);
  }

  // Merge Leads
  async mergeLeads(orgId: string, input: MergeInput) {
    return this.deduplicationService.mergeLeads(orgId, input);
  }

  // Delete Lead
  async remove(orgId: string, id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }
}
