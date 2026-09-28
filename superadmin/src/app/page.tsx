'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, Users, CreditCard, Activity, ArrowUpRight, 
  Plus, Search, RefreshCw, Server, CheckCircle2, 
  Sparkles, ExternalLink, Loader2
} from 'lucide-react';
import { formatNumber, formatCurrency } from '../lib/utils';
import { superAdminApi } from '../lib/api';

export default function SuperAdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const res = await superAdminApi.getOverview();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load superadmin overview:', err);
      setError(err.message || 'Failed to connect to backend database');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#111111]" />
        <span className="text-xs text-[#666666] font-mono">Querying PostgreSQL Cluster & Tenant Telemetry...</span>
      </div>
    );
  }

  const tenants = Array.isArray(data?.recentTenants) ? data.recentTenants : [];
  const totalTenants = data?.totalTenants ?? 0;
  const totalUsers = data?.totalUsers ?? 0;
  const totalDeals = data?.totalDeals ?? 0;
  const platformMRR = data?.platformMRR ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
              Master Platform Overview
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#111111] text-white font-mono font-medium">
              Live PostgreSQL Node
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Global multi-tenant governance, organization quotas, and real-time database telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className={`btn-secondary text-xs py-2 px-3 space-x-1.5 ${isRefreshing ? 'opacity-50' : ''}`}
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <Link
            href="/tenants"
            className="btn-primary text-xs py-2 px-3.5 space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision Tenant</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-mono">
          Database Connection Notice: {error}
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Tenants */}
        <div className="card-minimal p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#666666]">Active Workspaces</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-[#111111]" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#111111] mt-3">
            {formatNumber(totalTenants)}
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-[#16A34A]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-semibold">Live PostgreSQL</span>
            <span className="text-[#888888] font-normal">• 100% Isolated</span>
          </div>
        </div>

        {/* Global Platform Users */}
        <div className="card-minimal p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#666666]">Managed Users</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-[#111111]" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#111111] mt-3">
            {formatNumber(totalUsers)}
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-[#16A34A]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-semibold">{formatNumber(totalDeals)} total deals</span>
          </div>
        </div>

        {/* Platform MRR */}
        <div className="card-minimal p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#666666]">Platform MRR</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5 text-[#111111]" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#111111] mt-3">
            {formatCurrency(platformMRR)}
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-[#16A34A]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-semibold">Monthly Projected</span>
          </div>
        </div>

        {/* Database & Cluster Status */}
        <div className="card-minimal p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#666666]">Database Telemetry</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#111111] mt-3">
            ONLINE
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-[#666666]">
            <Server className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>PostgreSQL 16</span>
            <span className="text-[#888888] font-normal">• RLS Active</span>
          </div>
        </div>
      </div>

      {/* Main Tenant Management Table */}
      <div className="card-minimal overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-bold text-[#111111]">Database Workspaces</h2>
            <span className="text-xs bg-[#F4F4F6] text-[#666666] px-2 py-0.5 rounded-full font-mono">
              {tenants.length} tenants
            </span>
          </div>

          <Link
            href="/tenants"
            className="text-xs text-[#111111] font-semibold hover:underline flex items-center space-x-1"
          >
            <span>View All Tenants</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] tracking-wider uppercase">
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Industry Vertical</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Users & Records</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#888888] text-xs">
                    No organizations found in database. Create your first workspace above.
                  </td>
                </tr>
              ) : (
                tenants.map((t: any) => (
                  <tr key={t.id} className="hover:bg-[#FAFAFA] transition duration-150">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#111111]">{t.name}</div>
                          <div className="text-[10px] text-[#888888] font-mono">{t.slug}.zyvocrm.in</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#404040]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] text-[11px] font-medium text-[#404040]">
                        {t.vertical}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#F4F4F6] text-[#111111] border border-[#D4D4D4]">
                        {t.plan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-[#111111] font-semibold">{t.usersCount} users</span>
                      <span className="text-[#888888] text-[11px]"> • {t.dealsCount} deals • {t.leadsCount} leads</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                        <span>ACTIVE</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <a
                        href="http://localhost:3000/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-white hover:bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[11px] font-medium text-[#111111] transition inline-flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Launch</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
