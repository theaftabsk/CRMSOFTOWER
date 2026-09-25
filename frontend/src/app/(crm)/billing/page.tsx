'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { api } from '../../../lib/api';
import { formatNumber } from '../../../lib/utils';
import { launchCashfreeCheckout } from '../../../lib/cashfree';
import { useCRM } from '../../../context/CRMContext';
import { 
  CreditCard, Check, Sparkles, Shield, Clock, 
  ArrowRight, CheckCircle2, Download, AlertCircle, 
  Zap, Users, Database, Globe, RefreshCw, X, Receipt, ShieldCheck,
  UserPlus, ChevronRight, Layers, BarChart3
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const INITIAL_PLANS = [
  {
    id: 'starter',
    slug: 'starter',
    name: 'Starter',
    badge: 'Entry Level',
    description: 'Basic CRM & pipeline management for small teams.',
    price_monthly: 399,
    price_yearly: 3828, // ₹319/user/mo billed annually (20% off)
    currency: '₹',
    trial_days: 14,
    max_users: 5,
    max_leads: 500,
    max_storage_mb: 1024,
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
    id: 'pro',
    slug: 'pro',
    name: 'Professional',
    badge: 'Most Popular 🔥',
    description: 'For growing sales teams requiring commercial invoicing, web forms & automation.',
    price_monthly: 699,
    price_yearly: 6708, // ₹559/user/mo billed annually (20% off)
    currency: '₹',
    trial_days: 0,
    max_users: 25,
    max_leads: 5000,
    max_storage_mb: 5120,
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
    id: 'enterprise',
    slug: 'enterprise',
    name: 'Enterprise Scale',
    badge: 'All-Inclusive Scale',
    description: 'Unlimited leads, API access, custom workflows & priority support.',
    price_monthly: 1299,
    price_yearly: 12468, // ₹1,039/user/mo billed annually (20% off)
    currency: '₹',
    trial_days: 0,
    max_users: -1,
    max_leads: -1,
    max_storage_mb: 20480,
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

const PLAN_TIER_RANK: Record<string, number> = {
  starter: 1,
  pro: 2,
  enterprise: 3,
};

export default function BillingPage() {
  const { users } = useCRM();
  const [plans, setPlans] = useState<any[]>(INITIAL_PLANS);
  const [subscriptionData, setSubscriptionData] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'overview' | 'plans' | 'matrix' | 'invoices'
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'matrix' | 'invoices'>('overview');

  // Billing Cycle Toggle: 'MONTHLY' | 'YEARLY'
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [seats, setSeats] = useState<number>(2);

  // Upgrade Modal State
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<any | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Toast Notification State
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, currentSubRes, invsRes] = await Promise.all([
        api.getSubscriptionPlans(),
        api.getCurrentSubscription(),
        api.getSubscriptionInvoices(),
      ]);
      if (Array.isArray(plansRes) && plansRes.length > 0) {
        setPlans(plansRes);
      }
      setSubscriptionData(currentSubRes);
      setInvoices(Array.isArray(invsRes) ? invsRes : []);
      if (currentSubRes?.usage?.usersUsed) {
        setSeats(Math.max(2, currentSubRes.usage.usersUsed));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlanForUpgrade(plan);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanForUpgrade) return;
    setUpgrading(true);
    try {
      // 1. Create order on Cashfree PG
      const orderRes = await api.createCashfreeOrder({
        planSlug: selectedPlanForUpgrade.slug,
        billingCycle,
        seats,
      });

      if (!orderRes || !orderRes.order_id) {
        throw new Error('Cashfree order generation failed');
      }

      // 2. Launch Cashfree SDK Modal Checkout
      await launchCashfreeCheckout({
        orderId: orderRes.order_id,
        paymentSessionId: orderRes.payment_session_id,
        mode: orderRes.cf_env || 'sandbox',
        onSuccess: async () => {
          // 3. Verify order with backend
          const verifyRes = await api.verifyCashfreeOrder({
            order_id: orderRes.order_id,
            planSlug: selectedPlanForUpgrade.slug,
            billingCycle,
            seats,
          });

          if (verifyRes) {
            showToast(`Successfully upgraded to ${selectedPlanForUpgrade.name} via Cashfree!`, 'success');
            setSelectedPlanForUpgrade(null);
            await loadData();
          } else {
            showToast('Payment verification could not be confirmed.', 'error');
          }
        },
        onFailure: (err) => {
          showToast(err?.message || 'Payment cancelled or unsuccessful.', 'error');
        },
      });
    } catch (err: any) {
      showToast(err.message || 'Upgrade transaction could not be completed.', 'error');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    await api.cancelSubscription();
    setShowCancelDialog(false);
    showToast('Auto-renewal paused at period end.', 'info');
    loadData();
  };

  const currentPlanSlug = subscriptionData?.plan?.slug || 'starter';
  const isTrial = subscriptionData?.subscription?.status === 'TRIALING' || !subscriptionData?.subscription;
  const remainingDays = subscriptionData?.subscription?.remaining_trial_days ?? 14;

  // Pricing calculations
  const calculatePlanPrice = (plan: any, seatCount: number = seats) => {
    if (billingCycle === 'YEARLY') {
      const annualMonthlyRate = Math.round(plan.price_yearly / 12);
      return {
        unitRate: annualMonthlyRate,
        totalRate: annualMonthlyRate * seatCount,
        annualBilled: plan.price_yearly * seatCount,
      };
    }
    return {
      unitRate: plan.price_monthly,
      totalRate: plan.price_monthly * seatCount,
      annualBilled: plan.price_monthly * seatCount * 12,
    };
  };

  const currentPlan = plans.find((p) => p.slug === currentPlanSlug) || plans[0];
  const totalRevenuePaid = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 text-xs px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 border transition-all duration-300 animate-slideUp ${
            notification.type === 'error' 
              ? 'bg-[#111111] text-[#EF4444] border-[#DC2626]/40' 
              : notification.type === 'info'
              ? 'bg-[#111111] text-[#60A5FA] border-[#3B82F6]/40'
              : 'bg-[#111111] text-white border-[#333333]'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
          )}
          <span className="font-medium">{notification.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E5E5] pb-4">
        <PageHeader
          title="Subscription & Billing Hub"
          subtitle="Manage active tier, live resource quotas, team sub-user seats, and Cashfree GST tax invoices."
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F8F8F8] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION BAR */}
      <div className="flex items-center space-x-1 border-b border-[#E5E5E5] pb-px overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:border-[#CCCCCC]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Overview & Usage</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'plans'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:border-[#CCCCCC]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Plans & Pricing</span>
          <span className="px-1.5 py-0.2 bg-[#F4F4F5] rounded text-[10px] font-mono text-[#333333]">
            3 Plans
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'matrix'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:border-[#CCCCCC]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Feature Progression</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:border-[#CCCCCC]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices & Receipts</span>
          {invoices.length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#111111] text-white rounded text-[10px] font-mono">
              {invoices.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & USAGE TELEMETRY & SEATS MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Plan Hero Summary */}
          <div className="bg-white border-2 border-[#111111] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#111111] text-white font-mono text-[10px] font-bold tracking-wide uppercase">
                  {isTrial ? '14-Day Free Trial' : 'Active Subscription'}
                </span>
                {isTrial && (
                  <span className="text-xs font-semibold text-[#16A34A] flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{remainingDays} days remaining</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-[#111111]">
                {currentPlan?.name} Plan — Active Workspace
              </h2>
              <p className="text-xs text-[#666666] max-w-xl">
                {isTrial
                  ? 'All enterprise CRM features are 100% unlocked during your trial. Upgrade anytime with Cashfree to lock in your discounted rate.'
                  : 'Your cloud CRM workspace is fully active with automatic Cashfree renewal and official GST invoicing.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2.5 bg-[#111111] hover:bg-[#262626] text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isTrial ? 'Upgrade Plan via Cashfree' : 'Change Plan'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SUB-USER & SEAT ALLOCATION MANAGEMENT CARD */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E5E5E5] pb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#111111]" />
                  <span>Sub-Users & Team Seat Allocation Manager</span>
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Allocate user seats to your sales team. Add or remove seats dynamically as your team scales.
                </p>
              </div>

              {/* Dynamic Seat Adjustment Counter */}
              <div className="flex items-center space-x-3 bg-[#FAFAFA] border border-[#E5E5E5] p-1.5 rounded-lg">
                <span className="text-xs font-semibold text-[#666666] px-1">Allocated Seats:</span>
                <button
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="w-7 h-7 bg-white border border-[#E5E5E5] rounded-md font-bold text-xs hover:bg-[#F0F0F0] cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center font-mono font-bold text-xs text-[#111111]">
                  {seats} Seats
                </span>
                <button
                  onClick={() => setSeats(seats + 1)}
                  className="w-7 h-7 bg-white border border-[#E5E5E5] rounded-md font-bold text-xs hover:bg-[#F0F0F0] cursor-pointer"
                >
                  +
                </button>

                <button
                  onClick={() => handleOpenCheckout(currentPlan)}
                  className="ml-2 px-3 py-1 bg-[#111111] text-white text-xs font-semibold rounded-md hover:bg-[#262626] transition cursor-pointer flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Update Seats</span>
                </button>
              </div>
            </div>

            {/* Sub-Users List Table */}
            <div>
              <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider block mb-2">
                Active Assigned Team Members ({users?.length || 2} of {seats} seats occupied):
              </span>
              <div className="overflow-x-auto border border-[#E5E5E5] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                      <th className="py-2.5 px-4">Member Name</th>
                      <th className="py-2.5 px-4">Email Address</th>
                      <th className="py-2.5 px-4">Workspace Role</th>
                      <th className="py-2.5 px-4">Seat Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {users?.slice(0, seats).map((u, idx) => (
                      <tr key={u.id || idx} className="hover:bg-[#FAFAFA]">
                        <td className="py-2.5 px-4 font-medium text-[#111111] flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[10px]">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="py-2.5 px-4 text-[#666666] font-mono">{u.email}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F4F4F5] text-[#333333]">
                            {u.role || 'Sales Rep'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center space-x-1 text-[#16A34A] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                            <span>Active Seat</span>
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* Unused Empty Seats */}
                    {Array.from({ length: Math.max(0, seats - (users?.length || 2)) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="bg-[#FAFAFA]/50 text-[#888888] italic">
                        <td className="py-2.5 px-4">Available Seat Slot #{users?.length || 2 + i + 1}</td>
                        <td className="py-2.5 px-4 font-mono">Unassigned</td>
                        <td className="py-2.5 px-4">—</td>
                        <td className="py-2.5 px-4 text-[#888888]">Ready to Invite</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* LIVE RESOURCE USAGE TELEMETRY METERS */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
                  <Database className="w-4 h-4 text-[#111111]" />
                  <span>Live Resource Usage & Quota Telemetry</span>
                </h3>
                <p className="text-xs text-[#666666]">
                  Track real-time capacity usage across team seats, leads database, and web capture forms.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#F4F4F5] rounded-md text-[11px] font-mono text-[#111111] font-semibold border border-[#E5E5E5]">
                Plan: {subscriptionData?.plan?.name || 'Starter (Trial)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Team Members */}
              <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <div className="flex justify-between items-center text-[#666666]">
                  <span className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-medium">Team Members</span>
                  </span>
                  <span className="font-mono font-semibold text-[#111111]">
                    {(subscriptionData?.usage?.usersUsed ?? 2)} / {(subscriptionData?.usage?.usersLimit === -1 ? '∞' : (subscriptionData?.usage?.usersLimit ?? 5))}
                  </span>
                </div>
                <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#111111] h-full rounded-full transition-all"
                    style={{ 
                      width: subscriptionData?.usage?.usersLimit === -1 ? '20%' : `${Math.min(100, ((subscriptionData?.usage?.usersUsed ?? 2) / (subscriptionData?.usage?.usersLimit ?? 5)) * 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Inbound Leads */}
              <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <div className="flex justify-between items-center text-[#666666]">
                  <span className="flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span className="font-medium">Leads Database</span>
                  </span>
                  <span className="font-mono font-semibold text-[#111111]">
                    {(subscriptionData?.usage?.leadsUsed ?? 6)} / {(subscriptionData?.usage?.leadsLimit === -1 ? '∞' : (subscriptionData?.usage?.leadsLimit ?? 500))}
                  </span>
                </div>
                <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#111111] h-full rounded-full transition-all"
                    style={{ 
                      width: subscriptionData?.usage?.leadsLimit === -1 ? '15%' : `${Math.min(100, ((subscriptionData?.usage?.leadsUsed ?? 6) / (subscriptionData?.usage?.leadsLimit ?? 500)) * 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Web Capture Forms */}
              <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <div className="flex justify-between items-center text-[#666666]">
                  <span className="flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="font-medium">Active Web Forms</span>
                  </span>
                  <span className="font-mono font-semibold text-[#111111]">
                    {(subscriptionData?.usage?.formsUsed ?? 2)} / {(subscriptionData?.usage?.formsLimit === -1 ? '∞' : (subscriptionData?.usage?.formsLimit ?? 2))}
                  </span>
                </div>
                <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#111111] h-full rounded-full transition-all"
                    style={{ 
                      width: subscriptionData?.usage?.formsLimit === -1 ? '25%' : `${Math.min(100, ((subscriptionData?.usage?.formsUsed ?? 2) / (subscriptionData?.usage?.formsLimit ?? 2)) * 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Pipeline Deals */}
              <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <div className="flex justify-between items-center text-[#666666]">
                  <span className="flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="font-medium">Pipeline Deals</span>
                  </span>
                  <span className="font-mono font-semibold text-[#111111]">
                    {(subscriptionData?.usage?.dealsUsed ?? 1)} / {(subscriptionData?.usage?.dealsLimit === -1 ? '∞' : (subscriptionData?.usage?.dealsLimit ?? 200))}
                  </span>
                </div>
                <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#111111] h-full rounded-full transition-all"
                    style={{ 
                      width: subscriptionData?.usage?.dealsLimit === -1 ? '10%' : `${Math.min(100, ((subscriptionData?.usage?.dealsUsed ?? 1) / (subscriptionData?.usage?.dealsLimit ?? 200)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* REVENUE & BILLING SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl space-y-1">
              <span className="text-xs text-[#666666]">Total Subscription Spend:</span>
              <div className="text-xl font-bold font-mono text-[#111111]" suppressHydrationWarning>
                ₹{formatNumber(totalRevenuePaid)}
              </div>
              <span className="text-[11px] text-[#888888] block">Across {invoices.length} billing cycles</span>
            </div>

            <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl space-y-1">
              <span className="text-xs text-[#666666]">Payment Gateway:</span>
              <div className="text-sm font-bold text-[#111111] flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cashfree PG (Official)</span>
              </div>
              <span className="text-[11px] text-[#888888] block">Instant UPI, Cards & NetBanking</span>
            </div>

            <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-[#666666]">GST Tax Receipts:</span>
                <div className="text-sm font-bold text-[#111111]">{invoices.length} Invoices Available</div>
              </div>
              <button
                onClick={() => setActiveTab('invoices')}
                className="text-xs text-[#111111] font-semibold hover:underline flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLANS & PRICING */}
      {/* ========================================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-fadeIn">
          {/* BILLING CONTROLS: CYCLE SWITCH & SEATS SELECTOR */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            {/* Monthly / Annual Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-[#111111]">Billing Cadence:</span>
              <div className="flex items-center bg-[#F4F4F5] p-1 rounded-lg">
                <button
                  onClick={() => setBillingCycle('MONTHLY')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    billingCycle === 'MONTHLY' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('YEARLY')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                    billingCycle === 'YEARLY' ? 'bg-[#111111] text-white shadow-xs' : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  <span>Annual</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#16A34A] text-white">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Team Seats Selector */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-[#111111]">Team Members:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="w-7 h-7 bg-[#FAFAFA] border border-[#E5E5E5] rounded-md font-bold text-xs hover:bg-[#F0F0F0] cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center font-mono font-bold text-xs text-[#111111]">
                  {seats} {seats === 1 ? 'Seat' : 'Seats'}
                </span>
                <button
                  onClick={() => setSeats(seats + 1)}
                  className="w-7 h-7 bg-[#FAFAFA] border border-[#E5E5E5] rounded-md font-bold text-xs hover:bg-[#F0F0F0] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 3 PRICING TIERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const pricing = calculatePlanPrice(plan);
              const currentRank = PLAN_TIER_RANK[currentPlanSlug] || 1;
              const planRank = PLAN_TIER_RANK[plan.slug] || 1;
              const isCurrent = currentPlanSlug === plan.slug;
              const isUpgrade = planRank > currentRank;
              const isPopular = plan.slug === 'pro';

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-6 bg-white flex flex-col justify-between transition-all duration-200 relative ${
                    isPopular
                      ? 'border-2 border-[#111111] shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
                      : 'border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#111111] text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Most Popular 🔥</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-[#111111]">{plan.name}</h4>
                        <p className="text-xs text-[#666666] mt-0.5">{plan.description}</p>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="pt-2 border-t border-[#F0F0F0]">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-extrabold text-[#111111] font-mono">
                          ₹{formatNumber(pricing.unitRate)}
                        </span>
                        <span className="text-xs text-[#666666]">/ user / month</span>
                      </div>

                      <div className="text-[11px] text-[#666666] font-mono mt-1" suppressHydrationWarning>
                        Total: ₹{formatNumber(pricing.totalRate)} / month for {seats} seat{seats > 1 ? 's' : ''}
                        {billingCycle === 'YEARLY' && (
                          <span className="block text-[10px] text-[#16A34A] font-semibold">
                            Billed annually (₹{formatNumber(pricing.annualBilled)}/yr)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Feature Bullet Points */}
                    <div className="pt-2 space-y-2 border-t border-[#F0F0F0]">
                      <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block">
                        What&apos;s Included:
                      </span>
                      <ul className="space-y-2 text-xs text-[#444444]">
                        {plan.features?.map((f: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 mt-6 border-t border-[#F0F0F0]">
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-xl border border-[#16A34A] bg-[#DCFCE7]/40 text-[#16A34A] text-xs font-semibold text-center flex items-center justify-center space-x-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isTrial ? 'Active (14-Day Free Trial)' : 'Active Current Plan'}</span>
                      </div>
                    ) : isUpgrade ? (
                      <button
                        onClick={() => handleOpenCheckout(plan)}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                          isPopular
                            ? 'bg-[#111111] text-white hover:bg-[#262626] shadow-sm'
                            : 'bg-white border border-[#D4D4D4] text-[#111111] hover:bg-[#F8F8F8]'
                        }`}
                      >
                        <span>Upgrade to {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenCheckout(plan)}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer bg-white border border-[#E5E5E5] text-[#555555] hover:text-[#111111] hover:bg-[#F8F8F8]"
                      >
                        <span>Switch to {plan.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FEATURE PROGRESSION & DETAILED MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5 animate-fadeIn">
          <div className="border-b border-[#E5E5E5] pb-3">
            <h3 className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#111111]" />
              <span>Feature Progression & Detailed Plan Comparison</span>
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Transparent value gap designed for solo founders, growing teams, and high-scale enterprises.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[11px] uppercase tracking-wider text-[#666666]">
                  <th className="py-3 px-4 font-semibold w-1/3">Feature / Capability</th>
                  <th className="py-3 px-4 font-semibold text-center">Starter</th>
                  <th className="py-3 px-4 font-semibold text-center bg-[#FAFAFA] border-x border-[#E5E5E5] text-[#111111]">
                    Professional 🔥
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">Enterprise Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-[#333333]">
                {/* Category: Pricing & Terms */}
                <tr className="bg-[#F8F8F8] font-semibold text-[#111111] text-[11px] uppercase tracking-wider">
                  <td colSpan={4} className="py-2 px-4">
                    Pricing & Commercial Terms
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Monthly Rate / User</td>
                  <td className="py-2.5 px-4 text-center font-mono font-semibold">₹399</td>
                  <td className="py-2.5 px-4 text-center font-mono font-semibold bg-[#FAFAFA] border-x border-[#E5E5E5]">₹699</td>
                  <td className="py-2.5 px-4 text-center font-mono font-semibold">₹1,299</td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Annual Rate (20% Discount)</td>
                  <td className="py-2.5 px-4 text-center font-mono text-[#16A34A] font-semibold">₹319 / mo</td>
                  <td className="py-2.5 px-4 text-center font-mono text-[#16A34A] font-semibold bg-[#FAFAFA] border-x border-[#E5E5E5]">₹559 / mo</td>
                  <td className="py-2.5 px-4 text-center font-mono text-[#16A34A] font-semibold">₹1,039 / mo</td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Free Trial Period</td>
                  <td className="py-2.5 px-4 text-center font-semibold text-amber-600">14 Days Full Access</td>
                  <td className="py-2.5 px-4 text-center text-[#666666] bg-[#FAFAFA] border-x border-[#E5E5E5]">Instant Access</td>
                  <td className="py-2.5 px-4 text-center text-[#666666]">Instant Access</td>
                </tr>

                {/* Category: Capacity & Quotas */}
                <tr className="bg-[#F8F8F8] font-semibold text-[#111111] text-[11px] uppercase tracking-wider">
                  <td colSpan={4} className="py-2 px-4">
                    Capacity & Resource Limits
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Inbound Leads / User</td>
                  <td className="py-2.5 px-4 text-center font-mono">500</td>
                  <td className="py-2.5 px-4 text-center font-mono font-semibold bg-[#FAFAFA] border-x border-[#E5E5E5]">5,000</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#16A34A]">Unlimited</td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Cloud Storage / User</td>
                  <td className="py-2.5 px-4 text-center font-mono">1 GB</td>
                  <td className="py-2.5 px-4 text-center font-mono bg-[#FAFAFA] border-x border-[#E5E5E5]">5 GB</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold">20 GB</td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Web Capture Forms</td>
                  <td className="py-2.5 px-4 text-center text-[#999999]">—</td>
                  <td className="py-2.5 px-4 text-center font-mono bg-[#FAFAFA] border-x border-[#E5E5E5]">15 Forms</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#16A34A]">Unlimited</td>
                </tr>

                {/* Category: Modules & Capabilities */}
                <tr className="bg-[#F8F8F8] font-semibold text-[#111111] text-[11px] uppercase tracking-wider">
                  <td colSpan={4} className="py-2 px-4">
                    Features & Workflow Automation
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Basic CRM (Leads, Contacts, Accounts)</td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center bg-[#FAFAFA] border-x border-[#E5E5E5]"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Kanban Deals Pipeline</td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center bg-[#FAFAFA] border-x border-[#E5E5E5]"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Calendar & Meeting Scheduler</td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center bg-[#FAFAFA] border-x border-[#E5E5E5]"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Tasks & Follow-up Actions</td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center bg-[#FAFAFA] border-x border-[#E5E5E5]"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Sales Orders & Quotations</td>
                  <td className="py-2.5 px-4 text-center text-[#999999]">—</td>
                  <td className="py-2.5 px-4 text-center bg-[#FAFAFA] border-x border-[#E5E5E5]"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">GST Tax Invoices & Payments</td>
                  <td className="py-2.5 px-4 text-center text-[#999999]">—</td>
                  <td className="py-2.5 px-4 text-center bg-[#FAFAFA] border-x border-[#E5E5E5]"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">WhatsApp Integration</td>
                  <td className="py-2.5 px-4 text-center text-[#999999]">—</td>
                  <td className="py-2.5 px-4 text-center bg-[#FAFAFA] border-x border-[#E5E5E5]"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                  <td className="py-2.5 px-4 text-center"><Check className="w-4 h-4 text-[#16A34A] mx-auto" /></td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Sales Automation & Workflows</td>
                  <td className="py-2.5 px-4 text-center text-[#999999]">—</td>
                  <td className="py-2.5 px-4 text-center text-xs font-medium bg-[#FAFAFA] border-x border-[#E5E5E5]">Standard</td>
                  <td className="py-2.5 px-4 text-center text-xs font-semibold text-[#16A34A]">Advanced Custom</td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Developer API & Webhooks</td>
                  <td className="py-2.5 px-4 text-center text-[#999999]">—</td>
                  <td className="py-2.5 px-4 text-center text-xs font-medium bg-[#FAFAFA] border-x border-[#E5E5E5]">Standard API</td>
                  <td className="py-2.5 px-4 text-center text-xs font-semibold text-[#16A34A]">Full Dedicated Hub</td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 px-4 font-medium text-[#111111]">Customer Support SLA</td>
                  <td className="py-2.5 px-4 text-center text-xs text-[#666666]">Standard Support</td>
                  <td className="py-2.5 px-4 text-center text-xs font-medium bg-[#FAFAFA] border-x border-[#E5E5E5]">Priority Email</td>
                  <td className="py-2.5 px-4 text-center text-xs font-bold text-[#111111]">24/7 Dedicated SLA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INVOICES & BILLING RECEIPTS */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-[#111111]" />
                <span>Subscription Invoices & Payment Receipts</span>
              </h3>
              <p className="text-xs text-[#666666]">
                GST compliant tax invoices for your Zyvo CRM cloud subscription.
              </p>
            </div>
            {subscriptionData?.subscription?.status === 'ACTIVE' && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="text-xs text-[#DC2626] hover:underline cursor-pointer"
              >
                Pause Auto-Renewal
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[11px] uppercase tracking-wider text-[#666666] bg-[#FAFAFA]">
                  <th className="py-2.5 px-4 font-semibold">Invoice Number</th>
                  <th className="py-2.5 px-4 font-semibold">Billing Period</th>
                  <th className="py-2.5 px-4 font-semibold">Amount (inc. 18% GST)</th>
                  <th className="py-2.5 px-4 font-semibold">Payment Method</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAFAFA]">
                    <td className="py-3 px-4 font-mono font-medium text-[#111111]">{inv.invoice_number}</td>
                    <td className="py-3 px-4 text-[#666666]">{inv.billing_period || 'Monthly'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#111111]" suppressHydrationWarning>
                      ₹{formatNumber(inv.amount)}
                    </td>
                    <td className="py-3 px-4 text-[#666666]">{inv.payment_method || 'Cashfree PG'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#DCFCE7] text-[#16A34A]">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => showToast(`Receipt for ${inv.invoice_number} downloaded.`)}
                        className="inline-flex items-center space-x-1 text-xs text-[#111111] hover:underline font-medium cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#666666]">
                      No billing invoices generated yet. Invoices appear automatically upon plan upgrades or renewals.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKOUT & UPGRADE CASHFREE MODAL */}
      {/* ========================================================================= */}
      {selectedPlanForUpgrade && (
        <div 
          onClick={() => setSelectedPlanForUpgrade(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E5E5E5] flex justify-between items-center bg-white">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  {(PLAN_TIER_RANK[selectedPlanForUpgrade.slug] || 1) < (PLAN_TIER_RANK[currentPlanSlug] || 1)
                    ? `Switch to ${selectedPlanForUpgrade.name}`
                    : `Upgrade to ${selectedPlanForUpgrade.name}`}
                </h3>
                <p className="text-xs text-[#666666]">
                  Instant activation for your Zyvo organization workspace.
                </p>
              </div>
              <button
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="p-1.5 text-[#666666] hover:text-[#111111] rounded-lg hover:bg-[#F4F4F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Order Summary Box */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#666666]">Plan & Cadence:</span>
                  <span className="font-semibold text-[#111111]">
                    {selectedPlanForUpgrade.name} ({billingCycle.toLowerCase()})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#666666]">Seats Allocated:</span>
                  <span className="font-semibold text-[#111111]">{seats} Team Members</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#666666]">Base Subtotal:</span>
                  <span className="font-mono font-semibold text-[#111111]" suppressHydrationWarning>
                    ₹{formatNumber(calculatePlanPrice(selectedPlanForUpgrade).totalRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#666666]">GST (18%):</span>
                  <span className="font-mono text-[#666666]" suppressHydrationWarning>
                    ₹{formatNumber(Math.round(calculatePlanPrice(selectedPlanForUpgrade).totalRate * 0.18))}
                  </span>
                </div>
                <div className="border-t border-[#E5E5E5] pt-2 flex justify-between items-center text-sm">
                  <span className="font-bold text-[#111111]">Total Payable:</span>
                  <span className="font-mono font-bold text-base text-[#111111]" suppressHydrationWarning>
                    ₹{formatNumber(Math.round(calculatePlanPrice(selectedPlanForUpgrade).totalRate * 1.18))}
                  </span>
                </div>
              </div>

              {/* Cashfree Payment Gateway Box */}
              <div className="p-3.5 rounded-xl border border-[#111111]/20 bg-[#FAFAFA] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-xs text-[#111111]">
                      Cashfree Payments (Official PG)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    100% Secure
                  </span>
                </div>
                <p className="text-[11px] text-[#666666]">
                  Supports Instant UPI (Google Pay, PhonePe, Paytm, BHIM), NetBanking across all Indian banks, and Credit/Debit Cards with automated GST tax receipt.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8F8F8] border-t border-[#E5E5E5] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="px-4 py-2 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={upgrading}
                onClick={handleConfirmUpgrade}
                className="px-4 py-2 bg-[#111111] hover:bg-[#262626] text-white rounded-lg text-xs font-medium transition shadow-sm flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {upgrading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {(PLAN_TIER_RANK[selectedPlanForUpgrade.slug] || 1) < (PLAN_TIER_RANK[currentPlanSlug] || 1)
                        ? 'Confirm & Switch Plan'
                        : 'Pay with Cashfree PG'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL SUBSCRIPTION DIALOG */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Pause Auto-Renewal"
        message="Are you sure you want to pause auto-renewal? You will keep your current plan benefits until the end of this billing cycle."
        confirmLabel="Pause Auto-Renewal"
        cancelLabel="Keep Subscription"
        isDestructive={true}
        onConfirm={handleCancelSubscription}
        onCancel={() => setShowCancelDialog(false)}
      />
    </div>
  );
}
