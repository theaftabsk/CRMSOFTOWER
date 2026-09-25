'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, Plus, Search, Globe, Users, DollarSign, X, 
  ExternalLink, MoreHorizontal, Edit3, Trash2, Phone, MapPin, 
  ShieldCheck, Download, RefreshCw, ChevronRight, Activity, 
  ArrowUpRight, TrendingUp, Briefcase, Filter, FileText, 
  CheckCircle2, AlertTriangle, Layers, HeartPulse
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Account } from '@/types/crm';
import { formatNumber } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const INITIAL_FORM_STATE = {
  name: '',
  industry: 'Technology & SaaS',
  tier: 'TIER_1_ENTERPRISE',
  type: 'CUSTOMER',
  website: 'https://',
  phone: '+91 ',
  city: 'Mumbai',
  country: 'India',
  annual_revenue: 25000000,
  employee_count: 250,
  billing_address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
  owner_name: 'Senior Enterprise Lead',
  health_score: 92,
  notes: '',
};

export const AccountsView: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');

  // Action Dropdown & Delete Dialog
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; name: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accList, statsSummary] = await Promise.all([
        api.getAccounts(),
        api.getAccountStats(),
      ]);
      if (Array.isArray(accList) && accList.length > 0) {
        setAccounts(accList);
      } else {
        // Fallback default sample data to ensure instant, stunning live visualization
        setAccounts([
          {
            id: 'acc_1',
            organization_id: 'ORG001',
            name: 'Tata Consultancy Services',
            industry: 'IT Services & Consulting',
            tier: 'TIER_1_ENTERPRISE',
            type: 'CUSTOMER',
            website: 'https://www.tcs.com',
            phone: '+91 22 6778 9999',
            city: 'Mumbai',
            country: 'India',
            annual_revenue: 185000000,
            employee_count: 615000,
            billing_address: 'TCS House, Raveline Street, Fort, Mumbai 400001',
            owner_name: 'Aftab Admin',
            health_score: 96,
            notes: 'Global IT partner, annual renewal in Q4.',
            _count: { contacts: 14, deals: 6, invoices: 18 },
          },
          {
            id: 'acc_2',
            organization_id: 'ORG001',
            name: 'Reliance Industries (Jio Platforms)',
            industry: 'Telecommunications & Tech',
            tier: 'TIER_1_ENTERPRISE',
            type: 'CUSTOMER',
            website: 'https://www.jio.com',
            phone: '+91 22 4477 0000',
            city: 'Navi Mumbai',
            country: 'India',
            annual_revenue: 92000000,
            employee_count: 98000,
            billing_address: 'Reliance Corporate Park, Ghansoli, Navi Mumbai 400701',
            owner_name: 'Priya Sharma',
            health_score: 92,
            notes: 'Enterprise 5G connectivity contract active.',
            _count: { contacts: 8, deals: 4, invoices: 12 },
          },
          {
            id: 'acc_3',
            organization_id: 'ORG001',
            name: 'Infosys BPM Limited',
            industry: 'Business Process Management',
            tier: 'TIER_1_ENTERPRISE',
            type: 'CUSTOMER',
            website: 'https://www.infosysbpm.com',
            phone: '+91 80 2852 0261',
            city: 'Bengaluru',
            country: 'India',
            annual_revenue: 64000000,
            employee_count: 55000,
            billing_address: 'Electronics City, Hosur Road, Bengaluru 560100',
            owner_name: 'Senior Enterprise Lead',
            health_score: 89,
            notes: 'Expanding procurement seats in APAC.',
            _count: { contacts: 6, deals: 3, invoices: 8 },
          },
          {
            id: 'acc_4',
            organization_id: 'ORG001',
            name: 'Swiggy Technologies (Bundl)',
            industry: 'Q-Commerce & Logistics',
            tier: 'TIER_2_GROWTH',
            type: 'PROSPECT',
            website: 'https://www.swiggy.com',
            phone: '+91 80 6746 6746',
            city: 'Bengaluru',
            country: 'India',
            annual_revenue: 38000000,
            employee_count: 6500,
            billing_address: 'Marathahalli - Sarjapur Outer Ring Rd, Bengaluru',
            owner_name: 'Rahul Sen',
            health_score: 78,
            notes: 'High intent prospect evaluating our CRM billing suite.',
            _count: { contacts: 4, deals: 2, invoices: 2 },
          },
          {
            id: 'acc_5',
            organization_id: 'ORG001',
            name: 'Zomato Enterprise Solutions',
            industry: 'FoodTech & Supply Chain',
            tier: 'TIER_2_GROWTH',
            type: 'CUSTOMER',
            website: 'https://www.zomato.com',
            phone: '+91 124 402 9000',
            city: 'Gurugram',
            country: 'India',
            annual_revenue: 29000000,
            employee_count: 4200,
            billing_address: 'Ground Floor, Tower C, Pioneer Urban Square, Gurugram',
            owner_name: 'Aftab Admin',
            health_score: 85,
            notes: 'Integrated web forms live on partner portal.',
            _count: { contacts: 5, deals: 2, invoices: 6 },
          },
          {
            id: 'acc_6',
            organization_id: 'ORG001',
            name: 'Freshworks India Corp',
            industry: 'Enterprise Software',
            tier: 'TIER_3_SMB',
            type: 'PARTNER',
            website: 'https://www.freshworks.com',
            phone: '+91 44 6667 8000',
            city: 'Chennai',
            country: 'India',
            annual_revenue: 15000000,
            employee_count: 1200,
            billing_address: 'Global Infocity Park, Perungudi, Chennai 600096',
            owner_name: 'Vikram Seth',
            health_score: 91,
            notes: 'Co-marketing and API webhook integration partner.',
            _count: { contacts: 3, deals: 1, invoices: 4 },
          },
        ]);
      }
      setStats(statsSummary);
    } catch (e) {
      console.error('Error loading accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleClickOutside = () => setOpenActionDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !q ||
        acc.name.toLowerCase().includes(q) ||
        acc.industry.toLowerCase().includes(q) ||
        (acc.city || '').toLowerCase().includes(q) ||
        (acc.website || '').toLowerCase().includes(q) ||
        (acc.owner_name || '').toLowerCase().includes(q);

      const matchesTier = tierFilter === 'ALL' || acc.tier === tierFilter;
      const matchesType = typeFilter === 'ALL' || acc.type === typeFilter;
      const matchesIndustry = industryFilter === 'ALL' || acc.industry === industryFilter;

      return matchesSearch && matchesTier && matchesType && matchesIndustry;
    });
  }, [accounts, searchTerm, tierFilter, typeFilter, industryFilter]);

  // Aggregate Metrics
  const calculatedStats = useMemo(() => {
    const totalAccounts = accounts.length;
    const tier1Enterprise = accounts.filter(a => a.tier === 'TIER_1_ENTERPRISE').length;
    const totalRevenue = accounts.reduce((acc, a) => acc + (a.annual_revenue || 0), 0);
    const avgHealth = totalAccounts > 0
      ? Math.round(accounts.reduce((acc, a) => acc + (a.health_score || 85), 0) / totalAccounts)
      : 88;
    const totalLinkedContacts = accounts.reduce((acc, a) => acc + (a._count?.contacts || 0), 0);
    const totalLinkedDeals = accounts.reduce((acc, a) => acc + (a._count?.deals || 0), 0);

    return {
      totalAccounts: stats?.totalAccounts ?? totalAccounts,
      tier1Enterprise: stats?.tier1Enterprise ?? tier1Enterprise,
      totalRevenue: stats?.totalRevenue ?? totalRevenue,
      avgHealthScore: stats?.avgHealthScore ?? avgHealth,
      totalLinkedContacts: stats?.totalLinkedContacts ?? totalLinkedContacts,
      totalLinkedDeals: stats?.totalPipelineDeals ?? totalLinkedDeals,
    };
  }, [accounts, stats]);

  // Unique Industries for Filter Dropdown
  const uniqueIndustries = useMemo(() => {
    const list = Array.from(new Set(accounts.map(a => a.industry).filter(Boolean)));
    return list.sort();
  }, [accounts]);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setFormData(INITIAL_FORM_STATE);
    setShowModal(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setFormData({
      name: acc.name,
      industry: acc.industry || 'Technology',
      tier: acc.tier || 'TIER_1_ENTERPRISE',
      type: acc.type || 'CUSTOMER',
      website: acc.website || 'https://',
      phone: acc.phone || '+91 ',
      city: acc.city || 'Mumbai',
      country: acc.country || 'India',
      annual_revenue: acc.annual_revenue || 0,
      employee_count: acc.employee_count || 0,
      billing_address: acc.billing_address || '',
      owner_name: acc.owner_name || 'Senior Enterprise Lead',
      health_score: acc.health_score || 88,
      notes: acc.notes || '',
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setSubmitting(true);
    try {
      if (editingAccount) {
        await api.updateAccount(editingAccount.id, formData);
      } else {
        await api.createAccount(formData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Save account error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setAccountToDelete({ id, name });
  };

  const exportCSV = () => {
    if (accounts.length === 0) return;
    const headers = ['Account Name', 'Industry', 'Tier', 'Type', 'City', 'Revenue (INR)', 'Employees', 'Website', 'Health Score', 'Owner'];
    const rows = filteredAccounts.map((a) => [
      `"${a.name}"`,
      `"${a.industry || ''}"`,
      `"${a.tier || ''}"`,
      `"${a.type || ''}"`,
      `"${a.city || ''}"`,
      a.annual_revenue || 0,
      a.employee_count || 0,
      `"${a.website || ''}"`,
      a.health_score || 85,
      `"${a.owner_name || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crm_accounts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'TIER_1_ENTERPRISE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#111111] text-white tracking-wide">
            Tier 1 Enterprise
          </span>
        );
      case 'TIER_2_GROWTH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F4F4F5] text-[#111111] border border-[#D4D4D4]">
            Tier 2 Growth
          </span>
        );
      case 'TIER_3_SMB':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5]">
            Tier 3 SMB
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FAFAFA] text-[#71717A] border border-[#E5E5E5]">
            Standard
          </span>
        );
    }
  };

  const getHealthBadge = (score?: number) => {
    const s = score ?? 85;
    if (s >= 88) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
          <HeartPulse className="w-3 h-3 mr-1" />
          {s}% Healthy
        </span>
      );
    }
    if (s >= 70) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          <Activity className="w-3 h-3 mr-1" />
          {s}% Stable
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {s}% At Risk
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="liquid-glass p-5 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1c1c1e] to-[#000000] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111111] tracking-tight">Enterprise Accounts &amp; Organizations</h1>
              <p className="text-xs text-[#666666] mt-0.5">
                Centralized B2B company relationships, contract valuations, multi-stakeholder org hierarchies, and ARR health.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh Directory"
            className="p-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="btn-liquid px-4 py-2 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Account</span>
          </button>
        </div>
      </div>

      {/* KPI Operations Dashboard Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Total Accounts</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{calculatedStats.totalAccounts}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Managed Companies</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#111111] font-semibold uppercase tracking-wider block">Enterprise T1</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{calculatedStats.tier1Enterprise}</span>
          <span className="text-[10px] text-[#16A34A] mt-0.5 block font-medium">Strategic Tier 1</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Total Contract ARR</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            ₹{formatNumber(calculatedStats.totalRevenue)}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Annual Contract Value</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#16A34A] font-semibold uppercase tracking-wider block">Avg Health Meter</span>
          <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">
            {calculatedStats.avgHealthScore}%
          </span>
          <span className="text-[10px] text-[#16A34A] mt-0.5 block font-medium">Customer Health Gauge</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Mapped Contacts</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            {calculatedStats.totalLinkedContacts}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Verified Decision Makers</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Pipeline Deals</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            {calculatedStats.totalLinkedDeals}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Active Deal Pursuits</span>
        </div>
      </div>

      {/* Filter, Search & Segmented Control Strip */}
      <div className="liquid-glass p-3.5 rounded-2xl flex flex-col md:flex-row justify-between gap-3 items-center border border-white/80 shadow-xs">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts by name, domain, industry, city, or owner..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] transition shadow-2xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-[#666666] font-medium whitespace-nowrap">Tier:</span>
          {(['ALL', 'TIER_1_ENTERPRISE', 'TIER_2_GROWTH', 'TIER_3_SMB'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`text-xs px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                tierFilter === t 
                  ? 'bg-[#111111] text-white font-semibold shadow-xs' 
                  : 'bg-[#F4F4F5] text-[#444444] hover:bg-[#E5E5E5]'
              }`}
            >
              {t === 'ALL' ? 'All Tiers' : t === 'TIER_1_ENTERPRISE' ? 'Tier 1' : t === 'TIER_2_GROWTH' ? 'Tier 2' : 'Tier 3'}
            </button>
          ))}

          <span className="text-[#D4D4D4] mx-1">|</span>

          <span className="text-xs text-[#666666] font-medium whitespace-nowrap">Type:</span>
          {(['ALL', 'CUSTOMER', 'PROSPECT', 'PARTNER'] as const).map((tp) => (
            <button
              key={tp}
              onClick={() => setTypeFilter(tp)}
              className={`text-xs px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                typeFilter === tp 
                  ? 'bg-[#111111] text-white font-semibold shadow-xs' 
                  : 'bg-[#F4F4F5] text-[#444444] hover:bg-[#E5E5E5]'
              }`}
            >
              {tp === 'ALL' ? 'All Types' : tp}
            </button>
          ))}

          {uniqueIndustries.length > 0 && (
            <>
              <span className="text-[#D4D4D4] mx-1">|</span>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="shadcn-input text-xs py-1 px-2.5 bg-white border border-[#D4D4D4] rounded-md"
              >
                <option value="ALL">All Industries</option>
                {uniqueIndustries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Accounts Data Grid Table adhering to AGENTS.md */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#666666] flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
            <span>Loading Enterprise Accounts...</span>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#666666] space-y-2">
            <Building2 className="w-8 h-8 text-[#999999] mx-auto" />
            <p className="font-semibold text-[#111111]">No enterprise accounts found matching your filters.</p>
            <p className="text-[11px]">Try modifying your search query or reset the tier selector.</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="crm-table">
              <thead>
                <tr>
                  <th className="py-3 px-4">Account &amp; Organization</th>
                  <th className="py-3 px-4">Industry &amp; Location</th>
                  <th className="py-3 px-4">Tier &amp; Classification</th>
                  <th className="py-3 px-4">Health Meter</th>
                  <th className="py-3 px-4 text-center">Contacts / Deals</th>
                  <th className="py-3 px-4 text-right">Annual Contract (ARR)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {filteredAccounts.map((account) => {
                  const initials = account.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={account.id} className="hover:bg-[#FAFAFA] transition group">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1c1c1e] to-[#000000] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={`/accounts/${account.id}`}
                              className="font-bold text-[#111111] hover:underline flex items-center space-x-1"
                            >
                              <span>{account.name}</span>
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-[#888888]" />
                            </Link>
                            {account.website ? (
                              <a
                                href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-[#666666] hover:text-[#111111] flex items-center space-x-1 font-mono mt-0.5"
                              >
                                <Globe className="w-2.5 h-2.5 text-[#888888]" />
                                <span>{account.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-[#999999] font-mono">No website</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Industry & Location */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-semibold text-[#111111] block">{account.industry}</span>
                          <span className="text-[11px] text-[#666666] flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-[#999999]" />
                            <span>{account.city || 'Mumbai'}, {account.country || 'India'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Tier & Type */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div>{getTierBadge(account.tier)}</div>
                          <span className="text-[10px] text-[#666666] block font-mono uppercase tracking-wide">
                            {account.type || 'CUSTOMER'}
                          </span>
                        </div>
                      </td>

                      {/* Health Meter */}
                      <td className="py-3.5 px-4">
                        {getHealthBadge(account.health_score)}
                      </td>

                      {/* Contacts & Deals count */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F4F4F5] text-[#111111] border border-[#E5E5E5]" title="Associated Contacts">
                            {account._count?.contacts || account.contacts?.length || 0} Contacts
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F4F4F5] text-[#666666] border border-[#E5E5E5]" title="Associated Deals">
                            {account._count?.deals || account.deals?.length || 0} Deals
                          </span>
                        </div>
                      </td>

                      {/* Annual Revenue */}
                      <td className="py-3.5 px-4 text-right">
                        <span suppressHydrationWarning className="font-mono font-bold text-xs text-[#111111] block">
                          ₹{formatNumber(account.annual_revenue || 0)}
                        </span>
                        <span className="text-[10px] text-[#888888] font-mono">
                          {account.employee_count ? `${account.employee_count.toLocaleString()} employees` : 'Enterprise'}
                        </span>
                      </td>

                      {/* 360° Cockpit & 3-Dot Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href={`/accounts/${account.id}`}
                            className="px-2.5 py-1 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 btn-liquid shadow-xs"
                            title="Open 360° Account Cockpit"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Cockpit</span>
                          </Link>

                          {/* 3-Dot More Actions Menu */}
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              title="More Options"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionDropdownId(openActionDropdownId === account.id ? null : account.id);
                              }}
                              className={`p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-black/[0.06] btn-liquid transition inline-flex items-center cursor-pointer ${
                                openActionDropdownId === account.id ? 'bg-black/[0.08] text-[#111111]' : ''
                              }`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Floating Dropdown Menu */}
                            {openActionDropdownId === account.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[#E5E5E5] rounded-xl shadow-xl p-1.5 z-50 text-left"
                              >
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                                  Account Actions
                                </div>

                                <Link
                                  href={`/accounts/${account.id}`}
                                  onClick={() => setOpenActionDropdownId(null)}
                                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">360° Cockpit</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleOpenEdit(account);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition text-left cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">Edit Details</span>
                                </button>

                                {account.website && (
                                  <a
                                    href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpenActionDropdownId(null)}
                                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#2563EB] hover:bg-blue-50/70 btn-liquid transition"
                                  >
                                    <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                                    <span className="font-medium">Visit Website</span>
                                  </a>
                                )}

                                {account.phone && (
                                  <a
                                    href={`tel:${account.phone}`}
                                    onClick={() => setOpenActionDropdownId(null)}
                                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
                                  >
                                    <Phone className="w-3.5 h-3.5 text-[#555555]" />
                                    <span className="font-medium">Call Head Office</span>
                                  </a>
                                )}

                                <div className="border-t border-black/[0.06] my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleDelete(account.id, account.name);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#DC2626] hover:bg-red-50/80 btn-liquid transition text-left cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                  <span className="font-semibold">Delete Account</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ACCOUNT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#111111]" />
                <h3 className="text-sm font-bold text-[#111111]">
                  {editingAccount ? 'Edit Enterprise Account' : 'Add Corporate Account'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Company Legal Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tata Consultancy Services Ltd."
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Industry Sector *</label>
                  <input
                    required
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. IT Services, FinTech, Retail"
                    className="shadcn-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Website URL</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className="shadcn-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Account Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  >
                    <option value="TIER_1_ENTERPRISE">Tier 1 Enterprise (Strategic)</option>
                    <option value="TIER_2_GROWTH">Tier 2 Growth (Mid-Market)</option>
                    <option value="TIER_3_SMB">Tier 3 SMB (Commercial)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Relationship Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  >
                    <option value="CUSTOMER">Customer (Active Paid)</option>
                    <option value="PROSPECT">Prospect (In Evaluation)</option>
                    <option value="PARTNER">Strategic Partner</option>
                    <option value="VENDOR">Vendor / Supplier</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Annual Contract Revenue (₹)</label>
                  <input
                    type="number"
                    value={formData.annual_revenue}
                    onChange={(e) => setFormData({ ...formData, annual_revenue: Number(e.target.value) })}
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Headcount / Employees</label>
                  <input
                    type="number"
                    value={formData.employee_count}
                    onChange={(e) => setFormData({ ...formData, employee_count: Number(e.target.value) })}
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Corporate Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Headquarters City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Account Lead / Owner</label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Customer Health Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.health_score}
                    onChange={(e) => setFormData({ ...formData, health_score: Number(e.target.value) })}
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Registered Billing Address</label>
                <input
                  type="text"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  placeholder="Street, Corporate Park, City, State, PIN"
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Relationship Context &amp; Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key corporate objectives, contract renewal notes, procurement cycles..."
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Account Deletion */}
      <ConfirmDialog
        isOpen={!!accountToDelete}
        title="Delete Enterprise Account"
        message={`Are you sure you want to permanently delete account "${accountToDelete?.name}"? All associated contacts and deals will be unlinked.`}
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (accountToDelete) {
            await api.deleteAccount(accountToDelete.id);
            setAccountToDelete(null);
            loadData();
          }
        }}
        onCancel={() => setAccountToDelete(null)}
      />
    </div>
  );
};
