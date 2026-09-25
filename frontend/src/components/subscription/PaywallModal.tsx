'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { launchCashfreeCheckout } from '@/lib/cashfree';
import { 
  ShieldCheck, Lock, Check, Sparkles, ArrowRight, 
  CreditCard, Loader2, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onUnlocked: () => void;
}

const PLANS = [
  {
    slug: 'starter',
    name: 'Starter',
    badge: 'Basic CRM',
    price_monthly: 399,
    price_yearly: 3828, // ₹319/mo
    features: [
      'Basic CRM Platform',
      'Leads & Contacts (500/user)',
      'Kanban Deals Pipeline',
      'Calendar & Meetings',
      'Tasks & Follow-ups',
      '1 GB Storage / user',
    ],
  },
  {
    slug: 'pro',
    name: 'Professional',
    badge: 'Most Popular 🔥',
    popular: true,
    price_monthly: 699,
    price_yearly: 6708, // ₹559/mo
    features: [
      'Everything in Starter',
      'Sales Orders & Quotations',
      'GST Tax Invoices & Ledger',
      'Web Forms Studio',
      'Sales Automation Workflows',
      'WhatsApp Integration',
      '5,000 Leads & 5 GB Storage',
    ],
  },
  {
    slug: 'enterprise',
    name: 'Enterprise Scale',
    badge: 'All-Inclusive Scale',
    price_monthly: 1299,
    price_yearly: 12468, // ₹1,039/mo
    features: [
      'Everything in Professional',
      'Unlimited Leads & Contacts',
      'Developer API Hub & Webhooks',
      'Advanced Automation & Rules',
      'Custom Workflows & Audit Logs',
      '20 GB Storage & Priority SLA',
    ],
  },
];

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onUnlocked }) => {
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('pro');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [seats, setSeats] = useState(3);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPlan = PLANS.find((p) => p.slug === selectedPlanSlug) || PLANS[1];

  const unitRate =
    billingCycle === 'YEARLY'
      ? Math.round(selectedPlan.price_yearly / 12)
      : selectedPlan.price_monthly;

  const baseTotal =
    (billingCycle === 'YEARLY' ? selectedPlan.price_yearly : selectedPlan.price_monthly) * seats;
  const gstTax = Math.round(baseTotal * 0.18);
  const grandTotal = baseTotal + gstTax;

  const handleCashfreePayment = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Create Order via Cashfree PG
      const orderRes = await api.createCashfreeOrder({
        planSlug: selectedPlan.slug,
        billingCycle,
        seats,
      });

      if (!orderRes || !orderRes.order_id) {
        throw new Error('Could not initiate Cashfree payment session.');
      }

      // 2. Launch Cashfree SDK Modal Checkout
      await launchCashfreeCheckout({
        orderId: orderRes.order_id,
        paymentSessionId: orderRes.payment_session_id,
        mode: orderRes.cf_env || 'sandbox',
        onSuccess: async () => {
          // 3. Verify on backend & unlock
          const verifyRes = await api.verifyCashfreeOrder({
            order_id: orderRes.order_id,
            planSlug: selectedPlan.slug,
            billingCycle,
            seats,
          });

          if (verifyRes) {
            onUnlocked();
          } else {
            setErrorMsg('Payment verification could not be confirmed.');
          }
        },
        onFailure: (err) => {
          setErrorMsg(err?.message || 'Payment was cancelled or unsuccessful.');
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation error.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col p-6 sm:p-8 animate-scaleUp">
        {/* Security Lock Header */}
        <div className="text-center space-y-2 pb-6 border-b border-[#E5E5E5]">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            14-Day Free Trial Has Ended
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] max-w-xl mx-auto">
            Your 14-day free trial period has concluded. All your leads, deals, contacts, and invoices remain <strong className="text-[#111111]">100% safely preserved</strong>. Subscribe now via Cashfree Payments to instantly restore full workspace access.
          </p>

          {/* Cadence & Seat Adjuster */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <div className="flex items-center bg-[#F4F4F5] p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-white text-[#111111] shadow-xs'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
                  billingCycle === 'YEARLY'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#16A34A] text-white">
                  -20%
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-2 bg-[#FAFAFA] border border-[#E5E5E5] px-3 py-1 rounded-lg">
              <span className="text-xs text-[#666666]">Seats:</span>
              <button
                onClick={() => setSeats(Math.max(1, seats - 1))}
                className="w-6 h-6 bg-white border border-[#E5E5E5] rounded text-xs font-bold hover:bg-[#F0F0F0]"
              >
                -
              </button>
              <span className="font-mono font-bold text-xs text-[#111111] w-8 text-center">
                {seats}
              </span>
              <button
                onClick={() => setSeats(seats + 1)}
                className="w-6 h-6 bg-white border border-[#E5E5E5] rounded text-xs font-bold hover:bg-[#F0F0F0]"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 3 Plans Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          {PLANS.map((plan) => {
            const isSelected = selectedPlanSlug === plan.slug;
            const rate =
              billingCycle === 'YEARLY'
                ? Math.round(plan.price_yearly / 12)
                : plan.price_monthly;

            return (
              <div
                key={plan.slug}
                onClick={() => setSelectedPlanSlug(plan.slug)}
                className={`rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-2 border-[#111111] bg-white shadow-md'
                    : 'border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#CCCCCC]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-[#111111] text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-[#111111]">{plan.name}</h4>
                      <span className="text-[11px] text-[#666666]">{plan.badge}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#CCCCCC]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAEAEA]">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-extrabold text-[#111111] font-mono">
                        ₹{formatNumber(rate)}
                      </span>
                      <span className="text-[11px] text-[#666666]">/user/mo</span>
                    </div>
                    <div className="text-[10px] text-[#666666] font-mono mt-0.5">
                      ₹{formatNumber(rate * seats)} / month ({seats} seats)
                    </div>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-[#EAEAEA] text-[11px] text-[#444444]">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cashfree Payment Footer Action */}
        <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-xs text-[#666666]">
              Total payable with 18% GST:
            </div>
            <div className="text-lg font-extrabold font-mono text-[#111111]">
              ₹{formatNumber(grandTotal)}{' '}
              <span className="text-xs font-normal text-[#666666]">
                ({billingCycle.toLowerCase()})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={handleCashfreePayment}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Cashfree PG...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Pay with Cashfree PG (UPI / Cards / NetBanking)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
