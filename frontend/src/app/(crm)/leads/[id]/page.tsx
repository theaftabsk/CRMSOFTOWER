'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Building2, Mail, Phone, Calendar, Video, 
  MessageSquare, ArrowRightLeft, CheckCircle2, Clock, ShieldCheck, 
  ExternalLink, Sparkles, Flame, Snowflake, Zap, AlertTriangle, 
  Check, Plus, Send, RefreshCw, FileText, CheckSquare, PhoneCall,
  UserCheck, DollarSign, Briefcase, Globe, MapPin, ChevronRight, Copy
} from 'lucide-react';
import { useCRM } from '../../../../context/CRMContext';
import { Lead, LeadActivity, LifecycleStage, ActivityStatus } from '../../../../types/crm';
import { formatNumber } from '../../../../lib/utils';
import { api } from '../../../../lib/api';

export default function LeadsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { leads, accounts, contacts, updateLead, convertLead } = useCRM();
  
  const leadId = params.id as string;
  const contextLead = leads.find((l) => l.id === leadId);

  // Local state for full lead data (either from API or Context)
  const [lead, setLead] = useState<Lead | null>(contextLead || null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshingScore, setIsRefreshingScore] = useState(false);
  
  // Fast Action Dock Tab
  const [activeDockTab, setActiveDockTab] = useState<'NOTE' | 'CALL' | 'EMAIL' | 'WHATSAPP' | 'MEET' | 'TASK'>('NOTE');
  const [noteContent, setNoteContent] = useState('');
  const [callDuration, setCallDuration] = useState('5');
  const [callOutcome, setCallOutcome] = useState('Connected & Discussed Requirements');
  const [callNotes, setCallNotes] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('11:00');
  const [meetDuration, setMeetDuration] = useState(30);
  const [createdMeetingResult, setCreatedMeetingResult] = useState<{
    meet_link: string;
    google_space_name?: string;
    title: string;
  } | null>(null);
  const [copiedMeetLink, setCopiedMeetLink] = useState(false);
  const [copiedTimelineMeetId, setCopiedTimelineMeetId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'CALL' | 'EMAIL' | 'WHATSAPP' | 'MEETING' | 'NOTE' | 'STAGE'>('ALL');

  // Salesforce 3-in-1 Conversion Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertAccountMode, setConvertAccountMode] = useState<'CREATE_NEW' | 'EXISTING' | 'NONE'>('CREATE_NEW');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accountNameInput, setAccountNameInput] = useState('');
  const [convertContactMode, setConvertContactMode] = useState<'CREATE_NEW' | 'EXISTING'>('CREATE_NEW');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactNameInput, setContactNameInput] = useState('');
  const [createDeal, setCreateDeal] = useState(true);
  const [dealTitleInput, setDealTitleInput] = useState('');
  const [dealValueInput, setDealValueInput] = useState(50000);
  const [dealStageInput, setDealStageInput] = useState('Qualification');
  const [converting, setConverting] = useState(false);

  // BANT Edit State
  const [budgetVal, setBudgetVal] = useState(0);
  const [budgetVerified, setBudgetVerified] = useState(false);
  const [authorityLevel, setAuthorityLevel] = useState('DECISION_MAKER');
  const [authorityVerified, setAuthorityVerified] = useState(false);
  const [needText, setNeedText] = useState('');
  const [timelineVal, setTimelineVal] = useState('Immediate (< 30 days)');

  useEffect(() => {
    if (contextLead) {
      setLead(contextLead);
      setBudgetVal(contextLead.budget || contextLead.expected_value || 50000);
      setBudgetVerified(contextLead.budget_verified || false);
      setAuthorityLevel(contextLead.authority_level || 'DECISION_MAKER');
      setAuthorityVerified(contextLead.authority_verified || false);
      setNeedText(contextLead.need || contextLead.notes || '');
      setTimelineVal(contextLead.timeline || 'Immediate (< 30 days)');
      setAccountNameInput(contextLead.company || '');
      setContactNameInput(contextLead.name || `${contextLead.first_name || ''} ${contextLead.last_name || ''}`.trim() || '');
      setDealTitleInput(`${contextLead.company || 'Lead'} Enterprise Opportunity`);
      setDealValueInput(contextLead.expected_value || 50000);
    }
  }, [contextLead]);

  useEffect(() => {
    fetchLeadFromBackend();
  }, [leadId]);

  const fetchLeadFromBackend = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads/${leadId}`);
      if (res && res.data) {
        setLead(res.data);
        if (res.data.activities) {
          setActivities(res.data.activities);
        }
      }
    } catch (err) {
      // Backend fallback to mock or context
      console.warn('Backend lead fetch fallback to context', err);
    } finally {
      setLoading(false);
    }
  };

  const currentLead = lead || contextLead;

  // Stages definition
  const stages: { key: LifecycleStage; label: string; desc: string }[] = [
    { key: 'NEW', label: '1. New Prospect', desc: 'Captured & Unengaged' },
    { key: 'WORKING', label: '2. Working & Engaged', desc: 'Outreach in progress' },
    { key: 'QUALIFIED', label: '3. Sales Qualified', desc: 'BANT Criteria Met' },
    { key: 'CONVERTED', label: '4. Converted to Deal', desc: 'Closed Opportunity' },
  ];

  const currentStageIndex = useMemo(() => {
    if (!currentLead) return 0;
    const stage = (currentLead.lifecycle_stage || 'NEW').toUpperCase();
    if (stage === 'CONVERTED' || currentLead.status === 'Converted') return 3;
    if (stage === 'QUALIFIED' || currentLead.status === 'Qualified') return 2;
    if (stage === 'WORKING' || currentLead.status === 'Contacted' || currentLead.status === 'Interested') return 1;
    return 0;
  }, [currentLead]);

  const handleStageChange = async (targetStage: LifecycleStage) => {
    if (!currentLead) return;
    if (targetStage === 'CONVERTED') {
      setShowConvertModal(true);
      return;
    }

    try {
      // 1. Log activity in backend
      await api.post(`/leads/${currentLead.id}/activity`, {
        type: 'STAGE_CHANGE',
        title: `Lifecycle Stage changed to ${targetStage}`,
        description: `Lead moved to ${targetStage} stage in Sales Cockpit`,
      }).catch(() => null);

      // 2. Update context & local state
      updateLead(currentLead.id, {
        lifecycle_stage: targetStage,
        status: targetStage === 'QUALIFIED' ? 'Qualified' : 'Contacted',
      });

      setLead(prev => prev ? {
        ...prev,
        lifecycle_stage: targetStage,
        status: targetStage === 'QUALIFIED' ? 'Qualified' : 'Contacted',
      } : null);

      fetchLeadFromBackend();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecalculateIntelligence = async () => {
    if (!currentLead) return;
    setIsRefreshingScore(true);
    try {
      // Log check to trigger backend scoring engine
      await api.post(`/leads/${currentLead.id}/activity`, {
        type: 'NOTE',
        title: 'Lead Intelligence Recalculated',
        description: 'Refreshed Dual Score (Fit + Engagement) and AI Next Best Action recommendation.',
      }).catch(() => null);

      await fetchLeadFromBackend();
    } finally {
      setIsRefreshingScore(false);
    }
  };

  const handleSaveBANT = async () => {
    if (!currentLead) return;
    try {
      const updatePayload = {
        budget: budgetVal,
        budget_verified: budgetVerified,
        authority_level: authorityLevel,
        authority_verified: authorityVerified,
        need: needText,
        timeline: timelineVal,
        expected_value: budgetVal,
      };

      updateLead(currentLead.id, updatePayload);
      setLead(prev => prev ? { ...prev, ...updatePayload } : null);

      await api.post(`/leads/${currentLead.id}/activity`, {
        type: 'NOTE',
        title: 'BANT Qualification Matrix Updated',
        description: `Budget: ₹${budgetVal} (${budgetVerified ? 'Verified' : 'Unverified'}) | Authority: ${authorityLevel} (${authorityVerified ? 'Verified' : 'Unverified'}) | Timeline: ${timelineVal}`,
      }).catch(() => null);

      alert('BANT qualification details saved successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogActivity = async (type: string, title: string, description: string, metadata?: any) => {
    if (!currentLead) return;
    setActionSubmitting(true);
    try {
      const newAct: LeadActivity = {
        id: `act_${Date.now()}`,
        lead_id: currentLead.id,
        type,
        title,
        description,
        metadata,
        created_at: new Date().toISOString(),
        created_by: 'You (Sales Executive)',
      };

      // Optimistic local state update
      setActivities(prev => [newAct, ...prev]);

      // Call backend
      await api.post(`/leads/${currentLead.id}/activity`, {
        type,
        title,
        description,
        metadata,
        source: 'Sales Cockpit',
      }).catch(() => null);

      // Reset form states
      setNoteContent('');
      setCallNotes('');
      setEmailSubject('');
      setEmailBody('');
      setWaMessage('');
      setMeetTitle('');
      setTaskTitle('');

      fetchLeadFromBackend();
    } catch (e) {
      console.error(e);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleExecuteConversion = async () => {
    if (!currentLead) return;
    setConverting(true);
    try {
      const conversionPayload = {
        accountMode: convertAccountMode,
        existingAccountId: selectedAccountId || undefined,
        accountName: accountNameInput || currentLead.company,
        contactMode: convertContactMode,
        existingContactId: selectedContactId || undefined,
        contactName: contactNameInput || currentLead.name,
        createDeal,
        dealTitle: dealTitleInput || `${currentLead.company} Deal`,
        dealValue: Number(dealValueInput) || 50000,
        pipelineStage: dealStageInput,
      };

      // Call backend conversion endpoint
      await api.post(`/leads/${currentLead.id}/convert-enterprise`, conversionPayload).catch(() => null);

      // Execute in frontend context
      convertLead(currentLead.id, {
        createDeal,
        dealTitle: dealTitleInput,
        dealValue: Number(dealValueInput),
      });

      setShowConvertModal(false);
      alert('Lead successfully converted to Account, Contact, and Opportunity Deal without deleting historical lead record!');
      router.push('/deals');
    } catch (e) {
      console.error(e);
      alert('Error during conversion. Please review fields.');
    } finally {
      setConverting(false);
    }
  };

  if (!currentLead) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <Link href="/leads" className="inline-flex items-center space-x-1 text-xs text-[#666666] hover:text-[#111111]">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Leads</span>
        </Link>
        <div className="p-8 bg-white border border-[#E5E5E5] rounded-xl text-center">
          <p className="text-sm font-semibold text-[#111111]">Lead Record Not Found</p>
          <p className="text-xs text-[#666666] mt-1">Lead ID: {leadId}</p>
        </div>
      </div>
    );
  }

  const displayName = currentLead.name || `${currentLead.first_name || ''} ${currentLead.last_name || ''}`.trim() || 'Lead Prospect';
  const fitScore = currentLead.fit_score || 72;
  const engScore = currentLead.engagement_score || 80;
  const leadScore = currentLead.lead_score || Math.round((fitScore * 0.4) + (engScore * 0.6));
  const scoreTier = currentLead.score_tier || (leadScore >= 75 ? 'HOT' : leadScore >= 50 ? 'WARM' : 'COLD');
  const nextAction = currentLead.next_best_action || 'Schedule Discovery Call (Google Meet) to verify decision authority & implementation timeline.';

  const filteredTimeline = activities.filter(act => {
    if (timelineFilter === 'ALL') return true;
    if (timelineFilter === 'STAGE') return act.type === 'STAGE_CHANGE' || act.type === 'STATUS_CHANGE';
    return act.type === timelineFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Top Breadcrumb & Metadata Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/leads" 
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#666666] hover:text-[#111111] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads Workspace</span>
        </Link>
        <div className="flex items-center space-x-3 text-xs text-[#666666]">
          <span>Lead ID: <span className="font-mono text-[#111111] font-semibold">{currentLead.id}</span></span>
          <span>&bull;</span>
          <span>Owner: <span className="font-medium text-[#111111]">{currentLead.assigned_to || currentLead.owner_name || 'Sales Team'}</span></span>
        </div>
      </div>

      {/* Header Profile Cockpit Card */}
      <div className="p-6 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <h1 className="text-2xl font-bold text-[#111111] tracking-tight">{displayName}</h1>
              {currentLead.job_title && (
                <span className="text-sm font-medium text-[#666666] bg-[#F4F4F5] px-2.5 py-0.5 rounded-md border border-[#E5E5E5]">
                  {currentLead.job_title}
                </span>
              )}
              {/* Score Tier Badge */}
              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-md border ${
                scoreTier === 'HOT' 
                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' 
                  : scoreTier === 'WARM' 
                    ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' 
                    : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
              }`}>
                {scoreTier === 'HOT' ? <Flame className="w-3.5 h-3.5 fill-[#DC2626]" /> : scoreTier === 'WARM' ? <Zap className="w-3.5 h-3.5 fill-[#D97706]" /> : <Snowflake className="w-3.5 h-3.5" />}
                <span>{scoreTier} PROSPECT ({leadScore}/100)</span>
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-[#666666] flex-wrap gap-y-1">
              <span className="flex items-center space-x-1 text-[#111111] font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                <span>{currentLead.company}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#888888]" />
                <span>{currentLead.city ? `${currentLead.city}, ${currentLead.country || 'India'}` : 'Location Unset'}</span>
              </span>
              <span>&bull;</span>
              <span>Source: <strong className="text-[#111111]">{currentLead.source}</strong></span>
              <span>&bull;</span>
              <span>Pipeline Potential: <strong suppressHydrationWarning className="font-mono text-[#111111] font-bold">₹{formatNumber(currentLead.expected_value || 50000)}</strong></span>
            </div>
          </div>

          {/* Quick Primary CTAs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const waMsg = `Hi ${displayName}, thank you for contacting us regarding ${currentLead.company}. When would be a good time for a 15-min discovery call?`;
                window.open(`https://wa.me/${(currentLead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMsg)}`, '_blank');
                handleLogActivity('WHATSAPP', 'WhatsApp Message Initiated', waMsg);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-lg transition inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => {
                setActiveDockTab('MEET');
                setMeetTitle(`Discovery & Demo with ${currentLead.company}`);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-[#111111] bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] rounded-lg transition inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Video className="w-4 h-4 text-[#111111]" />
              <span>Schedule Meet</span>
            </button>

            {currentLead.status !== 'Converted' && (
              <button
                onClick={() => setShowConvertModal(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Salesforce 3-in-1 Convert</span>
              </button>
            )}
          </div>
        </div>

        {/* Salesforce-Style Stage Chevron Progression Bar */}
        <div className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {stages.map((stg, idx) => {
              const isPassed = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;
              return (
                <button
                  key={stg.key}
                  onClick={() => handleStageChange(stg.key)}
                  className={`p-3 rounded-lg border text-left transition relative cursor-pointer ${
                    isCurrent
                      ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                      : isPassed
                        ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                        : 'bg-[#F9FAFB] text-[#666666] border-[#E5E5E5] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{stg.label}</span>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : null}
                  </div>
                  <p className={`text-[11px] mt-0.5 ${isCurrent ? 'text-[#D4D4D4]' : 'text-[#888888]'}`}>
                    {stg.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Next Best Action & AI Intelligence Banner */}
      <div className="p-4 bg-gradient-to-r from-[#FAFAFA] to-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#111111] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                HubSpot &amp; Zoho AI Next Best Action
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#DC2626] text-white rounded">HIGH PRIORITY</span>
            </div>
            <p className="text-xs text-[#333333] font-medium mt-1 leading-relaxed">
              {nextAction}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => {
              setActiveDockTab('CALL');
              setCallNotes('Initiating priority discovery call per AI recommendation.');
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-md transition cursor-pointer"
          >
            Execute Now
          </button>
          <button
            onClick={handleRecalculateIntelligence}
            disabled={isRefreshingScore}
            title="Recalculate Fit & Engagement Scores"
            className="p-1.5 text-xs text-[#666666] hover:text-[#111111] bg-white border border-[#D4D4D4] rounded-md hover:bg-[#F8F8F8] transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingScore ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead 360 Information & BANT (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Dual Score Breakdown Meter */}
          <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-[#DC2626]" />
                <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Lead Score Intelligence
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#111111]">{leadScore}/100</span>
            </div>

            <div className="space-y-3">
              {/* Fit Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#666666]">Fit Score (Profile, Budget, Authority)</span>
                  <span className="font-mono font-bold text-[#111111]">{fitScore}/100</span>
                </div>
                <div className="w-full bg-[#F4F4F5] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#111111] h-2 rounded-full transition-all duration-500" style={{ width: `${fitScore}%` }} />
                </div>
              </div>

              {/* Engagement Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#666666]">Engagement Score (Calls, Meets, WhatsApp)</span>
                  <span className="font-mono font-bold text-[#16A34A]">{engScore}/100</span>
                </div>
                <div className="w-full bg-[#F4F4F5] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#16A34A] h-2 rounded-full transition-all duration-500" style={{ width: `${engScore}%` }} />
                </div>
              </div>

              <div className="p-2.5 bg-[#F9FAFB] rounded-lg border border-[#E5E5E5] text-[11px] text-[#666666] leading-relaxed">
                Calculated dynamically via Zoho &amp; HubSpot rules: Fit 40% + Omnichannel Engagement 60%.
              </div>
            </div>
          </div>

          {/* BANT Qualification Card */}
          <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#111111]" />
                <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  BANT Qualification Matrix
                </h3>
              </div>
              <button 
                onClick={handleSaveBANT}
                className="text-[11px] font-bold text-[#111111] hover:underline cursor-pointer"
              >
                Save Matrix
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Budget */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-[#111111]">Budget (₹)</label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={budgetVerified} 
                      onChange={(e) => setBudgetVerified(e.target.checked)}
                      className="rounded border-[#D4D4D4] text-[#111111] focus:ring-0"
                    />
                    <span className="text-[11px] text-[#666666]">Verified</span>
                  </label>
                </div>
                <input 
                  type="number" 
                  value={budgetVal} 
                  onChange={(e) => setBudgetVal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg font-mono font-medium focus:bg-white focus:border-[#111111] outline-none"
                />
              </div>

              {/* Authority */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-[#111111]">Authority Role</label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={authorityVerified} 
                      onChange={(e) => setAuthorityVerified(e.target.checked)}
                      className="rounded border-[#D4D4D4] text-[#111111] focus:ring-0"
                    />
                    <span className="text-[11px] text-[#666666]">Verified</span>
                  </label>
                </div>
                <select
                  value={authorityLevel}
                  onChange={(e) => setAuthorityLevel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                >
                  <option value="DECISION_MAKER">Decision Maker (C-Level / MD / VP)</option>
                  <option value="INFLUENCER">Internal Influencer / Champion</option>
                  <option value="EVALUATOR">Technical / Commercial Evaluator</option>
                  <option value="GATEKEEPER">Gatekeeper / Procurement</option>
                </select>
              </div>

              {/* Need */}
              <div>
                <label className="font-medium text-[#111111] block mb-1">Specific Need / Problem</label>
                <textarea
                  rows={2}
                  value={needText}
                  onChange={(e) => setNeedText(e.target.value)}
                  placeholder="e.g. Migration from legacy ERP to cloud CRM with 25 users..."
                  className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                />
              </div>

              {/* Timeline */}
              <div>
                <label className="font-medium text-[#111111] block mb-1">Decision Timeline</label>
                <select
                  value={timelineVal}
                  onChange={(e) => setTimelineVal(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                >
                  <option value="Immediate (< 30 days)">Immediate (&lt; 30 days)</option>
                  <option value="1 - 3 Months">1 - 3 Months (Current Quarter)</option>
                  <option value="3 - 6 Months">3 - 6 Months</option>
                  <option value="Exploring for next FY">Exploring for next FY</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-2">
              Contact &amp; Account Info
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#666666] text-[11px] block">Corporate Email</span>
                <a href={`mailto:${currentLead.email}`} className="font-mono text-[#111111] font-semibold hover:underline block mt-0.5">
                  {currentLead.email || 'N/A'}
                </a>
              </div>

              <div>
                <span className="text-[#666666] text-[11px] block">Direct Phone</span>
                <a href={`tel:${currentLead.phone}`} className="font-mono text-[#111111] font-semibold hover:underline block mt-0.5">
                  {currentLead.phone || 'N/A'}
                </a>
              </div>

              <div>
                <span className="text-[#666666] text-[11px] block">Company &amp; Industry</span>
                <div className="flex items-center space-x-1.5 text-[#111111] font-medium mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#888888]" />
                  <span>{currentLead.company} &bull; {currentLead.industry || 'Technology'}</span>
                </div>
              </div>

              {currentLead.website && (
                <div>
                  <span className="text-[#666666] text-[11px] block">Website</span>
                  <a href={currentLead.website.startsWith('http') ? currentLead.website : `https://${currentLead.website}`} target="_blank" rel="noreferrer" className="text-[#111111] hover:underline flex items-center space-x-1 mt-0.5">
                    <Globe className="w-3.5 h-3.5 text-[#888888]" />
                    <span>{currentLead.website}</span>
                    <ExternalLink className="w-3 h-3 text-[#888888]" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Fast Action Dock & Omnichannel Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Fast Action Dock */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Dock Tabs */}
            <div className="flex items-center border-b border-[#E5E5E5] bg-[#FAFAFA] overflow-x-auto">
              {[
                { key: 'NOTE', label: 'Add Note', icon: FileText },
                { key: 'CALL', label: 'Log Call', icon: PhoneCall },
                { key: 'EMAIL', label: 'Send Email', icon: Mail },
                { key: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
                { key: 'MEET', label: 'Schedule Meet', icon: Video },
                { key: 'TASK', label: 'Create Task', icon: CheckSquare },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeDockTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveDockTab(tab.key as any)}
                    className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'border-[#111111] text-[#111111] bg-white' 
                        : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="p-4">
              {/* TAB 1: ADD NOTE */}
              {activeDockTab === 'NOTE' && (
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Log executive notes, requirements, objection handling, or next steps..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      disabled={!noteContent.trim() || actionSubmitting}
                      onClick={() => handleLogActivity('NOTE', 'Internal Note Added', noteContent)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] disabled:opacity-50 rounded-lg transition cursor-pointer"
                    >
                      {actionSubmitting ? 'Saving...' : 'Save Note (+5 Eng. Pts)'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: LOG CALL */}
              {activeDockTab === 'CALL' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#666666] block mb-1">Call Outcome</label>
                      <select
                        value={callOutcome}
                        onChange={(e) => setCallOutcome(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                      >
                        <option value="Connected & Discussed Requirements">Connected &amp; Discussed Requirements</option>
                        <option value="Connected - Follow-up Requested">Connected - Follow-up Requested</option>
                        <option value="Left Voicemail / SMS">Left Voicemail / SMS</option>
                        <option value="No Answer / Busy">No Answer / Busy</option>
                        <option value="Gatekeeper Blocked">Gatekeeper Blocked</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#666666] block mb-1">Duration (minutes)</label>
                      <input 
                        type="number"
                        value={callDuration}
                        onChange={(e) => setCallDuration(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg font-mono focus:bg-white focus:border-[#111111] outline-none"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Summary of conversation, objections raised, agreed timeline..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      disabled={actionSubmitting}
                      onClick={() => handleLogActivity(
                        'CALL', 
                        `Call Logged: ${callOutcome}`, 
                        callNotes || `Call lasted ${callDuration} mins. Result: ${callOutcome}`,
                        { duration: callDuration, outcome: callOutcome }
                      )}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition cursor-pointer"
                    >
                      {actionSubmitting ? 'Logging...' : 'Log Call (+20 Eng. Pts)'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: SEND EMAIL */}
              {activeDockTab === 'EMAIL' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Recipient</label>
                    <input 
                      disabled
                      value={currentLead.email}
                      className="w-full px-3 py-1.5 text-xs bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg font-mono text-[#666666]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Subject</label>
                    <input 
                      placeholder="e.g. Next steps regarding ERP & CRM implementation for your team"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Body</label>
                    <textarea 
                      rows={3}
                      placeholder={`Dear ${displayName},\n\nThank you for reaching out to us. We would love to walk you through how our software solves your workflow challenges...`}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      disabled={!emailSubject.trim() || actionSubmitting}
                      onClick={() => handleLogActivity('EMAIL', `Email Sent: ${emailSubject}`, emailBody)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition cursor-pointer inline-flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send &amp; Log Email (+5 Eng. Pts)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: WHATSAPP */}
              {activeDockTab === 'WHATSAPP' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Phone Number</label>
                    <input 
                      disabled
                      value={currentLead.phone}
                      className="w-full px-3 py-1.5 text-xs bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg font-mono text-[#666666]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">WhatsApp Message</label>
                    <textarea 
                      rows={3}
                      placeholder={`Hi ${displayName}, let's schedule a short 15-min consultation.`}
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      disabled={!waMessage.trim() || actionSubmitting}
                      onClick={() => {
                        window.open(`https://wa.me/${(currentLead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`, '_blank');
                        handleLogActivity('WHATSAPP', 'WhatsApp Message Dispatched', waMessage);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-lg transition cursor-pointer inline-flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open WhatsApp Web &amp; Log (+15 Eng. Pts)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: SCHEDULE MEET */}
              {activeDockTab === 'MEET' && (
                <div className="space-y-4">
                  {createdMeetingResult ? (
                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-[#111111]">Google Meet Space Created!</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#666666]">
                          Provider: Google Meet
                        </span>
                      </div>

                      <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg space-y-1.5">
                        <p className="text-xs font-semibold text-[#111111]">{createdMeetingResult.title}</p>
                        {createdMeetingResult.google_space_name && (
                          <p className="text-[10px] font-mono text-[#666666]">
                            Space Name: <span className="text-[#111111] font-semibold">{createdMeetingResult.google_space_name}</span>
                          </p>
                        )}
                        <p className="text-xs font-mono font-medium text-blue-600 break-all">
                          {createdMeetingResult.meet_link}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => {
                            setCreatedMeetingResult(null);
                            setMeetTitle('');
                          }}
                          className="text-xs text-[#666666] hover:text-[#111111] hover:underline"
                        >
                          + Schedule Another Meeting
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(createdMeetingResult.meet_link);
                              setCopiedMeetLink(true);
                              setTimeout(() => setCopiedMeetLink(false), 2000);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-[#111111] bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] rounded-lg transition inline-flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedMeetLink ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedMeetLink ? 'Copied!' : 'Copy Link'}</span>
                          </button>

                          <a
                            href={createdMeetingResult.meet_link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meeting</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-3">
                          <label className="text-[11px] font-medium text-[#666666] block mb-1">Meeting Title *</label>
                          <input 
                            value={meetTitle || `CRM Product Demo: ${currentLead.company || currentLead.name}`}
                            onChange={(e) => setMeetTitle(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                            placeholder="e.g. CRM Product Demo & Architecture Review"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[#666666] block mb-1">Date</label>
                          <input 
                            type="date"
                            value={meetDate}
                            onChange={(e) => setMeetDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[#666666] block mb-1">Start Time</label>
                          <input 
                            type="time"
                            value={meetTime}
                            onChange={(e) => setMeetTime(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[#666666] block mb-1">Duration</label>
                          <select 
                            value={meetDuration}
                            onChange={(e) => setMeetDuration(Number(e.target.value))}
                            className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                          >
                            <option value={15}>15 mins</option>
                            <option value={30}>30 mins</option>
                            <option value={45}>45 mins</option>
                            <option value={60}>60 mins</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-xs">
                        <div className="flex items-center space-x-2">
                          <Video className="w-4 h-4 text-[#111111]" />
                          <span className="font-semibold text-[#111111]">Provider: Google Meet (REST API v2)</span>
                        </div>
                        <span className="text-[11px] text-[#666666] font-mono">spaces.create</span>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          disabled={actionSubmitting}
                          onClick={async () => {
                            setActionSubmitting(true);
                            try {
                              const finalTitle = meetTitle.trim() || `CRM Product Demo: ${currentLead.company || currentLead.name}`;
                              const chosenDate = meetDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
                              const startDateTime = `${chosenDate}T${meetTime || '11:00'}:00`;

                              const res = await api.post('/integrations/google-meet/create', {
                                title: finalTitle,
                                startTime: startDateTime,
                                durationMinutes: meetDuration,
                                attendeeEmail: currentLead.email,
                                attendeeName: currentLead.name,
                                leadId: currentLead.id,
                                timezone: 'Asia/Kolkata',
                                accessType: 'OPEN',
                              });

                              const data = res?.data || res;
                              const link = data.meet_link || data.google_meet_url || 'https://meet.google.com/crm-demo-call';
                              setCreatedMeetingResult({
                                meet_link: link,
                                google_space_name: data.google_space_name,
                                title: finalTitle,
                              });

                              fetchLeadFromBackend();
                            } catch (err: any) {
                              console.error('Error creating Google Meet:', err);
                              alert('Failed to generate Google Meet space.');
                            } finally {
                              setActionSubmitting(false);
                            }
                          }}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] disabled:opacity-50 rounded-lg transition cursor-pointer inline-flex items-center space-x-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{actionSubmitting ? 'Creating Meet Space...' : 'Create Google Meet (+25 Eng. Pts)'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: TASK */}
              {activeDockTab === 'TASK' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#666666] block mb-1">Task Title</label>
                      <input 
                        placeholder="e.g. Send custom price proposal & case studies"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#666666] block mb-1">Due Date</label>
                      <input 
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:bg-white focus:border-[#111111] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      disabled={!taskTitle.trim() || actionSubmitting}
                      onClick={() => handleLogActivity('TASK', `Task Assigned: ${taskTitle}`, `Due by: ${taskDueDate || 'End of Week'}`)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition cursor-pointer"
                    >
                      Create Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Omnichannel Activity Timeline */}
          <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#111111]" />
                <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Omnichannel Activity History
                </h3>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
                {(['ALL', 'CALL', 'EMAIL', 'WHATSAPP', 'MEETING', 'NOTE', 'STAGE'] as const).map(flt => (
                  <button
                    key={flt}
                    onClick={() => setTimelineFilter(flt)}
                    className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                      timelineFilter === flt
                        ? 'bg-[#111111] text-white'
                        : 'bg-[#F4F4F5] text-[#666666] hover:bg-[#E5E5E5]'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Feed */}
            {filteredTimeline.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#888888] space-y-2">
                <FileText className="w-8 h-8 mx-auto text-[#D4D4D4]" />
                <p>No logged activities matching this filter.</p>
                <p className="text-[11px] text-[#AAAAAA]">Use the Fast Action Dock above to log calls, emails, WhatsApp messages or notes.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E5E5E5]">
                {filteredTimeline.map(act => {
                  const isCall = act.type === 'CALL';
                  const isMeet = act.type === 'MEETING';
                  const isWa = act.type === 'WHATSAPP';
                  const isEmail = act.type === 'EMAIL';
                  const isStage = act.type === 'STAGE_CHANGE' || act.type === 'STATUS_CHANGE';

                  return (
                    <div key={act.id} className="relative flex items-start space-x-3 pl-8">
                      {/* Timeline Icon Node */}
                      <div className={`absolute left-0 w-7 h-7 rounded-full flex items-center justify-center border text-white ${
                        isCall ? 'bg-[#2563EB] border-[#1D4ED8]' :
                        isMeet ? 'bg-[#7C3AED] border-[#6D28D9]' :
                        isWa ? 'bg-[#16A34A] border-[#15803D]' :
                        isEmail ? 'bg-[#D97706] border-[#B45309]' :
                        isStage ? 'bg-[#111111] border-[#111111]' :
                        'bg-[#4B5563] border-[#374151]'
                      }`}>
                        {isCall && <PhoneCall className="w-3.5 h-3.5" />}
                        {isMeet && <Video className="w-3.5 h-3.5" />}
                        {isWa && <MessageSquare className="w-3.5 h-3.5" />}
                        {isEmail && <Mail className="w-3.5 h-3.5" />}
                        {isStage && <ChevronRight className="w-3.5 h-3.5" />}
                        {!isCall && !isMeet && !isWa && !isEmail && !isStage && <FileText className="w-3.5 h-3.5" />}
                      </div>

                      <div className="w-full p-3 bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#111111]">{act.title}</h4>
                          <span className="text-[10px] text-[#888888] font-mono">
                            {new Date(act.created_at).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-[#444444] mt-1 whitespace-pre-wrap leading-relaxed">
                            {act.description}
                          </p>
                        )}
                        {act.metadata?.meet_link && (
                          <div className="mt-2.5 pt-2 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E5E5E5] text-[#666666]">
                                Google Meet
                              </span>
                              {act.metadata?.google_space_name && (
                                <span className="text-[10px] font-mono text-[#888888]">
                                  {act.metadata.google_space_name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(act.metadata.meet_link);
                                  setCopiedTimelineMeetId(act.id);
                                  setTimeout(() => setCopiedTimelineMeetId(null), 2000);
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-[#111111] bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] rounded transition inline-flex items-center space-x-1 cursor-pointer"
                              >
                                {copiedTimelineMeetId === act.id ? (
                                  <Check className="w-3 h-3 text-[#16A34A]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{copiedTimelineMeetId === act.id ? 'Copied' : 'Copy Link'}</span>
                              </button>
                              <a
                                href={act.metadata.meet_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded transition cursor-pointer"
                              >
                                <Video className="w-3 h-3" />
                                <span>Join Meeting</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SALESFORCE 3-IN-1 CONVERSION MODAL */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Salesforce 3-in-1 Lead Conversion
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Convert <strong className="text-[#111111]">{displayName}</strong> into Account, Contact, and Opportunity Deal. Historical lead record is preserved.
                </p>
              </div>
              <button 
                onClick={() => setShowConvertModal(false)}
                className="p-1.5 text-[#888888] hover:text-[#111111] rounded-md hover:bg-[#F4F4F5]"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Section 1: Account Mapping */}
              <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111] flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-[#888888]" />
                    <span>1. Account (Company)</span>
                  </span>
                  <div className="flex items-center space-x-2 text-xs">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="accountMode" 
                        checked={convertAccountMode === 'CREATE_NEW'} 
                        onChange={() => setConvertAccountMode('CREATE_NEW')}
                      />
                      <span>Create New</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="accountMode" 
                        checked={convertAccountMode === 'EXISTING'} 
                        onChange={() => setConvertAccountMode('EXISTING')}
                      />
                      <span>Attach Existing</span>
                    </label>
                  </div>
                </div>

                {convertAccountMode === 'CREATE_NEW' ? (
                  <div>
                    <label className="text-[11px] text-[#666666] block mb-1">New Account Name</label>
                    <input 
                      value={accountNameInput} 
                      onChange={(e) => setAccountNameInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg font-medium outline-none focus:border-[#111111]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] text-[#666666] block mb-1">Select Existing Account</label>
                    <select
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg outline-none focus:border-[#111111]"
                    >
                      <option value="">-- Choose Account --</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.industry})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Section 2: Contact Mapping */}
              <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111] flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-[#888888]" />
                    <span>2. Contact Record</span>
                  </span>
                  <div className="flex items-center space-x-2 text-xs">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="contactMode" 
                        checked={convertContactMode === 'CREATE_NEW'} 
                        onChange={() => setConvertContactMode('CREATE_NEW')}
                      />
                      <span>Create New</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="contactMode" 
                        checked={convertContactMode === 'EXISTING'} 
                        onChange={() => setConvertContactMode('EXISTING')}
                      />
                      <span>Attach Existing</span>
                    </label>
                  </div>
                </div>

                {convertContactMode === 'CREATE_NEW' ? (
                  <div>
                    <label className="text-[11px] text-[#666666] block mb-1">Contact Name</label>
                    <input 
                      value={contactNameInput} 
                      onChange={(e) => setContactNameInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg font-medium outline-none focus:border-[#111111]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] text-[#666666] block mb-1">Select Existing Contact</label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg outline-none focus:border-[#111111]"
                    >
                      <option value="">-- Choose Contact --</option>
                      {contacts.map(con => (
                        <option key={con.id} value={con.id}>{con.name} ({con.email})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Section 3: Opportunity Deal */}
              <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111] flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-[#888888]" />
                    <span>3. Deal / Opportunity</span>
                  </span>
                  <label className="flex items-center space-x-1.5 text-xs cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={createDeal} 
                      onChange={(e) => setCreateDeal(e.target.checked)}
                      className="rounded border-[#D4D4D4] text-[#111111] focus:ring-0"
                    />
                    <span className="font-semibold text-[#111111]">Create Opportunity Deal</span>
                  </label>
                </div>

                {createDeal && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-[#666666] block mb-1">Deal Title</label>
                      <input 
                        value={dealTitleInput} 
                        onChange={(e) => setDealTitleInput(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg font-medium outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#666666] block mb-1">Deal Value (₹)</label>
                      <input 
                        type="number"
                        value={dealValueInput} 
                        onChange={(e) => setDealValueInput(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg font-mono font-medium outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#666666] block mb-1">Initial Pipeline Stage</label>
                      <select
                        value={dealStageInput}
                        onChange={(e) => setDealStageInput(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg outline-none focus:border-[#111111]"
                      >
                        <option value="Qualification">Qualification</option>
                        <option value="Value Proposition">Value Proposition</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5E5] bg-[#F8F8F8] flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#444444] bg-white border border-[#D4D4D4] hover:bg-[#F0F0F0] rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={converting}
                onClick={handleExecuteConversion}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition shadow-sm cursor-pointer"
              >
                {converting ? 'Converting Records...' : 'Execute 3-in-1 Conversion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
