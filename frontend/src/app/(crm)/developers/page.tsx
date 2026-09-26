'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { api } from '../../../lib/api';
import { 
  Key, Plus, Copy, Check, ShieldAlert, Code2, Play, 
  Webhook, RefreshCw, X, AlertCircle, CheckCircle2, Terminal,
  Inbox, CreditCard, ShieldCheck, UserCheck, ExternalLink,
  ChevronRight, Lock, MoreHorizontal, Trash2, Power, Eye, EyeOff, Info,
  Globe, Send, Sparkles, CheckCircle, ArrowRight, UserPlus
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import Link from 'next/link';

const AVAILABLE_SCOPES = [
  { id: 'leads:read', label: 'leads:read', desc: 'Query and view CRM leads' },
  { id: 'leads:write', label: 'leads:write', desc: 'Ingest website enquiries and update leads' },
  { id: 'auth:sso', label: 'auth:sso', desc: 'Partner software user linking and 1-click SSO session creation' },
  { id: 'contacts:read', label: 'contacts:read', desc: 'View contacts directory' },
  { id: 'deals:read', label: 'deals:read', desc: 'View sales pipeline deals' },
  { id: 'deals:write', label: 'deals:write', desc: 'Create and advance deal stages' },
  { id: 'invoices:read', label: 'invoices:read', desc: 'View customer invoices' },
  { id: 'invoices:write', label: 'invoices:write', desc: 'Generate customer invoices & payment links' },
  { id: 'webhooks:manage', label: 'webhooks:manage', desc: 'Configure outgoing webhooks' },
];

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<'lead_capture' | 'auth_sso' | 'keys' | 'requests' | 'webhooks' | 'sandbox'>('lead_capture');

  // Data States
  const [requests, setRequests] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [devStats, setDevStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Notifications
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Dialog States
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [openMenuKeyId, setOpenMenuKeyId] = useState<string | null>(null);
  const [openMenuWebhookId, setOpenMenuWebhookId] = useState<string | null>(null);

  // Direct Key Form State
  const [directKeyName, setDirectKeyName] = useState('');
  const [directScopes, setDirectScopes] = useState<string[]>(['leads:write', 'leads:read', 'auth:sso']);
  const [creatingKey, setCreatingKey] = useState(false);

  // Partner Request Form State
  const [newReq, setNewReq] = useState({
    developer_name: '',
    company_name: '',
    email: '',
    purpose: '',
    requested_scopes: ['leads:write', 'auth:sso', 'invoices:read'],
  });
  const [submittingReq, setSubmittingReq] = useState(false);

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

  // Interactive Live SSO Simulator
  const [ssoForm, setSsoForm] = useState({
    email: 'client.director@partnercorp.com',
    name: 'Suresh Menon',
    external_user_id: 'EXT-USR-9921',
    redirect_path: '/dashboard',
  });
  const [generatingSso, setGeneratingSso] = useState(false);
  const [ssoResult, setSsoResult] = useState<any | null>(null);

  // API Sandbox State
  const [sandboxApiKey, setSandboxApiKey] = useState('crm_live_demo_key_super_secure_123');
  const [sandboxEndpoint, setSandboxEndpoint] = useState('/external/auth/verify');
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
    const [reqsData, keysData, whData, statsData] = await Promise.all([
      api.getPartnerRequests(),
      api.getApiKeys(),
      api.getWebhooks(),
      api.getExternalStats(),
    ]);
    setRequests(Array.isArray(reqsData) ? reqsData : []);
    setKeys(Array.isArray(keysData) ? keysData : []);
    setWebhooks(Array.isArray(whData) ? whData : []);
    if (statsData) setDevStats(statsData);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateDirectKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directKeyName) return;
    setCreatingKey(true);
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
  };

  const handleRevokeKey = async (id: string) => {
    await api.revokeApiKey(id);
    setKeyToRevoke(null);
    showToast('API Key revoked', 'info');
    loadAll();
  };

  const handleDeleteKey = async (id: string) => {
    await api.deleteApiKey(id);
    setKeyToDelete(null);
    showToast('API Key permanently deleted', 'info');
    loadAll();
  };

  const handleApproveRequest = async (requestId: string) => {
    const res = await api.approvePartnerRequest(requestId);
    if (res && res.issued_key) {
      setGeneratedKey(res.issued_key);
    }
    showToast('Partner request approved and API key issued!', 'success');
    loadAll();
  };

  const handleRejectRequest = async (requestId: string) => {
    await api.rejectPartnerRequest(requestId);
    setRequestToReject(null);
    showToast('Partner request declined', 'info');
    loadAll();
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReq(true);
    await api.submitDeveloperRequest(newReq);
    setSubmittingReq(false);
    setShowRequestModal(false);
    setNewReq({
      developer_name: '',
      company_name: '',
      email: '',
      purpose: '',
      requested_scopes: ['leads:write', 'auth:sso', 'invoices:read'],
    });
    showToast('Partner application submitted for admin review', 'success');
    loadAll();
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) return;
    setCreatingWebhook(true);
    await api.createWebhook({
      target_url: webhookUrl,
      events: webhookEvents,
    });
    setCreatingWebhook(false);
    setShowWebhookModal(false);
    setWebhookUrl('');
    showToast('Webhook registered successfully!', 'success');
    loadAll();
  };

  const handleToggleWebhook = async (id: string) => {
    setOpenMenuWebhookId(null);
    await api.toggleWebhook(id);
    showToast('Webhook status updated', 'success');
    loadAll();
  };

  const handleDeleteWebhook = async (id: string) => {
    await api.deleteWebhook(id);
    setWebhookToDelete(null);
    showToast('Webhook removed', 'info');
    loadAll();
  };

  const handleTestPing = async (id: string) => {
    setOpenMenuWebhookId(null);
    const res = await api.testWebhook(id);
    showToast(res?.message || 'Test event dispatched successfully!', 'success');
  };

  // Test Lead Submission
  const handleExecuteLeadTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTestLead(true);
    setTestLeadResult(null);

    const res = await api.submitExternalLead(testLeadForm, sandboxApiKey);
    setTestLeadResult(res);
    setSubmittingTestLead(false);

    if (res.ok) {
      showToast('Live test enquiry captured into CRM!', 'success');
      loadAll();
    } else {
      showToast('Enquiry submission failed', 'error');
    }
  };

  // Generate SSO Ticket
  const handleGenerateSsoTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingSso(true);
    setSsoResult(null);

    const res = await api.generatePartnerSsoToken(ssoForm, sandboxApiKey);
    setSsoResult(res);
    setGeneratingSso(false);

    if (res.ok) {
      showToast('1-Click SSO ticket generated successfully!', 'success');
    } else {
      showToast(res.data?.message || 'Failed to generate SSO ticket', 'error');
    }
  };

  // Run Sandbox Request
  const handleRunSandbox = async () => {
    setSandboxTesting(true);
    setSandboxResult(null);

    try {
      const baseUrl = typeof window !== 'undefined' && window.location.hostname.includes('zyvocrm.in')
        ? `${window.location.protocol}//api.zyvocrm.in/api/v1`
        : `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4000/api/v1`;
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

  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;

  // Code Snippets for Website Enquiry Ingestion
  const snippets = {
    html: `<!-- Standard HTML Contact / Enquiry Form -->
<!-- Submits directly to the CRM without any complex backend setup -->
<form action="http://localhost:4000/api/v1/public/leads" method="POST">
  <input type="text" name="name" placeholder="Full Name" required />
  <input type="email" name="email" placeholder="Business Email" required />
  <input type="tel" name="phone" placeholder="Phone Number" required />
  <input type="text" name="company" placeholder="Company Name" />
  <input type="hidden" name="source" value="Website Contact Page" />
  <input type="hidden" name="website_url" value="https://yourwebsite.com/contact" />
  <textarea name="message" placeholder="How can we help you?"></textarea>
  <button type="submit">Submit Enquiry</button>
</form>`,

    js: `// Modern JavaScript (Fetch API) for React, Vue, Webflow, or Custom Website
async function submitWebsiteEnquiry(formData) {
  const response = await fetch("http://localhost:4000/api/v1/external/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "YOUR_API_KEY", // Issued from CRM Developer Portal
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || "Website Visitor",
      source: "Website Pricing Form",
      service_interest: formData.service || "Enterprise Tier",
      website_url: window.location.href,
      referrer: document.referrer,
      utm_source: new URLSearchParams(window.location.search).get("utm_source") || "direct",
      utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || "",
      message: formData.message,
      expected_value: 50000
    }),
  });

  const result = await response.json();
  if (response.ok && result.success) {
    alert("Thank you! Our sales team has received your enquiry.");
  }
}`,

    php: `<?php
// WordPress / PHP Contact Form Integration (e.g. in functions.php or form handler)
function send_lead_to_crm($name, $email, $phone, $company, $message) {
    $url = 'http://localhost:4000/api/v1/external/leads';
    $api_key = 'YOUR_API_KEY';

    $payload = [
        'name'             => sanitize_text_field($name),
        'email'            => sanitize_email($email),
        'phone'            => sanitize_text_field($phone),
        'company'          => sanitize_text_field($company),
        'source'           => 'WordPress Contact Form',
        'website_url'      => home_url($_SERVER['REQUEST_URI']),
        'message'          => sanitize_textarea_field($message),
        'expected_value'   => 45000
    ];

    $response = wp_remote_post($url, [
        'headers' => [
            'Content-Type' => 'application/json',
            'x-api-key'    => $api_key,
        ],
        'body'    => json_encode($payload),
        'timeout' => 15,
    ]);

    return !is_wp_error($response) && wp_remote_retrieve_response_code($response) === 201;
}`,

    python: `import requests

# Python Flask / Django / FastAPI Backend Lead Ingestion
CRM_API_URL = "http://localhost:4000/api/v1/external/leads"
API_KEY = "YOUR_API_KEY"

def send_enquiry_to_crm(lead_data):
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
    }
    payload = {
        "name": lead_data.get("name"),
        "email": lead_data.get("email"),
        "phone": lead_data.get("phone"),
        "company": lead_data.get("company", "Web Lead"),
        "source": "Landing Page Google Ads",
        "website_url": "https://company.com/landing",
        "utm_source": "google-ads",
        "utm_campaign": "q3-enterprise",
        "message": lead_data.get("message"),
        "expected_value": 75000,
    }

    resp = requests.post(CRM_API_URL, json=payload, headers=headers)
    return resp.status_code in (200, 201), resp.json()`,

    curl: `curl -X POST http://localhost:4000/api/v1/external/leads \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "name": "Priya Sharma",
    "email": "priya.sharma@innovate.co",
    "phone": "+91 9876543210",
    "company": "Innovate Technologies",
    "source": "Website Contact Page",
    "website_url": "https://innovate.co/contact",
    "service_interest": "Custom SaaS Solution",
    "message": "Looking to automate our sales workflow for 25 representatives.",
    "expected_value": 85000
  }'`,
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg border text-xs font-medium shadow-md flex items-center space-x-2 animate-fadeIn ${
          notification.type === 'success' 
            ? 'bg-[#111111] text-white border-[#111111]' 
            : notification.type === 'error'
            ? 'bg-[#DC2626] text-white border-[#DC2626]'
            : 'bg-white text-[#111111] border-[#E5E5E5]'
        }`}>
          <Check className="w-3.5 h-3.5" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Developer Platform & Public API Ecosystem"
          subtitle="Enterprise REST API, website enquiry ingestion, third-party software Auth/SSO linking, and webhooks."
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F8F8F8] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply as Partner</span>
          </button>
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition shadow-sm"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Issue API Key</span>
          </button>
        </div>
      </div>

      {/* Quick Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[#666666] font-medium block">Total Leads Ingested</span>
          <span className="text-xl font-bold font-mono text-[#111111] mt-1 block">
            {devStats?.total_leads ?? '...'}
          </span>
          <span className="text-[10px] text-[#16A34A] font-mono mt-0.5 block">Live Synchronized</span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[#666666] font-medium block">Active API Keys</span>
          <span className="text-xl font-bold font-mono text-[#111111] mt-1 block">
            {keys.filter(k => !k.is_revoked).length}
          </span>
          <span className="text-[10px] text-[#666666] font-mono mt-0.5 block">SHA-256 Encrypted</span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[#666666] font-medium block">Subscribed Webhooks</span>
          <span className="text-xl font-bold font-mono text-[#111111] mt-1 block">
            {webhooks.filter(w => w.is_active).length}
          </span>
          <span className="text-[10px] text-[#666666] font-mono mt-0.5 block">HMAC-SHA256 Signed</span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[#666666] font-medium block">Partner Inquiries</span>
          <span className="text-xl font-bold font-mono text-[#111111] mt-1 block">
            {pendingRequestsCount}
          </span>
          <span className="text-[10px] text-[#D97706] font-mono mt-0.5 block">
            {pendingRequestsCount > 0 ? 'Pending Admin Action' : 'All clear'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E5E5] pb-2">
        <button
          onClick={() => setActiveTab('lead_capture')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'lead_capture' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website Enquiry API</span>
        </button>

        <button
          onClick={() => setActiveTab('auth_sso')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'auth_sso' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Partner Auth & SSO Link</span>
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'keys' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys ({keys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'requests' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Partner Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#DC2626] text-white">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'webhooks' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Webhook className="w-3.5 h-3.5" />
          <span>Webhooks ({webhooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'sandbox' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Live API Sandbox</span>
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
              Connect contact forms, quotation requests, and landing pages directly to the CRM. Every incoming enquiry automatically records visitor contact info, originating URL, message body, and marketing attribution tags (UTM source, campaign).
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-[#666666]">
              <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded">Endpoint: POST /api/v1/external/leads</span>
              <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded">Header: x-api-key: YOUR_KEY</span>
              <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded">Scope: leads:write</span>
              <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[#16A34A]">Auto-Deduplication: Enabled</span>
            </div>
          </div>

          {/* Code Snippets & Language Switcher */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E5E5E5] pb-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                  Integration Code Examples
                </h4>
                <p className="text-[11px] text-[#666666]">Select your platform or programming language.</p>
              </div>
              <div className="flex flex-wrap gap-1 bg-[#F8F8F8] p-1 rounded-lg border border-[#E5E5E5]">
                {(['js', 'html', 'php', 'python', 'curl'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLeadCodeTab(tab)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition ${
                      leadCodeTab === tab ? 'bg-[#111111] text-white shadow-sm' : 'text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    {tab === 'js' ? 'JavaScript' : tab === 'html' ? 'HTML Form' : tab === 'php' ? 'WordPress/PHP' : tab === 'python' ? 'Python' : 'cURL'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative bg-[#111111] text-white rounded-xl p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-emerald-400 leading-relaxed">
                {snippets[leadCodeTab]}
              </pre>
              <button
                onClick={() => copyText(snippets[leadCodeTab])}
                className="absolute top-3 right-3 flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-[11px] transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Website Enquiry Simulator */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="border-b border-[#E5E5E5] pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Interactive Live Enquiry Simulator</span>
                </h4>
                <p className="text-[11px] text-[#666666]">
                  Simulate an external website visitor submitting an inquiry. This sends a real HTTP request to your CRM backend API.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSandboxApiKey('crm_live_demo_key_super_secure_123')}
                className="text-[11px] font-mono text-[#111111] underline hover:text-[#444444]"
              >
                Use Demo API Key
              </button>
            </div>

            <form onSubmit={handleExecuteLeadTest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#404040] font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={testLeadForm.name}
                    onChange={(e) => setTestLeadForm({ ...testLeadForm, name: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#404040] font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={testLeadForm.email}
                    onChange={(e) => setTestLeadForm({ ...testLeadForm, email: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#404040] font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={testLeadForm.phone}
                    onChange={(e) => setTestLeadForm({ ...testLeadForm, phone: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#404040] font-medium mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={testLeadForm.company}
                    onChange={(e) => setTestLeadForm({ ...testLeadForm, company: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#404040] font-medium mb-1">Origin Source Label</label>
                  <input
                    type="text"
                    value={testLeadForm.source}
                    onChange={(e) => setTestLeadForm({ ...testLeadForm, source: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#404040] font-medium mb-1">Expected Deal Value (₹)</label>
                  <input
                    type="number"
                    value={testLeadForm.expected_value}
                    onChange={(e) => setTestLeadForm({ ...testLeadForm, expected_value: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#404040] font-medium mb-1">Website URL</label>
                  <input
                    type="text"
                    value={testLeadForm.website_url}
                    onChange={(e) => setTestLeadForm({ ...testLeadForm, website_url: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[#404040] font-medium mb-1">UTM Campaign</label>
                  <input
                    type="text"
                    value={testLeadForm.utm_campaign}
                    onChange={(e) => setTestLeadForm({ ...testLeadForm, utm_campaign: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[#404040] font-medium mb-1">API Key for Ingestion</label>
                  <input
                    type="text"
                    value={sandboxApiKey}
                    onChange={(e) => setSandboxApiKey(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[#404040] font-medium mb-1">Enquiry Message Body</label>
                <textarea
                  rows={2}
                  value={testLeadForm.message}
                  onChange={(e) => setTestLeadForm({ ...testLeadForm, message: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-[#666666]">
                  Dispatches <code className="font-mono text-[#111111]">lead.created</code> webhook if successful.
                </span>
                <button
                  type="submit"
                  disabled={submittingTestLead}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#111111] hover:bg-[#262626] disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingTestLead ? 'Submitting to API...' : 'Send Live Test Enquiry'}</span>
                </button>
              </div>
            </form>

            {/* Test Result Inspector */}
            {testLeadResult && (
              <div className={`p-4 rounded-xl border text-xs font-mono mt-3 ${
                testLeadResult.ok ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2 font-bold">
                    {testLeadResult.ok ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> : <AlertCircle className="w-4 h-4 text-[#DC2626]" />}
                    <span>Status: HTTP {testLeadResult.status} {testLeadResult.ok ? 'Created / Authorized' : 'Error'}</span>
                  </div>
                  {testLeadResult.ok && (
                    <Link
                      href="/leads"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-[#BBF7D0] rounded text-[11px] font-sans font-medium text-[#166534] hover:bg-[#DCFCE7] transition"
                    >
                      <span>View in CRM Leads</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(testLeadResult.data || testLeadResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PARTNER AUTH & SSO USER LINKING */}
      {activeTab === 'auth_sso' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <h3 className="text-sm font-semibold text-[#111111]">
                External Software Auth & Single Sign-On (SSO) Handshake
              </h3>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed max-w-3xl">
              Enable your partners, client portals, and external SaaS platforms to link directly with your CRM. Users authenticated in an external system can jump seamlessly into your CRM without entering separate credentials.
            </p>

            {/* 2-Step Architecture Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <div className="flex items-center space-x-2 font-semibold text-[#111111]">
                  <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Backend Ticket Generation</span>
                </div>
                <code className="block bg-white p-2 rounded border border-[#E5E5E5] font-mono text-[11px] text-[#111111]">
                  POST /api/v1/external/auth/sso-token
                </code>
                <p className="text-[#666666] text-[11px] leading-relaxed">
                  Your external software backend passes the user's email, name, and external ID along with your API Key (scope: <code className="font-mono text-[#111111]">auth:sso</code>). Returns a single-use ticket valid for 5 minutes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <div className="flex items-center space-x-2 font-semibold text-[#111111]">
                  <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>1-Click User Redirection</span>
                </div>
                <code className="block bg-white p-2 rounded border border-[#E5E5E5] font-mono text-[11px] text-[#111111]">
                  GET /api/auth/sso?ticket=sso_ticket_...
                </code>
                <p className="text-[#666666] text-[11px] leading-relaxed">
                  External software directs the browser to this URL. The CRM verifies the ticket, signs a secure 7-day session cookie, and opens the CRM directly.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Live SSO Session Generator */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="border-b border-[#E5E5E5] pb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                Live SSO Ticket Generator Simulator
              </h4>
              <p className="text-[11px] text-[#666666]">
                Generate a live single-use SSO link for any test partner user.
              </p>
            </div>

            <form onSubmit={handleGenerateSsoTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#404040] font-medium mb-1">User Email Address *</label>
                  <input
                    type="email"
                    required
                    value={ssoForm.email}
                    onChange={(e) => setSsoForm({ ...ssoForm, email: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#404040] font-medium mb-1">User Full Name</label>
                  <input
                    type="text"
                    value={ssoForm.name}
                    onChange={(e) => setSsoForm({ ...ssoForm, name: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#404040] font-medium mb-1">External System User ID</label>
                  <input
                    type="text"
                    value={ssoForm.external_user_id}
                    onChange={(e) => setSsoForm({ ...ssoForm, external_user_id: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-[#666666]">
                  Uses active API Key: <code className="font-mono text-[#111111]">{sandboxApiKey.slice(0, 16)}...</code>
                </span>
                <button
                  type="submit"
                  disabled={generatingSso}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#111111] hover:bg-[#262626] disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{generatingSso ? 'Issuing Ticket...' : 'Generate 1-Click SSO Link'}</span>
                </button>
              </div>
            </form>

            {ssoResult && (
              <div className={`p-4 rounded-xl border text-xs font-mono mt-3 ${
                ssoResult.ok ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              }`}>
                {ssoResult.ok ? (
                  <div className="space-y-3 font-sans">
                    <div className="flex items-center space-x-2 font-semibold text-[#16A34A]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SSO Session Ready (Expires in 5 minutes)</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-[#BBF7D0] space-y-2">
                      <span className="text-[11px] text-[#666666] font-medium block">Generated SSO Link:</span>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs font-mono text-[#111111] break-all">
                          {ssoResult.data.sso_redirect_url}
                        </code>
                        <button
                          onClick={() => copyText(ssoResult.data.sso_redirect_url, 'SSO Link copied!')}
                          className="px-2 py-1 bg-[#F8F8F8] hover:bg-[#E5E5E5] border border-[#D4D4D4] rounded text-xs text-[#111111] font-medium shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <a
                      href={ssoResult.data.sso_redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#16A34A] text-white rounded-lg text-xs font-medium hover:bg-[#15803D] transition shadow-sm"
                    >
                      <span>Test Live SSO Login (Opens in New Tab)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <pre className="text-[11px]">
                    {JSON.stringify(ssoResult.data || ssoResult.error, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ISSUED API KEYS */}
      {activeTab === 'keys' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Active Partner & Developer API Keys</h3>
              <p className="text-xs text-[#666666]">
                Only cryptographic SHA-256 hashes are persisted in PostgreSQL. Keys include rate limits and granular scopes.
              </p>
            </div>
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition shadow-sm"
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
                      <div className="flex items-center justify-end space-x-1.5 relative">
                        {!k.is_revoked ? (
                          <button
                            onClick={() => setKeyToRevoke(k.id)}
                            className="px-2.5 py-1 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => setKeyToDelete(k.id)}
                            className="px-2.5 py-1 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#666666] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition"
                          >
                            Delete
                          </button>
                        )}
                        <button
                          onClick={() => setOpenMenuKeyId(openMenuKeyId === k.id ? null : k.id)}
                          className="p-1 text-[#666666] hover:text-[#111111] hover:bg-[#F0F0F0] rounded-lg transition"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openMenuKeyId === k.id && (
                          <div 
                            className="absolute right-0 top-8 z-30 w-44 bg-white border border-[#E5E5E5] rounded-xl shadow-lg py-1 text-left animate-fadeIn"
                            onMouseLeave={() => setOpenMenuKeyId(null)}
                          >
                            <button
                              onClick={() => {
                                copyText(k.id, 'Key ID copied!');
                                setOpenMenuKeyId(null);
                              }}
                              className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-[#444444] hover:bg-[#F8F8F8] transition"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#666666]" />
                              <span>Copy Key ID</span>
                            </button>
                            <button
                              onClick={() => {
                                copyText(k.key_prefix, 'Prefix copied!');
                                setOpenMenuKeyId(null);
                              }}
                              className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-[#444444] hover:bg-[#F8F8F8] transition"
                            >
                              <Key className="w-3.5 h-3.5 text-[#666666]" />
                              <span>Copy Prefix</span>
                            </button>
                            <div className="border-t border-[#E5E5E5] my-1" />
                            <button
                              onClick={() => {
                                setKeyToDelete(k.id);
                                setOpenMenuKeyId(null);
                              }}
                              className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] transition"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                              <span>Delete Key Record</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {keys.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#666666]">
                      No API keys created yet. Click "Issue New Key" above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PARTNER ACCESS REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Third-Party Access Applications</h3>
              <p className="text-xs text-[#666666]">
                External developers and partners submit access requests with requested scopes for admin approval.
              </p>
            </div>
            <button
              onClick={loadAll}
              className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] rounded-lg transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#666666] uppercase text-[11px] tracking-wider bg-[#FAFAFA]">
                  <th className="py-2.5 px-3 font-semibold">Developer / Company</th>
                  <th className="py-2.5 px-3 font-semibold">Contact Email</th>
                  <th className="py-2.5 px-3 font-semibold">Integration Purpose</th>
                  <th className="py-2.5 px-3 font-semibold">Requested Scopes</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#111111]">{r.developer_name}</div>
                      <div className="text-[11px] text-[#666666]">{r.company_name}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#444444]">{r.email}</td>
                    <td className="py-3 px-3 text-[#444444] max-w-xs">{r.purpose}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {r.requested_scopes.map((sc: string) => (
                          <span key={sc} className="px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#111111] font-mono text-[10px]">
                            {sc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          r.status === 'Approved'
                            ? 'bg-[#DCFCE7] text-[#16A34A]'
                            : r.status === 'Rejected'
                            ? 'bg-[#FEF2F2] text-[#DC2626]'
                            : 'bg-[#FEF3C7] text-[#D97706]'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {r.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleApproveRequest(r.id)}
                            className="px-3 py-1 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRequestToReject(r.id)}
                            className="px-2.5 py-1 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#999999]">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}

                {requests.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#666666]">
                      No partner requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: WEBHOOKS */}
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
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Webhook</span>
            </button>
          </div>

          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className="p-4 border border-[#E5E5E5] rounded-xl bg-[#FAFAFA] space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-[#111111]">{wh.target_url}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          wh.is_active ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F4F4F5] text-[#737373]'
                        }`}
                      >
                        {wh.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((ev: string) => (
                        <span key={ev} className="px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded text-[10px] font-mono text-[#666666]">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 relative">
                    <button
                      onClick={() => handleTestPing(wh.id)}
                      className="px-2.5 py-1 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F8F8F8] transition"
                    >
                      Test Ping
                    </button>
                    <button
                      onClick={() => setOpenMenuWebhookId(openMenuWebhookId === wh.id ? null : wh.id)}
                      className="p-1 text-[#666666] hover:text-[#111111] hover:bg-[#F0F0F0] rounded-lg transition"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {openMenuWebhookId === wh.id && (
                      <div 
                        className="absolute right-0 top-8 z-30 w-48 bg-white border border-[#E5E5E5] rounded-xl shadow-lg py-1 text-left animate-fadeIn"
                        onMouseLeave={() => setOpenMenuWebhookId(null)}
                      >
                        <button
                          onClick={() => handleToggleWebhook(wh.id)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-[#444444] hover:bg-[#F8F8F8] transition"
                        >
                          <Power className="w-3.5 h-3.5 text-[#666666]" />
                          <span>{wh.is_active ? 'Pause / Disable' : 'Activate Webhook'}</span>
                        </button>
                        <div className="border-t border-[#E5E5E5] my-1" />
                        <button
                          onClick={() => {
                            setWebhookToDelete(wh.id);
                            setOpenMenuWebhookId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                          <span>Delete Webhook</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {webhooks.length === 0 && !loading && (
              <div className="text-center py-8 text-xs text-[#666666]">
                No webhooks configured yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: LIVE API GATEWAY SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">API Gateway Endpoint Tester</h3>
            <p className="text-xs text-[#666666]">
              Send live verification requests directly to any endpoint using your API credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[#404040] font-medium mb-1">API Key Header (<code className="font-mono text-[#111111]">x-api-key</code>)</label>
              <input
                type="text"
                value={sandboxApiKey}
                onChange={(e) => setSandboxApiKey(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-[#404040] font-medium mb-1">Target Endpoint</label>
              <select
                value={sandboxEndpoint}
                onChange={(e) => setSandboxEndpoint(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono text-[11px]"
              >
                <option value="/external/auth/verify">GET /external/auth/verify</option>
                <option value="/external/stats">GET /external/stats</option>
                <option value="/external/leads">GET /external/leads</option>
                <option value="/external/deals">GET /external/deals</option>
                <option value="/external/invoices">GET /external/invoices</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setSandboxApiKey('crm_live_demo_key_super_secure_123')}
              className="text-[11px] font-mono text-[#111111] underline hover:text-[#444444]"
            >
              Fill Demo API Key
            </button>
            <button
              onClick={handleRunSandbox}
              disabled={sandboxTesting}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#111111] hover:bg-[#262626] disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{sandboxTesting ? 'Sending Request...' : 'Execute API Call'}</span>
            </button>
          </div>

          {sandboxResult && (
            <div className={`p-4 rounded-xl border text-xs font-mono mt-3 ${
              sandboxResult.ok ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
            }`}>
              <div className="flex items-center space-x-2 font-bold mb-2">
                {sandboxResult.ok ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> : <AlertCircle className="w-4 h-4 text-[#DC2626]" />}
                <span>HTTP {sandboxResult.status} {sandboxResult.ok ? 'OK (Authorized)' : 'Unauthorized'}</span>
              </div>
              <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(sandboxResult.data || sandboxResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ISSUE NEW KEY */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Issue Production API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="p-1 hover:bg-[#F8F8F8] rounded">
                <X className="w-4 h-4 text-[#666666]" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectKey} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#404040] font-medium mb-1">Key Label / Application Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Contact Form Widget"
                  value={directKeyName}
                  onChange={(e) => setDirectKeyName(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#404040] font-medium mb-1.5">Authorized Permissions & Scopes</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                  {AVAILABLE_SCOPES.map((sc) => (
                    <label key={sc.id} className="flex items-start space-x-2 text-[11px] cursor-pointer hover:bg-white p-1 rounded transition">
                      <input
                        type="checkbox"
                        checked={directScopes.includes(sc.id)}
                        onChange={(e) => {
                          if (e.target.checked) setDirectScopes([...directScopes, sc.id]);
                          else setDirectScopes(directScopes.filter(s => s !== sc.id));
                        }}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-mono font-semibold text-[#111111]">{sc.label}</div>
                        <div className="text-[#666666]">{sc.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#666666] hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingKey || !directKeyName}
                  className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] disabled:opacity-50"
                >
                  {creatingKey ? 'Generating...' : 'Create API Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEWLY GENERATED KEY DISPLAY */}
      {generatedKey && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">API Key Generated</h3>
              <p className="text-xs text-[#666666]">
                Copy and save this key immediately. For security, it will never be displayed again.
              </p>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-2 text-xs">
              <span className="font-medium text-[#666666] block">Your Secret API Key:</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-[#111111] break-all">
                  {generatedKey.raw_api_key}
                </code>
                <button
                  onClick={() => copyText(generatedKey.raw_api_key, 'API Key copied!')}
                  className="px-2.5 py-1.5 bg-[#111111] text-white rounded text-xs font-medium shrink-0 hover:bg-[#262626]"
                >
                  Copy Key
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setGeneratedKey(null)}
                className="w-full py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626]"
              >
                I Have Saved My Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT PARTNER REQUEST */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Partner Integration Application</h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1 hover:bg-[#F8F8F8] rounded">
                <X className="w-4 h-4 text-[#666666]" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#404040] font-medium mb-1">Developer / Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sen"
                  value={newReq.developer_name}
                  onChange={(e) => setNewReq({ ...newReq, developer_name: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#404040] font-medium mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZenScale Systems"
                  value={newReq.company_name}
                  onChange={(e) => setNewReq({ ...newReq, company_name: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#404040] font-medium mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="ananya@zenscale.io"
                  value={newReq.email}
                  onChange={(e) => setNewReq({ ...newReq, email: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#404040] font-medium mb-1">Integration Purpose *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe your software integration or website enquiry workflow..."
                  value={newReq.purpose}
                  onChange={(e) => setNewReq({ ...newReq, purpose: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#666666] hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] disabled:opacity-50"
                >
                  {submittingReq ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE WEBHOOK */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Register Outgoing Webhook</h3>
              <button onClick={() => setShowWebhookModal(false)} className="p-1 hover:bg-[#F8F8F8] rounded">
                <X className="w-4 h-4 text-[#666666]" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#404040] font-medium mb-1">Target Endpoint URL (HTTPS) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://yourapp.com/webhooks/crm"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[#404040] font-medium mb-1.5">Subscribed Real-Time Events</label>
                <div className="space-y-1 bg-[#FAFAFA] p-2 rounded-lg border border-[#E5E5E5]">
                  {['lead.created', 'lead.updated', 'deal.won', 'invoice.paid'].map((ev) => (
                    <label key={ev} className="flex items-center space-x-2 text-[11px] cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={webhookEvents.includes(ev)}
                        onChange={(e) => {
                          if (e.target.checked) setWebhookEvents([...webhookEvents, ev]);
                          else setWebhookEvents(webhookEvents.filter(x => x !== ev));
                        }}
                      />
                      <span className="font-mono text-[#111111]">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#666666] hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWebhook || !webhookUrl}
                  className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] disabled:opacity-50"
                >
                  {creatingWebhook ? 'Registering...' : 'Register Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOGS */}
      <ConfirmDialog
        isOpen={Boolean(keyToRevoke)}
        title="Revoke API Key"
        message="Are you sure you want to revoke this API key? Any third-party software or website using it will immediately be rejected."
        confirmLabel="Revoke Key"
        onConfirm={() => { if (keyToRevoke) handleRevokeKey(keyToRevoke); }}
        onCancel={() => setKeyToRevoke(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(keyToDelete)}
        title="Delete API Key Record"
        message="Are you sure you want to permanently remove this key record? This action cannot be undone."
        confirmLabel="Delete Record"
        onConfirm={() => { if (keyToDelete) handleDeleteKey(keyToDelete); }}
        onCancel={() => setKeyToDelete(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(webhookToDelete)}
        title="Delete Webhook"
        message="Are you sure you want to remove this outgoing webhook destination?"
        confirmLabel="Delete Webhook"
        onConfirm={() => { if (webhookToDelete) handleDeleteWebhook(webhookToDelete); }}
        onCancel={() => setWebhookToDelete(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(requestToReject)}
        title="Decline Partner Request"
        message="Decline this developer's API access application?"
        confirmLabel="Decline Application"
        onConfirm={() => { if (requestToReject) handleRejectRequest(requestToReject); }}
        onCancel={() => setRequestToReject(null)}
      />
    </div>
  );
}
