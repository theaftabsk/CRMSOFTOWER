import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CashfreeService } from './cashfree.service';

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private cashfreeService: CashfreeService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultPlans();
  }

  async seedDefaultPlans() {
    const defaultPlans = [
      {
        slug: 'starter',
        name: 'Starter',
        badge: 'Entry Level',
        description: 'Ideal for independent consultants and small sales teams getting started.',
        price_monthly: 399,
        price_yearly: 3828, // ₹319/user/mo billed annually
        currency: '₹',
        trial_days: 14,
        max_users: 5,
        max_leads: 500,
        max_deals: 200,
        max_forms: 2,
        max_storage_mb: 1024, // 1 GB
        has_api_access: false,
        has_webhooks: false,
        has_custom_domain: false,
        has_quotes_invoices: false,
        has_automation: false,
        features: [
          'Basic CRM',
          'Leads & Contacts (500 / user)',
          'Kanban Pipeline',
          'Calendar',
          'Tasks & Follow-ups',
          'Basic Reports',
          '1 GB Storage / user',
        ],
      },
      {
        slug: 'pro',
        name: 'Professional',
        badge: 'Most Popular 🔥',
        description: 'For growing sales teams requiring commercial invoicing, web forms & automation.',
        price_monthly: 699,
        price_yearly: 6708, // ₹559/user/mo billed annually (20% discount)
        currency: '₹',
        trial_days: 0,
        max_users: 25,
        max_leads: 5000,
        max_deals: 2500,
        max_forms: 15,
        max_storage_mb: 5120, // 5 GB
        has_api_access: true,
        has_webhooks: true,
        has_custom_domain: false,
        has_quotes_invoices: true,
        has_automation: true,
        features: [
          'Everything in Starter',
          'Sales Orders',
          'Quotations',
          'GST Invoices',
          'Web Forms',
          'Automation',
          'Advanced Reports',
          'WhatsApp Integration',
          '5,000 Leads / user & 5 GB Storage',
        ],
      },
      {
        slug: 'enterprise',
        name: 'Enterprise Scale',
        badge: 'All-Inclusive Scale',
        description: 'For mid-market & corporate organizations requiring custom workflows and dedicated API access.',
        price_monthly: 1299,
        price_yearly: 12468, // ₹1,039/user/mo billed annually (20% discount)
        currency: '₹',
        trial_days: 0,
        max_users: -1, // Unlimited
        max_leads: -1, // Unlimited
        max_deals: -1, // Unlimited
        max_forms: -1, // Unlimited
        max_storage_mb: 20480, // 20 GB / user
        has_api_access: true,
        has_webhooks: true,
        has_custom_domain: true,
        has_quotes_invoices: true,
        has_automation: true,
        features: [
          'Everything in Professional',
          'Unlimited Leads',
          'Advanced Automation',
          'API Access',
          'Advanced Analytics',
          'Custom Workflows',
          'Priority Support',
          '20 GB Storage / user',
        ],
      },
    ];

    for (const p of defaultPlans) {
      await this.prisma.subscriptionPlan.upsert({
        where: { slug: p.slug },
        update: p,
        create: p,
      });
    }

    // Ensure Default Org (ORG001) has an active starter subscription with 14-day trial
    await this.ensureOrgSubscription('ORG001');
  }

  async ensureOrgSubscription(orgId: string) {
    const existing = await this.prisma.organizationSubscription.findUnique({
      where: { organization_id: orgId },
      include: { plan: true },
    });

    if (existing) return existing;

    const starterPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: 'starter' },
    });

    if (!starterPlan) return null;

    const startDate = new Date();
    const trialEnd = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    return this.prisma.organizationSubscription.create({
      data: {
        organization_id: orgId,
        plan_id: starterPlan.id,
        status: 'TRIALING',
        billing_cycle: 'MONTHLY',
        current_period_start: startDate,
        current_period_end: trialEnd,
        trial_ends_at: trialEnd,
        payment_provider: 'CASHFREE',
      },
      include: { plan: true },
    });
  }

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { is_active: true },
      orderBy: { price_monthly: 'asc' },
    });
  }

  async updatePlan(id: string, updates: any) {
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: updates,
    });
  }

  async getCurrentSubscription(orgId: string) {
    let sub = await this.ensureOrgSubscription(orgId);

    if (!sub) {
      throw new Error('Subscription could not be resolved for organization');
    }

    const [usersCount, leadsCount, formsCount, dealsCount] = await Promise.all([
      this.prisma.user.count({ where: { organization_id: orgId } }),
      this.prisma.lead.count({ where: { organization_id: orgId } }),
      this.prisma.webForm.count({ where: { organization_id: orgId } }),
      this.prisma.deal.count({ where: { organization_id: orgId } }),
    ]);

    const now = new Date();
    let remainingTrialDays = 0;
    let isExpired = false;

    if (sub.status === 'TRIALING' && sub.trial_ends_at) {
      const diffMs = new Date(sub.trial_ends_at).getTime() - now.getTime();
      remainingTrialDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      if (diffMs <= 0) {
        isExpired = true;
        sub = await this.prisma.organizationSubscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
          include: { plan: true },
        });
      }
    } else if (sub.status === 'ACTIVE' && sub.current_period_end) {
      if (now.getTime() > new Date(sub.current_period_end).getTime()) {
        isExpired = true;
      }
    } else if (sub.status === 'EXPIRED') {
      isExpired = true;
    }

    const isLocked = isExpired && sub.status !== 'ACTIVE';

    return {
      subscription: {
        id: sub.id,
        organization_id: sub.organization_id,
        status: sub.status,
        billing_cycle: sub.billing_cycle,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        trial_ends_at: sub.trial_ends_at,
        remaining_trial_days: remainingTrialDays,
        cancel_at_period_end: sub.cancel_at_period_end,
        payment_provider: sub.payment_provider,
      },
      access: {
        isLocked,
        isTrial: sub.status === 'TRIALING',
        isExpired,
        remainingTrialDays,
        allFeaturesUnlocked: !isLocked,
      },
      plan: sub.plan,
      usage: {
        usersUsed: usersCount,
        usersLimit: sub.plan.max_users,
        leadsUsed: leadsCount,
        leadsLimit: sub.plan.max_leads,
        formsUsed: formsCount,
        formsLimit: sub.plan.max_forms,
        dealsUsed: dealsCount,
        dealsLimit: sub.plan.max_deals,
      },
    };
  }

  // --- CASHFREE PAYMENT GATEWAY INTEGRATION ---
  async createCashfreeOrder(
    orgId: string,
    data: {
      planSlug: string;
      billingCycle: 'MONTHLY' | 'YEARLY';
      seats?: number;
      customerEmail?: string;
      customerPhone?: string;
      customerName?: string;
      returnUrl?: string;
    },
  ) {
    const targetPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: data.planSlug },
    });

    if (!targetPlan) {
      throw new Error(`Plan ${data.planSlug} not found`);
    }

    const seats = Math.max(1, data.seats || 1);
    const pricePerUnit =
      data.billingCycle === 'YEARLY'
        ? targetPlan.price_yearly
        : targetPlan.price_monthly;

    const baseAmount = pricePerUnit * seats;
    const taxAmount = Math.round(baseAmount * 0.18); // 18% GST
    const totalAmount = baseAmount + taxAmount;
    const orderId = `zyvo_cf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const cfOrder = await this.cashfreeService.createOrder({
      orderId,
      amount: totalAmount,
      currency: 'INR',
      customer: {
        id: orgId,
        email: data.customerEmail || 'billing@zyvocrm.in',
        phone: data.customerPhone || '9876543210',
        name: data.customerName || 'Zyvo Subscriber',
      },
      returnUrl: data.returnUrl || `http://localhost:3000/billing?cf_order_id={order_id}`,
      note: `Zyvo CRM ${targetPlan.name} Subscription (${seats} seats)`,
    });

    return {
      ...cfOrder,
      plan: targetPlan,
      billing_cycle: data.billingCycle,
      seats,
    };
  }

  async verifyCashfreeOrder(
    orgId: string,
    data: {
      order_id: string;
      planSlug: string;
      billingCycle: 'MONTHLY' | 'YEARLY';
      seats?: number;
    },
  ) {
    const orderDetails = await this.cashfreeService.getOrder(data.order_id);

    if (orderDetails.order_status !== 'PAID') {
      throw new Error(`Cashfree order status is ${orderDetails.order_status}, not PAID.`);
    }

    // Activated via Cashfree PG
    return this.upgradePlan(orgId, {
      planSlug: data.planSlug,
      billingCycle: data.billingCycle,
      seats: data.seats || 1,
      paymentMethod: 'Cashfree PG (UPI / Cards / NetBanking)',
      gatewayOrderId: data.order_id,
    });
  }

  async upgradePlan(
    orgId: string,
    data: {
      planSlug: string;
      billingCycle: 'MONTHLY' | 'YEARLY';
      seats?: number;
      paymentMethod?: string;
      gatewayOrderId?: string;
    },
  ) {
    const targetPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: data.planSlug },
    });

    if (!targetPlan) {
      throw new Error(`Plan with slug ${data.planSlug} not found`);
    }

    const seats = Math.max(1, data.seats || 1);
    let sub = await this.ensureOrgSubscription(orgId);

    const now = new Date();
    const periodDays = data.billingCycle === 'YEARLY' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    const pricePerUnit =
      data.billingCycle === 'YEARLY'
        ? targetPlan.price_yearly
        : targetPlan.price_monthly;

    const baseAmount = pricePerUnit * seats;
    const taxAmount = Math.round(baseAmount * 0.18); // 18% GST
    const totalAmount = baseAmount + taxAmount;

    // Update active subscription
    const updatedSub = await this.prisma.organizationSubscription.update({
      where: { organization_id: orgId },
      data: {
        plan_id: targetPlan.id,
        status: 'ACTIVE',
        billing_cycle: data.billingCycle,
        current_period_start: now,
        current_period_end: periodEnd,
        trial_ends_at: null, // Successfully subscribed, trial ended
        cancel_at_period_end: false,
        payment_provider: 'CASHFREE',
        gateway_subscription_id: data.gatewayOrderId || null,
      },
      include: { plan: true },
    });

    // Record billing invoice receipt
    if (totalAmount > 0) {
      const invoiceNumber = `INV-ZY-${Date.now().toString().slice(-6)}`;
      await this.prisma.subscriptionInvoice.create({
        data: {
          subscription_id: updatedSub.id,
          organization_id: orgId,
          invoice_number: invoiceNumber,
          amount: totalAmount,
          tax_amount: taxAmount,
          currency: targetPlan.currency,
          status: 'PAID',
          payment_method: data.paymentMethod || 'Cashfree PG (UPI / NetBanking)',
          gateway_payment_id: data.gatewayOrderId || `cf_${Date.now()}`,
          billing_period: `${now.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - ${periodEnd.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} (${seats} seat${seats > 1 ? 's' : ''})`,
          paid_at: now,
        },
      });
    }

    return this.getCurrentSubscription(orgId);
  }

  async setTrialExpiredDebug(orgId: string, expired: boolean) {
    const sub = await this.ensureOrgSubscription(orgId);
    if (!sub) return null;

    const trialEnd = expired
      ? new Date(Date.now() - 24 * 60 * 60 * 1000) // Expired yesterday
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    await this.prisma.organizationSubscription.update({
      where: { organization_id: orgId },
      data: {
        status: expired ? 'EXPIRED' : 'TRIALING',
        trial_ends_at: trialEnd,
      },
    });

    return this.getCurrentSubscription(orgId);
  }

  async cancelSubscription(orgId: string) {
    const sub = await this.ensureOrgSubscription(orgId);
    if (!sub) return null;

    return this.prisma.organizationSubscription.update({
      where: { organization_id: orgId },
      data: { cancel_at_period_end: true },
      include: { plan: true },
    });
  }

  async getInvoices(orgId: string) {
    return this.prisma.subscriptionInvoice.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }
}
