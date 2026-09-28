'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layers, Check, Sparkles, ShieldCheck, CreditCard, 
  Settings2, Plus, Edit3, ArrowUpRight, Loader2 
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { superAdminApi } from '../../lib/api';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await superAdminApi.getSubscriptions();
        setPlans(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error('Failed to load plans:', err);
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            SaaS Plans & Tenant Quotas
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Real subscription tiers from PostgreSQL with active tenant counts and entitlement gates.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs font-mono text-[#111111]">
          <span>Configured Tiers: </span>
          <span className="font-bold">{plans.length}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 space-x-2 text-xs text-[#666666]">
          <Loader2 className="w-5 h-5 animate-spin text-[#111111]" />
          <span>Fetching SaaS Tiers from Database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Array.isArray(plans) ? plans : []).map((plan) => (
            <div 
              key={plan.id || plan.slug}
              className={`card-minimal p-6 flex flex-col justify-between relative transition-all duration-150 ${
                plan.badge ? 'border-[#111111] shadow-[0_4px_16px_rgba(0,0,0,0.04)]' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111111] text-white text-[9px] font-bold px-3 py-0.5 rounded-full tracking-wider">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#111111]">{plan.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] text-[#16A34A] font-semibold">
                    {plan.activeSubscribers ?? 1} Tenants
                  </span>
                </div>

                <div className="mt-3 flex items-baseline space-x-1">
                  <span className="text-2xl font-bold font-mono text-[#111111]">
                    {plan.price_monthly === 0 ? 'Free' : formatCurrency(plan.price_monthly)}
                  </span>
                  {plan.price_monthly > 0 && <span className="text-xs text-[#666666]">/month</span>}
                </div>

                {/* Quotas */}
                <div className="mt-4 p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Seat Limit:</span>
                    <span className="font-mono font-semibold text-[#111111]">{plan.max_users} Users</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Lead Volume:</span>
                    <span className="font-mono font-semibold text-[#111111]">{formatNumber(plan.max_leads)} Records</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Storage Vault:</span>
                    <span className="font-mono font-semibold text-[#111111]">
                      {plan.max_storage_mb >= 1000 ? `${plan.max_storage_mb / 1000} GB` : `${plan.max_storage_mb} MB`}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-5 space-y-2.5">
                  <div className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                    Included Entitlements
                  </div>
                  <ul className="space-y-2 text-xs text-[#404040]">
                    {(plan.features || []).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="text-[11px] text-[#666666]">Status: Active</span>
                <span className="text-[11px] font-mono text-[#111111]">PostgreSQL Managed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
