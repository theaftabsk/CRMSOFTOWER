'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Share2, RefreshCw, Plus, ArrowUpRight, Zap, AlertTriangle, 
  ChevronRight, Play, Pause, ExternalLink
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatNumber } from '../../../lib/utils';

export default function MetaAdsOverviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [connection, setConnection] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isSimulatingLead, setIsSimulatingLead] = useState(false);
  const [simulatedLeadResult, setSimulatedLeadResult] = useState<any>(null);

  const loadData = async () => {
    try {
      const [ovData, connData, campData] = await Promise.all([
        api.getMetaOverview(),
        api.getMetaConnection(),
        api.getMetaCampaigns(),
      ]);

      if (ovData) setOverview(ovData);
      if (connData) setConnection(connData);
      if (Array.isArray(campData)) setCampaigns(campData);
    } catch (err) {
      console.error('Failed to load Meta Overview:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleSimulateLead = async () => {
    setIsSimulatingLead(true);
    setSimulatedLeadResult(null);
    try {
      const res = await api.simulateMetaLead();
      setSimulatedLeadResult(res);
      await loadData();
    } catch (err) {
      console.error('Failed to simulate lead:', err);
    } finally {
      setIsSimulatingLead(false);
    }
  };

  const handleToggleCampaign = async (id: string) => {
    try {
      await api.toggleMetaCampaign(id);
      await loadData();
    } catch (e) {
      console.error('Failed to toggle campaign:', e);
    }
  };

  const isConnected = connection?.isConnected ?? false;
  const metrics = overview?.metrics || {
    total_spend: 0,
    total_leads: 0,
    cpl: 0,
    qualified_leads: 0,
    deals_won: 0,
    revenue: 0,
    roas: 0,
  };

  const funnel = overview?.funnel || [
    { stage: 'Ad Impressions', count: 0, rate: '0%' },
    { stage: 'Link Clicks', count: 0, rate: '0%' },
    { stage: 'Form Leads Captured', count: metrics.total_leads, rate: '0%' },
    { stage: 'Sales Qualified (SQL)', count: metrics.qualified_leads, rate: '0%' },
    { stage: 'Deals Won & Closed', count: metrics.deals_won, rate: '0%' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Meta Overview & ROI Analytics
            </h1>
            {isConnected ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
                Live Sync Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                Disconnected
              </span>
            )}
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Real marketing-to-revenue performance, live lead counts, and closed-won deal ROAS.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            href="/meta-ads/campaigns/create"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Disconnected Notice if not set up */}
      {!isConnected && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-semibold">Meta Marketing API Disconnected:</span> Connect your Meta Ad Account and Page in settings to start syncing live metrics.
            </div>
          </div>
          <Link
            href="/meta-ads/settings"
            className="px-3 py-1 rounded-lg bg-amber-900 text-white font-semibold hover:bg-amber-950 transition text-[11px] whitespace-nowrap self-start sm:self-auto"
          >
            Configure Connection
          </Link>
        </div>
      )}

      {/* Simulated Lead Feedback Banner */}
      {simulatedLeadResult && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between text-xs text-emerald-900 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-semibold">
                {simulatedLeadResult.action === 'CREATED_NEW_LEAD' ? 'New Lead Ingested into Database:' : 'Duplicate Lead Updated:'}
              </span>{' '}
              {simulatedLeadResult.leadName || 'Meta Lead'} was processed via Webhook and assigned to{' '}
              <span className="font-semibold">{simulatedLeadResult.assignedTo || 'Sales Rep'}</span>.
            </div>
          </div>
          <Link
            href="/meta-ads/leads"
            className="font-medium underline hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View in Meta Leads</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Executive KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-[#666666] uppercase tracking-wider block">
            Total Ad Spend
          </span>
          <div className="text-xl font-bold font-mono text-[#111111] mt-1" suppressHydrationWarning>
            ₹{formatNumber(metrics.total_spend)}
          </div>
          <span className="text-[10px] text-[#999999] mt-0.5 block">Active Campaigns</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-[#666666] uppercase tracking-wider block">
            Total Leads
          </span>
          <div className="text-xl font-bold font-mono text-[#111111] mt-1" suppressHydrationWarning>
            {formatNumber(metrics.total_leads)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Real Database Rows</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-[#666666] uppercase tracking-wider block">
            Cost Per Lead
          </span>
          <div className="text-xl font-bold font-mono text-[#111111] mt-1" suppressHydrationWarning>
            ₹{formatNumber(metrics.cpl)}
          </div>
          <span className="text-[10px] text-[#999999] mt-0.5 block">Spend ÷ Leads</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-[#666666] uppercase tracking-wider block">
            Qualified (SQL)
          </span>
          <div className="text-xl font-bold font-mono text-[#111111] mt-1" suppressHydrationWarning>
            {metrics.qualified_leads}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
            {metrics.total_leads > 0 ? `${Math.round((metrics.qualified_leads / metrics.total_leads) * 100)}% conversion` : '0%'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-[#666666] uppercase tracking-wider block">
            Deals Closed Won
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1" suppressHydrationWarning>
            {metrics.deals_won}
          </div>
          <span className="text-[10px] text-[#999999] mt-0.5 block">Won CRM Deals</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-[#666666] uppercase tracking-wider block">
            Direct Revenue
          </span>
          <div className="text-xl font-bold font-mono text-[#111111] mt-1" suppressHydrationWarning>
            ₹{formatNumber(metrics.revenue)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Closed Deal Values</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] text-white border border-[#111111] shadow-xs">
          <span className="text-[11px] font-medium text-white/70 uppercase tracking-wider block">
            Actual ROAS
          </span>
          <div className="text-xl font-bold font-mono text-white mt-1" suppressHydrationWarning>
            {metrics.roas}x
          </div>
          <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">Revenue ÷ Spend</span>
        </div>
      </div>

      {/* Funnel Visualizer */}
      <div className="p-5 rounded-xl bg-white border border-[#E5E5E5]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Real Marketing-to-Revenue Funnel</h3>
            <p className="text-xs text-[#666666]">End-to-end attribution from Meta ad impression to closed customer revenue</p>
          </div>
          <span className="text-[11px] font-mono text-[#666666] bg-[#F8F8F8] px-2.5 py-1 rounded-md border border-[#E5E5E5]">
            Attribution: 100% Real PostgreSQL Data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {funnel.map((step: any, idx: number) => (
            <div key={idx} className="relative p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
              <div className="flex items-center justify-between text-xs text-[#666666] mb-1">
                <span className="font-medium text-[11px]">{step.stage}</span>
                <span className="font-mono text-[10px] text-[#999999]">Stage {idx + 1}</span>
              </div>
              <div className="text-lg font-bold font-mono text-[#111111]" suppressHydrationWarning>
                {formatNumber(step.count)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-[#666666]">Conversion</span>
                <span className="font-mono font-semibold text-emerald-600">{step.rate}</span>
              </div>
              <div className="w-full h-1 bg-[#E5E5E5] rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-[#111111] rounded-full" 
                  style={{ width: `${Math.max(5, 100 - idx * 22)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Snapshot */}
      <div className="p-5 rounded-xl bg-white border border-[#E5E5E5]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Active Campaigns Snapshot</h3>
            <p className="text-xs text-[#666666]">Directly synced from your Meta Ad Account</p>
          </div>
          <Link
            href="/meta-ads/campaigns"
            className="text-xs font-medium text-[#111111] hover:underline flex items-center space-x-1"
          >
            <span>Open Campaign Manager</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[#E5E5E5] rounded-xl bg-[#FAFAFA]">
            <Share2 className="w-6 h-6 text-[#999999] mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-[#111111]">No Active Campaigns Found</h4>
            <p className="text-[11px] text-[#666666] mt-0.5 mb-3">
              Connect your Meta Ad Account or create a campaign to track performance.
            </p>
            <Link
              href="/meta-ads/campaigns"
              className="inline-flex px-3 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#262626] transition"
            >
              Go to Campaign Manager
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[11px] font-semibold text-[#666666] tracking-wider uppercase">
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Daily Budget</th>
                  <th className="py-2.5 px-3">Spent</th>
                  <th className="py-2.5 px-3">Leads</th>
                  <th className="py-2.5 px-3">CPL</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {campaigns.slice(0, 5).map((camp) => (
                  <tr key={camp.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#111111]">{camp.name}</div>
                      <div className="text-[11px] text-[#666666]">{camp.ad_set_name}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        camp.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium" suppressHydrationWarning>
                      ₹{formatNumber(camp.daily_budget)}/day
                    </td>
                    <td className="py-3 px-3 font-mono font-medium" suppressHydrationWarning>
                      ₹{formatNumber(camp.spent)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#111111]">
                      {camp.leads}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#666666]" suppressHydrationWarning>
                      ₹{formatNumber(camp.cpl)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleCampaign(camp.id)}
                        className="inline-flex items-center px-2 py-1 rounded-md border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] text-[11px] font-medium transition"
                      >
                        {camp.status === 'ACTIVE' ? (
                          <>
                            <Pause className="w-3 h-3 mr-1 text-[#666666]" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1 text-emerald-600" /> Resume
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
