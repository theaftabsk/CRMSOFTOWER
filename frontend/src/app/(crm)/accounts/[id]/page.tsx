'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, ArrowLeft, Globe, Phone, MapPin, Users, DollarSign, 
  Calendar, Clock, Plus, Trash2, Edit3, ShieldCheck, HeartPulse, 
  Activity, AlertTriangle, ExternalLink, RefreshCw, Mail, MessageSquare, 
  Briefcase, FileText, ChevronRight, Award, CheckCircle2, X, TrendingUp,
  Receipt, Layers, Check, Download
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Account, Contact, Deal } from '@/types/crm';
import { formatNumber } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function Account360CockpitPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'contacts' | 'financials' | 'touchpoints'>('overview');

  // Modals & Confirmation States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showAddTouchpointModal, setShowAddTouchpointModal] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Add Contact Form State
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'Vice President of Procurement',
    department: 'EXECUTIVE',
    buying_role: 'DECISION_MAKER',
    city: 'Mumbai',
  });
  const [savingContact, setSavingContact] = useState(false);

  // Add Deal Form State
  const [newDeal, setNewDeal] = useState({
    title: '',
    value: 2500000,
    stage: 'Qualification',
    probability: 60,
    closing_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    owner: 'Senior Account Executive',
  });
  const [savingDeal, setSavingDeal] = useState(false);

  // Add Touchpoint Form State
  const [touchpoint, setTouchpoint] = useState({
    type: 'MEETING',
    title: '',
    notes: '',
  });
  const [touchpoints, setTouchpoints] = useState<any[]>([
    {
      id: 'tp_1',
      type: 'MEETING',
      title: 'Executive Sponsor Review & Annual Roadmap',
      notes: 'Reviewed Q3 platform telemetry, discussed expansion to 500 enterprise seats across India and APAC.',
      date: '2026-09-22T11:00:00Z',
      author: 'Aftab Admin',
    },
    {
      id: 'tp_2',
      type: 'CALL',
      title: 'Procurement Security & SOC2 Review Call',
      notes: 'Addressed infosec checklist with head of compliance. Sent updated DPA and SLA agreements.',
      date: '2026-09-15T15:30:00Z',
      author: 'Senior Account Executive',
    },
    {
      id: 'tp_3',
      type: 'EMAIL',
      title: 'Q4 Contract Renewal Quote Dispatched',
      notes: 'Sent enterprise proposal covering 3-year term with 15% committed ARR volume discount.',
      date: '2026-09-08T09:15:00Z',
      author: 'Finance Team',
    },
  ]);

  const loadAccount = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const data = await api.getAccount(accountId);
      if (data && data.name) {
        setAccount(data);
        setEditFormData(data);
      } else {
        // Fallback demo account for ACC001 or missing IDs
        const demoAccount: Account = {
          id: accountId || 'acc_tata',
          organization_id: 'ORG001',
          name: accountId === 'ACC001' ? 'Tata Motors Enterprise (EV Division)' : 'Enterprise Corporation Ltd',
          industry: 'Automotive & Clean Mobility',
          tier: 'TIER_1_ENTERPRISE',
          type: 'CUSTOMER',
          website: 'https://www.tatamotors.com',
          phone: '+91 22 6665 8282',
          city: 'Mumbai',
          country: 'India',
          annual_revenue: 85000000,
          employee_count: 52000,
          billing_address: 'Bombay House, 24 Homi Mody Street, Fort, Mumbai 400001',
          owner_name: 'Aftab Admin',
          health_score: 95,
          notes: 'Flagship automotive account. Evaluating enterprise CRM billing engine for commercial fleet dealers across 28 states.',
          created_date: '2026-01-15T10:00:00Z',
          contacts: [
            {
              id: 'con_1',
              organization_id: 'ORG001',
              account_id: accountId,
              name: 'Rajesh Varma',
              designation: 'Chief Information Officer (CIO)',
              department: 'EXECUTIVE',
              buying_role: 'DECISION_MAKER',
              email: 'rajesh.varma@tatamotors.com',
              phone: '+91 98201 12345',
              city: 'Mumbai',
              status: 'Active',
            },
            {
              id: 'con_2',
              organization_id: 'ORG001',
              account_id: accountId,
              name: 'Ananya Deshmukh',
              designation: 'Head of Fleet Procurement',
              department: 'FINANCE',
              buying_role: 'ECONOMIC_BUYER',
              email: 'ananya.d@tatamotors.com',
              phone: '+91 98202 54321',
              city: 'Pune',
              status: 'Active',
            },
            {
              id: 'con_3',
              organization_id: 'ORG001',
              account_id: accountId,
              name: 'Karan Mehra',
              designation: 'Principal Solutions Architect',
              department: 'ENGINEERING',
              buying_role: 'CHAMPION',
              email: 'karan.mehra@tatamotors.com',
              phone: '+91 98203 98765',
              city: 'Mumbai',
              status: 'Active',
            },
          ],
          deals: [
            {
              id: 'deal_1',
              organization_id: 'ORG001',
              account_id: accountId,
              account_name: 'Tata Motors Enterprise',
              title: 'EV Fleet Telematics & Dealer Billing Engine',
              stage: 'Negotiation',
              value: 4800000,
              probability: 85,
              closing_date: '2026-10-15',
              owner: 'Aftab Admin',
              pipeline_name: 'Enterprise Strategic Pipeline',
              created_date: '2026-08-01T00:00:00Z',
            },
            {
              id: 'deal_2',
              organization_id: 'ORG001',
              account_id: accountId,
              account_name: 'Tata Motors Enterprise',
              title: 'Pan-India Service Center CRM Rollout',
              stage: 'Proposal Sent',
              value: 3200000,
              probability: 65,
              closing_date: '2026-11-30',
              owner: 'Priya Sharma',
              pipeline_name: 'Enterprise Strategic Pipeline',
              created_date: '2026-08-20T00:00:00Z',
            },
            {
              id: 'deal_3',
              organization_id: 'ORG001',
              account_id: accountId,
              account_name: 'Tata Motors Enterprise',
              title: 'Dealer Partner Portal Integration Phase 1',
              stage: 'Closed Won',
              value: 2500000,
              probability: 100,
              closing_date: '2026-04-10',
              owner: 'Aftab Admin',
              pipeline_name: 'Enterprise Strategic Pipeline',
              created_date: '2026-02-15T00:00:00Z',
            },
          ],
          invoices: [
            {
              id: 'inv_101',
              invoice_number: 'INV-2026-0042',
              amount: 2500000,
              status: 'PAID',
              issue_date: '2026-04-15',
              due_date: '2026-05-15',
            },
            {
              id: 'inv_102',
              invoice_number: 'INV-2026-0098',
              amount: 625000,
              status: 'PENDING',
              issue_date: '2026-09-01',
              due_date: '2026-10-01',
            },
          ],
        };
        setAccount(demoAccount);
        setEditFormData(demoAccount);
      }
    } catch (err) {
      console.error('Error loading account:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, [accountId]);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setSavingEdit(true);
    try {
      await api.updateAccount(account.id, editFormData);
      setShowEditModal(false);
      loadAccount();
    } catch (err) {
      console.error('Update account error:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email || !account) return;
    setSavingContact(true);
    try {
      await api.createContact({
        ...newContact,
        company: account.name,
        account_id: account.id,
      });
      setShowAddContactModal(false);
      setNewContact({
        name: '',
        email: '',
        phone: '',
        designation: 'Vice President of Procurement',
        department: 'EXECUTIVE',
        buying_role: 'DECISION_MAKER',
        city: account.city || 'Mumbai',
      });
      loadAccount();
    } catch (err) {
      console.error('Error creating contact:', err);
    } finally {
      setSavingContact(false);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.title || !account) return;
    setSavingDeal(true);
    try {
      await api.createDeal({
        ...newDeal,
        account_name: account.name,
        account_id: account.id,
      });
      setShowAddDealModal(false);
      setNewDeal({
        title: '',
        value: 2500000,
        stage: 'Qualification',
        probability: 60,
        closing_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        owner: account.owner_name || 'Senior Account Executive',
      });
      loadAccount();
    } catch (err) {
      console.error('Error creating deal:', err);
    } finally {
      setSavingDeal(false);
    }
  };

  const handleAddTouchpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!touchpoint.title) return;
    const newEntry = {
      id: `tp_${Date.now()}`,
      type: touchpoint.type,
      title: touchpoint.title,
      notes: touchpoint.notes,
      date: new Date().toISOString(),
      author: 'Current User',
    };
    setTouchpoints([newEntry, ...touchpoints]);
    setTouchpoint({ type: 'MEETING', title: '', notes: '' });
    setShowAddTouchpointModal(false);
  };

  const handleDeleteAccount = async () => {
    if (!account) return;
    await api.deleteAccount(account.id);
    router.push('/accounts');
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-[#666666] flex items-center justify-center space-x-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
        <span>Loading Account 360° Cockpit...</span>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-16 text-center text-xs text-[#666666] space-y-3">
        <Building2 className="w-10 h-10 text-[#999999] mx-auto" />
        <p className="font-semibold text-sm text-[#111111]">Account Not Found</p>
        <p className="text-[11px]">The requested account identifier does not exist or has been archived.</p>
        <Link
          href="/accounts"
          className="inline-flex items-center px-4 py-2 bg-[#111111] text-white rounded-lg font-semibold text-xs mt-2"
        >
          Return to Accounts Directory
        </Link>
      </div>
    );
  }

  const initials = account.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const activeDeals = account.deals || [];
  const totalPipelineVal = activeDeals
    .filter((d) => d.stage !== 'Closed Lost')
    .reduce((acc, d) => acc + (d.value || 0), 0);

  const contactsList = account.contacts || [];
  const invoicesList = account.invoices || [];
  const paidRevenue = invoicesList
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, inv) => acc + (inv.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/accounts"
          className="inline-flex items-center space-x-1.5 text-xs text-[#666666] hover:text-[#111111] transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Accounts Directory</span>
        </Link>

        <span className="text-[11px] text-[#888888] font-mono">
          Organization ID: {account.id}
        </span>
      </div>

      {/* Hero Header Cockpit Card */}
      <div className="liquid-glass p-6 rounded-2xl border border-white/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1c1c1e] to-[#000000] text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[#111111] tracking-tight">{account.name}</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#111111] text-white">
                  {account.tier === 'TIER_1_ENTERPRISE' ? 'Tier 1 Enterprise' : account.tier === 'TIER_2_GROWTH' ? 'Tier 2 Growth' : 'Tier 3 SMB'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-[#F4F4F5] text-[#111111] border border-[#D4D4D4]">
                  {account.type || 'CUSTOMER'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                  <HeartPulse className="w-3 h-3 mr-1" />
                  {account.health_score || 95}% Customer Health
                </span>
              </div>

              {/* Quick Meta Chips */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#666666]">
                <span className="font-medium text-[#111111]">{account.industry}</span>
                <span className="text-[#D4D4D4]">&bull;</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#888888]" />
                  <span>{account.city || 'Mumbai'}, {account.country || 'India'}</span>
                </span>
                {account.website && (
                  <>
                    <span className="text-[#D4D4D4]">&bull;</span>
                    <a
                      href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:underline flex items-center space-x-1 font-mono text-[11px]"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{account.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  </>
                )}
                {account.phone && (
                  <>
                    <span className="text-[#D4D4D4]">&bull;</span>
                    <a href={`tel:${account.phone}`} className="flex items-center space-x-1 font-mono text-[11px] text-[#444444] hover:text-[#111111]">
                      <Phone className="w-3 h-3 text-[#888888]" />
                      <span>{account.phone}</span>
                    </a>
                  </>
                )}
                <span className="text-[#D4D4D4]">&bull;</span>
                <span className="text-[11px] text-[#888888]">Lead: <strong className="text-[#111111]">{account.owner_name || 'Senior Enterprise Lead'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Dock */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddDealModal(true)}
              className="btn-liquid px-3.5 py-2 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Deal</span>
            </button>

            <button
              onClick={() => setShowAddContactModal(true)}
              className="px-3.5 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-[#555555]" />
              <span>+ Add Stakeholder</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs transition cursor-pointer shadow-2xs"
              title="Edit Account Details"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 bg-white border border-[#D4D4D4] hover:bg-red-50 text-[#DC2626] rounded-lg text-xs transition cursor-pointer shadow-2xs"
              title="Delete Account"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notes preview */}
        {account.notes && (
          <div className="bg-black/[0.02] border border-black/[0.05] p-3 rounded-xl text-xs text-[#555555] leading-relaxed">
            <strong className="text-[#111111]">Strategic Context: </strong>
            {account.notes}
          </div>
        )}
      </div>

      {/* KPI Intelligence Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Annual Contract (ARR)</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            ₹{formatNumber(account.annual_revenue || 0)}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Recurring Contract Revenue</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#111111] font-semibold uppercase tracking-wider block">In-Flight Pipeline</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            ₹{formatNumber(totalPipelineVal)}
          </span>
          <span className="text-[10px] text-[#16A34A] mt-0.5 block font-medium">{activeDeals.length} Active Deals</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Buying Committee</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{contactsList.length}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Mapped Human Profiles</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#16A34A] font-semibold uppercase tracking-wider block">Lifetime Collected</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">
            ₹{formatNumber(paidRevenue || 2500000)}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Completed Invoice Settlements</span>
        </div>
      </div>

      {/* Cockpit Workspace Navigation Tabs */}
      <div className="border-b border-[#E5E5E5] flex space-x-6 text-xs font-semibold">
        {[
          { key: 'overview', label: '360° Intelligence' },
          { key: 'deals', label: `Pipeline Deals (${activeDeals.length})` },
          { key: 'contacts', label: `Stakeholders & Org (${contactsList.length})` },
          { key: 'financials', label: `Financials & Invoices (${invoicesList.length})` },
          { key: 'touchpoints', label: `Timeline Touchpoints (${touchpoints.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 transition relative cursor-pointer ${
              activeTab === tab.key
                ? 'text-[#111111] font-bold border-b-2 border-[#111111]'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 360° Intelligence & Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Corporate Profile Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#111111] flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#111111]" />
                <span>Corporate Structure &amp; Entity Profile</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#888888] block text-[11px]">Legal Entity</span>
                  <span className="font-semibold text-[#111111] block mt-0.5">{account.name}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px]">Industry Sector</span>
                  <span className="font-semibold text-[#111111] block mt-0.5">{account.industry}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px]">Headcount / Scale</span>
                  <span className="font-semibold text-[#111111] block mt-0.5">
                    {account.employee_count ? `${account.employee_count.toLocaleString()} employees` : 'Enterprise'}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px]">Corporate Phone</span>
                  <span className="font-mono font-medium text-[#111111] block mt-0.5">{account.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px]">Website Domain</span>
                  <span className="font-mono text-[#2563EB] block mt-0.5">{account.website || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px]">Account Owner</span>
                  <span className="font-semibold text-[#111111] block mt-0.5">{account.owner_name || 'Senior Enterprise Lead'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5]">
                <span className="text-[#888888] block text-[11px]">Registered Headquarters &amp; Billing Address</span>
                <span className="text-xs text-[#333333] font-medium block mt-0.5">
                  {account.billing_address || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Buying Committee Hierarchy Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#111111] flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#111111]" />
                  <span>Buying Committee Mapping</span>
                </h3>
                <button
                  onClick={() => setShowAddContactModal(true)}
                  className="text-xs text-[#111111] hover:underline font-semibold cursor-pointer"
                >
                  + Add Stakeholder
                </button>
              </div>

              {contactsList.length === 0 ? (
                <p className="text-xs text-[#666666] py-3">No contacts mapped yet to this organization.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {contactsList.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                      <div>
                        <Link href={`/contacts/${c.id}`} className="font-semibold text-xs text-[#111111] hover:underline block">
                          {c.name}
                        </Link>
                        <span className="text-[11px] text-[#666666] block">{c.designation || 'Stakeholder'}</span>
                        <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#111111] text-white">
                          {c.buying_role || 'DECISION_MAKER'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-[#16A34A] transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`mailto:${c.email}`}
                          className="p-1.5 rounded-md hover:bg-white text-[#666666] hover:text-[#111111] transition"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Rail: Health Meter & Telemetry */}
          <div className="space-y-5">
            <div className="liquid-glass-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#111111] flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-[#16A34A]" />
                <span>Customer Health Gauge</span>
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold font-mono text-[#111111]">{account.health_score || 95}%</span>
                  <span className="text-[10px] text-[#16A34A] font-semibold block mt-0.5">EXCELLENT RETENTION PROBABILITY</span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-[#16A34A] flex items-center justify-center font-bold text-xs font-mono text-[#16A34A]">
                  95
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#666666]">Product &amp; Workflow Adoption</span>
                    <span className="font-mono font-semibold text-[#111111]">98%</span>
                  </div>
                  <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#111111] h-full rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#666666]">Invoice Settlement Velocity</span>
                    <span className="font-mono font-semibold text-[#111111]">92%</span>
                  </div>
                  <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#16A34A] h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#666666]">Stakeholder Engagement</span>
                    <span className="font-mono font-semibold text-[#111111]">94%</span>
                  </div>
                  <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#111111] h-full rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.05] text-[11px] text-[#666666]">
                Renewal target projected for <strong>Q4 2026</strong>. Zero open escalations in the last 90 days.
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider block">
                Quick Operations
              </span>
              <button
                onClick={() => setShowAddDealModal(true)}
                className="w-full py-2 px-3 text-left rounded-lg text-xs font-semibold text-[#111111] hover:bg-[#F4F4F5] transition flex items-center justify-between cursor-pointer"
              >
                <span>Launch New Deal Pursuit</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#888888]" />
              </button>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="w-full py-2 px-3 text-left rounded-lg text-xs font-semibold text-[#111111] hover:bg-[#F4F4F5] transition flex items-center justify-between cursor-pointer"
              >
                <span>Add Key Decision Maker</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#888888]" />
              </button>
              <button
                onClick={() => setShowAddTouchpointModal(true)}
                className="w-full py-2 px-3 text-left rounded-lg text-xs font-semibold text-[#111111] hover:bg-[#F4F4F5] transition flex items-center justify-between cursor-pointer"
              >
                <span>Log Executive Touchpoint</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#888888]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Pipeline Deals */}
      {activeTab === 'deals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#111111]">Associated Commercial Deals</h3>
              <p className="text-xs text-[#666666]">All active pipeline pursuits, proposals, and won contracts.</p>
            </div>
            <button
              onClick={() => setShowAddDealModal(true)}
              className="btn-liquid px-3.5 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Deal</span>
            </button>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  <th className="py-3 px-4">Deal Title</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Probability</th>
                  <th className="py-3 px-4 text-right">Value (INR)</th>
                  <th className="py-3 px-4">Target Close</th>
                  <th className="py-3 px-4">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {activeDeals.map((d) => (
                  <tr key={d.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3.5 px-4 font-semibold text-[#111111]">
                      {d.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.stage === 'Closed Won'
                          ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                          : d.stage === 'Negotiation'
                          ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                          : 'bg-[#F4F4F5] text-[#111111] border border-[#E5E5E5]'
                      }`}>
                        {d.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {d.probability}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111111]">
                      ₹{formatNumber(d.value)}
                    </td>
                    <td className="py-3.5 px-4 text-[#666666] font-mono text-[11px]">
                      {d.closing_date}
                    </td>
                    <td className="py-3.5 px-4 text-[#555555]">
                      {d.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Stakeholders & Contacts */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#111111]">Corporate Stakeholders &amp; Human Contacts</h3>
              <p className="text-xs text-[#666666]">Direct contacts mapped to {account.name}.</p>
            </div>
            <button
              onClick={() => setShowAddContactModal(true)}
              className="btn-liquid px-3.5 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Stakeholder</span>
            </button>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  <th className="py-3 px-4">Stakeholder</th>
                  <th className="py-3 px-4">Role &amp; Title</th>
                  <th className="py-3 px-4">Buying Authority</th>
                  <th className="py-3 px-4">Channels</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {contactsList.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3.5 px-4">
                      <Link href={`/contacts/${c.id}`} className="font-bold text-[#111111] hover:underline block">
                        {c.name}
                      </Link>
                      <span className="text-[11px] text-[#666666] font-mono">{c.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#111111] block">{c.designation || 'Stakeholder'}</span>
                      <span className="text-[10px] text-[#888888] font-mono uppercase">{c.department || 'EXECUTIVE'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#111111] text-white">
                        {c.buying_role || 'DECISION_MAKER'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded border border-[#E5E5E5] hover:bg-emerald-50 text-[#16A34A] transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`mailto:${c.email}`}
                          className="p-1 rounded border border-[#E5E5E5] hover:bg-white text-[#666666] hover:text-[#111111] transition"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#666666]">
                      {c.city || 'Mumbai'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="px-2.5 py-1 bg-[#F4F4F5] hover:bg-[#E5E5E5] text-[#111111] rounded-md text-xs font-semibold inline-flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Cockpit</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Financials & Invoices */}
      {activeTab === 'financials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#111111]">Invoices &amp; Revenue Ledger</h3>
              <p className="text-xs text-[#666666]">Financial settlements and issued billing statements.</p>
            </div>
            <Link
              href="/invoices"
              className="btn-liquid px-3.5 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Generate Invoice</span>
            </Link>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {invoicesList.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#111111]">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                          : 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#666666] text-[11px]">
                      {inv.issue_date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#666666] text-[11px]">
                      {inv.due_date}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111111]">
                      ₹{formatNumber(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/invoices`}
                        className="px-2.5 py-1 bg-[#F4F4F5] hover:bg-[#E5E5E5] text-[#111111] rounded-md text-xs font-semibold inline-flex items-center space-x-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Touchpoints & Timeline */}
      {activeTab === 'touchpoints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#111111]">Executive Touchpoints &amp; Activity Stream</h3>
              <p className="text-xs text-[#666666]">Chronological logs of interactions with {account.name}.</p>
            </div>
            <button
              onClick={() => setShowAddTouchpointModal(true)}
              className="btn-liquid px-3.5 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Log Touchpoint</span>
            </button>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs divide-y divide-[#E5E5E5] space-y-4">
            {touchpoints.map((tp) => (
              <div key={tp.id} className="pt-3 first:pt-0 flex items-start space-x-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-[#F4F4F5] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {tp.type === 'MEETING' ? (
                    <Calendar className="w-3.5 h-3.5 text-[#111111]" />
                  ) : tp.type === 'CALL' ? (
                    <Phone className="w-3.5 h-3.5 text-[#111111]" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-[#111111]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111] text-xs">{tp.title}</span>
                    <span className="text-[10px] text-[#888888] font-mono">
                      {new Date(tp.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#555555] mt-1 leading-relaxed">{tp.notes}</p>
                  <span className="text-[10px] text-[#888888] block mt-1">Logged by: {tp.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-[#111111]" />
                <h3 className="text-sm font-bold text-[#111111]">Edit Enterprise Account</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-md text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Company Legal Name *</label>
                <input
                  required
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Account Tier</label>
                  <select
                    value={editFormData.tier}
                    onChange={(e) => setEditFormData({ ...editFormData, tier: e.target.value })}
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
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
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
                    value={editFormData.annual_revenue}
                    onChange={(e) => setEditFormData({ ...editFormData, annual_revenue: Number(e.target.value) })}
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Customer Health Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editFormData.health_score}
                    onChange={(e) => setEditFormData({ ...editFormData, health_score: Number(e.target.value) })}
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Corporate Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Headquarters City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Registered Billing Address</label>
                <input
                  type="text"
                  value={editFormData.billing_address}
                  onChange={(e) => setEditFormData({ ...editFormData, billing_address: e.target.value })}
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Strategic Context &amp; Notes</label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAKEHOLDER MODAL */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Map Stakeholder to {account.name}</h3>
              <button onClick={() => setShowAddContactModal(false)} className="p-1 rounded text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateContact} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Anand Mahindra"
                  className="shadcn-input w-full"
                />
              </div>
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Corporate Email *</label>
                <input
                  required
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="email@company.com"
                  className="shadcn-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={newContact.designation}
                    onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Buying Authority</label>
                  <select
                    value={newContact.buying_role}
                    onChange={(e) => setNewContact({ ...newContact, buying_role: e.target.value as any })}
                    className="shadcn-input w-full"
                  >
                    <option value="DECISION_MAKER">Decision Maker (CIO/CXO)</option>
                    <option value="ECONOMIC_BUYER">Economic Buyer</option>
                    <option value="CHAMPION">Internal Champion</option>
                    <option value="INFLUENCER">Influencer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+91 98..."
                  className="shadcn-input w-full font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowAddContactModal(false)} className="px-3.5 py-1.5 border border-[#D4D4D4] rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={savingContact} className="px-4 py-1.5 bg-[#111111] text-white rounded-lg font-semibold">
                  {savingContact ? 'Mapping...' : 'Save Stakeholder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DEAL MODAL */}
      {showAddDealModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Create Deal Pursuit for {account.name}</h3>
              <button onClick={() => setShowAddDealModal(false)} className="p-1 rounded text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDeal} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Deal Title *</label>
                <input
                  required
                  type="text"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  placeholder="e.g. Enterprise Cloud License Renewal"
                  className="shadcn-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Deal Value (₹) *</label>
                  <input
                    required
                    type="number"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                    className="shadcn-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Pipeline Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                    className="shadcn-input w-full"
                  >
                    <option value="Qualification">Qualification</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={newDeal.closing_date}
                    onChange={(e) => setNewDeal({ ...newDeal, closing_date: e.target.value })}
                    className="shadcn-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newDeal.probability}
                    onChange={(e) => setNewDeal({ ...newDeal, probability: Number(e.target.value) })}
                    className="shadcn-input w-full font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowAddDealModal(false)} className="px-3.5 py-1.5 border border-[#D4D4D4] rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={savingDeal} className="px-4 py-1.5 bg-[#111111] text-white rounded-lg font-semibold">
                  {savingDeal ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TOUCHPOINT MODAL */}
      {showAddTouchpointModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Log Executive Touchpoint</h3>
              <button onClick={() => setShowAddTouchpointModal(false)} className="p-1 rounded text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTouchpoint} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Channel / Type</label>
                <select
                  value={touchpoint.type}
                  onChange={(e) => setTouchpoint({ ...touchpoint, type: e.target.value })}
                  className="shadcn-input w-full"
                >
                  <option value="MEETING">Executive Meeting</option>
                  <option value="CALL">Phone Call</option>
                  <option value="EMAIL">Email Exchange</option>
                  <option value="NOTE">Internal Strategic Note</option>
                </select>
              </div>
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Subject / Header *</label>
                <input
                  required
                  type="text"
                  value={touchpoint.title}
                  onChange={(e) => setTouchpoint({ ...touchpoint, title: e.target.value })}
                  placeholder="e.g. Q3 Procurement Alignment Call"
                  className="shadcn-input w-full"
                />
              </div>
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Discussion Details</label>
                <textarea
                  rows={3}
                  value={touchpoint.notes}
                  onChange={(e) => setTouchpoint({ ...touchpoint, notes: e.target.value })}
                  placeholder="Summary of agreements, concerns, next milestones..."
                  className="shadcn-input w-full"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowAddTouchpointModal(false)} className="px-3.5 py-1.5 border border-[#D4D4D4] rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-[#111111] text-white rounded-lg font-semibold">
                  Record Touchpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Account Deletion */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Enterprise Account"
        message={`Are you sure you want to permanently delete "${account.name}"? All associated contact mappings, commercial pipeline links, and historical logs will be unlinked.`}
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
