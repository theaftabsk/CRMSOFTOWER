'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/layout/PageHeader';
import { api } from '../../../lib/api';
import { 
  Globe, Plus, Code, Copy, Check, ExternalLink, 
  Layers, CheckCircle2, RefreshCw, X, Loader2, Sparkles, 
  Eye, FileText, BarChart3, Settings, Trash2, CopyCheck, 
  Sliders, ArrowRight, MessageSquare, Terminal, Zap, ShieldCheck, MoreHorizontal
} from 'lucide-react';
import { WebForm } from '@/types/crm';
import { FORM_TEMPLATES, FormTemplate } from '@/features/forms/data/formTemplates';
import { formatNumber } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function WebFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<WebForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<WebForm | null>(null);
  
  // Modals
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedTab, setEmbedTab] = useState<'iframe' | 'link' | 'sdk' | 'popup'>('iframe');
  const [formToDelete, setFormToDelete] = useState<{ id: string; title: string } | null>(null);
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);

  // Click outside to close 3-dot dropdown
  useEffect(() => {
    const handleGlobalClick = () => setOpenActionDropdownId(null);
    if (openActionDropdownId) {
      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
    }
  }, [openActionDropdownId]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [layoutFilter, setLayoutFilter] = useState<'ALL' | 'classic' | 'conversational'>('ALL');

  // Quick Create State
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    layout: 'classic' as 'classic' | 'conversational',
    submit_btn_text: 'Submit Inquiry',
    success_message: 'Thank you! Our sales team will connect with you shortly.',
    redirect_url: '',
  });
  const [creating, setCreating] = useState(false);

  const loadForms = async () => {
    setLoading(true);
    try {
      const data = await api.getWebForms();
      setForms(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleToggle = async (id: string) => {
    await api.toggleWebForm(id);
    loadForms();
  };

  const handleDuplicate = async (id: string) => {
    await api.duplicateWebForm(id);
    loadForms();
  };

  const handleDelete = (id: string, title: string) => {
    setFormToDelete({ id, title });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title) return;
    setCreating(true);
    try {
      const created = await api.createWebForm(newForm);
      setShowCreateModal(false);
      if (created?.id) {
        router.push(`/forms/${created.id}`);
      } else {
        loadForms();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleInstantiateTemplate = async (template: FormTemplate) => {
    setCreating(true);
    try {
      const created = await api.createWebForm({
        title: template.name,
        description: template.description,
        layout: template.layout,
        fields: template.fields,
        theme: template.theme,
        settings: template.settings,
        submit_btn_text: 'Submit Inquiry',
        success_message: 'Thank you! Your request has been recorded.',
      });
      setShowTemplateModal(false);
      if (created?.id) {
        router.push(`/forms/${created.id}`);
      } else {
        loadForms();
      }
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // KPIs
  const totalViews = useMemo(() => forms.reduce((acc, f) => acc + (f.views_count || 0), 0), [forms]);
  const totalStarts = useMemo(() => forms.reduce((acc, f) => acc + (f.starts_count || 0), 0), [forms]);
  const totalSubmissions = useMemo(() => forms.reduce((acc, f) => acc + (f.submissions_count || 0), 0), [forms]);
  const activeFormsCount = useMemo(() => forms.filter((f) => f.is_active).length, [forms]);
  const overallConversionRate = useMemo(() => {
    return totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(2) : '0.00';
  }, [totalViews, totalSubmissions]);

  // Filtered Forms
  const filteredForms = useMemo(() => {
    return forms.filter((f) => {
      const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (f.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? f.is_active : !f.is_active);
      const matchesLayout = layoutFilter === 'ALL' || f.layout === layoutFilter;
      return matchesSearch && matchesStatus && matchesLayout;
    });
  }, [forms, searchTerm, statusFilter, layoutFilter]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header adhering to AGENTS.md */}
      <PageHeader
        title="Web Forms &amp; Lead Capture Studio"
        subtitle="Deploy conversational Typeform-style or classic lead capture forms to ingest prospects directly into your CRM pipeline."
        action={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-3.5 py-2 bg-white border border-[#D4D4D4] text-[#111111] hover:bg-[#F8F8F8] rounded-lg text-xs font-semibold transition shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Use Template</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary space-x-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Web Form</span>
            </button>
          </div>
        }
      />

      {/* KPI Operations Dashboard Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Total Forms</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{forms.length}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Configured Studio Forms</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#16A34A] font-semibold uppercase tracking-wider block">Active Forms</span>
          <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">{activeFormsCount}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Accepting Submissions</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Total Views</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            {formatNumber(totalViews)}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Public Impressions</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Form Starts</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            {formatNumber(totalStarts)}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">User Engagements</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#111111] font-semibold uppercase tracking-wider block">Leads Ingested</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            {formatNumber(totalSubmissions)}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Completed Submissions</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#16A34A] font-semibold uppercase tracking-wider block">Conversion Rate</span>
          <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">
            {overallConversionRate}%
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Submissions / Views</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="liquid-glass p-3 rounded-2xl flex flex-col md:flex-row justify-between gap-3 items-center border border-white/80 shadow-sm">
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-[#666666] font-medium whitespace-nowrap">Filter Status:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                statusFilter === st 
                  ? 'bg-[#111111] text-white font-semibold' 
                  : 'bg-[#F4F4F5] text-[#444444] hover:bg-[#E5E5E5]'
              }`}
            >
              {st}
            </button>
          ))}

          <span className="text-[#D4D4D4] mx-1">|</span>

          <span className="text-xs text-[#666666] font-medium whitespace-nowrap">Layout:</span>
          {(['ALL', 'classic', 'conversational'] as const).map((ly) => (
            <button
              key={ly}
              onClick={() => setLayoutFilter(ly)}
              className={`text-xs px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                layoutFilter === ly 
                  ? 'bg-[#111111] text-white font-semibold' 
                  : 'bg-[#F4F4F5] text-[#444444] hover:bg-[#E5E5E5]'
              }`}
            >
              {ly === 'ALL' ? 'All Layouts' : ly === 'conversational' ? 'Conversational (Typeform)' : 'Classic'}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-72">
          <input
            type="text"
            placeholder="Search forms by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadcn-input w-full text-xs"
          />
          <button
            onClick={loadForms}
            title="Refresh list"
            className="p-2 border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] text-[#666666] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Forms Table */}
      <div className="liquid-glass rounded-2xl overflow-hidden border border-white/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Form Title &amp; Details</th>
                <th>Layout Mode</th>
                <th>Status</th>
                <th className="text-center">Views</th>
                <th className="text-center">Leads Captured</th>
                <th className="text-center">Conversion</th>
                <th className="text-right">Studio Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#888888] space-y-1">
                    <p className="text-sm font-semibold text-[#111111]">No web forms found</p>
                    <p className="text-xs text-[#666666]">Click "Create Web Form" or "Use Template" to launch your first lead capture experience.</p>
                  </td>
                </tr>
              ) : (
                filteredForms.map((form) => {
                  const views = form.views_count || 0;
                  const subs = form.submissions_count || 0;
                  const conv = views > 0 ? ((subs / views) * 100).toFixed(1) : '0.0';
                  const isConversational = form.layout === 'conversational';

                  return (
                    <tr key={form.id}>
                      <td>
                        <div className="space-y-0.5">
                          <Link
                            href={`/forms/${form.id}`}
                            className="font-bold text-[#111111] hover:underline block text-xs"
                          >
                            {form.title}
                          </Link>
                          <p className="text-[11px] text-[#666666] truncate max-w-sm">
                            {form.description || 'No description provided'}
                          </p>
                        </div>
                      </td>

                      <td>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                          isConversational 
                            ? 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]' 
                            : 'bg-[#F4F4F5] text-[#111111] border-[#E5E5E5]'
                        }`}>
                          {isConversational ? 'Conversational Typeform' : 'Classic Single Card'}
                        </span>
                      </td>

                      <td>
                        <button
                          onClick={() => handleToggle(form.id)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                            form.is_active
                              ? 'bg-[#DCFCE7] text-[#16A34A] hover:bg-[#BBF7D0]'
                              : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7]'
                          }`}
                        >
                          {form.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="text-center font-mono font-medium text-[#111111] text-xs">
                        {views}
                      </td>

                      <td className="text-center font-mono font-bold text-[#111111] text-xs">
                        {subs}
                      </td>

                      <td className="text-center">
                        <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] rounded font-mono text-[11px] font-bold">
                          {conv}%
                        </span>
                      </td>

                      {/* Studio Actions with 3-Dot More Options Menu */}
                      <td className="text-right whitespace-nowrap relative">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href={`/forms/${form.id}`}
                            title="Open Form Studio"
                            className="px-2.5 py-1 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 btn-liquid shadow-xs cursor-pointer"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Studio</span>
                          </Link>

                          {/* 3-Dot Button */}
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              title="More Options"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionDropdownId(openActionDropdownId === form.id ? null : form.id);
                              }}
                              className={`p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-black/[0.06] btn-liquid transition inline-flex items-center cursor-pointer ${
                                openActionDropdownId === form.id ? 'bg-black/[0.08] text-[#111111]' : ''
                              }`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Floating Liquid Glass Dropdown Menu */}
                            {openActionDropdownId === form.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1 w-52 liquid-glass-dropdown p-1.5 z-40 liquid-animate-in border border-white/80 shadow-2xl text-left"
                              >
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                                  Form Actions
                                </div>

                                <Link
                                  href={`/forms/${form.id}`}
                                  onClick={() => setOpenActionDropdownId(null)}
                                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
                                >
                                  <Sliders className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">Form Studio</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    setSelectedForm(form);
                                    setShowEmbedModal(true);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition text-left cursor-pointer"
                                >
                                  <Code className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">Get Embed Code</span>
                                </button>

                                <a
                                  href={`/f/${form.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setOpenActionDropdownId(null)}
                                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
                                  <span className="font-medium">Open Public Form</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleDuplicate(form.id);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition text-left cursor-pointer"
                                >
                                  <CopyCheck className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">Duplicate Form</span>
                                </button>

                                <div className="border-t border-black/[0.06] my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleDelete(form.id, form.title);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#DC2626] hover:bg-red-50/80 btn-liquid transition text-left cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                  <span className="font-semibold">Delete Form</span>
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

      {/* TEMPLATE PICKER MODAL */}
      {showTemplateModal && (
        <div 
          onClick={() => setShowTemplateModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95"
          >
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-black/[0.04] border border-black/[0.06] flex items-center justify-center text-[#111111]">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#111111]">Enterprise Form Templates</h3>
                  <p className="text-xs text-[#666666]">Choose an industry-optimized template to launch lead capture instantly.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 text-[#666666] hover:text-[#111111] rounded-lg hover:bg-[#F4F4F5] transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar flex-1">
              {FORM_TEMPLATES.map((tpl) => (
                <div 
                  key={tpl.id}
                  className="p-4 rounded-xl border border-[#E5E5E5] hover:border-[#111111] hover:shadow-xs transition space-y-3 flex flex-col justify-between bg-white"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] bg-[#F4F4F5] px-2 py-0.5 rounded">
                        {tpl.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        tpl.layout === 'conversational' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'bg-[#F9FAFB] text-[#444444]'
                      }`}>
                        {tpl.layout === 'conversational' ? 'Conversational Typeform' : 'Classic Card'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#111111]">{tpl.name}</h4>
                    <p className="text-[11px] text-[#666666] leading-relaxed">
                      {tpl.description}
                    </p>
                    <div className="text-[11px] text-[#888888] font-mono">
                      {tpl.fields.length} predefined fields
                    </div>
                  </div>

                  <button
                    disabled={creating}
                    onClick={() => handleInstantiateTemplate(tpl)}
                    className="w-full py-2 bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>Use This Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUICK CREATE MODAL */}
      {showCreateModal && (
        <div 
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
          >
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex items-center justify-between bg-white flex-shrink-0">
              <h3 className="text-base font-bold text-[#111111]">Create New Lead Capture Form</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-[#888888] hover:text-[#111111] rounded-lg hover:bg-[#F4F4F5] transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Form Title *</label>
                <input
                  required
                  placeholder="e.g. Inbound Demo & Pricing Request"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Subtitle / Purpose</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Submit your details to receive an instant proposal."
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Layout Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewForm({ ...newForm, layout: 'classic' })}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                      newForm.layout === 'classic' ? 'border-[#111111] bg-[#FAFAFA]' : 'border-[#E5E5E5]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#111111]">Classic Card</span>
                    <span className="text-[10px] text-[#666666]">Standard single-page form</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewForm({ ...newForm, layout: 'conversational' })}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                      newForm.layout === 'conversational' ? 'border-[#111111] bg-[#FAFAFA]' : 'border-[#E5E5E5]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#7C3AED]">Typeform Conversational</span>
                    <span className="text-[10px] text-[#666666]">1-question-at-a-time flow</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F8F8F8] border-t border-[#E5E5E5] -mx-6 -mb-6 mt-4 flex justify-end space-x-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs"
                >
                  {creating ? 'Creating...' : 'Create & Open Studio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMBED & SHARE MODAL */}
      {showEmbedModal && selectedForm && (
        <div 
          onClick={() => setShowEmbedModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Embed &amp; Share Form</h3>
                <p className="text-xs text-[#666666] mt-0.5">Form: <strong>{selectedForm.title}</strong></p>
              </div>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="p-1 text-[#666666] hover:text-[#111111] rounded hover:bg-[#F4F4F5] transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E5E5E5] text-xs space-x-4">
              <button
                onClick={() => setEmbedTab('iframe')}
                className={`pb-2 border-b-2 font-semibold cursor-pointer ${
                  embedTab === 'iframe' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666]'
                }`}
              >
                iFrame Embed
              </button>
              <button
                onClick={() => setEmbedTab('link')}
                className={`pb-2 border-b-2 font-semibold cursor-pointer ${
                  embedTab === 'link' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666]'
                }`}
              >
                Direct Link &amp; QR
              </button>
              <button
                onClick={() => setEmbedTab('sdk')}
                className={`pb-2 border-b-2 font-semibold cursor-pointer ${
                  embedTab === 'sdk' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666]'
                }`}
              >
                JavaScript SDK
              </button>
            </div>

            {/* iFrame Tab */}
            {embedTab === 'iframe' && (
              <div className="space-y-3">
                <p className="text-xs text-[#666666]">
                  Paste this responsive HTML snippet into your WordPress, Next.js, Webflow, or Shopify site:
                </p>
                <div className="bg-[#111111] text-[#FAFAFA] p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
                  {`<iframe\n  src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/f/${selectedForm.id}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border:none; border-radius:12px;"\n></iframe>`}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `<iframe src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/f/${selectedForm.id}" width="100%" height="600" frameborder="0" style="border:none; border-radius:12px;"></iframe>`
                      )
                    }
                    className="btn-primary text-xs flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Direct Link Tab */}
            {embedTab === 'link' && (
              <div className="space-y-3">
                <p className="text-xs text-[#666666]">
                  Direct public link for email newsletters, WhatsApp campaigns, or social media bios:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/f/${selectedForm.id}`}
                    className="shadcn-input w-full font-mono text-xs"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/f/${selectedForm.id}`
                      )
                    }
                    className="btn-primary text-xs flex items-center space-x-1 flex-shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="pt-2">
                  <a
                    href={`/f/${selectedForm.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#111111] hover:underline flex items-center space-x-1"
                  >
                    <span>Open Public Form in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* JS SDK Tab */}
            {embedTab === 'sdk' && (
              <div className="space-y-3">
                <p className="text-xs text-[#666666]">
                  Dynamic JavaScript loader for embedded popup modal or floating trigger:
                </p>
                <div className="bg-[#111111] text-[#FAFAFA] p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
                  {`<script src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/embed/forms.js"></script>\n<script>\n  CRMForm.render({\n    formId: "${selectedForm.id}",\n    target: "#crm-lead-form"\n  });\n</script>`}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liquid Glass Confirmation Dialog for Web Form Deletion */}
      <ConfirmDialog
        isOpen={!!formToDelete}
        title="Delete Web Form"
        message={`Are you sure you want to permanently delete form "${formToDelete?.title}"? Existing embed instances will cease to accept submissions.`}
        confirmLabel="Delete Form"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (formToDelete) {
            await api.deleteWebForm(formToDelete.id);
            setFormToDelete(null);
            loadForms();
          }
        }}
        onCancel={() => setFormToDelete(null)}
      />
    </div>
  );
}
