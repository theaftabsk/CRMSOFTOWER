import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query?: any) {
    const where: any = { organization_id: orgId };

    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
        { company: { contains: s, mode: 'insensitive' } },
        { designation: { contains: s, mode: 'insensitive' } },
        { city: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (query?.account_id) {
      where.account_id = query.account_id;
    }

    if (query?.buying_role && query.buying_role !== 'ALL') {
      where.buying_role = query.buying_role;
    }

    if (query?.department && query.department !== 'ALL') {
      where.department = query.department;
    }

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    let contacts = await this.prisma.contact.findMany({
      where,
      include: {
        account: {
          select: { id: true, name: true, industry: true, annual_revenue: true },
        },
        deals: {
          select: { id: true, title: true, stage: true, value: true },
        },
        _count: {
          select: { activities: true, deals: true },
        },
      },
      orderBy: { created_date: 'desc' },
    });

    if (contacts.length <= 1 && (!query?.search && !query?.buying_role)) {
      await this.seedSampleContacts(orgId);
      contacts = await this.prisma.contact.findMany({
        where: { organization_id: orgId },
        include: {
          account: {
            select: { id: true, name: true, industry: true, annual_revenue: true },
          },
          deals: {
            select: { id: true, title: true, stage: true, value: true },
          },
          _count: {
            select: { activities: true, deals: true },
          },
        },
        orderBy: { created_date: 'desc' },
      });
    }

    return contacts;
  }

  async getStats(orgId: string) {
    const contacts = await this.prisma.contact.findMany({
      where: { organization_id: orgId },
      include: {
        deals: { select: { value: true } },
      },
    });

    const totalContacts = contacts.length;
    const decisionMakers = contacts.filter(
      (c) => c.buying_role === 'DECISION_MAKER' || c.buying_role === 'ECONOMIC_BUYER',
    ).length;
    const accountsLinked = contacts.filter((c) => c.account_id).length;
    const activeContacts = contacts.filter((c) => c.status === 'Active').length;

    let influencedPipelineValue = 0;
    contacts.forEach((c) => {
      c.deals?.forEach((d) => {
        influencedPipelineValue += Number(d.value || 0);
      });
    });

    return {
      totalContacts,
      decisionMakers,
      accountsLinked,
      activeContacts,
      influencedPipelineValue,
    };
  }

  async findOne(orgId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, organization_id: orgId },
      include: {
        account: {
          include: {
            contacts: {
              where: { id: { not: id } },
              select: { id: true, name: true, designation: true, email: true, phone: true, buying_role: true },
            },
          },
        },
        deals: {
          orderBy: { created_date: 'desc' },
        },
        activities: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async create(orgId: string, dto: any) {
    return this.prisma.contact.create({
      data: {
        organization_id: orgId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        designation: dto.designation || 'Executive',
        city: dto.city || 'Mumbai',
        department: dto.department || 'EXECUTIVE',
        buying_role: dto.buying_role || 'INFLUENCER',
        status: dto.status || 'Active',
        lifecycle_stage: dto.lifecycle_stage || 'CUSTOMER',
        preferred_contact_method: dto.preferred_contact_method || 'EMAIL',
        linkedin_url: dto.linkedin_url || null,
        twitter_url: dto.twitter_url || null,
        account_id: dto.account_id || null,
        notes: dto.notes || null,
        tags: dto.tags || [],
      },
      include: { account: true },
    });
  }

  async update(orgId: string, id: string, data: any) {
    return this.prisma.contact.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        designation: data.designation,
        city: data.city,
        department: data.department,
        buying_role: data.buying_role,
        status: data.status,
        lifecycle_stage: data.lifecycle_stage,
        preferred_contact_method: data.preferred_contact_method,
        linkedin_url: data.linkedin_url,
        twitter_url: data.twitter_url,
        account_id: data.account_id,
        notes: data.notes,
        tags: data.tags,
      },
      include: { account: true },
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.contact.delete({
      where: { id },
    });
  }

  async addActivity(orgId: string, contactId: string, data: any) {
    await this.findOne(orgId, contactId);
    const activity = await this.prisma.contactActivity.create({
      data: {
        organization_id: orgId,
        contact_id: contactId,
        type: data.type || 'NOTE',
        title: data.title || 'General Touchpoint',
        description: data.description || null,
        status: data.status || 'COMPLETED',
        created_by: data.created_by || 'Sales Executive',
      },
    });

    await this.prisma.contact.update({
      where: { id: contactId },
      data: { last_contacted_at: new Date() },
    });

    return activity;
  }

  async getActivities(orgId: string, contactId: string) {
    return this.prisma.contactActivity.findMany({
      where: { organization_id: orgId, contact_id: contactId },
      orderBy: { created_at: 'desc' },
    });
  }

  async deleteActivity(orgId: string, contactId: string, activityId: string) {
    return this.prisma.contactActivity.delete({
      where: { id: activityId },
    });
  }

  async seedSampleContacts(orgId: string) {
    const existingAccounts = await this.prisma.account.findMany({
      where: { organization_id: orgId },
      take: 4,
    });

    const acc1 = existingAccounts[0]?.id;
    const acc2 = existingAccounts[1]?.id;

    const samples = [
      {
        organization_id: orgId,
        account_id: acc1 || null,
        name: 'Vikramaditya Singhania',
        email: 'vikram.singhania@reliance-industries.com',
        phone: '+91 98201 12345',
        designation: 'Chief Technology Officer (CTO)',
        company: 'Reliance Industries Enterprise',
        city: 'Mumbai',
        department: 'EXECUTIVE',
        buying_role: 'DECISION_MAKER',
        status: 'Active',
        lifecycle_stage: 'OPPORTUNITY',
        preferred_contact_method: 'PHONE',
        linkedin_url: 'https://linkedin.com/in/vikram-singhania-enterprise',
        notes: 'Chief stakeholder for Pan-India CRM transformation rollout. Prefers executive briefing slide deck.',
        tags: ['Key Account', 'CXO', 'Decision Maker'],
      },
      {
        organization_id: orgId,
        account_id: acc1 || null,
        name: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@tcs-consultancy.com',
        phone: '+91 97654 32109',
        designation: 'VP of Global Procurement & Licensing',
        company: 'Tata Consultancy Enterprise',
        city: 'Pune',
        department: 'PROCUREMENT',
        buying_role: 'ECONOMIC_BUYER',
        status: 'Active',
        lifecycle_stage: 'CUSTOMER',
        preferred_contact_method: 'EMAIL',
        linkedin_url: 'https://linkedin.com/in/ananya-deshmukh-procurement',
        notes: 'Approves vendor contracts exceeding ₹50,00,000. Annual renewals occur every Q3.',
        tags: ['Procurement', 'Finance Approver'],
      },
      {
        organization_id: orgId,
        account_id: acc2 || null,
        name: 'Rohan Mehra',
        email: 'rohan.mehra@infosys-fintech.com',
        phone: '+91 99112 23344',
        designation: 'Head of Solutions Architecture',
        company: 'Infosys Financial Cloud',
        city: 'Bengaluru',
        department: 'ENGINEERING',
        buying_role: 'CHAMPION',
        status: 'Active',
        lifecycle_stage: 'OPPORTUNITY',
        preferred_contact_method: 'WHATSAPP',
        linkedin_url: 'https://linkedin.com/in/rohan-mehra-arch',
        notes: 'Internal champion testing our API webhooks and high-throughput pipeline integration.',
        tags: ['Technical Champion', 'API Evaluator'],
      },
      {
        organization_id: orgId,
        account_id: acc2 || null,
        name: 'Kavita Iyer',
        email: 'kavita.iyer@hcl-digital.com',
        phone: '+91 98450 67890',
        designation: 'Director of Enterprise Sales Enablement',
        company: 'HCL Technologies',
        city: 'Chennai',
        department: 'SALES',
        buying_role: 'INFLUENCER',
        status: 'Active',
        lifecycle_stage: 'CUSTOMER',
        preferred_contact_method: 'EMAIL',
        linkedin_url: 'https://linkedin.com/in/kavita-iyer-sales',
        notes: 'Requested CRM mobile app and WhatsApp Business API integration for 40 sales reps.',
        tags: ['Sales Operations', 'User Trainer'],
      },
      {
        organization_id: orgId,
        account_id: null,
        name: 'Arjun Nambiar',
        email: 'arjun.nambiar@startup-scale.in',
        phone: '+91 99887 76655',
        designation: 'Managing Director & Founder',
        company: 'Nambiar Logistics Tech',
        city: 'Hyderabad',
        department: 'EXECUTIVE',
        buying_role: 'DECISION_MAKER',
        status: 'Active',
        lifecycle_stage: 'LEAD',
        preferred_contact_method: 'PHONE',
        linkedin_url: 'https://linkedin.com/in/arjun-nambiar-founder',
        notes: 'Inbound lead converted from Contact Sales web form. Looking for rapid 1-week deployment.',
        tags: ['Founder', 'Inbound Lead'],
      },
    ];

    for (const s of samples) {
      const created = await this.prisma.contact.create({
        data: s,
      });

      await this.prisma.contactActivity.create({
        data: {
          organization_id: orgId,
          contact_id: created.id,
          type: 'CALL',
          title: 'Introductory Discovery Call',
          description: `Connected with ${created.name} regarding enterprise tier requirements and account mapping.`,
          status: 'COMPLETED',
          created_by: 'Vikram Sales Manager',
        },
      });
    }
  }
}
