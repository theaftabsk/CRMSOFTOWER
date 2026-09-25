'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Sliders, Palette, Zap, Inbox, BarChart3, 
  Share2, Settings, Plus, Trash2, Copy, Check, ExternalLink, 
  Eye, RefreshCw, Smartphone, Tablet, Monitor, Save, 
  CheckCircle2, AlertCircle, Sparkles, Building2, UserCheck, 
  Layers, Code, ChevronRight, FileText, ArrowRight
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { WebForm, WebFormField, WebFormTheme, WebFormSettings, WebFormLogicRule, FormFieldType } from '@/types/crm';
import { FormRenderer } from '@/features/forms/components/FormRenderer';
import { formatNumber } from '@/lib/utils';

export default function FormStudioPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  const [form, setForm] = useState<WebForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active Studio Tab
  const [activeTab, setActiveTab] = useState<'builder' | 'design' | 'automation' | 'responses' | 'analytics' | 'share'>('builder');
  
  // Preview Device State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Selected Field in Builder
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Share Modal / Copy state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);

  const loadFormData = async () => {
    setLoading(true);
    try {
      const data = await api.getWebForm(formId);
      if (data) {
        const normalizedFields = (data.fields || []).map((f: any, idx: number) => ({
          ...f,
          id: f.id || f.name || `field_${idx}`,
        }));
        const normalizedData = { ...data, fields: normalizedFields };
        setForm(normalizedData);
        if (normalizedFields.length > 0) {
          setSelectedFieldId(normalizedFields[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      loadFormData();
    }
  }, [formId]);

  useEffect(() => {
    if (activeTab === 'responses' && formId) {
      loadSubmissions();
    } else if (activeTab === 'analytics' && formId) {
      loadAnalytics();
    }
  }, [activeTab, formId]);

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const data = await api.getWebFormSubmissions(formId);
      setSubmissions(Array.isArray(data) ? data : []);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await api.getWebFormAnalytics(formId);
      setAnalytics(data);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleSaveForm = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await api.updateWebForm(form.id, {
        title: form.title,
        description: form.description,
        layout: form.layout,
        status: form.status,
        fields: form.fields,
        steps: form.steps,
        logic: form.logic,
        theme: form.theme,
        settings: form.settings,
        submit_btn_text: form.submit_btn_text,
        success_message: form.success_message,
        redirect_url: form.redirect_url,
        is_active: form.is_active,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!form) return;
    const res = await api.toggleWebForm(form.id);
    if (res) {
      setForm((prev) => (prev ? { ...prev, is_active: res.is_active } : null));
    }
  };

  // Field manipulation helpers
  const handleAddField = (type: FormFieldType, label: string) => {
    if (!form) return;
    const newFieldId = `fld_${Date.now()}`;
    const newField: WebFormField = {
      id: newFieldId,
      name: label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      label,
      type,
      required: false,
      placeholder: `Enter ${label}...`,
      mapping: type === 'email' ? 'Lead.email' : type === 'tel' ? 'Lead.phone' : type === 'company' ? 'Lead.company' : type === 'budget' ? 'Lead.expected_value' : undefined,
    };

    if (type === 'select' || type === 'radio') {
      newField.options = [
        { label: 'Option 1', value: 'Option 1' },
        { label: 'Option 2', value: 'Option 2' },
      ];
    }

    setForm((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        fields: [...prev.fields, newField],
      };
    });
    setSelectedFieldId(newFieldId);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<WebFormField>) => {
    setForm((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
      };
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setForm((prev) => {
      if (!prev) return null;
      const updated = prev.fields.filter((f) => f.id !== fieldId);
      return { ...prev, fields: updated };
    });
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleUpdateTheme = (updates: Partial<WebFormTheme>) => {
    setForm((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        theme: { ...prev.theme, ...updates },
        layout: updates.layout || prev.layout,
      };
    });
  };

  const handleUpdateSettings = (updates: Partial<WebFormSettings>) => {
    setForm((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        settings: { ...prev.settings, ...updates },
      };
    });
  };

  if (loading || !form) {
    return (
      <div className="p-12 text-center text-xs text-[#666666] flex items-center justify-center space-x-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
        <span>Loading Form Studio...</span>
      </div>
    );
  }

  const selectedField = form.fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="space-y-5 animate-fadeIn pb-16">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-3">
          <Link
            href="/forms"
            className="p-1.5 rounded-lg border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#666666] transition inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-[#111111]">{form.title}</h1>
              <button
                type="button"
                onClick={handleToggleActive}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition inline-flex items-center space-x-1.5 cursor-pointer ${
                  form.is_active 
                    ? 'bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC] hover:bg-[#BBF7D0]' 
                    : 'bg-[#F4F4F5] text-[#71717A] border-[#E5E5E5] hover:bg-[#E4E4E7]'
                }`}
                title="Click to toggle Live/Paused status"
              >
                <span className={`w-2 h-2 rounded-full ${form.is_active ? 'bg-[#16A34A] animate-pulse' : 'bg-[#71717A]'}`} />
                <span>{form.is_active ? 'Live (Active)' : 'Paused (Offline)'}</span>
              </button>
              <span className="px-2 py-0.5 text-[10px] font-mono text-[#666666] bg-[#F4F4F5] rounded border border-[#E5E5E5]">
                v{form.version || 1}
              </span>
            </div>
            <p className="text-[11px] text-[#666666] mt-0.5">
              Layout: <strong>{form.layout === 'conversational' ? 'Conversational Typeform' : 'Classic Single Card'}</strong> &bull; {form.fields.length} Active Fields
            </p>
          </div>
        </div>

        {/* Studio Primary Action Buttons */}
        <div className="flex items-center space-x-2">
          <a
            href={`/f/${form.id}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Live</span>
          </a>

          <button
            disabled={saving}
            onClick={handleSaveForm}
            className="px-4 py-1.5 bg-[#111111] hover:bg-[#262626] text-white rounded-lg text-xs font-semibold transition shadow-sm inline-flex items-center space-x-1.5 cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Studio'}</span>
          </button>
        </div>
      </div>

      {/* Studio Navigation Tabs Bar */}
      <div className="flex items-center border-b border-[#E5E5E5] bg-white rounded-xl px-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto">
        {[
          { key: 'builder', label: 'Form Builder', icon: Sliders },
          { key: 'design', label: 'Design & Theming', icon: Palette },
          { key: 'automation', label: 'Routing & Automations', icon: Zap },
          { key: 'responses', label: 'Submissions Inbox', icon: Inbox },
          { key: 'analytics', label: 'Conversion Analytics', icon: BarChart3 },
          { key: 'share', label: 'Embed & Share', icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-[#111111] text-[#111111] bg-[#FAFAFA]' 
                  : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FORM BUILDER (3-COLUMN STUDIO)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Column 1: Field Catalog Palette (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Field Catalog
              </h3>
              <p className="text-[11px] text-[#666666]">Click any field to add to the canvas.</p>

              {/* Basic Fields */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#888888] uppercase">Basic Inputs</span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button onClick={() => handleAddField('text', 'Short Text')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Short Text
                  </button>
                  <button onClick={() => handleAddField('textarea', 'Long Text')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Textarea
                  </button>
                  <button onClick={() => handleAddField('email', 'Work Email')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Email
                  </button>
                  <button onClick={() => handleAddField('tel', 'Phone Number')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Phone
                  </button>
                </div>
              </div>

              {/* Choice Fields */}
              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-bold text-[#888888] uppercase">Choice &amp; Selection</span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button onClick={() => handleAddField('select', 'Dropdown')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Dropdown
                  </button>
                  <button onClick={() => handleAddField('radio', 'Radio Choice')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Radio
                  </button>
                  <button onClick={() => handleAddField('checkbox', 'Checkbox')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Checkbox
                  </button>
                  <button onClick={() => handleAddField('rating', 'Star Rating')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Rating
                  </button>
                </div>
              </div>

              {/* Business / CRM Specific */}
              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-bold text-[#888888] uppercase">Business &amp; CRM Fields</span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button onClick={() => handleAddField('company', 'Company Name')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Company
                  </button>
                  <button onClick={() => handleAddField('budget', 'Budget (₹)')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Budget
                  </button>
                  <button onClick={() => handleAddField('job_title', 'Job Title')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + Job Title
                  </button>
                  <button onClick={() => handleAddField('city', 'City / Location')} className="p-2 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg text-left text-xs font-medium text-[#111111] cursor-pointer">
                    + City
                  </button>
                </div>
              </div>
            </div>

            {/* Form Fields Outline */}
            <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2">
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Canvas Fields ({form.fields.length})</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {form.fields.map((field, idx) => (
                  <div
                    key={field.id || field.name || `outline_${idx}`}
                    onClick={() => setSelectedFieldId(field.id || field.name || `field_${idx}`)}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                      selectedFieldId === field.id 
                        ? 'bg-[#111111] text-white border-[#111111]' 
                        : 'bg-[#F9FAFB] text-[#111111] border-[#E5E5E5] hover:bg-[#F4F4F5]'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-mono text-[10px] mr-1 opacity-70">#{idx + 1}</span>
                      <span className="font-medium">{field.label}</span>
                    </div>
                    {field.required && (
                      <span className="text-[10px] text-red-400 font-bold ml-1">*</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Live Responsive Preview Canvas (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Device Switcher Bar */}
            <div className="flex items-center justify-between p-2.5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Live Form Renderer
              </span>
              <div className="flex items-center space-x-1 bg-[#F4F4F5] p-0.5 rounded-lg border border-[#E5E5E5]">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded text-xs transition cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white shadow-xs text-[#111111]' : 'text-[#666666]'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded text-xs transition cursor-pointer ${
                    previewDevice === 'tablet' ? 'bg-white shadow-xs text-[#111111]' : 'text-[#666666]'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded text-xs transition cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white shadow-xs text-[#111111]' : 'text-[#666666]'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rendered Live Canvas Container */}
            <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-2xl p-4 min-h-[500px] overflow-y-auto">
              <FormRenderer 
                form={form} 
                previewMode={true} 
                device={previewDevice} 
              />
            </div>
          </div>

          {/* Column 3: Field Configuration Inspector (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {selectedField ? (
              <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                      Field Inspector
                    </h3>
                    <span className="text-[11px] font-mono text-[#888888]">{selectedField.type}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteField(selectedField.id)}
                    className="text-xs text-[#DC2626] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-[#111111] block mb-1">Field Label *</label>
                    <input
                      value={selectedField.label}
                      onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
                      className="shadcn-input w-full"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#111111] block mb-1">Field Name (Payload Key)</label>
                    <input
                      value={selectedField.name}
                      onChange={(e) => handleUpdateField(selectedField.id, { name: e.target.value })}
                      className="shadcn-input w-full font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#111111] block mb-1">Placeholder Text</label>
                    <input
                      value={selectedField.placeholder || ''}
                      onChange={(e) => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
                      className="shadcn-input w-full"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#111111] block mb-1">Help / Subtitle Description</label>
                    <textarea
                      rows={2}
                      value={selectedField.description || ''}
                      onChange={(e) => handleUpdateField(selectedField.id, { description: e.target.value })}
                      className="shadcn-input w-full"
                    />
                  </div>

                  {/* Required Toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                    <span className="font-medium text-[#111111]">Required Field</span>
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(e) => handleUpdateField(selectedField.id, { required: e.target.checked })}
                      className="rounded border-[#D4D4D4] text-[#111111] focus:ring-0"
                    />
                  </div>

                  {/* CRM Field Mapping */}
                  <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg space-y-1.5">
                    <div className="flex items-center space-x-1 text-[#16A34A] font-bold text-[11px]">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>CRM Lead Field Mapping</span>
                    </div>
                    <select
                      value={selectedField.mapping || ''}
                      onChange={(e) => handleUpdateField(selectedField.id, { mapping: e.target.value || undefined })}
                      className="shadcn-input w-full bg-white text-xs"
                    >
                      <option value="">-- No Direct Mapping --</option>
                      <option value="Lead.name">Lead Name (Lead.name)</option>
                      <option value="Lead.email">Work Email (Lead.email)</option>
                      <option value="Lead.phone">Phone Number (Lead.phone)</option>
                      <option value="Lead.company">Company Name (Lead.company)</option>
                      <option value="Lead.job_title">Job Title (Lead.job_title)</option>
                      <option value="Lead.expected_value">Budget / Deal Value (Lead.expected_value)</option>
                      <option value="Lead.city">City (Lead.city)</option>
                      <option value="Lead.notes">Inquiry Message (Lead.notes)</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white border border-[#E5E5E5] rounded-xl text-center text-xs text-[#888888]">
                Select a field on the outline or canvas to inspect its configuration.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DESIGN & THEME ENGINE                                              */}
      {/* ========================================================================= */}
      {activeTab === 'design' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-5">
            {/* Layout Mode Selector */}
            <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                1. Form Layout Mode
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdateTheme({ layout: 'classic' })}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                    form.theme?.layout === 'classic' ? 'border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]' : 'border-[#E5E5E5]'
                  }`}
                >
                  <span className="text-xs font-bold block text-[#111111]">Classic Card</span>
                  <span className="text-[11px] text-[#666666] mt-0.5 block">Standard single-page enterprise form with all fields visible.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateTheme({ layout: 'conversational' })}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                    form.theme?.layout === 'conversational' ? 'border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]' : 'border-[#E5E5E5]'
                  }`}
                >
                  <span className="text-xs font-bold block text-[#7C3AED]">Typeform Conversational</span>
                  <span className="text-[11px] text-[#666666] mt-0.5 block">One question at a time with smooth progress bar &amp; keyboard flow.</span>
                </button>
              </div>
            </div>

            {/* Design Token Presets */}
            <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                2. Design System Token Presets
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'minimal_monochrome', name: 'Minimal Monochrome', primary: '#111111', bg: '#FFFFFF' },
                  { id: 'dark_obsidian', name: 'Dark Obsidian', primary: '#09090B', bg: '#FFFFFF' },
                  { id: 'corporate_cobalt', name: 'Corporate Cobalt', primary: '#2563EB', bg: '#FFFFFF' },
                  { id: 'clean_emerald', name: 'Clean Emerald', primary: '#16A34A', bg: '#FFFFFF' },
                  { id: 'warm_slate', name: 'Warm Slate', primary: '#475569', bg: '#FFFFFF' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() =>
                      handleUpdateTheme({
                        preset: preset.id,
                        primary_color: preset.primary,
                        background_color: preset.bg,
                      })
                    }
                    className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                      form.theme?.preset === preset.id ? 'border-[#111111] bg-[#F9FAFB] ring-1 ring-[#111111]' : 'border-[#E5E5E5]'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <span className="text-xs font-bold text-[#111111]">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography & Radius Controls */}
            <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 text-xs">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                3. Typography &amp; Component Radius
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#111111] block mb-1">Font Family</label>
                  <select
                    value={form.theme?.font || 'Inter'}
                    onChange={(e) => handleUpdateTheme({ font: e.target.value })}
                    className="shadcn-input w-full"
                  >
                    <option value="Inter">Inter (Clean SaaS)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Outfit">Outfit</option>
                    <option value="System">System Sans</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#111111] block mb-1">Button Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={form.theme?.primary_color || '#111111'}
                      onChange={(e) => handleUpdateTheme({ primary_color: e.target.value })}
                      className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer p-0"
                    />
                    <input
                      value={form.theme?.primary_color || '#111111'}
                      onChange={(e) => handleUpdateTheme({ primary_color: e.target.value })}
                      className="shadcn-input w-full font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#111111] block mb-1">Card Radius</label>
                  <select
                    value={form.theme?.radius || '12px'}
                    onChange={(e) => handleUpdateTheme({ radius: e.target.value })}
                    className="shadcn-input w-full"
                  >
                    <option value="4px">4px (Sharp Minimal)</option>
                    <option value="8px">8px (Standard)</option>
                    <option value="12px">12px (Soft Card)</option>
                    <option value="16px">16px (Rounded)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#111111] block mb-1">Button Radius</label>
                  <select
                    value={form.theme?.button_radius || '8px'}
                    onChange={(e) => handleUpdateTheme({ button_radius: e.target.value })}
                    className="shadcn-input w-full"
                  >
                    <option value="4px">4px (Sharp)</option>
                    <option value="8px">8px (Subtle)</option>
                    <option value="12px">12px (Rounded)</option>
                    <option value="999px">Pill / Fully Round</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Theme Preview */}
          <div className="lg:col-span-6 space-y-3">
            <div className="p-2.5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Instant Design Preview
              </span>
            </div>
            <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-2xl p-4 min-h-[500px]">
              <FormRenderer form={form} previewMode={true} device={previewDevice} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEAD ROUTING & AUTOMATION                                          */}
      {/* ========================================================================= */}
      {activeTab === 'automation' && (
        <div className="max-w-3xl space-y-5">
          <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 text-xs">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              1. CRM Lead Ingestion &amp; Assignment
            </h3>

            <div className="flex items-center justify-between p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
              <div>
                <span className="font-semibold text-[#111111] block">Auto-Create Lead on Submission</span>
                <span className="text-[11px] text-[#666666]">Automatically converts prospect form submissions into active CRM leads.</span>
              </div>
              <input
                type="checkbox"
                checked={form.settings?.auto_create_lead ?? true}
                onChange={(e) => handleUpdateSettings({ auto_create_lead: e.target.checked })}
                className="rounded border-[#D4D4D4] text-[#111111] focus:ring-0"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-semibold text-[#111111] block mb-1">Sales Rep Assignment</label>
                <select
                  value={form.settings?.assigned_to || 'Vikram Sales Manager'}
                  onChange={(e) => handleUpdateSettings({ assigned_to: e.target.value })}
                  className="shadcn-input w-full"
                >
                  <option value="Vikram Sales Manager">Vikram Sales Manager</option>
                  <option value="Rohan Sales Exec">Rohan Sales Exec</option>
                  <option value="Priya Sales Exec">Priya Sales Exec</option>
                  <option value="ROUND_ROBIN">Round Robin (Distribute Equally)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#111111] block mb-1">Default Lifecycle Stage</label>
                <select
                  value={form.settings?.default_lifecycle_stage || 'NEW'}
                  onChange={(e) => handleUpdateSettings({ default_lifecycle_stage: e.target.value })}
                  className="shadcn-input w-full"
                >
                  <option value="NEW">1. NEW (Incoming Prospect)</option>
                  <option value="WORKING">2. WORKING (Ready for outreach)</option>
                  <option value="QUALIFIED">3. QUALIFIED (BANT met)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Post-Submission Actions */}
          <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 text-xs">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              2. Post-Submission Action &amp; Meeting Booking
            </h3>

            <div className="space-y-2">
              <label className="font-semibold text-[#111111] block">Submission Flow</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'THANK_YOU', label: 'On-Screen Message', desc: 'Display confirmation' },
                  { key: 'BOOK_MEETING', label: 'Book Google Meet', desc: 'Jump to calendar' },
                  { key: 'REDIRECT', label: 'Redirect URL', desc: 'Custom website page' },
                ].map((act) => (
                  <button
                    key={act.key}
                    type="button"
                    onClick={() => handleUpdateSettings({ success_action: act.key as any })}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                      form.settings?.success_action === act.key ? 'border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]' : 'border-[#E5E5E5]'
                    }`}
                  >
                    <span className="font-bold text-[#111111] block text-xs">{act.label}</span>
                    <span className="text-[10px] text-[#666666]">{act.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#111111] block mb-1">Custom Success Message</label>
              <textarea
                rows={2}
                value={form.success_message || ''}
                onChange={(e) => setForm({ ...form, success_message: e.target.value })}
                className="shadcn-input w-full"
              />
            </div>

            {form.settings?.success_action === 'REDIRECT' && (
              <div>
                <label className="font-semibold text-[#111111] block mb-1">Redirect Destination URL</label>
                <input
                  placeholder="https://yourcompany.com/thank-you"
                  value={form.redirect_url || ''}
                  onChange={(e) => setForm({ ...form, redirect_url: e.target.value })}
                  className="shadcn-input w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUBMISSIONS INBOX                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'responses' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Submissions &amp; Responses Inbox</h3>
              <p className="text-xs text-[#666666]">Total Captured: {submissions.length} inquiries</p>
            </div>
            <button
              onClick={() => {
                const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent(
                  'Date,Name,Email,Phone,Company,UTM Source\n' +
                  submissions.map(s => `"${s.created_at}","${s.payload?.name || ''}","${s.payload?.email || ''}","${s.payload?.phone || ''}","${s.payload?.company || ''}","${s.utm_source || ''}"`).join('\n')
                );
                const a = document.createElement('a');
                a.setAttribute('href', csv);
                a.setAttribute('download', `submissions_${form.id}.csv`);
                a.click();
              }}
              className="btn-secondary text-xs"
            >
              Export CSV
            </button>
          </div>

          <div className="shadcn-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Contact Name</th>
                    <th>Email &amp; Phone</th>
                    <th>Company</th>
                    <th>UTM Source</th>
                    <th>Linked CRM Lead</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-[#888888] text-xs">
                        No submissions recorded for this form yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td className="font-mono text-[11px] text-[#666666]">
                          {new Date(sub.created_at).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="font-semibold text-[#111111] text-xs">
                          {sub.payload?.name || 'Visitor'}
                        </td>
                        <td className="font-mono text-xs">
                          <div>{sub.payload?.email || 'N/A'}</div>
                          <div className="text-[#888888] text-[11px]">{sub.payload?.phone || 'N/A'}</div>
                        </td>
                        <td className="text-xs text-[#111111]">
                          {sub.payload?.company || 'N/A'}
                        </td>
                        <td>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F4F4F5] rounded border border-[#E5E5E5]">
                            {sub.utm_source || 'Direct / Organic'}
                          </span>
                        </td>
                        <td>
                          {sub.lead_id ? (
                            <Link
                              href={`/leads/${sub.lead_id}`}
                              className="text-xs font-semibold text-[#16A34A] hover:underline flex items-center space-x-1"
                            >
                              <span>View Lead 360°</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-xs text-[#888888]">Inquiry Only</span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="text-xs font-semibold text-[#111111] hover:underline"
                          >
                            Inspect Payload
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CONVERSION ANALYTICS & FUNNEL                                      */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="shadcn-card p-4">
              <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Total Views</span>
              <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{analytics?.views || form.views_count}</span>
            </div>
            <div className="shadcn-card p-4">
              <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Form Starts</span>
              <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{analytics?.starts || form.starts_count}</span>
            </div>
            <div className="shadcn-card p-4">
              <span className="text-[11px] text-[#16A34A] font-semibold uppercase tracking-wider block">Submissions</span>
              <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">{analytics?.completed || form.submissions_count}</span>
            </div>
            <div className="shadcn-card p-4">
              <span className="text-[11px] text-[#111111] font-semibold uppercase tracking-wider block">Conversion Rate</span>
              <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{analytics?.conversionRate || form.conversion_rate || 0}%</span>
            </div>
          </div>

          {/* Conversion Funnel Strip */}
          <div className="p-6 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Lead Conversion Funnel
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#666666]">1. Impressions / Public Views</span>
                  <span className="font-mono font-bold text-[#111111]">{analytics?.views || 100}%</span>
                </div>
                <div className="w-full bg-[#F4F4F5] rounded-full h-3 overflow-hidden">
                  <div className="bg-[#111111] h-3 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#666666]">2. Form Started (User Engagement)</span>
                  <span className="font-mono font-bold text-[#2563EB]">{analytics?.startRate || 65}%</span>
                </div>
                <div className="w-full bg-[#F4F4F5] rounded-full h-3 overflow-hidden">
                  <div className="bg-[#2563EB] h-3 rounded-full" style={{ width: `${analytics?.startRate || 65}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#666666]">3. Completed Inquiries Ingested</span>
                  <span className="font-mono font-bold text-[#16A34A]">{analytics?.conversionRate || 35}%</span>
                </div>
                <div className="w-full bg-[#F4F4F5] rounded-full h-3 overflow-hidden">
                  <div className="bg-[#16A34A] h-3 rounded-full" style={{ width: `${analytics?.conversionRate || 35}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: EMBED & SHARE                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'share' && (
        <div className="max-w-2xl space-y-5">
          <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Shareable Direct Link
            </h3>
            <p className="text-xs text-[#666666]">Send this link in WhatsApp or marketing emails:</p>
            <div className="flex items-center space-x-2">
              <input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/f/${form.id}`}
                className="shadcn-input w-full font-mono text-xs"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/f/${form.id}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="btn-primary text-xs flex items-center space-x-1 flex-shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Responsive iFrame Embed Code
            </h3>
            <p className="text-xs text-[#666666]">Embed this form on any external landing page:</p>
            <div className="bg-[#111111] text-[#FAFAFA] p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
              {`<iframe\n  src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/f/${form.id}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border:none; border-radius:12px;"\n></iframe>`}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`<iframe src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/f/${form.id}" width="100%" height="600" frameborder="0" style="border:none; border-radius:12px;"></iframe>`);
                  setCopiedIframe(true);
                  setTimeout(() => setCopiedIframe(false), 2000);
                }}
                className="btn-primary text-xs flex items-center space-x-1 cursor-pointer"
              >
                {copiedIframe ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIframe ? 'Copied' : 'Copy HTML Snippet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT SUBMISSION PAYLOAD MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Submission Payload</h3>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="text-xs p-1 text-[#888888] hover:text-[#111111]"
              >
                &times;
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3 font-mono text-xs bg-[#FAFAFA]">
              <pre className="text-[11px] whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(selectedSubmission.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
