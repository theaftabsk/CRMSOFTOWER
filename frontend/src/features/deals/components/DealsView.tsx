'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { 
  TrendingUp, Plus, DollarSign, Clock, Building2, User, ChevronRight, X, 
  LayoutGrid, List, Search, Filter, ArrowUpRight, Percent, Receipt, 
  MessageCircle, Mail, AlertCircle, CheckCircle2, ArrowRight, ExternalLink,
  Briefcase, FileCheck, HelpCircle
} from 'lucide-react';
import { Deal, DealStage } from '../../../types/crm';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { api } from '../../../lib/api';

const PIPELINES = [
  'All Pipelines',
  'Standard Enterprise Pipeline',
  'SaaS Subscriptions Pipeline',
  'Renewals & Retainers Pipeline',
];

const STAGES: { stage: DealStage; label: string; probability: number; color: string }[] = [
  { stage: 'Qualification', label: 'Qualification', probability: 20, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { stage: 'Value Proposition', label: 'Value Proposition', probability: 40, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { stage: 'Proposal Sent', label: 'Proposal Sent', probability: 60, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { stage: 'Negotiation', label: 'Negotiation', probability: 80, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { stage: 'Closed Won', label: 'Closed Won', probability: 100, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { stage: 'Closed Lost', label: 'Closed Lost', probability: 0, color: 'bg-red-50 text-red-700 border-red-200' },
];

const LOST_REASONS = [
  'Competitor Won',
  'Budget Constraints / Price',
  'Project Postponed / Timing',
  'Product Feature Gap',
  'Ghosted / Unresponsive',
  'Other',
];

export const DealsView: React.FC = () => {
  const { deals, addDeal, updateDealStage, accounts, refreshData } = useCRM();

  // View Controls
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedPipeline, setSelectedPipeline] = useState<string>('All Pipelines');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Lost Reason Modal State
  const [lostDialogDealId, setLostDialogDealId] = useState<string | null>(null);
  const [selectedLostReason, setSelectedLostReason] = useState<string>(LOST_REASONS[0]);
  const [customLostNote, setCustomLostNote] = useState('');

  // Invoice Conversion State
  const [isConverting, setIsConverting] = useState(false);
  const [convertedInvoiceInfo, setConvertedInvoiceInfo] = useState<{ number: string; url: string } | null>(null);

  // New Deal Form State
  const [newDeal, setNewDeal] = useState({
    title: '',
    account_name: '',
    stage: 'Qualification' as Deal['stage'],
    value: 250000,
    closing_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    owner: 'Vikram Sales Manager',
    pipeline_name: 'Standard Enterprise Pipeline',
    notes: '',
  });

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      // Pipeline filter
      if (selectedPipeline !== 'All Pipelines') {
        const dealPipeline = d.pipeline_name || 'Standard Enterprise Pipeline';
        if (dealPipeline !== selectedPipeline) return false;
      }
      // Stage filter
      if (stageFilter !== 'All' && d.stage !== stageFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = d.title.toLowerCase().includes(query);
        const matchesAccount = (d.account_name || '').toLowerCase().includes(query);
        const matchesOwner = (d.owner || d.owner_name || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesAccount && !matchesOwner) return false;
      }
      return true;
    });
  }, [deals, selectedPipeline, stageFilter, searchQuery]);

  // Forecasting KPI Calculations
  const openDeals = filteredDeals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
  const wonDeals = filteredDeals.filter(d => d.stage === 'Closed Won');
  const lostDeals = filteredDeals.filter(d => d.stage === 'Closed Lost');

  const totalPipelineValue = openDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
  const weightedForecastValue = openDeals.reduce((acc, d) => {
    const prob = d.probability !== undefined ? d.probability : 50;
    return acc + ((Number(d.value) || 0) * prob) / 100;
  }, 0);
  const wonTotalValue = wonDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  const totalClosed = wonDeals.length + lostDeals.length;
  const winRate = totalClosed > 0 ? Math.round((wonDeals.length / totalClosed) * 100) : 0;
  const avgDealSize = openDeals.length > 0 ? Math.round(totalPipelineValue / openDeals.length) : 0;

  // HTML5 Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    const currentDeal = deals.find(d => d.id === dealId);
    if (!currentDeal || currentDeal.stage === targetStage) return;

    if (targetStage === 'Closed Lost') {
      setLostDialogDealId(dealId);
      return;
    }

    updateDealStage(dealId, targetStage);
    if (activeDeal && activeDeal.id === dealId) {
      setActiveDeal({ ...activeDeal, stage: targetStage });
    }
  };

  // Confirm Closed Lost with Reason
  const confirmClosedLost = () => {
    if (!lostDialogDealId) return;
    const reasonText = customLostNote.trim() 
      ? `${selectedLostReason}: ${customLostNote}` 
      : selectedLostReason;

    updateDealStage(lostDialogDealId, 'Closed Lost', reasonText);
    if (activeDeal && activeDeal.id === lostDialogDealId) {
      setActiveDeal({ ...activeDeal, stage: 'Closed Lost', lost_reason: reasonText });
    }
    setLostDialogDealId(null);
    setCustomLostNote('');
  };

  // Convert Won Deal to Invoice
  const handleConvertToInvoice = async (deal: Deal) => {
    setIsConverting(true);
    try {
      const res = await api.convertDealToInvoice(deal.id);
      if (res && res.success) {
        setConvertedInvoiceInfo({
          number: res.invoice.invoice_number,
          url: res.payment_url,
        });
        if (refreshData) refreshData();
      } else {
        alert('Could not convert deal to invoice. Please verify backend connection.');
      }
    } catch (err) {
      console.error(err);
      alert('Error converting deal to invoice');
    } finally {
      setIsConverting(false);
    }
  };

  // Create Deal Submit
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.title || !newDeal.account_name) return;

    addDeal({
      title: newDeal.title,
      account_name: newDeal.account_name,
      stage: newDeal.stage,
      value: Number(newDeal.value) || 0,
      closing_date: newDeal.closing_date,
      owner: newDeal.owner,
      pipeline_name: newDeal.pipeline_name,
      notes: newDeal.notes,
      probability: STAGES.find(s => s.stage === newDeal.stage)?.probability || 50,
    });

    setShowCreateModal(false);
    setNewDeal({
      title: '',
      account_name: '',
      stage: 'Qualification',
      value: 250000,
      closing_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      owner: 'Vikram Sales Manager',
      pipeline_name: 'Standard Enterprise Pipeline',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader 
        title="Sales Deals & Pipeline" 
        subtitle="Manage deals, visual Kanban workflow, weighted revenue forecasting, and one-click invoice conversion."
        action={
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="btn-primary cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Deal</span>
            </button>
          </div>
        }
      />

      {/* Revenue Forecasting KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Open Pipeline */}
        <div className="shadcn-card p-4 bg-white border border-[#E5E5E5] rounded-xl">
          <div className="flex justify-between items-center text-[#666666] text-xs font-medium uppercase tracking-wider">
            <span>Total Open Pipeline</span>
            <DollarSign className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111]">
              ₹{formatNumber(totalPipelineValue)}
            </span>
            <span className="text-xs text-[#666666]">{openDeals.length} deals</span>
          </div>
          <span className="text-[11px] text-[#888888] mt-1 block">Sum of all active, unclosed opportunities</span>
        </div>

        {/* Weighted Revenue Forecast */}
        <div className="shadcn-card p-4 bg-white border border-[#E5E5E5] rounded-xl">
          <div className="flex justify-between items-center text-[#666666] text-xs font-medium uppercase tracking-wider">
            <span>Weighted Forecast</span>
            <TrendingUp className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111]">
              ₹{formatNumber(Math.round(weightedForecastValue))}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#F4F4F5] text-[#111111] font-mono font-medium">
              ∑ Value × Prob%
            </span>
          </div>
          <span className="text-[11px] text-[#888888] mt-1 block">Expected closing revenue based on stage probability</span>
        </div>

        {/* Closed Won Revenue */}
        <div className="shadcn-card p-4 bg-white border border-[#E5E5E5] rounded-xl">
          <div className="flex justify-between items-center text-[#666666] text-xs font-medium uppercase tracking-wider">
            <span>Closed Won Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#16A34A]">
              ₹{formatNumber(wonTotalValue)}
            </span>
            <span className="text-xs text-[#16A34A] font-semibold">{wonDeals.length} won</span>
          </div>
          <span className="text-[11px] text-[#888888] mt-1 block">Successfully closed and billable deals</span>
        </div>

        {/* Win Rate & Avg Deal Size */}
        <div className="shadcn-card p-4 bg-white border border-[#E5E5E5] rounded-xl">
          <div className="flex justify-between items-center text-[#666666] text-xs font-medium uppercase tracking-wider">
            <span>Win Rate & Avg Size</span>
            <Percent className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#111111]">
              {winRate}%
            </span>
            <span suppressHydrationWarning className="text-xs font-mono font-semibold text-[#666666]">
              Avg: ₹{formatNumber(avgDealSize)}
            </span>
          </div>
          <span className="text-[11px] text-[#888888] mt-1 block">{totalClosed} historical closed deals tracked</span>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white border border-[#E5E5E5] rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Pipeline Switcher */}
          <div className="flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#666666]" />
            <select
              value={selectedPipeline}
              onChange={(e) => setSelectedPipeline(e.target.value)}
              className="text-xs font-medium py-1 px-2.5 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA] text-[#111111] focus:outline-none focus:border-[#111111]"
            >
              {PIPELINES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-[#666666]" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="text-xs font-medium py-1 px-2.5 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA] text-[#111111] focus:outline-none focus:border-[#111111]"
            >
              <option value="All">All Stages</option>
              {STAGES.map(s => (
                <option key={s.stage} value={s.stage}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search deals, company, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA] text-[#111111] w-48 sm:w-64 focus:outline-none focus:border-[#111111]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888888]">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 border border-[#E5E5E5] rounded-lg p-0.5 bg-[#FAFAFA]">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'kanban' 
                ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#E5E5E5]' 
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'table' 
                ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#E5E5E5]' 
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Data Table</span>
          </button>
        </div>
      </div>

      {/* MAIN VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
          {STAGES.map(({ stage, label, probability, color }) => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage);
            const stageTotal = stageDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
            const isTargeted = dragOverStage === stage;

            return (
              <div 
                key={stage} 
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
                className={`w-76 flex-shrink-0 rounded-xl p-3 flex flex-col transition-all duration-150 ${
                  isTargeted 
                    ? 'bg-[#F4F4F5] border-2 border-dashed border-[#111111]' 
                    : 'bg-[#F8F8F8] border border-[#E5E5E5]'
                }`}
              >
                {/* Column Header */}
                <div className="flex justify-between items-start mb-3 pb-2.5 border-b border-[#E5E5E5]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-[#111111] block">{label}</span>
                      <span className="text-[10px] font-mono text-[#888888]">{probability}%</span>
                    </div>
                    <span suppressHydrationWarning className="text-xs font-mono font-bold text-[#111111] mt-0.5 block">
                      ₹{formatNumber(stageTotal)}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white border border-[#E5E5E5] text-[#111111]">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Cards List in Stage */}
                <div className="space-y-3 flex-1 min-h-[420px]">
                  {stageDeals.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-center text-[#999999] text-xs border border-dashed border-[#E5E5E5] rounded-lg">
                      Drag deal here
                    </div>
                  ) : (
                    stageDeals.map(deal => {
                      const dealProb = deal.probability !== undefined ? deal.probability : probability;
                      return (
                        <div 
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onClick={() => setActiveDeal(deal)}
                          className="shadcn-card p-3.5 space-y-2.5 cursor-grab active:cursor-grabbing hover:border-[#111111] bg-white border border-[#E5E5E5] rounded-xl transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                        >
                          {/* Title & Value */}
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-xs text-[#111111] leading-tight line-clamp-2">
                              {deal.title}
                            </h4>
                            <span suppressHydrationWarning className="font-mono text-xs font-bold text-[#111111] whitespace-nowrap">
                              ₹{formatNumber(deal.value)}
                            </span>
                          </div>

                          {/* Account & Pipeline */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5 text-[11px] text-[#555555]">
                              <Building2 className="w-3 h-3 text-[#888888] flex-shrink-0" />
                              <span className="truncate">{deal.account_name}</span>
                            </div>
                            {deal.pipeline_name && deal.pipeline_name !== 'Standard Enterprise Pipeline' && (
                              <span className="inline-block text-[10px] px-1.5 py-0.2 bg-[#F4F4F5] text-[#666666] rounded border border-[#E5E5E5]">
                                {deal.pipeline_name}
                              </span>
                            )}
                          </div>

                          {/* Probability Bar */}
                          <div>
                            <div className="flex justify-between text-[10px] text-[#888888] mb-1 font-mono">
                              <span>Probability</span>
                              <span>{dealProb}%</span>
                            </div>
                            <div className="w-full bg-[#EEEEEE] h-1 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  stage === 'Closed Won' ? 'bg-[#16A34A]' : stage === 'Closed Lost' ? 'bg-[#DC2626]' : 'bg-[#111111]'
                                }`} 
                                style={{ width: `${dealProb}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer Meta */}
                          <div className="flex justify-between items-center text-[10px] text-[#888888] pt-2 border-t border-[#F0F0F0]">
                            <span className="truncate max-w-[120px]">
                              {deal.owner || deal.owner_name || 'Sales Team'}
                            </span>
                            <span className="font-mono">
                              {deal.closing_date || deal.expected_close || '30d'}
                            </span>
                          </div>

                          {/* Lost Reason Display (if closed lost) */}
                          {deal.stage === 'Closed Lost' && deal.lost_reason && (
                            <div className="text-[10px] text-[#DC2626] bg-red-50 p-1.5 rounded border border-red-100 flex items-start space-x-1">
                              <AlertCircle className="w-3 h-3 text-[#DC2626] flex-shrink-0 mt-0.5" />
                              <span className="truncate">{deal.lost_reason}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MAIN VIEW: ENTERPRISE DATA TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] tracking-wider uppercase">
                  <th className="py-3 px-4">Deal Title</th>
                  <th className="py-3 px-4">Account / Company</th>
                  <th className="py-3 px-4">Pipeline</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Value (₹)</th>
                  <th className="py-3 px-4 text-center">Probability</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Closing Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs text-[#111111]">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#888888]">
                      No deals found matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => {
                    const currentStageConfig = STAGES.find(s => s.stage === deal.stage);
                    return (
                      <tr 
                        key={deal.id} 
                        className="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                        onClick={() => setActiveDeal(deal)}
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#111111]">
                          {deal.title}
                        </td>
                        <td className="py-3.5 px-4 text-[#555555]">
                          <div className="flex items-center space-x-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                            <span>{deal.account_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-[#666666]">
                          {deal.pipeline_name || 'Standard Enterprise'}
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={deal.stage}
                            onChange={(e) => {
                              const newStage = e.target.value as DealStage;
                              if (newStage === 'Closed Lost') {
                                setLostDialogDealId(deal.id);
                              } else {
                                updateDealStage(deal.id, newStage);
                              }
                            }}
                            className="text-[11px] font-medium py-1 px-2 border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none"
                          >
                            {STAGES.map(s => (
                              <option key={s.stage} value={s.stage}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td suppressHydrationWarning className="py-3.5 px-4 text-right font-mono font-bold text-[#111111]">
                          ₹{formatNumber(deal.value)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F4F4F5] text-[#111111]">
                            {deal.probability !== undefined ? deal.probability : (currentStageConfig?.probability || 50)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#666666]">
                          {deal.owner || deal.owner_name || 'Sales Team'}
                        </td>
                        <td className="py-3.5 px-4 text-[#666666] font-mono text-[11px]">
                          {deal.closing_date || deal.expected_close || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setActiveDeal(deal)}
                            className="btn-secondary text-[11px] py-1 px-2.5 cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEAL DETAIL SLIDE-OVER DRAWER */}
      {activeDeal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setActiveDeal(null)} 
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-[#E5E5E5] shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E5E5E5] flex justify-between items-start bg-[#FAFAFA]">
                <div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">Deal Details</span>
                  <h3 className="font-bold text-base text-[#111111] mt-0.5">{activeDeal.title}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-[#666666] mt-1">
                    <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                    <span className="font-medium">{activeDeal.account_name}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveDeal(null)} 
                  className="p-1 rounded-md text-[#888888] hover:text-[#111111] hover:bg-[#E5E5E5]/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar text-xs">
                {/* Stage Stepper Bar */}
                <div>
                  <span className="font-semibold text-xs text-[#111111] block mb-2">Stage Progression</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {STAGES.map((st) => {
                      const isActive = activeDeal.stage === st.stage;
                      return (
                        <button
                          key={st.stage}
                          onClick={() => {
                            if (st.stage === 'Closed Lost') {
                              setLostDialogDealId(activeDeal.id);
                            } else {
                              updateDealStage(activeDeal.id, st.stage);
                              setActiveDeal({ ...activeDeal, stage: st.stage });
                            }
                          }}
                          className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#111111] text-white border-[#111111] font-semibold'
                              : 'bg-white text-[#444444] border-[#E5E5E5] hover:border-[#111111]'
                          }`}
                        >
                          <span className="block text-[10px] leading-tight opacity-75">{st.probability}%</span>
                          <span className="block text-[11px] font-medium truncate">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Deal Financials Card */}
                <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666] font-medium">Deal Amount</span>
                    <span suppressHydrationWarning className="font-mono text-base font-bold text-[#111111]">
                      ₹{formatNumber(activeDeal.value)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666] font-medium">Weighted Forecast</span>
                    <span suppressHydrationWarning className="font-mono text-sm font-semibold text-[#111111]">
                      ₹{formatNumber(Math.round(((activeDeal.value || 0) * (activeDeal.probability ?? 50)) / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666] font-medium">Assigned Owner</span>
                    <span className="text-[#111111] font-medium">
                      {activeDeal.owner || activeDeal.owner_name || 'Vikram Sales Manager'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666] font-medium">Closing Date</span>
                    <span className="font-mono text-[#111111]">
                      {activeDeal.closing_date || activeDeal.expected_close || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666] font-medium">Pipeline</span>
                    <span className="text-[#111111]">
                      {activeDeal.pipeline_name || 'Standard Enterprise'}
                    </span>
                  </div>
                </div>

                {/* Lost Reason if applicable */}
                {activeDeal.stage === 'Closed Lost' && activeDeal.lost_reason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-semibold text-[#DC2626] block">Closed Lost Reason</span>
                    <p className="text-xs text-red-900">{activeDeal.lost_reason}</p>
                  </div>
                )}

                {/* One-Click Invoice Conversion */}
                <div className="p-4 border border-[#E5E5E5] rounded-xl bg-white space-y-3">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-[#111111]" />
                    <span className="font-semibold text-xs text-[#111111]">Finance & Invoicing Automation</span>
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    Generate a formal GST invoice with public payment token and UPI/Card link directly from this deal.
                  </p>
                  
                  {convertedInvoiceInfo ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                      <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Invoice Generated: {convertedInvoiceInfo.number}</span>
                      </div>
                      <a 
                        href={convertedInvoiceInfo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-emerald-900 font-mono underline"
                      >
                        <span>Open Public Payment Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConvertToInvoice(activeDeal)}
                      disabled={isConverting}
                      className="w-full btn-primary py-2 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{isConverting ? 'Generating Invoice...' : 'Convert to Invoice & Payment Link'}</span>
                    </button>
                  )}
                </div>

                {/* Communication Outreach */}
                <div className="p-4 border border-[#E5E5E5] rounded-xl bg-white space-y-3">
                  <span className="font-semibold text-xs text-[#111111] block">Client Quick Outreach</span>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Hi ${activeDeal.account_name}, following up regarding our discussion on ${activeDeal.title} (Value: ₹${formatNumber(activeDeal.value)}). Let us know your thoughts!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center space-x-1.5 p-2 rounded-lg border border-[#E5E5E5] hover:bg-[#FAFAFA] text-[#111111] font-medium text-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`mailto:contact@example.com?subject=${encodeURIComponent(`Update on ${activeDeal.title}`)}&body=${encodeURIComponent(`Hello team,\n\nHere is the latest status for ${activeDeal.title} at stage: ${activeDeal.stage}.\n\nExpected Value: ₹${formatNumber(activeDeal.value)}\n\nBest regards,\nCRM Sales Team`)}`}
                      className="flex items-center justify-center space-x-1.5 p-2 rounded-lg border border-[#E5E5E5] hover:bg-[#FAFAFA] text-[#111111] font-medium text-xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#111111]" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2">
                  <span className="font-semibold text-xs text-[#111111] block">Deal Notes</span>
                  <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-[#555555] leading-relaxed">
                    {activeDeal.notes || 'No notes added yet for this deal. Edit to add discussion minutes.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLOSED LOST REASON PROMPT MODAL */}
      {lostDialogDealId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                <h3 className="font-semibold text-base text-[#111111]">Mark Deal as Closed Lost</h3>
              </div>
              <button onClick={() => setLostDialogDealId(null)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#666666]">
              Please record the reason why this deal was lost. This helps improve sales win-rate reporting and competitive analytics.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Primary Reason *</label>
                <select
                  value={selectedLostReason}
                  onChange={(e) => setSelectedLostReason(e.target.value)}
                  className="shadcn-input w-full bg-white"
                >
                  {LOST_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Additional Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={customLostNote}
                  onChange={(e) => setCustomLostNote(e.target.value)}
                  placeholder="e.g. Lost to Competitor X due to 15% discount on 3-year contract"
                  className="shadcn-input w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
              <button 
                type="button" 
                onClick={() => setLostDialogDealId(null)} 
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmClosedLost} 
                className="btn-primary bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs"
              >
                Confirm Closed Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE DEAL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-lg shadow-xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Create Sales Opportunity</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Deal Title *</label>
                <input 
                  required
                  type="text" 
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  className="shadcn-input w-full"
                  placeholder="e.g. Apex Hospital ERP Suite Migration"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Company / Account *</label>
                  <input 
                    required
                    type="text" 
                    value={newDeal.account_name}
                    onChange={(e) => setNewDeal({ ...newDeal, account_name: e.target.value })}
                    className="shadcn-input w-full"
                    placeholder="e.g. Apex Health Systems"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Sales Pipeline</label>
                  <select
                    value={newDeal.pipeline_name}
                    onChange={(e) => setNewDeal({ ...newDeal, pipeline_name: e.target.value })}
                    className="shadcn-input w-full bg-white"
                  >
                    {PIPELINES.filter(p => p !== 'All Pipelines').map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Deal Value (₹) *</label>
                  <input 
                    required
                    type="number" 
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                    className="shadcn-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Initial Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as any })}
                    className="shadcn-input w-full bg-white"
                  >
                    {STAGES.map(s => <option key={s.stage} value={s.stage}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Target Closing Date</label>
                  <input 
                    type="date" 
                    value={newDeal.closing_date}
                    onChange={(e) => setNewDeal({ ...newDeal, closing_date: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Sales Owner</label>
                  <input 
                    type="text" 
                    value={newDeal.owner}
                    onChange={(e) => setNewDeal({ ...newDeal, owner: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Discussion Notes / Deal Scope</label>
                <textarea 
                  rows={2}
                  value={newDeal.notes}
                  onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                  placeholder="Key deliverables, buyer decision makers, budget notes..."
                  className="shadcn-input w-full"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
