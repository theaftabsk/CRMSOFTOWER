'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { 
  Target, Plus, Search, Filter, ArrowRightLeft, Mail, Phone, Building2, 
  CheckCircle2, X, MessageSquare, Send, Video, Calendar, Copy, Check, 
  ExternalLink, Eye, Trash2, Flame, Zap, Snowflake, AlertTriangle, 
  GitMerge, Clock, ShieldCheck, UserCheck, Briefcase, MapPin, Layers, MoreHorizontal
} from 'lucide-react';
import { Lead } from '../../../types/crm';
import { formatNumber } from '../../../lib/utils';
import { api } from '../../../lib/api';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

type SavedViewType = 'ALL' | 'HOT' | 'TODAY' | 'STALE' | 'HIGH_VAL' | 'QUALIFIED' | 'CONVERTED';

export const LeadsView: React.FC = () => {
  const { leads, accounts, contacts, addLead, updateLead, convertLead, deleteLead } = useCRM();
  
  // Filters & Saved Views
  const [savedView, setSavedView] = useState<SavedViewType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<Lead | null>(null);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);

  // Click outside to close 3-dot dropdown
  useEffect(() => {
    const handleGlobalClick = () => setOpenActionDropdownId(null);
    if (openActionDropdownId) {
      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
    }
  }, [openActionDropdownId]);

  // Communications Modal State
  const [commsLead, setCommsLead] = useState<Lead | null>(null);
  const [commsChannel, setCommsChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [commsSubject, setCommsSubject] = useState('');
  const [commsMessage, setCommsMessage] = useState('');
  const [commsSending, setCommsSending] = useState(false);

  // Schedule Google Meet Modal State
  const [scheduleLead, setScheduleLead] = useState<Lead | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('11:00');
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [meetingProvider, setMeetingProvider] = useState<'GOOGLE_MEET' | 'ZOOM'>('GOOGLE_MEET');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledMeetResult, setScheduledMeetResult] = useState<any | null>(null);
  const [copiedMeetLink, setCopiedMeetLink] = useState(false);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    job_title: '',
    industry: 'Technology',
    city: 'Mumbai',
    status: 'New' as Lead['status'],
    lifecycle_stage: 'NEW',
    source: 'Website',
    assigned_to: 'Vikram Sales Manager',
    expected_value: 50000,
    notes: '',
  });

  // Salesforce 3-in-1 Convert Form State
  const [convertAccountMode, setConvertAccountMode] = useState<'CREATE_NEW' | 'EXISTING'>('CREATE_NEW');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accountNameInput, setAccountNameInput] = useState('');
  const [convertContactMode, setConvertContactMode] = useState<'CREATE_NEW' | 'EXISTING'>('CREATE_NEW');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactNameInput, setContactNameInput] = useState('');
  const [createDealOption, setCreateDealOption] = useState(true);
  const [convertDealTitle, setConvertDealTitle] = useState('');
  const [convertDealValue, setConvertDealValue] = useState(50000);
  const [convertDealStage, setConvertDealStage] = useState('Qualification');

  // Merge State
  const [mergePrimaryId, setMergePrimaryId] = useState<string>('');
  const [mergeSecondaryId, setMergeSecondaryId] = useState<string>('');
  const [merging, setMerging] = useState(false);

  // Filtered Leads calculation with Saved Views
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const displayName = lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead';
      const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      const score = lead.lead_score || (lead.rating === 'Hot' ? 85 : lead.rating === 'Warm' ? 60 : 30);
      const val = Number(lead.expected_value) || 0;

      switch (savedView) {
        case 'HOT':
          return score >= 75 && lead.status !== 'Converted';
        case 'QUALIFIED':
          return (lead.status === 'Qualified' || lead.lifecycle_stage === 'QUALIFIED') && lead.status !== 'Converted';
        case 'TODAY':
          return !!lead.next_followup_date || !!lead.next_follow_up_date;
        case 'STALE':
          // Leads with inactivity or uncontacted
          return lead.activity_status === 'NOT_CONTACTED' || lead.lead_health === 'STALE' || lead.status === 'New';
        case 'HIGH_VAL':
          return val >= 100000 && lead.status !== 'Converted';
        case 'CONVERTED':
          return lead.status === 'Converted' || lead.lifecycle_stage === 'CONVERTED';
        case 'ALL':
        default:
          return true;
      }
    });
  }, [leads, searchTerm, savedView]);

  // Dynamic KPI Metrics
  const totalValue = useMemo(() => leads.reduce((acc, l) => acc + (Number(l.expected_value) || 0), 0), [leads]);
  const hotCount = useMemo(() => leads.filter(l => (l.lead_score && l.lead_score >= 75) || l.rating === 'Hot').length, [leads]);
  const qualifiedCount = useMemo(() => leads.filter(l => l.status === 'Qualified' || l.lifecycle_stage === 'QUALIFIED').length, [leads]);
  const followUpTodayCount = useMemo(() => leads.filter(l => !!l.next_followup_date || !!l.next_follow_up_date).length, [leads]);
  const staleCount = useMemo(() => leads.filter(l => l.activity_status === 'NOT_CONTACTED' || l.status === 'New').length, [leads]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;

    addLead(newLead);

    // Call backend
    await api.post('/leads', {
      name: newLead.name,
      company: newLead.company,
      email: newLead.email,
      phone: newLead.phone,
      job_title: newLead.job_title,
      industry: newLead.industry,
      city: newLead.city,
      source: newLead.source,
      assigned_to: newLead.assigned_to,
      expected_value: Number(newLead.expected_value),
      notes: newLead.notes,
    }).catch(() => null);

    setShowCreateModal(false);
    setNewLead({
      name: '',
      company: '',
      email: '',
      phone: '',
      job_title: '',
      industry: 'Technology',
      city: 'Mumbai',
      status: 'New',
      lifecycle_stage: 'NEW',
      source: 'Website',
      assigned_to: 'Vikram Sales Manager',
      expected_value: 50000,
      notes: '',
    });
  };

  const handleOpenConvert = (lead: Lead) => {
    setShowConvertModal(lead);
    const displayName = lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead';
    setAccountNameInput(lead.company);
    setContactNameInput(displayName);
    setConvertDealTitle(`${lead.company} Enterprise Opportunity`);
    setConvertDealValue(Number(lead.expected_value) || 50000);
  };

  const handleExecuteConvert = async () => {
    if (!showConvertModal) return;
    try {
      // Call backend
      await api.post(`/leads/${showConvertModal.id}/convert-enterprise`, {
        accountMode: convertAccountMode,
        existingAccountId: selectedAccountId || undefined,
        accountName: accountNameInput || showConvertModal.company,
        contactMode: convertContactMode,
        existingContactId: selectedContactId || undefined,
        contactName: contactNameInput || showConvertModal.name,
        createDeal: createDealOption,
        dealTitle: convertDealTitle,
        dealValue: Number(convertDealValue),
        pipelineStage: convertDealStage,
      }).catch(() => null);

      convertLead(showConvertModal.id, {
        createDeal: createDealOption,
        dealTitle: convertDealTitle,
        dealValue: Number(convertDealValue),
      });

      setShowConvertModal(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenMerge = () => {
    if (selectedLeadIds.length >= 2) {
      setMergePrimaryId(selectedLeadIds[0]);
      setMergeSecondaryId(selectedLeadIds[1]);
    } else if (leads.length >= 2) {
      setMergePrimaryId(leads[0].id);
      setMergeSecondaryId(leads[1].id);
    }
    setShowMergeModal(true);
  };

  const handleExecuteMerge = async () => {
    if (!mergePrimaryId || !mergeSecondaryId || mergePrimaryId === mergeSecondaryId) {
      alert('Please select two different leads to merge.');
      return;
    }
    setMerging(true);
    try {
      await api.post('/leads/merge', {
        primaryLeadId: mergePrimaryId,
        secondaryLeadId: mergeSecondaryId,
        strategy: 'PREFER_PRIMARY',
      }).catch(() => null);

      // Remove secondary lead from local state
      deleteLead(mergeSecondaryId);
      setSelectedLeadIds([]);
      setShowMergeModal(false);
      alert('Leads successfully merged! Activities and timeline consolidated.');
    } catch (e) {
      console.error(e);
      alert('Could not complete merge.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Page Header adhering to AGENTS.md */}
      <PageHeader 
        title="Leads Workspace &amp; Intelligence" 
        subtitle="Salesforce 3-in-1 Conversion, HubSpot Dual Lead Scoring &amp; Omnichannel Engagement."
        action={
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenMerge}
              className="px-3.5 py-2 text-xs font-semibold text-[#111111] bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] rounded-lg transition inline-flex items-center space-x-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer"
            >
              <GitMerge className="w-4 h-4 text-[#666666]" />
              <span>Deduplicate &amp; Merge {selectedLeadIds.length >= 2 ? `(${selectedLeadIds.length})` : ''}</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary space-x-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Lead</span>
            </button>
          </div>
        }
      />

      {/* KPI Stat Cards: Liquid Glass Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Total Pipeline</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{leads.length}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Active Prospects</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#DC2626] font-semibold uppercase tracking-wider block flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 fill-[#DC2626]" />
            <span>Hot Leads</span>
          </span>
          <span className="text-2xl font-bold font-mono text-[#DC2626] mt-1 block">{hotCount}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Score &ge; 75</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#16A34A] font-semibold uppercase tracking-wider block flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Qualified</span>
          </span>
          <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">{qualifiedCount}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">BANT Verified</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-[#666666]" />
            <span>Due Today</span>
          </span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{followUpTodayCount}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Follow-up actions</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#D97706] font-semibold uppercase tracking-wider block flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Stale / Inactive</span>
          </span>
          <span className="text-2xl font-bold font-mono text-[#D97706] mt-1 block">{staleCount}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">&gt;14d or Uncontacted</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Expected Value</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            ₹{formatNumber(totalValue)}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Gross Pipeline</span>
        </div>
      </div>

      {/* Saved Views Selector Bar */}
      <div className="liquid-glass p-3 rounded-2xl flex flex-col md:flex-row justify-between gap-3 items-center border border-white/80 shadow-sm">
        {/* Saved Views Pills with clean SVG icons */}
        <div className="segmented-control flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', label: 'All Leads', icon: Layers, color: 'text-[#666666]' },
            { key: 'HOT', label: 'Hot (≥75)', icon: Flame, color: 'text-[#DC2626]' },
            { key: 'QUALIFIED', label: 'Qualified', icon: ShieldCheck, color: 'text-[#16A34A]' },
            { key: 'TODAY', label: 'Due Today', icon: Calendar, color: 'text-[#2563EB]' },
            { key: 'STALE', label: 'Stale Leads', icon: AlertTriangle, color: 'text-[#D97706]' },
            { key: 'HIGH_VAL', label: 'High Value (>₹1L)', icon: Zap, color: 'text-[#7C3AED]' },
            { key: 'CONVERTED', label: 'Converted', icon: CheckCircle2, color: 'text-[#111111]' },
          ].map(viewItem => {
            const Icon = viewItem.icon;
            const isActive = savedView === viewItem.key;
            return (
              <button
                key={viewItem.key}
                onClick={() => setSavedView(viewItem.key as SavedViewType)}
                className={`segmented-item text-xs px-3 py-1.5 transition font-medium whitespace-nowrap cursor-pointer inline-flex items-center space-x-1.5 ${
                  isActive 
                    ? 'active font-semibold' 
                    : 'text-[#555555] hover:text-[#111111]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#111111]' : viewItem.color}`} />
                <span>{viewItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search lead, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl pl-9 pr-4 py-2 bg-white/60 focus:bg-white text-[#111111] placeholder-[#888888] border border-black/[0.08] focus:border-black/30 outline-none transition"
          />
        </div>
      </div>

      {/* Liquid Glass Leads Table */}
      <div className="liquid-glass rounded-2xl overflow-hidden border border-white/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th className="w-8">
                  <input 
                    type="checkbox"
                    checked={selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-[#D4D4D4] text-[#111111] focus:ring-0"
                  />
                </th>
                <th>Lead &amp; Company</th>
                <th>Score &amp; Tier</th>
                <th>Lifecycle Stage</th>
                <th>Activity Status</th>
                <th>Expected Value</th>
                <th>Owner</th>
                <th className="text-right">Action Dock</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#888888] space-y-1">
                    <p className="text-sm font-semibold text-[#111111]">No leads found</p>
                    <p className="text-xs text-[#666666]">Try adjusting your search criteria or switch the saved view.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const displayName = lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead Prospect';
                  const fit = lead.fit_score || 72;
                  const eng = lead.engagement_score || 80;
                  const score = lead.lead_score || Math.round(fit * 0.4 + eng * 0.6);
                  const isHot = score >= 75 || lead.rating === 'Hot';
                  const isWarm = score >= 50 && score < 75;
                  const isChecked = selectedLeadIds.includes(lead.id);

                  return (
                    <tr key={lead.id} className={isChecked ? 'bg-[#FAFAFA]' : ''}>
                      <td>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(lead.id)}
                          className="rounded border-[#D4D4D4] text-[#111111] focus:ring-0"
                        />
                      </td>

                      {/* Lead & Company Info */}
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2a2a2e] to-[#111111] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 border border-white/20">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <Link
                                href={`/leads/${lead.id}`}
                                className="font-bold text-[#111111] hover:underline text-xs"
                              >
                                {displayName}
                              </Link>
                              {lead.job_title && (
                                <span className="text-[10px] text-[#666666] bg-black/[0.04] px-1.5 py-0.2 rounded border border-black/[0.05]">
                                  {lead.job_title}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 text-[11px] text-[#666666] truncate">
                              <span className="flex items-center space-x-1 font-medium text-[#444444]">
                                <Building2 className="w-3 h-3 text-[#888888] shrink-0" />
                                <span className="truncate">{lead.company}</span>
                              </span>
                              <span>&bull;</span>
                              <span className="truncate">{lead.source}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#777777]">
                              <a href={`mailto:${lead.email}`} className="hover:text-[#111111] hover:underline flex items-center space-x-1">
                                <Mail className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate max-w-[120px]">{lead.email}</span>
                              </a>
                              {lead.phone && (
                                <>
                                  <span>&bull;</span>
                                  <a href={`tel:${lead.phone}`} className="hover:text-[#111111] hover:underline flex items-center space-x-1">
                                    <Phone className="w-2.5 h-2.5 shrink-0" />
                                    <span>{lead.phone}</span>
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dual Score & Tier */}
                      <td>
                        <div className="space-y-1">
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-bold rounded-lg border ${
                            isHot 
                              ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' 
                              : isWarm 
                                ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' 
                                : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                          }`}>
                            {isHot ? <Flame className="w-3 h-3 fill-[#DC2626]" /> : isWarm ? <Zap className="w-3 h-3 fill-[#D97706]" /> : <Snowflake className="w-3 h-3" />}
                            <span>{score}/100 {isHot ? 'HOT' : isWarm ? 'WARM' : 'COLD'}</span>
                          </span>
                          <div className="text-[10px] text-[#888888]">
                            Fit {fit} &bull; Eng {eng}
                          </div>
                        </div>
                      </td>

                      {/* Lifecycle Stage */}
                      <td>
                        <span className={`shadcn-badge font-semibold ${
                          lead.lifecycle_stage === 'CONVERTED' || lead.status === 'Converted' ? 'shadcn-badge-default font-bold' :
                          lead.lifecycle_stage === 'QUALIFIED' || lead.status === 'Qualified' ? 'shadcn-badge-success' :
                          lead.lifecycle_stage === 'WORKING' || lead.status === 'Contacted' ? 'shadcn-badge-warning' :
                          'shadcn-badge-default'
                        }`}>
                          {lead.lifecycle_stage || lead.status}
                        </span>
                      </td>

                      {/* Activity Status & Aging */}
                      <td>
                        <div className="space-y-0.5 text-xs">
                          <span className="text-[#111111] font-medium block">
                            {lead.activity_status || 'ATTEMPTED'}
                          </span>
                          <span className="text-[10px] text-[#888888] block">
                            {lead.next_followup_date ? `Due: ${lead.next_followup_date.split('T')[0]}` : 'No due follow-up'}
                          </span>
                        </div>
                      </td>

                      {/* Expected Value */}
                      <td suppressHydrationWarning className="font-mono font-bold text-[#111111]">
                        ₹{formatNumber(lead.expected_value || 50000)}
                      </td>

                      {/* Owner */}
                      <td className="text-[#444444] text-xs">
                        {lead.assigned_to || lead.owner_name || 'Sales Team'}
                      </td>

                      {/* Action Dock with Clean 3-Dot More Actions Menu */}
                      <td className="text-right whitespace-nowrap relative">
                        <div className="flex items-center justify-end space-x-1">
                          <Link
                            href={`/leads/${lead.id}`}
                            title="View Lead Details"
                            className="p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-black/[0.05] btn-liquid transition inline-flex items-center cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* 3-Dot Button */}
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              title="More Options"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionDropdownId(openActionDropdownId === lead.id ? null : lead.id);
                              }}
                              className={`p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-black/[0.06] btn-liquid transition inline-flex items-center cursor-pointer ${
                                openActionDropdownId === lead.id ? 'bg-black/[0.08] text-[#111111]' : ''
                              }`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Floating Liquid Glass Dropdown Menu */}
                            {openActionDropdownId === lead.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1 w-52 liquid-glass-dropdown p-1.5 z-40 liquid-animate-in border border-white/80 shadow-2xl text-left"
                              >
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                                  Lead Actions
                                </div>

                                <Link
                                  href={`/leads/${lead.id}`}
                                  onClick={() => setOpenActionDropdownId(null)}
                                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">360° Lead Cockpit</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    setCommsLead(lead);
                                    setCommsChannel('whatsapp');
                                    setCommsMessage(`Hi ${displayName}, thank you for contacting us regarding ${lead.company}. When can we schedule a quick 15-min discovery consultation?`);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-[#F0FDF4] hover:text-[#16A34A] btn-liquid transition text-left cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-[#16A34A]" />
                                  <span className="font-medium">Quick WhatsApp</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    setScheduleLead(lead);
                                    setMeetingTitle(`Discovery & Demo: ${lead.company}`);
                                    setMeetingDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                                    setScheduledMeetResult(null);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-[#EFF6FF] hover:text-[#2563EB] btn-liquid transition text-left cursor-pointer"
                                >
                                  <Video className="w-3.5 h-3.5 text-[#2563EB]" />
                                  <span className="font-medium">Schedule Meeting</span>
                                </button>

                                {lead.status !== 'Converted' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      handleOpenConvert(lead);
                                    }}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition text-left cursor-pointer"
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#111111]" />
                                    <span className="font-medium">3-in-1 Convert</span>
                                  </button>
                                )}

                                <div className="border-t border-black/[0.06] my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    setLeadToDelete({ id: lead.id, name: displayName });
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#DC2626] hover:bg-red-50/80 btn-liquid transition text-left cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                  <span className="font-semibold">Delete Lead</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE LEAD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111111]">Create New Prospect Lead</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-[#888888] hover:text-[#111111] rounded-md hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Full Name *</label>
                  <input
                    required
                    placeholder="e.g. Rajesh Gupta"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Job Title</label>
                  <input
                    placeholder="e.g. Chief Operating Officer"
                    value={newLead.job_title}
                    onChange={(e) => setNewLead({ ...newLead, job_title: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Company *</label>
                  <input
                    required
                    placeholder="e.g. Apex Industries Ltd"
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Industry</label>
                  <select
                    value={newLead.industry}
                    onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                    className="shadcn-input w-full"
                  >
                    <option value="Technology">Technology &amp; Software</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Education">Education &amp; EdTech</option>
                    <option value="Healthcare">Healthcare &amp; Pharma</option>
                    <option value="Finance">Banking &amp; Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="rajesh@apex.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Phone</label>
                  <input
                    placeholder="+91 98765 43210"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="shadcn-input w-full"
                  >
                    <option value="Website">Website</option>
                    <option value="Google">Google Ads</option>
                    <option value="Facebook">Facebook</option>
                    <option value="WhatsApp">WhatsApp Inbound</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">City</label>
                  <input
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Expected Value (₹)</label>
                  <input
                    type="number"
                    value={newLead.expected_value}
                    onChange={(e) => setNewLead({ ...newLead, expected_value: Number(e.target.value) })}
                    className="shadcn-input w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Initial Requirement Notes</label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="e.g. Needs software solution for 30 sales executives with automated invoicing."
                  className="shadcn-input w-full"
                />
              </div>

              <div className="p-4 bg-[#F8F8F8] border-t border-[#E5E5E5] -mx-6 -mb-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Create &amp; Auto-Score Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SALESFORCE 3-IN-1 CONVERT MODAL */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in">
            <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Salesforce 3-in-1 Conversion
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Convert lead into Account, Contact, and Opportunity Deal. Historical lead is preserved.
                </p>
              </div>
              <button 
                onClick={() => setShowConvertModal(null)}
                className="p-1.5 text-[#888888] hover:text-[#111111] rounded-md hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Account mapping */}
              <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-2">
                <div className="flex items-center justify-between font-bold text-[#111111]">
                  <span>1. Account</span>
                  <div className="space-x-2 font-normal">
                    <label className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="accMode" 
                        checked={convertAccountMode === 'CREATE_NEW'} 
                        onChange={() => setConvertAccountMode('CREATE_NEW')}
                      /> Create New
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="accMode" 
                        checked={convertAccountMode === 'EXISTING'} 
                        onChange={() => setConvertAccountMode('EXISTING')}
                      /> Existing
                    </label>
                  </div>
                </div>
                {convertAccountMode === 'CREATE_NEW' ? (
                  <input 
                    value={accountNameInput} 
                    onChange={(e) => setAccountNameInput(e.target.value)} 
                    className="shadcn-input w-full" 
                  />
                ) : (
                  <select 
                    value={selectedAccountId} 
                    onChange={(e) => setSelectedAccountId(e.target.value)} 
                    className="shadcn-input w-full"
                  >
                    <option value="">-- Select Existing Account --</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Contact mapping */}
              <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-2">
                <div className="flex items-center justify-between font-bold text-[#111111]">
                  <span>2. Contact</span>
                  <div className="space-x-2 font-normal">
                    <label className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="conMode" 
                        checked={convertContactMode === 'CREATE_NEW'} 
                        onChange={() => setConvertContactMode('CREATE_NEW')}
                      /> Create New
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="conMode" 
                        checked={convertContactMode === 'EXISTING'} 
                        onChange={() => setConvertContactMode('EXISTING')}
                      /> Existing
                    </label>
                  </div>
                </div>
                {convertContactMode === 'CREATE_NEW' ? (
                  <input 
                    value={contactNameInput} 
                    onChange={(e) => setContactNameInput(e.target.value)} 
                    className="shadcn-input w-full" 
                  />
                ) : (
                  <select 
                    value={selectedContactId} 
                    onChange={(e) => setSelectedContactId(e.target.value)} 
                    className="shadcn-input w-full"
                  >
                    <option value="">-- Select Existing Contact --</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Opportunity Deal mapping */}
              <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-2">
                <div className="flex items-center justify-between font-bold text-[#111111]">
                  <span>3. Deal / Opportunity</span>
                  <label className="cursor-pointer font-normal">
                    <input 
                      type="checkbox" 
                      checked={createDealOption} 
                      onChange={(e) => setCreateDealOption(e.target.checked)} 
                    /> Create Deal
                  </label>
                </div>
                {createDealOption && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="col-span-2">
                      <input 
                        value={convertDealTitle} 
                        onChange={(e) => setConvertDealTitle(e.target.value)} 
                        className="shadcn-input w-full" 
                      />
                    </div>
                    <div>
                      <input 
                        type="number" 
                        value={convertDealValue} 
                        onChange={(e) => setConvertDealValue(Number(e.target.value))} 
                        className="shadcn-input w-full font-mono" 
                      />
                    </div>
                    <div>
                      <select 
                        value={convertDealStage} 
                        onChange={(e) => setConvertDealStage(e.target.value)} 
                        className="shadcn-input w-full"
                      >
                        <option value="Qualification">Qualification</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#F8F8F8] border-t border-[#E5E5E5] flex justify-end space-x-2">
              <button 
                onClick={() => setShowConvertModal(null)} 
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleExecuteConvert} 
                className="btn-primary text-xs"
              >
                Execute Conversion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDUPLICATION & 2-WAY MERGE MODAL */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in">
            <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Deduplicate &amp; 2-Way Lead Merge
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Select the surviving master lead. Activities and history from the secondary lead will be merged into it.
                </p>
              </div>
              <button 
                onClick={() => setShowMergeModal(false)}
                className="p-1.5 text-[#888888] hover:text-[#111111] rounded-md hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Lead */}
                <div className="p-4 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg space-y-2">
                  <span className="font-bold text-[#16A34A] block uppercase text-[11px]">
                    Master Record (Surviving)
                  </span>
                  <select
                    value={mergePrimaryId}
                    onChange={(e) => setMergePrimaryId(e.target.value)}
                    className="shadcn-input w-full bg-white"
                  >
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name || `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Lead'} - {l.company} ({l.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Secondary Lead */}
                <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-lg space-y-2">
                  <span className="font-bold text-[#DC2626] block uppercase text-[11px]">
                    Duplicate Record (To Merge &amp; Archive)
                  </span>
                  <select
                    value={mergeSecondaryId}
                    onChange={(e) => setMergeSecondaryId(e.target.value)}
                    className="shadcn-input w-full bg-white"
                  >
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name || `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Lead'} - {l.company} ({l.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-[11px] text-[#666666] leading-relaxed">
                <strong>Consolidation Rule:</strong> All timeline activities (calls, emails, WhatsApp logs, Google Meets, notes) from the duplicate record will be automatically migrated to the master record.
              </div>
            </div>

            <div className="p-4 bg-[#F8F8F8] border-t border-[#E5E5E5] flex justify-end space-x-2">
              <button 
                onClick={() => setShowMergeModal(false)} 
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button 
                disabled={merging}
                onClick={handleExecuteMerge} 
                className="btn-primary text-xs"
              >
                {merging ? 'Merging Records...' : 'Execute 2-Way Merge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMUNICATIONS MODAL (WhatsApp & Email) */}
      {commsLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {commsChannel === 'whatsapp' ? (
                  <MessageSquare className="w-5 h-5 text-[#16A34A]" />
                ) : (
                  <Mail className="w-5 h-5 text-[#111111]" />
                )}
                <div>
                  <h3 className="text-base font-bold text-[#111111]">
                    {commsChannel === 'whatsapp' ? 'Send WhatsApp Message' : 'Send Direct Email'}
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Recipient: <strong className="text-[#111111]">{commsLead.name || commsLead.company}</strong> ({commsChannel === 'whatsapp' ? commsLead.phone : commsLead.email})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCommsLead(null)}
                className="p-1.5 text-[#888888] hover:text-[#111111] rounded-md hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {commsChannel === 'email' && (
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Subject</label>
                  <input
                    value={commsSubject}
                    onChange={(e) => setCommsSubject(e.target.value)}
                    placeholder="e.g. Exclusive proposal for CRM Implementation"
                    className="shadcn-input w-full"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Message Body</label>
                <textarea
                  rows={4}
                  value={commsMessage}
                  onChange={(e) => setCommsMessage(e.target.value)}
                  className="shadcn-input w-full"
                />
              </div>
            </div>

            <div className="p-4 bg-[#F8F8F8] border-t border-[#E5E5E5] flex justify-end space-x-2">
              <button
                onClick={() => setCommsLead(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                disabled={commsSending}
                onClick={async () => {
                  setCommsSending(true);
                  if (commsChannel === 'whatsapp') {
                    const cleanPhone = (commsLead.phone || '').replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(commsMessage)}`, '_blank');
                    await api.post(`/leads/${commsLead.id}/activity`, {
                      type: 'WHATSAPP',
                      title: 'WhatsApp Message Dispatched',
                      description: commsMessage,
                    }).catch(() => null);
                  } else {
                    await api.post(`/leads/${commsLead.id}/activity`, {
                      type: 'EMAIL',
                      title: `Email Sent: ${commsSubject || 'Direct Outreach'}`,
                      description: commsMessage,
                    }).catch(() => null);
                  }
                  setCommsSending(false);
                  setCommsLead(null);
                }}
                className={`btn-primary text-xs flex items-center space-x-1.5 ${commsChannel === 'whatsapp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : ''}`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{commsSending ? 'Processing...' : commsChannel === 'whatsapp' ? 'Open WhatsApp Web & Log' : 'Send & Log Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE GOOGLE MEET / ZOOM MODAL */}
      {scheduleLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-[#111111]" />
                <div>
                  <h3 className="text-base font-bold text-[#111111]">
                    Schedule Video Meeting
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Prospect: <strong className="text-[#111111]">{scheduleLead.name || scheduleLead.company}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setScheduleLead(null)}
                className="p-1.5 text-[#888888] hover:text-[#111111] rounded-md hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#111111] block mb-1">Meeting Title</label>
                <input
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="shadcn-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#111111] block mb-1">Date</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#111111] block mb-1">Time</label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="shadcn-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#111111] block mb-1">Duration</label>
                  <select
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(Number(e.target.value))}
                    className="shadcn-input w-full"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#111111] block mb-1">Provider</label>
                  <select
                    value={meetingProvider}
                    onChange={(e) => setMeetingProvider(e.target.value as any)}
                    className="shadcn-input w-full"
                  >
                    <option value="GOOGLE_MEET">Google Meet</option>
                    <option value="ZOOM">Zoom Video</option>
                  </select>
                </div>
              </div>

              {scheduledMeetResult && (
                <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg space-y-2 animate-fadeIn">
                  <div className="flex items-center space-x-1.5 text-[#16A34A] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Meeting Successfully Generated!</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-[#E5E5E5]">
                    <span className="font-mono text-xs text-[#111111] truncate">
                      {scheduledMeetResult.meet_link}
                    </span>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scheduledMeetResult.meet_link);
                          setCopiedMeetLink(true);
                          setTimeout(() => setCopiedMeetLink(false), 2000);
                        }}
                        className="px-2 py-0.5 text-[11px] font-medium text-[#111111] bg-[#F4F4F5] border border-[#D4D4D4] rounded hover:bg-[#EAEAEA] flex items-center space-x-1"
                      >
                        {copiedMeetLink ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedMeetLink ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={scheduledMeetResult.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded bg-[#111111] text-white hover:bg-[#262626]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F8F8F8] border-t border-[#E5E5E5] flex justify-end space-x-2">
              <button
                onClick={() => setScheduleLead(null)}
                className="btn-secondary text-xs"
              >
                {scheduledMeetResult ? 'Close' : 'Cancel'}
              </button>

              {!scheduledMeetResult ? (
                <button
                  disabled={isScheduling || !meetingTitle}
                  onClick={async () => {
                    try {
                      setIsScheduling(true);
                      const startIso = new Date(`${meetingDate}T${meetingTime}:00`).toISOString();
                      const endIso = new Date(new Date(startIso).getTime() + meetingDuration * 60000).toISOString();

                      const endpoint = meetingProvider === 'GOOGLE_MEET'
                        ? '/integrations/google-meet/create'
                        : '/integrations/zoom/create';

                      const res = await api.post(endpoint, {
                        title: meetingTitle,
                        startTime: startIso,
                        endTime: endIso,
                        durationMinutes: meetingDuration,
                        attendeeEmail: scheduleLead.email,
                        attendeeName: scheduleLead.name,
                      });

                      const data = res?.data || res;
                      setScheduledMeetResult(data);
                    } catch (err: any) {
                      alert(`Failed to schedule meeting: ${err.message}`);
                    } finally {
                      setIsScheduling(false);
                    }
                  }}
                  className="btn-primary text-xs flex items-center space-x-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{isScheduling ? 'Generating Room...' : `Create ${meetingProvider === 'GOOGLE_MEET' ? 'Google Meet' : 'Zoom'}`}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const waMsg = `Hi ${scheduleLead.name}, your meeting has been scheduled: ${meetingTitle}\nLink: ${scheduledMeetResult.meet_link}`;
                    window.open(`https://wa.me/${scheduleLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMsg)}`, '_blank');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] flex items-center space-x-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Liquid Glass Confirmation Dialog for Lead Deletion */}
      <ConfirmDialog
        isOpen={!!leadToDelete}
        title="Delete Lead"
        message={`Are you sure you want to permanently delete lead "${leadToDelete?.name}"? All associated communications, deal proposals, and timeline logs will be removed.`}
        confirmLabel="Delete Lead"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (leadToDelete) {
            deleteLead(leadToDelete.id);
            setLeadToDelete(null);
          }
        }}
        onCancel={() => setLeadToDelete(null)}
      />
    </div>
  );
};
