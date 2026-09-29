'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Share2, Plus, RefreshCw, Play, Pause, ExternalLink, 
  ArrowLeft, ChevronRight, Layers, Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export default function MetaCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    objective: 'OUTCOME_LEADS',
    daily_budget: 1500,
    ad_set_name: '',
    target_location: 'India',
  });

  const loadData = async () => {
    try {
      const campData = await api.getMetaCampaigns();
      if (Array.isArray(campData)) setCampaigns(campData);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
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

  const handleToggleCampaign = async (id: string) => {
    try {
      await api.toggleMetaCampaign(id);
      await loadData();
    } catch (e) {
      console.error('Failed to toggle campaign:', e);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) return;
    setIsSubmitting(true);
    try {
      await api.createMetaCampaign(newCampaign);
      setIsCreateModalOpen(false);
      setNewCampaign({
        name: '',
        objective: 'OUTCOME_LEADS',
        daily_budget: 1500,
        ad_set_name: '',
        target_location: 'India',
      });
      await loadData();
    } catch (err) {
      console.error('Failed to create campaign:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <Link 
              href="/meta-ads"
              className="p-1.5 rounded-lg border border-[#E5E5E5] text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Meta Ad Campaigns
            </h1>
            <span className="text-xs font-mono text-[#666666] bg-[#F8F8F8] px-2.5 py-1 rounded-md border border-[#E5E5E5]">
              {campaigns.length} Active Tiers
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Control daily ad budgets, pause or resume ad sets, and create new Lead Generation campaigns via Meta Graph API.
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

      {/* Campaigns Table or Empty State */}
      {campaigns.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E5E5E5] rounded-xl bg-white p-8">
          <Layers className="w-10 h-10 text-[#999999] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#111111]">No Active Campaigns Found</h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto mt-1 mb-5">
            You don&apos;t have any campaigns in this Ad Account yet. Create your first Lead Ad campaign to start streaming prospects.
          </p>
          <Link
            href="/meta-ads/campaigns/create"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#262626] transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create First Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[11px] font-semibold text-[#666666] tracking-wider uppercase bg-[#FAFAFA]">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Objective</th>
                <th className="py-3 px-4">Daily Budget</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Leads</th>
                <th className="py-3 px-4">CPL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-xs">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#FAFAFA] transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#111111]">{camp.name}</div>
                    <div className="text-[11px] text-[#666666] mt-0.5 flex items-center space-x-2">
                      <span>AdSet: {camp.ad_set_name}</span>
                      <span>•</span>
                      <span className="font-mono">{camp.created_at}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                      camp.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}>
                      {camp.status === 'ACTIVE' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
                      )}
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F4F4F5] text-[#111111] text-[10px] font-mono font-medium">
                      {camp.objective}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium" suppressHydrationWarning>
                    ₹{formatNumber(camp.daily_budget)}/day
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#111111]" suppressHydrationWarning>
                    ₹{formatNumber(camp.spent)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#111111]">
                    {camp.leads}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#666666]" suppressHydrationWarning>
                    ₹{formatNumber(camp.cpl)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleCampaign(camp.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                        camp.status === 'ACTIVE'
                          ? 'border-[#D4D4D4] bg-white text-[#111111] hover:bg-[#F8F8F8]'
                          : 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {camp.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 mr-1 text-[#666666]" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 mr-1" /> Resume
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

      {/* CREATE CAMPAIGN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Create Meta Lead Ad Campaign</h3>
                <p className="text-xs text-[#666666]">Deploys campaign parameters via Meta Graph API</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#999999] hover:text-[#111111] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Q4 Commercial Lead Gen"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">
                    Campaign Objective
                  </label>
                  <select
                    value={newCampaign.objective}
                    onChange={(e) => setNewCampaign({ ...newCampaign, objective: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="OUTCOME_LEADS">Leads (Instant Forms)</option>
                    <option value="OUTCOME_TRAFFIC">Traffic</option>
                    <option value="OUTCOME_AWARENESS">Awareness</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">
                    Daily Budget (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={100}
                    value={newCampaign.daily_budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, daily_budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  Target Ad Set Name
                </label>
                <input
                  type="text"
                  value={newCampaign.ad_set_name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, ad_set_name: e.target.value })}
                  placeholder="e.g. Metro Decision Makers 28-55"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] text-xs font-medium text-[#666666]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold transition"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
