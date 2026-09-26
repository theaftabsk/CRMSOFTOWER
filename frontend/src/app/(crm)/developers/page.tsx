'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { api, getApiBaseUrl } from '../../../lib/api';
import { 
  Key, Plus, Copy, Check, ShieldAlert, Code2, Play, 
  Webhook, RefreshCw, X, AlertCircle, CheckCircle2, Terminal,
  Globe, Send, Sparkles, CheckCircle, ArrowRight, UserPlus,
  MoreHorizontal, Trash2, Power, Eye, EyeOff, Info, Lock
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const AVAILABLE_SCOPES = [
  { id: 'leads:write', label: 'leads:write', desc: 'Ingest website enquiries and form submissions' },
  { id: 'leads:read', label: 'leads:read', desc: 'Query and view CRM leads' },
  { id: 'contacts:read', label: 'contacts:read', desc: 'View contacts directory' },
  { id: 'deals:read', label: 'deals:read', desc: 'View sales pipeline deals' },
  { id: 'deals:write', label: 'deals:write', desc: 'Create and advance deal stages' },
  { id: 'invoices:read', label: 'invoices:read', desc: 'View customer invoices' },
  { id: 'invoices:write', label: 'invoices:write', desc: 'Generate customer invoices & payment links' },
  { id: 'webhooks:manage', label: 'webhooks:manage', desc: 'Configure outgoing webhooks' },
];

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<'lead_capture' | 'keys' | 'webhooks' | 'sandbox'>('lead_capture');

  // Data States
  const [keys, setKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [devStats, setDevStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Notifications
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Dialog States
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [openMenuKeyId, setOpenMenuKeyId] = useState<string | null>(null);
  const [openMenuWebhookId, setOpenMenuWebhookId] = useState<string | null>(null);

  // Direct Key Form State
  const [directKeyName, setDirectKeyName] = useState('');
  const [directScopes, setDirectScopes] = useState<string[]>(['leads:write', 'leads:read']);
  const [creatingKey, setCreatingKey] = useState(false);

  // Webhook Form State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['lead.created', 'lead.updated', 'deal.won']);
  const [creatingWebhook, setCreatingWebhook] = useState(false);

  // Code Tab for Lead Capture
  const [leadCodeTab, setLeadCodeTab] = useState<'html' | 'js' | 'php' | 'python' | 'curl'>('js');
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive Live Website Lead Test Form
  const [testLeadForm, setTestLeadForm] = useState({
    name: 'Rohit Verma',
    email: 'rohit.verma@apextech.in',
    phone: '+91 9876543299',
    company: 'Apex Digital Labs',
    source: 'Landing Page Google Ads',
    service_interest: 'Enterprise Cloud CRM Plan',
    website_url: 'https://apextech.in/pricing',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'q3-growth',
    message: 'We need CRM migration for 40 team members and API access.',
    expected_value: 75000,
  });
  const [submittingTestLead, setSubmittingTestLead] = useState(false);
  const [testLeadResult, setTestLeadResult] = useState<any | null>(null);

  // API Sandbox State
  const [sandboxApiKey, setSandboxApiKey] = useState('crm_live_demo_key_super_secure_123');
  const [sandboxEndpoint, setSandboxEndpoint] = useState('/external/leads');
  const [sandboxTesting, setSandboxTesting] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyText = (txt: string, label: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(txt);
    setCopiedCode(true);
    showToast(label, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [keysData, whData, statsData] = await Promise.all([
        api.getApiKeys(),
        api.getWebhooks(),
        api.getExternalStats(),
      ]);
      setKeys(Array.isArray(keysData) ? keysData : []);
      setWebhooks(Array.isArray(whData) ? whData : []);
      if (statsData) setDevStats(statsData);
    } catch (e) {
      console.warn('Developer page load notice:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateDirectKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directKeyName) return;
    setCreatingKey(true);
    try {
      const result = await api.createApiKey({
        key_name: directKeyName,
        permissions: directScopes,
        rate_limit_per_min: 150,
      });
      setCreatingKey(false);
      setShowKeyModal(false);
      setDirectKeyName('');
      if (result && result.raw_api_key) {
        setGeneratedKey(result);
      }
      showToast('API Key generated successfully!', 'success');
      loadAll();
    } catch {
      setCreatingKey(false);
      showToast('Failed to create API key', 'error');
    }
  };

  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;
    try {
      await api.revokeApiKey(keyToRevoke);
      setKeyToRevoke(null);
      showToast('API Key revoked successfully', 'info');
      loadAll();
    } catch {
      showToast('Failed to revoke API key', 'error');
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    try {
      await api.deleteApiKey(keyToDelete);
      setKeyToDelete(null);
      showToast('API Key deleted permanently', 'info');
      loadAll();
    } catch {
      showToast('Failed to delete API key', 'error');
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) return;
    setCreatingWebhook(true);
    try {
      await api.createWebhook({
        target_url: webhookUrl,
        subscribed_events: webhookEvents,
      });
      setCreatingWebhook(false);
      setShowWebhookModal(false);
      setWebhookUrl('');
      showToast('Webhook subscription registered!', 'success');
      loadAll();
    } catch {
      setCreatingWebhook(false);
      showToast('Failed to register webhook', 'error');
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) return;
    try {
      await api.deleteWebhook(webhookToDelete);
      setWebhookToDelete(null);
      showToast('Webhook removed', 'info');
      loadAll();
    } catch {
      showToast('Failed to delete webhook', 'error');
    }
  };

  const handleTestLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTestLead(true);
    setTestLeadResult(null);

    const baseUrl = getApiBaseUrl();
    const activeKey = keys.find(k => !k.is_revoked)?.key_prefix 
      ? keys.find(k => !k.is_revoked) 
      : null;

    try {
      const res = await fetch(`${baseUrl}/external/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey?.raw_api_key || 'crm_live_demo_key_super_secure_123',
        },
        body: JSON.stringify(testLeadForm),
      });

      const data = await res.json();
      setTestLeadResult({
        status: res.status,
        ok: res.ok,
        data,
      });

      if (res.ok) {
        showToast('Lead ingested successfully into CRM pipeline!', 'success');
        loadAll();
      } else {
        showToast(`API Response: ${data.message || 'Error'}`, 'error');
      }
    } catch (err: any) {
      setTestLeadResult({
        status: 500,
        ok: false,
        error: err.message,
      });
      showToast(`Network error: ${err.message}`, 'error');
    } finally {
      setSubmittingTestLead(false);
    }
  };

  const handleRunSandbox = async () => {
    setSandboxTesting(true);
    setSandboxResult(null);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${sandboxEndpoint}`, {
        headers: { 'x-api-key': sandboxApiKey.trim() },
      });
      const data = await res.json();
      setSandboxResult({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setSandboxResult({ status: 500, ok: false, error: err.message });
    } finally {
      setSandboxTesting(false);
    }
  };

  const apiBase = getApiBaseUrl();

  // Code Snippets for Website Enquiry Ingestion
  const snippets = {
    html: `<!-- 1. Pure HTML Contact Form (No Backend Required) -->
<!-- Submits directly to Zyvo CRM Public Lead Ingestion Engine -->
<form action="${apiBase}/public/leads" method="POST">
  <input type="text" name="name" placeholder="Full Name" required />
  <input type="email" name="email" placeholder="Business Email" required />
  <input type="tel" name="phone" placeholder="Phone Number" required />
  <input type="text" name="company" placeholder="Company Name" />
  
  <!-- Marketing & Attribution Context -->
  <input type="hidden" name="source" value="Website Contact Page" />
  <input type="hidden" name="website_url" value="https://yourwebsite.com/contact" />
  <textarea name="message" placeholder="How can we help you?"></textarea>
  
  <button type="submit">Submit Enquiry</button>
</form>`,

    js: `// 2. Modern JavaScript (Fetch API) for React, Next.js, Vue, Webflow, or Shopify
async function submitWebsiteLead(formData) {
  const response = await fetch("${apiBase}/external/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "YOUR_API_KEY", // Generated from Developer Portal
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || "Website Visitor",
      source: "Landing Page Google Ads",
      service_interest: formData.service || "Enterprise Cloud CRM",
      website_url: window.location.href,
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "growth-q3",
      message: formData.message,
      expected_value: 50000
    }),
  });

  const result = await response.json();
  if (response.ok) {
    console.log("Lead captured in CRM! ID:", result.lead?.id);
    return result;
  } else {
    throw new Error(result.message || "Failed to submit lead");
  }
}`,

    php: `<?php
// 3. PHP / WordPress Contact Form 7 / Elementor Hook
function send_lead_to_crm($data) {
    $url = '${apiBase}/external/leads';
    $api_key = 'YOUR_API_KEY';

    $payload = json_encode([
        'name'             => $data['name'],
        'email'            => $data['email'],
        'phone'            => $data['phone'],
        'company'          => $data['company'] ?? 'Website Visitor',
        'source'           => 'WordPress Contact Page',
        'website_url'      => $_SERVER['HTTP_REFERER'] ?? 'https://yourwebsite.com',
        'message'          => $data['message'] ?? '',
        'expected_value'   => 25000
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $api_key
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ($http_code >= 200 && $http_code < 300);
}
?>`,

    python: `# 4. Python (Django, FastAPI, or Flask Backend)
import requests

CRM_API_URL = "${apiBase}/external/leads"
API_KEY = "YOUR_API_KEY"

def ingest_lead(name, email, phone, company="Website Lead", message=""):
    payload = {
        "name": name,
        "email": email,
        "phone": phone,
        "company": company,
        "source": "Python Webhook",
        "service_interest": "Custom Software Solution",
        "message": message,
        "expected_value": 45000,
        "utm_source": "meta_ads"
    }

    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }

    response = requests.post(CRM_API_URL, json=payload, headers=headers)
    return response.json()`,

    curl: `# 5. cURL Terminal Test Command
curl -X POST "${apiBase}/external/leads" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "name": "Amit Sharma",
    "email": "amit.sharma@example.com",
    "phone": "+91 9876543210",
    "company": "Sharma Enterprises",
    "source": "cURL Terminal Test",
    "service_interest": "CRM Enterprise Edition",
    "message": "Looking for pipeline automation.",
    "expected_value": 60000
  }'`,
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-lg flex items-center space-x-2 transition-all duration-300 animate-slideDown ${
            notification.type === 'success' 
              ? 'bg-[#111111] text-white border-[#262626]' 
              : notification.type === 'error'
              ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
              : 'bg-[#F4F4F5] text-[#111111] border-[#E5E5E5]'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />}
          {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-[#DC2626]" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Developer Platform & API Hub"
        subtitle="Capture leads from any website, generate secure API keys, and receive real-time webhook event dispatches."
        action={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Generate API Key</span>
            </button>
            <button
              onClick={() => setShowWebhookModal(true)}
              className="px-3.5 py-2 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Webhook className="w-3.5 h-3.5" />
              <span>Register Webhook</span>
            </button>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[#666666] font-medium text-xs block">Total Leads Ingested</span>
          <span className="text-xl font-bold font-mono text-[#111111] mt-1 block">
            {devStats?.total_leads ?? '...'}
          </span>
          <span className="text-[10px] text-[#16A34A] font-mono mt-0.5 block">Live Pipeline Sync</span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[#666666] font-medium text-xs block">Active API Keys</span>
          <span className="text-xl font-bold font-mono text-[#111111] mt-1 block">
            {keys.filter(k => !k.is_revoked).length}
          </span>
          <span className="text-[10px] text-[#666666] font-mono mt-0.5 block">SHA-256 Encrypted</span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[#666666] font-medium text-xs block">Subscribed Webhooks</span>
          <span className="text-xl font-bold font-mono text-[#111111] mt-1 block">
            {webhooks.filter(w => w.is_active).length}
          </span>
          <span className="text-[10px] text-[#666666] font-mono mt-0.5 block">HMAC-SHA256 Signed</span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[#666666] font-medium text-xs block">Lead Ingestion Engine</span>
          <span className="text-xl font-bold font-mono text-[#16A34A] mt-1 block">
            Active
          </span>
          <span className="text-[10px] text-[#16A34A] font-mono mt-0.5 block">Public &amp; REST Ready</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E5E5] pb-2">
        <button
          onClick={() => setActiveTab('lead_capture')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === 'lead_capture' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website Lead API</span>
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === 'keys' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys ({keys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === 'webhooks' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Webhook className="w-3.5 h-3.5" />
          <span>Webhooks ({webhooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === 'sandbox' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>API Sandbox Console</span>
        </button>
      </div>

      {/* TAB 1: WEBSITE ENQUIRY & LEAD INGESTION API */}
      {activeTab === 'lead_capture' && (
        <div className="space-y-6">
          {/* Architecture Overview */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <h3 className="text-sm font-semibold text-[#111111]">
                Website Enquiry to CRM Pipeline Integration
              </h3>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed max-w-3xl">
              Connect your contact forms, quotation requests, and marketing landing pages directly into Zyvo CRM. Every incoming enquiry automatically records visitor contact details, originating URL, message body, and marketing attribution tags (UTM source, campaign).
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-[#666666]">
              <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded">Public Endpoint: POST /api/v1/public/leads</span>
              <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded">REST Endpoint: POST /api/v1/external/leads</span>
              <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded">Header: x-api-key: YOUR_KEY</span>
              <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[#16A34A]">Auto-Deduplication: Active</span>
            </div>
          </div>

          {/* Side-by-Side: Interactive Lead Tester & Code Snippets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Interactive Tester */}
            <div className="lg:col-span-5 bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-[#111111]" />
                  <h4 className="text-xs font-semibold text-[#111111]">Live Website Enquiry Tester</h4>
                </div>
                <span className="text-[10px] font-mono text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>
              <p className="text-[11px] text-[#666666]">
                Simulate a visitor filling out a contact form on your website. Clicking Submit will create a real lead in your CRM table immediately.
              </p>

              <form onSubmit={handleTestLeadSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={testLeadForm.name}
                      onChange={(e) => setTestLeadForm({ ...testLeadForm, name: e.target.value })}
                      required
                      className="w-full px-3 py-1.5 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Company</label>
                    <input
                      type="text"
                      value={testLeadForm.company}
                      onChange={(e) => setTestLeadForm({ ...testLeadForm, company: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Email</label>
                    <input
                      type="email"
                      value={testLeadForm.email}
                      onChange={(e) => setTestLeadForm({ ...testLeadForm, email: e.target.value })}
                      required
                      className="w-full px-3 py-1.5 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Phone</label>
                    <input
                      type="tel"
                      value={testLeadForm.phone}
                      onChange={(e) => setTestLeadForm({ ...testLeadForm, phone: e.target.value })}
                      required
                      className="w-full px-3 py-1.5 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Service / Interest</label>
                    <input
                      type="text"
                      value={testLeadForm.service_interest}
                      onChange={(e) => setTestLeadForm({ ...testLeadForm, service_interest: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#666666] block mb-1">Budget (₹)</label>
                    <input
                      type="number"
                      value={testLeadForm.expected_value}
                      onChange={(e) => setTestLeadForm({ ...testLeadForm, expected_value: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#666666] block mb-1">Visitor Message</label>
                  <textarea
                    rows={2}
                    value={testLeadForm.message}
                    onChange={(e) => setTestLeadForm({ ...testLeadForm, message: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block">
                    Automatic Marketing Attribution:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-[#111111]">
                    <span className="bg-white px-1.5 py-0.5 border border-[#E5E5E5] rounded">utm_source: {testLeadForm.utm_source}</span>
                    <span className="bg-white px-1.5 py-0.5 border border-[#E5E5E5] rounded">utm_medium: {testLeadForm.utm_medium}</span>
                    <span className="bg-white px-1.5 py-0.5 border border-[#E5E5E5] rounded">utm_campaign: {testLeadForm.utm_campaign}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingTestLead}
                  className="w-full py-2 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#262626] transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingTestLead ? 'Transmitting to CRM...' : 'Send Test Lead to CRM'}</span>
                </button>
              </form>

              {testLeadResult && (
                <div className={`p-3 rounded-lg border text-xs font-mono transition-all animate-fadeIn ${
                  testLeadResult.ok ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                }`}>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>HTTP {testLeadResult.status} {testLeadResult.ok ? 'Created' : 'Failed'}</span>
                    <span className="text-[10px]">{testLeadResult.ok ? 'Lead ID: ' + (testLeadResult.data?.lead?.id || 'OK') : 'Error'}</span>
                  </div>
                  <pre className="text-[10px] overflow-x-auto max-h-32">
                    {JSON.stringify(testLeadResult.data || testLeadResult.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Code Snippets & Quick Integration */}
            <div className="lg:col-span-7 bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-[#111111]" />
                  <h4 className="text-xs font-semibold text-[#111111]">Integration Code Snippets</h4>
                </div>
                <button
                  onClick={() => copyText(snippets[leadCodeTab], 'Snippet copied to clipboard!')}
                  className="px-2.5 py-1 text-xs font-medium border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition flex items-center space-x-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Code Language Selector Tabs */}
              <div className="flex gap-1.5 border-b border-[#E5E5E5] pb-2">
                {[
                  { id: 'html', label: 'HTML Form' },
                  { id: 'js', label: 'JavaScript (Fetch)' },
                  { id: 'php', label: 'PHP / WordPress' },
                  { id: 'python', label: 'Python' },
                  { id: 'curl', label: 'cURL' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setLeadCodeTab(t.id as any)}
                    className={`px-3 py-1 rounded-md text-xs font-mono transition cursor-pointer ${
                      leadCodeTab === t.id ? 'bg-[#111111] text-white font-semibold' : 'text-[#666666] hover:bg-[#F4F4F5]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Code Viewer */}
              <div className="relative">
                <pre className="p-4 bg-[#111111] text-[#FAFAFA] rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[380px]">
                  <code>{snippets[leadCodeTab]}</code>
                </pre>
              </div>

              {/* Payload Field Guide */}
              <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-2">
                <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block">
                  Supported Lead Attributes
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                    <span className="font-mono font-semibold text-[#111111] block">name *</span>
                    <span className="text-[11px] text-[#666666]">Visitor full name</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                    <span className="font-mono font-semibold text-[#111111] block">email *</span>
                    <span className="text-[11px] text-[#666666]">Email address</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                    <span className="font-mono font-semibold text-[#111111] block">phone *</span>
                    <span className="text-[11px] text-[#666666]">Phone / WhatsApp</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                    <span className="font-mono font-semibold text-[#111111] block">company</span>
                    <span className="text-[11px] text-[#666666]">Organization name</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                    <span className="font-mono font-semibold text-[#111111] block">service_interest</span>
                    <span className="text-[11px] text-[#666666]">Product / inquiry</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                    <span className="font-mono font-semibold text-[#111111] block">utm_source</span>
                    <span className="text-[11px] text-[#666666]">google, meta, etc.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISSUED API KEYS */}
      {activeTab === 'keys' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Active Partner &amp; Developer API Keys</h3>
              <p className="text-xs text-[#666666]">
                Only cryptographic SHA-256 hashes are persisted in the database. Keys include rate limits and granular scopes.
              </p>
            </div>
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue New Key</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#666666] uppercase text-[11px] tracking-wider bg-[#FAFAFA]">
                  <th className="py-2.5 px-3 font-semibold">Key Label</th>
                  <th className="py-2.5 px-3 font-semibold">Prefix</th>
                  <th className="py-2.5 px-3 font-semibold">Authorized Scopes</th>
                  <th className="py-2.5 px-3 font-semibold">Rate Limit</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3 px-3 font-semibold text-[#111111]">{k.key_name}</td>
                    <td className="py-3 px-3 font-mono text-[#666666]">{k.key_prefix}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {k.permissions.map((p: string) => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#111111] font-mono text-[10px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#666666]">{k.rate_limit_per_min} req/min</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          k.is_revoked ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#DCFCE7] text-[#16A34A]'
                        }`}
                      >
                        {k.is_revoked ? 'Revoked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {!k.is_revoked ? (
                          <button
                            onClick={() => setKeyToRevoke(k.id)}
                            className="px-2.5 py-1 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => setKeyToDelete(k.id)}
                            className="px-2.5 py-1 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#666666] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {keys.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#666666]">
                      No active API keys found. Generate a key to begin ingesting leads.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Configured Outgoing Webhooks</h3>
              <p className="text-xs text-[#666666]">
                Webhook payloads are delivered in JSON with exponential backoff retries and cryptographic HMAC-SHA256 signatures.
              </p>
            </div>
            <button
              onClick={() => setShowWebhookModal(true)}
              className="px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Webhook</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#666666] uppercase text-[11px] tracking-wider bg-[#FAFAFA]">
                  <th className="py-2.5 px-3 font-semibold">Target URL</th>
                  <th className="py-2.5 px-3 font-semibold">Subscribed Events</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {webhooks.map((w) => (
                  <tr key={w.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3 px-3 font-mono text-[#111111]">{w.target_url}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {w.subscribed_events.map((ev: string) => (
                          <span key={ev} className="px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#111111] font-mono text-[10px]">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          w.is_active ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'
                        }`}
                      >
                        {w.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setWebhookToDelete(w.id)}
                        className="px-2.5 py-1 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {webhooks.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-[#666666]">
                      No outgoing webhooks configured. Register a webhook to listen to real-time CRM events.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: API SANDBOX CONSOLE */}
      {activeTab === 'sandbox' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-[#E5E5E5] pb-3">
            <h3 className="text-sm font-semibold text-[#111111]">Interactive REST API Sandbox</h3>
            <p className="text-xs text-[#666666]">
              Test incoming lead capture and API authentication in real time directly from the browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[#666666] block mb-1">API Key Header</label>
              <input
                type="text"
                value={sandboxApiKey}
                onChange={(e) => setSandboxApiKey(e.target.value)}
                placeholder="crm_live_..."
                className="w-full px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#666666] block mb-1">Endpoint Path</label>
              <select
                value={sandboxEndpoint}
                onChange={(e) => setSandboxEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
              >
                <option value="/external/leads">POST /external/leads (Lead Ingestion)</option>
                <option value="/external/stats">GET /external/stats (API Metrics)</option>
                <option value="/external/auth/verify">GET /external/auth/verify (Token Check)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRunSandbox}
                disabled={sandboxTesting}
                className="w-full py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{sandboxTesting ? 'Executing Call...' : 'Execute Request'}</span>
              </button>
            </div>
          </div>

          {sandboxResult && (
            <div className="p-4 bg-[#111111] text-white rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-[#333333] pb-2 text-[11px]">
                <span className="text-[#666666]">HTTP Status: {sandboxResult.status}</span>
                <span className={sandboxResult.ok ? 'text-[#16A34A]' : 'text-[#DC2626]'}>
                  {sandboxResult.ok ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              <pre className="overflow-x-auto max-h-60 text-[11px] text-[#A3A3A3]">
                {JSON.stringify(sandboxResult.data || sandboxResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Generate Direct API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Generate Secure API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="text-[#666666] hover:text-[#111111] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectKey} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-[#666666] block mb-1">Key Description / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Website Contact Form, Landing Page Zapier, Mobile App"
                  value={directKeyName}
                  onChange={(e) => setDirectKeyName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="font-medium text-[#666666] block mb-1.5">Authorized Permissions</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_SCOPES.map((sc) => (
                    <label key={sc.id} className="flex items-start space-x-2 p-2 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] cursor-pointer hover:bg-[#F4F4F5]">
                      <input
                        type="checkbox"
                        checked={directScopes.includes(sc.id)}
                        onChange={(e) => {
                          if (e.target.checked) setDirectScopes([...directScopes, sc.id]);
                          else setDirectScopes(directScopes.filter(s => s !== sc.id));
                        }}
                        className="mt-0.5 rounded text-[#111111]"
                      />
                      <div>
                        <span className="font-mono font-semibold text-[#111111] block text-[11px]">{sc.label}</span>
                        <span className="text-[10px] text-[#666666]">{sc.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3.5 py-1.5 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#666666] hover:bg-[#F8F8F8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingKey || !directKeyName}
                  className="px-3.5 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition disabled:opacity-50 cursor-pointer"
                >
                  {creatingKey ? 'Generating...' : 'Create API Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Newly Generated Raw API Key Alert */}
      {generatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-[#16A34A]">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm font-semibold text-[#111111]">API Key Generated Successfully</h3>
            </div>

            <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg text-xs text-[#92400E] space-y-1">
              <span className="font-semibold block">⚠️ Save this key now!</span>
              <p className="text-[11px] leading-relaxed">
                For security reasons, this secret key will never be displayed again. Store it securely in your environment variables.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#666666] block">Your New API Key:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={generatedKey.raw_api_key}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg text-xs font-mono text-[#111111] select-all"
                />
                <button
                  onClick={() => copyText(generatedKey.raw_api_key, 'API Key copied!')}
                  className="px-3 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition flex items-center space-x-1 cursor-pointer flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E5E5E5]">
              <button
                onClick={() => setGeneratedKey(null)}
                className="px-4 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition cursor-pointer"
              >
                I have saved this key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Register Webhook */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Register Outgoing Webhook</h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-[#666666] hover:text-[#111111] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-[#666666] block mb-1">Destination URL</label>
                <input
                  type="url"
                  placeholder="https://yourserver.com/api/crm-events"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="font-medium text-[#666666] block mb-1.5">Subscribed Event Triggers</label>
                <div className="space-y-1.5">
                  {['lead.created', 'lead.updated', 'deal.won', 'invoice.paid'].map((ev) => (
                    <label key={ev} className="flex items-center space-x-2 p-2 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] cursor-pointer hover:bg-[#F4F4F5]">
                      <input
                        type="checkbox"
                        checked={webhookEvents.includes(ev)}
                        onChange={(e) => {
                          if (e.target.checked) setWebhookEvents([...webhookEvents, ev]);
                          else setWebhookEvents(webhookEvents.filter(s => s !== ev));
                        }}
                        className="rounded text-[#111111]"
                      />
                      <span className="font-mono text-[#111111] text-[11px]">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-3.5 py-1.5 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#666666] hover:bg-[#F8F8F8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWebhook || !webhookUrl}
                  className="px-3.5 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition disabled:opacity-50 cursor-pointer"
                >
                  {creatingWebhook ? 'Registering...' : 'Register Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!keyToRevoke}
        title="Revoke API Key?"
        message="Any external websites or systems using this key will immediately be denied access."
        confirmLabel="Revoke Key"
        isDestructive={true}
        onConfirm={handleRevokeKey}
        onCancel={() => setKeyToRevoke(null)}
      />

      <ConfirmDialog
        isOpen={!!keyToDelete}
        title="Delete API Key Permanently?"
        message="This action cannot be undone. All audit references will remain intact."
        confirmLabel="Delete Key"
        isDestructive={true}
        onConfirm={handleDeleteKey}
        onCancel={() => setKeyToDelete(null)}
      />

      <ConfirmDialog
        isOpen={!!webhookToDelete}
        title="Delete Webhook Subscription?"
        message="Your endpoint will immediately stop receiving event dispatches."
        confirmLabel="Delete Webhook"
        isDestructive={true}
        onConfirm={handleDeleteWebhook}
        onCancel={() => setWebhookToDelete(null)}
      />
    </div>
  );
}
