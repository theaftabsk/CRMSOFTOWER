'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart3, TrendingUp, DollarSign, Target, Award, 
  Download, RefreshCw, Layers, ArrowUpRight, CheckCircle2, 
  Clock, AlertTriangle, Users, Building2, ShoppingBag, 
  FileText, Calendar, Filter, Sparkles, PieChart as PieIcon,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, AreaChart, Area, Cell, LineChart, Line 
} from 'recharts';
import { api } from '../../../lib/api';
import { formatNumber } from '../../../lib/utils';

export const ReportsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REVENUE' | 'PIPELINE' | 'LEADS'>('OVERVIEW');
  const [timeRange, setTimeRange] = useState<'Q3' | 'YTD' | '6M' | 'ALL'>('6M');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getReports();
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.warn('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = useMemo(() => {
    if (!data?.kpis) {
      return {
        totalRevenue: 373200,
        totalInvoiced: 422900,
        totalOutstandingDue: 141300,
        collectionRate: 88,
        totalPipeline: 120000,
        wonDealsCount: 1,
        wonDealsValue: 120000,
        winRate: 100,
        avgDealSize: 120000,
        totalLeads: 6,
        leadConversionRate: 38,
        totalContacts: 6,
        totalAccounts: 1,
      };
    }
    return data.kpis;
  }, [data]);

  const salesTrend = useMemo(() => {
    if (!data?.salesTrend || data.salesTrend.length === 0) {
      return [
        { month: 'Apr', revenue: 45000, target: 40000, invoiced: 55000 },
        { month: 'May', revenue: 78000, target: 60000, invoiced: 85000 },
        { month: 'Jun', revenue: 95000, target: 80000, invoiced: 105000 },
        { month: 'Jul', revenue: 112000, target: 100000, invoiced: 120000 },
        { month: 'Aug', revenue: 135000, target: 120000, invoiced: 140000 },
        { month: 'Sep', revenue: 373200, target: 350000, invoiced: 422900 },
      ];
    }
    return data.salesTrend;
  }, [data]);

  const pipelineByStage = useMemo(() => {
    if (!data?.pipelineByStage || data.pipelineByStage.length === 0) {
      return [
        { stage: 'Discovery', count: 2, value: 80000 },
        { stage: 'Qualification', count: 1, value: 50000 },
        { stage: 'Proposal', count: 1, value: 147500 },
        { stage: 'Negotiation', count: 1, value: 265500 },
        { stage: 'Closed Won', count: 2, value: 385500 },
        { stage: 'Closed Lost', count: 0, value: 0 },
      ];
    }
    return data.pipelineByStage;
  }, [data]);

  const leadsBySource = useMemo(() => {
    if (!data?.leadsBySource || data.leadsBySource.length === 0) {
      return [
        { source: 'Website Organic', count: 3 },
        { source: 'API Partner Apps', count: 2 },
        { source: 'Direct Inbound', count: 1 },
      ];
    }
    return data.leadsBySource;
  }, [data]);

  const agingReceivables = useMemo(() => {
    if (!data?.agingReceivables || data.agingReceivables.length === 0) {
      return [
        { category: 'Current (< Due Date)', amount: kpis.totalOutstandingDue || 141300 },
        { category: '1-15 Days Overdue', amount: 0 },
        { category: '16-30 Days Overdue', amount: 0 },
        { category: '30+ Days Overdue', amount: 0 },
      ];
    }
    return data.agingReceivables;
  }, [data, kpis]);

  const topAccounts = useMemo(() => {
    if (!data?.topAccounts || data.topAccounts.length === 0) {
      return [
        { id: 'ACC001', name: 'Apex Health Systems', tier: 'TIER_1_ENTERPRISE', dealsCount: 1, totalBilled: 381600, totalPaid: 353200 },
        { id: 'ACC002', name: 'Tata Digital Enterprise', tier: 'TIER_1_ENTERPRISE', dealsCount: 1, totalBilled: 265500, totalPaid: 265500 },
        { id: 'ACC003', name: 'Reliance Retail Logistics', tier: 'TIER_2_GROWTH', dealsCount: 1, totalBilled: 94400, totalPaid: 94400 },
      ];
    }
    return data.topAccounts;
  }, [data]);

  // Export Executive CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['Zyvo CRM Executive Analytics Report'],
      ['Generated On', new Date().toISOString()],
      [''],
      ['Key Performance Indicators', 'Value'],
      ['Realized Cash Revenue (INR)', kpis.totalRevenue],
      ['Total Invoiced Amount (INR)', kpis.totalInvoiced],
      ['Outstanding Receivables (INR)', kpis.totalOutstandingDue],
      ['Collection Efficiency Rate', `${kpis.collectionRate}%`],
      ['Active Pipeline Value (INR)', kpis.totalPipeline],
      ['Won Deals Count', kpis.wonDealsCount],
      ['Deal Win Rate', `${kpis.winRate}%`],
      ['Average Deal Size (INR)', kpis.avgDealSize],
      ['Total Leads Registered', kpis.totalLeads],
      ['Lead Conversion Rate', `${kpis.leadConversionRate}%`],
      [''],
      ['Monthly Revenue Trend'],
      ['Month', 'Actual Revenue (INR)', 'Target (INR)', 'Invoiced (INR)'],
      ...salesTrend.map((s: any) => [s.month, s.revenue, s.target, s.invoiced || s.revenue]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zyvo_CRM_Executive_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-black text-white">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#111111]">Executive Reports & Analytics</h1>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Real-time sales velocity, revenue realization, collection efficiency, and multi-channel pipeline intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range toggle */}
          <div className="flex items-center rounded-lg border border-[#E5E5E5] bg-white p-0.5 text-xs font-semibold">
            {(['6M', 'Q3', 'YTD', 'ALL'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeRange === t ? 'bg-[#111111] text-white shadow-xs' : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            title="Refresh Intelligence Data"
            className="p-2 rounded-lg border border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <Download className="w-3.5 h-3.5 text-[#666666]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 6 Master KPI Intelligence Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Realized Revenue</span>
            <DollarSign className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#16A34A]">
            ₹{formatNumber(kpis.totalRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-[#16A34A] flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>Actual Collections</span>
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Total Invoiced</span>
            <FileText className="w-4 h-4 text-[#111111]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            ₹{formatNumber(kpis.totalInvoiced)}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            Total billed B2B
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Outstanding Due</span>
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#DC2626]">
            ₹{formatNumber(kpis.totalOutstandingDue)}
          </div>
          <div className="mt-1 text-[11px] text-[#DC2626] font-semibold">
            Pending collection
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Deal Win Rate</span>
            <Award className="w-4 h-4 text-[#111111]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            {kpis.winRate}%
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            {kpis.wonDealsCount} deal{kpis.wonDealsCount === 1 ? '' : 's'} closed won
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Active Pipeline</span>
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            ₹{formatNumber(kpis.totalPipeline)}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            Avg Size: ₹{formatNumber(kpis.avgDealSize)}
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Collection Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#16A34A]">
            {kpis.collectionRate}%
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            Recovery efficiency
          </div>
        </div>
      </div>

      {/* Analysis Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E5E5E5] pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'OVERVIEW' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F4F4F5]'
          }`}
        >
          Executive Overview
        </button>
        <button
          onClick={() => setActiveTab('REVENUE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'REVENUE' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F4F4F5]'
          }`}
        >
          Revenue & Cash Flow
        </button>
        <button
          onClick={() => setActiveTab('PIPELINE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'PIPELINE' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F4F4F5]'
          }`}
        >
          Sales Pipeline Funnel
        </button>
        <button
          onClick={() => setActiveTab('LEADS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'LEADS' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F4F4F5]'
          }`}
        >
          Leads & Acquisition
        </button>
      </div>

      {/* OVERVIEW / REVENUE CHARTS GRID */}
      {(activeTab === 'OVERVIEW' || activeTab === 'REVENUE') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Target Bar Chart */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Monthly Revenue vs Enterprise Target (₹)</h3>
                <p className="text-xs text-[#666666] mt-0.5">Actual cash collections against forecasted quota</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E5E5E5]" />
                  <span className="text-[#666666]">Target</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#111111]" />
                  <span className="text-[#111111] font-semibold">Actual</span>
                </span>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', fontSize: '12px' }}
                    formatter={(val: any) => [`₹${formatNumber(Number(val))}`, '']}
                  />
                  <Bar dataKey="target" fill="#E5E5E5" name="Target (₹)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#111111" name="Actual (₹)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cumulative Revenue Trajectory Area Chart */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Revenue Trajectory & Cumulative Inflow</h3>
                <p className="text-xs text-[#666666] mt-0.5">Year-to-date collections curve and realization pace</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]">
                88% Realization
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111111" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#111111" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', fontSize: '12px' }}
                    formatter={(val: any) => [`₹${formatNumber(Number(val))}`, 'Realized Cash']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#111111" 
                    strokeWidth={2.5} 
                    fill="url(#revenueGradient)" 
                    name="Realized Revenue" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* PIPELINE BY STAGE BREAKDOWN */}
      {(activeTab === 'OVERVIEW' || activeTab === 'PIPELINE') && (
        <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Sales Pipeline Velocity by Stage</h3>
              <p className="text-xs text-[#666666] mt-0.5">Value and density of commercial opportunities across active deal stages</p>
            </div>
            <Link 
              href="/deals"
              className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
            >
              <span>Manage Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {pipelineByStage.map((st: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#888888] block truncate">
                  {st.stage}
                </span>
                <span suppressHydrationWarning className="text-lg font-bold font-mono text-[#111111] block mt-1">
                  ₹{formatNumber(st.value)}
                </span>
                <div className="text-[11px] text-[#666666] mt-0.5">
                  {st.count} opportunit{st.count === 1 ? 'y' : 'ies'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEADS & ACQUISITION INTELLIGENCE */}
      {(activeTab === 'OVERVIEW' || activeTab === 'LEADS') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads by Acquisition Source */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Lead Acquisition by Channel</h3>
                <p className="text-xs text-[#666666] mt-0.5">Origin channels driving prospect inflow into CRM</p>
              </div>
              <Link 
                href="/leads"
                className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
              >
                <span>View Leads</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {leadsBySource.map((s: any, idx: number) => {
                const total = leadsBySource.reduce((acc: number, curr: any) => acc + curr.count, 0) || 1;
                const pct = Math.round((s.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#111111] truncate">{s.source}</span>
                      <span className="font-mono text-[#666666]">{s.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F4F4F5] overflow-hidden">
                      <div 
                        className="h-full bg-[#111111] rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aging Receivables Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Receivables Aging Schedule</h3>
                <p className="text-xs text-[#666666] mt-0.5">Analysis of unpaid invoices by delinquency age</p>
              </div>
              <Link 
                href="/invoices"
                className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
              >
                <span>Invoices Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {agingReceivables.map((ag: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
                    <span className="text-xs font-semibold text-[#111111]">{ag.category}</span>
                  </div>
                  <span suppressHydrationWarning className="font-mono font-bold text-xs text-[#111111]">
                    ₹{formatNumber(ag.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOP CONTRIBUTING CLIENT ACCOUNTS */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#111111]">Top Revenue-Contributing Accounts</h3>
            <p className="text-xs text-[#666666] mt-0.5">High-value enterprise client relationships ranked by contracted cash inflow</p>
          </div>
          <Link
            href="/accounts"
            className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
          >
            <span>All Accounts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <table className="crm-table w-full">
          <thead>
            <tr>
              <th className="text-left">Account Name</th>
              <th className="text-left">Account Tier</th>
              <th className="text-center">Deals</th>
              <th className="text-right">Total Invoiced</th>
              <th className="text-right">Cash Realized</th>
              <th className="text-right pr-4">Contribution %</th>
            </tr>
          </thead>
          <tbody>
            {topAccounts.map((acc: any) => {
              const totalRev = kpis.totalRevenue || 1;
              const sharePct = Math.min(100, Math.round(((acc.totalPaid || 0) / totalRev) * 100));

              return (
                <tr key={acc.id} className="hover:bg-[#FAFAFA] transition-colors border-b border-[#F0F0F0]">
                  <td className="py-3.5 font-semibold text-xs text-[#111111] flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                    <span>{acc.name}</span>
                  </td>
                  <td className="py-3.5 text-xs text-[#666666]">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F4F5] text-[#111111] border border-[#E5E5E5]">
                      {acc.tier}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-mono text-xs text-[#666666]">
                    {acc.dealsCount || 1}
                  </td>
                  <td suppressHydrationWarning className="py-3.5 text-right font-mono text-xs text-[#666666]">
                    ₹{formatNumber(acc.totalBilled || acc.totalPaid)}
                  </td>
                  <td suppressHydrationWarning className="py-3.5 text-right font-mono font-bold text-xs text-[#16A34A]">
                    ₹{formatNumber(acc.totalPaid)}
                  </td>
                  <td className="py-3.5 text-right pr-4 font-mono font-semibold text-xs text-[#111111]">
                    {sharePct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
