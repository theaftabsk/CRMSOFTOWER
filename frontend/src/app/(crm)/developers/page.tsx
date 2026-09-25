'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { api } from '../../../lib/api';
import { 
  Key, Plus, Copy, Check, ShieldAlert, Code2, Play, 
  Webhook, RefreshCw, X, AlertCircle, CheckCircle2, Terminal,
  Inbox, CreditCard, ShieldCheck, UserCheck, ExternalLink,
  ChevronRight, Lock, MoreHorizontal, Trash2, Power, Eye, EyeOff, Info
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const AVAILABLE_SCOPES = [
  { id: 'leads:read', label: 'leads:read', desc: 'Query and view leads' },
  { id: 'leads:write', label: 'leads:write', desc: 'Create and update leads' },
  { id: 'contacts:read', label: 'contacts:read', desc: 'View contacts' },
  { id: 'deals:read', label: 'deals:read', desc: 'View pipeline deals' },
  { id: 'deals:write', label: 'deals:write', desc: 'Create and update deals' },
  { id: 'invoices:read', label: 'invoices:read', desc: 'View invoices' },
  { id: 'invoices:write', label: 'invoices:write', desc: 'Generate invoices & payment links' },
  { id: 'webhooks:manage', label: 'webhooks:manage', desc: 'Configure webhooks' },
];

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'keys' | 'payment_tokens' | 'docs' | 'webhooks'>('requests');

  // Data States
  const [requests, setRequests] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<any | null>(null);

  // Dialog States
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [openMenuKeyId, setOpenMenuKeyId] = useState<string | null>(null);
  const [openMenuWebhookId, setOpenMenuWebhookId] = useState<string | null>(null);
  const [visibleWebhookSecretId, setVisibleWebhookSecretId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Partner Request Form State
  const [newReq, setNewReq] = useState({
    developer_name: '',
    company_name: '',
    email: '',
    purpose: '',
    requested_scopes: ['leads:write', 'invoices:read', 'invoices:write'],
  });
  const [submittingReq, setSubmittingReq] = useState(false);

  // Direct Key Form State
  const [directKeyName, setDirectKeyName] = useState('');
  const [directScopes, setDirectScopes] = useState<string[]>(['leads:write', 'leads:read']);
  const [creatingKey, setCreatingKey] = useState(false);

  // Webhook Form State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['lead.created', 'deal.won', 'invoice.paid']);
  const [creatingWebhook, setCreatingWebhook] = useState(false);

  // Code Tab State
  const [codeTab, setCodeTab] = useState<'curl' | 'js' | 'python'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Sandbox State
  const [testKey, setTestKey] = useState('crm_live_demo_key_super_secure_123');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const loadAll = async () => {
    setLoading(true);
    const [reqsData, keysData, whData] = await Promise.all([
      api.getPartnerRequests(),
      api.getApiKeys(),
      api.getWebhooks(),
    ]);
    setRequests(Array.isArray(reqsData) ? reqsData : []);
    setKeys(Array.isArray(keysData) ? keysData : []);
    setWebhooks(Array.isArray(whData) ? whData : []);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleApproveRequest = async (requestId: string) => {
    const res = await api.approvePartnerRequest(requestId);
    if (res && res.issued_key) {
      setGeneratedKey(res.issued_key);
    }
    loadAll();
  };

  const handleRejectRequest = (requestId: string) => {
    setRequestToReject(requestId);
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
      requested_scopes: ['leads:write', 'invoices:read', 'invoices:write'],
    });
    loadAll();
  };

  const handleCreateDirectKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directKeyName) return;
    setCreatingKey(true);
    const result = await api.createApiKey({
      key_name: directKeyName,
      permissions: directScopes,
    });
    setCreatingKey(false);
    setShowKeyModal(false);
    setDirectKeyName('');
    if (result && result.raw_api_key) {
      setGeneratedKey(result);
    }
    loadAll();
  };

  const handleRevokeKey = (id: string) => {
    setKeyToRevoke(id);
    setOpenMenuKeyId(null);
  };

  const handleDeleteKey = (id: string) => {
    setKeyToDelete(id);
    setOpenMenuKeyId(null);
  };

  const handleToggleWebhook = async (id: string) => {
    setOpenMenuWebhookId(null);
    await api.toggleWebhook(id);
    showToast('Webhook status updated', 'success');
    loadAll();
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhookToDelete(id);
    setOpenMenuWebhookId(null);
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
    showToast('Webhook created successfully!', 'success');
    loadAll();
  };

  const handleTestPing = async (id: string) => {
    setOpenMenuWebhookId(null);
    const res = await api.testWebhook(id);
    showToast(res?.message || 'Test event dispatched successfully!', 'success');
    loadAll();
  };

  const handleRunSandbox = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:4000/api/v1/external/auth/verify', {
        headers: { 'x-api-key': testKey.trim() },
      });
      const json = await res.json();
      setTestResult({ status: res.status, ok: res.ok, data: json });
    } catch (err: any) {
      setTestResult({ status: 500, ok: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const copyText = (txt: string, label: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(txt);
    setCopiedCode(true);
    showToast(label, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  const cURLSnippet = `curl -X POST http://localhost:4000/api/v1/external/leads \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Idempotency-Key: partner-req-${Date.now()}" \\
  -d '{
    "name": "Partner Lead",
    "email": "lead@partnercorp.com",
    "phone": "+91 9876543210",
    "company": "Partner Enterprise",
    "expected_value": 90000,
    "source": "External Partner API"
  }'`;

  const jsSnippet = `const response = await fetch("http://localhost:4000/api/v1/external/leads", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",
    "Idempotency-Key": "partner-req-" + Date.now()
  },
  body: JSON.stringify({
    name: "Partner Lead",
    email: "lead@partnercorp.com",
    phone: "+91 9876543210",
    company: "Partner Enterprise",
    expected_value: 90000,
    source: "External Software"
  })
});
const result = await response.json();
console.log("Success:", result);`;

  const pythonSnippet = `import requests
import time

url = "http://localhost:4000/api/v1/external/leads"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",
    "Idempotency-Key": f"partner-req-{int(time.time())}"
}
payload = {
    "name": "Partner Lead",
    "email": "lead@partnercorp.com",
    "phone": "+91 9876543210",
    "company": "Partner Enterprise",
    "expected_value": 90000,
    "source": "Python Client"
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Developer Portal & Partner Integration Hub"
          subtitle="Enterprise API authorization, partner permission request approvals, payment tokens, and live sandbox."
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F8F8F8] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Partner Request</span>
          </button>
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition shadow-sm"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Issue Direct Key</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E5E5] pb-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'requests' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Access Requests</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#DC2626] text-white">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'keys' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Issued API Keys ({keys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payment_tokens')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'payment_tokens' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Tokens & Checkout APIs</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'docs' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Integration Docs & Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'webhooks' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
          }`}
        >
          <Webhook className="w-3.5 h-3.5" />
          <span>Webhooks & Retries ({webhooks.length})</span>
        </button>
      </div>

      {/* TAB 1: ACCESS REQUESTS (APPROVAL INBOX) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">Partner Permission & Access Requests</h3>
                <p className="text-xs text-[#666666]">
                  Collaborators and third-party software developers submit access requests with requested scopes. Admins review and grant permission.
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
                    <th className="py-3 px-4 font-semibold">Developer / Company</th>
                    <th className="py-3 px-4 font-semibold">Contact Email</th>
                    <th className="py-3 px-4 font-semibold">Integration Purpose</th>
                    <th className="py-3 px-4 font-semibold">Requested Scopes</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FAFAFA] transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#111111]">{r.developer_name}</div>
                        <div className="text-[11px] text-[#666666]">{r.company_name}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#444444]">{r.email}</td>
                      <td className="py-3 px-4 text-[#444444] max-w-xs">{r.purpose}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {r.requested_scopes.map((sc: string) => (
                            <span key={sc} className="px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#111111] font-mono text-[10px]">
                              {sc}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 text-right space-x-2">
                        {r.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveRequest(r.id)}
                              className="px-3 py-1 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition"
                            >
                              Approve & Issue Key
                            </button>
                            <button
                              onClick={() => handleRejectRequest(r.id)}
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
                        No partner access requests found. Click "Submit Partner Request" to simulate an external partner applying for API credentials.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISSUED API KEYS */}
      {activeTab === 'keys' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Active Partner API Keys</h3>
              <p className="text-xs text-[#666666]">
                Only cryptographic SHA-256 hashes are stored in database. Prefix is displayed for identification.
              </p>
            </div>
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue New Key</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#666666] uppercase text-[11px] tracking-wider">
                  <th className="pb-3 font-semibold">Key Label / Client</th>
                  <th className="pb-3 font-semibold">Prefix</th>
                  <th className="pb-3 font-semibold">Authorized Scopes</th>
                  <th className="pb-3 font-semibold">Rate Limit</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3 font-semibold text-[#111111]">{k.key_name}</td>
                    <td className="py-3 font-mono text-[#666666]">{k.key_prefix}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {k.permissions.map((p: string) => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#333333] font-mono text-[10px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[#666666]">{k.rate_limit_per_min} req/min</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          k.is_revoked ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#DCFCE7] text-[#16A34A]'
                        }`}
                      >
                        {k.is_revoked ? 'Revoked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end space-x-1.5 relative">
                        {!k.is_revoked ? (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="px-2.5 py-1 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteKey(k.id)}
                            className="px-2.5 py-1 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#666666] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition"
                          >
                            Delete
                          </button>
                        )}
                        <button
                          onClick={() => setOpenMenuKeyId(openMenuKeyId === k.id ? null : k.id)}
                          className="p-1 text-[#666666] hover:text-[#111111] hover:bg-[#F0F0F0] rounded-lg transition"
                          title="More actions"
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
                              onClick={() => handleDeleteKey(k.id)}
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

                {keys.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-[#666666]">
                      No keys issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT TOKENS & CHECKOUT APIS */}
      {activeTab === 'payment_tokens' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#111111]" />
                <span>High-Entropy Payment Tokens Architecture</span>
              </h3>
              <p className="text-xs text-[#666666]">
                Each invoice generated via API or CRM is automatically assigned a cryptographically random 48-character hex payment token.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <span className="font-semibold text-[#111111] block">Sanitized Public Endpoint:</span>
                <code className="block bg-white p-2 rounded border border-[#E5E5E5] font-mono text-[11px] text-[#111111]">
                  GET /api/v1/public/invoices/:payment_token
                </code>
                <p className="text-[#666666] text-[11px]">
                  Exposes only non-sensitive customer invoice lines, total amount, paid balance, and company public name. Zero internal UUIDs or tenant configuration leaks.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <span className="font-semibold text-[#111111] block">Instant Payment Confirmation:</span>
                <code className="block bg-white p-2 rounded border border-[#E5E5E5] font-mono text-[11px] text-[#111111]">
                  POST /api/v1/public/invoices/:payment_token/pay
                </code>
                <p className="text-[#666666] text-[11px]">
                  Records atomic payment entry, updates invoice to <code className="font-mono text-[#16A34A]">Paid</code>, and dispatches <code className="font-mono">invoice.paid</code> webhook event.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-[#111111] block mb-2">Live Demo Payment Portal:</span>
              <a
                href="/pay/pay_token_apex_demo_2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition shadow-sm"
              >
                <span>Open Live Invoice Checkout Portal (pay_token_apex_demo_2026)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTEGRATION DOCS & SANDBOX */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">Partner Lead Ingestion Code</h3>
                <p className="text-xs text-[#666666]">
                  Pass <code className="font-mono text-[#111111]">x-api-key</code> and <code className="font-mono text-[#111111]">Idempotency-Key</code> in HTTP headers.
                </p>
              </div>
              <div className="flex space-x-1.5">
                {(['curl', 'js', 'python'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCodeTab(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
                      codeTab === t ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#F8F8F8]'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative bg-[#111111] text-white rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-emerald-400 leading-relaxed">
                {codeTab === 'curl' && cURLSnippet}
                {codeTab === 'js' && jsSnippet}
                {codeTab === 'python' && pythonSnippet}
              </pre>
              <button
                onClick={() => {
                  const str = codeTab === 'curl' ? cURLSnippet : codeTab === 'js' ? jsSnippet : pythonSnippet;
                  copyText(str);
                }}
                className="absolute top-3 right-3 flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[11px] transition"
              >
                {copiedCode ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Live Sandbox */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Live API Sandbox Tester</h3>
              <p className="text-xs text-[#666666]">
                Execute live validation against the API Gateway endpoint (<code className="font-mono text-[#111111]">GET /api/v1/external/auth/verify</code>).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter API Key"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                className="flex-1 text-xs font-mono bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
              />
              <button
                onClick={handleRunSandbox}
                disabled={testing || !testKey}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] disabled:opacity-50 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{testing ? 'Calling Gateway...' : 'Execute Request'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-lg border text-xs font-mono ${
                  testResult.ok
                    ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                    : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold mb-2">
                  {testResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>Status: HTTP {testResult.status} {testResult.ok ? 'OK (Authorized)' : 'Unauthorized'}</span>
                </div>
                <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(testResult.data || testResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: WEBHOOKS & RETRIES */}
      {activeTab === 'webhooks' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Configured Outgoing Webhooks</h3>
              <p className="text-xs text-[#666666]">
                Webhook deliveries automatically retry up to 3 times with exponential backoff and HMAC-SHA256 signatures.
              </p>
            </div>
            <button
              onClick={() => setShowWebhookModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Webhook</span>
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

                  {/* Action Dock for Webhook */}
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
                      title="More actions"
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
                        <button
                          onClick={() => {
                            copyText(wh.secret_token, 'Secret token copied!');
                            setOpenMenuWebhookId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-[#444444] hover:bg-[#F8F8F8] transition"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#666666]" />
                          <span>Copy Signing Secret</span>
                        </button>
                        <div className="border-t border-[#E5E5E5] my-1" />
                        <button
                          onClick={() => handleDeleteWebhook(wh.id)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                          <span>Delete Webhook</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signing Secret Box */}
                {wh.secret_token && (
                  <div className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-3.5 h-3.5 text-[#666666]" />
                      <span className="text-[#666666] font-medium text-[11px]">HMAC Signature Secret:</span>
                      <span className="font-mono text-[#111111] text-[11px]">
                        {visibleWebhookSecretId === wh.id 
                          ? wh.secret_token 
                          : `${wh.secret_token.slice(0, 10)}••••••••••••••••••••`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setVisibleWebhookSecretId(visibleWebhookSecretId === wh.id ? null : wh.id)}
                        className="p-1 text-[#666666] hover:text-[#111111] rounded hover:bg-[#F8F8F8]"
                        title={visibleWebhookSecretId === wh.id ? 'Hide Secret' : 'Reveal Secret'}
                      >
                        {visibleWebhookSecretId === wh.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyText(wh.secret_token, 'Signing secret copied to clipboard!')}
                        className="p-1 text-[#666666] hover:text-[#111111] rounded hover:bg-[#F8F8F8]"
                        title="Copy Secret"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Delivery Log */}
                {wh.logs && wh.logs.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E5E5]">
                    <span className="text-[10px] text-[#666666] uppercase font-semibold">Delivery Logs (Last 3 Dispatches):</span>
                    <div className="space-y-1.5 mt-1.5">
                      {wh.logs.slice(0, 3).map((l: any) => (
                        <div key={l.id} className="flex items-center justify-between text-[11px] font-mono bg-white p-2 rounded border border-[#E5E5E5]">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#111111] font-semibold">{l.event}</span>
                            <span className="text-[#666666] text-[10px]">(Attempt {l.attempt}/{l.max_attempts})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[#666666] text-[10px]">
                              {new Date(l.executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              l.status_code >= 200 && l.status_code < 300 ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'
                            }`}>
                              {l.status_code ? `HTTP ${l.status_code}` : 'Network Timeout'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {webhooks.length === 0 && (
              <p className="text-center py-6 text-xs text-[#666666]">No webhooks configured yet.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT PARTNER REQUEST */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Request Developer API Access</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-[#666666] hover:bg-[#F8F8F8] p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Developer / Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Sen"
                  value={newReq.developer_name}
                  onChange={(e) => setNewReq({ ...newReq, developer_name: e.target.value })}
                  className="w-full text-xs bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Company / App Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HealthBridge App Systems"
                  value={newReq.company_name}
                  onChange={(e) => setNewReq({ ...newReq, company_name: e.target.value })}
                  className="w-full text-xs bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. dev@healthbridge.io"
                  value={newReq.email}
                  onChange={(e) => setNewReq({ ...newReq, email: e.target.value })}
                  className="w-full text-xs bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Integration Purpose *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe your collaboration and which endpoints you require"
                  value={newReq.purpose}
                  onChange={(e) => setNewReq({ ...newReq, purpose: e.target.value })}
                  className="w-full text-xs bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-2">Requested Permissions</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-[#E5E5E5] rounded-lg p-2.5 text-xs">
                  {AVAILABLE_SCOPES.map((sc) => (
                    <label key={sc.id} className="flex items-center space-x-2 cursor-pointer font-mono">
                      <input
                        type="checkbox"
                        checked={newReq.requested_scopes.includes(sc.id)}
                        onChange={() => {
                          if (newReq.requested_scopes.includes(sc.id)) {
                            setNewReq({ ...newReq, requested_scopes: newReq.requested_scopes.filter((s) => s !== sc.id) });
                          } else {
                            setNewReq({ ...newReq, requested_scopes: [...newReq.requested_scopes, sc.id] });
                          }
                        }}
                        className="rounded border-[#D4D4D4] text-[#111111]"
                      />
                      <span>{sc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] disabled:opacity-50"
                >
                  {submittingReq ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ONE-TIME SECRET KEY DISPLAY */}
      {generatedKey && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center space-x-2 text-[#16A34A]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-[#111111]">API Key Generated & Authorized</h3>
            </div>

            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#991B1B] space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>One-Time Key Display Reminder:</span>
              </div>
              <p>
                This raw API key is displayed once only. Copy and store it securely now.
              </p>
            </div>

            <div className="relative bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-3 font-mono text-xs text-[#111111] break-all">
              {generatedKey.raw_api_key}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  copyText(generatedKey.raw_api_key, 'API Key copied to clipboard!');
                  setTimeout(() => setGeneratedKey(null), 800);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Key & Close</span>
              </button>
              <button
                onClick={() => setGeneratedKey(null)}
                className="px-4 py-2 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F8F8F8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT KEY ISSUANCE */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Issue Direct Partner API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="text-[#666666] hover:bg-[#F8F8F8] p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Key Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Partner, Accounting Bridge"
                  value={directKeyName}
                  onChange={(e) => setDirectKeyName(e.target.value)}
                  className="w-full text-xs bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-2">Granted Permissions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-[#E5E5E5] rounded-lg p-3 text-xs">
                  {AVAILABLE_SCOPES.map((sc) => {
                    const checked = directScopes.includes(sc.id);
                    return (
                      <label key={sc.id} className="flex items-start space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setDirectScopes(directScopes.filter((s) => s !== sc.id));
                            } else {
                              setDirectScopes([...directScopes, sc.id]);
                            }
                          }}
                          className="mt-0.5 rounded border-[#D4D4D4] text-[#111111]"
                        />
                        <div>
                          <span className="font-mono font-semibold text-[#111111]">{sc.label}</span>
                          <p className="text-[11px] text-[#666666]">{sc.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingKey || !directKeyName}
                  className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] disabled:opacity-50"
                >
                  {creatingKey ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD WEBHOOK */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Register Outgoing Webhook</h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-[#666666] hover:bg-[#F8F8F8] p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Target Webhook URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://partner-system.com/webhook/crm-events"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-2">Events to Deliver</label>
                <div className="space-y-1.5 border border-[#E5E5E5] rounded-lg p-3 text-xs">
                  {['lead.created', 'deal.won', 'deal.created', 'invoice.paid'].map((ev) => (
                    <label key={ev} className="flex items-center space-x-2 cursor-pointer font-mono">
                      <input
                        type="checkbox"
                        checked={webhookEvents.includes(ev)}
                        onChange={() => {
                          if (webhookEvents.includes(ev)) {
                            setWebhookEvents(webhookEvents.filter((e) => e !== ev));
                          } else {
                            setWebhookEvents([...webhookEvents, ev]);
                          }
                        }}
                        className="rounded border-[#D4D4D4] text-[#111111]"
                      />
                      <span>{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F8F8F8]"
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
      {/* Dialog for Declining Request */}
      <ConfirmDialog
        isOpen={!!requestToReject}
        title="Decline Integration Request"
        message="Are you sure you want to decline this integration request? The partner developer will not receive API credentials."
        confirmLabel="Decline Request"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (requestToReject) {
            await api.rejectPartnerRequest(requestToReject);
            setRequestToReject(null);
            showToast('Partner request declined', 'info');
            loadAll();
          }
        }}
        onCancel={() => setRequestToReject(null)}
      />

      {/* Dialog for Revoking API Key */}
      <ConfirmDialog
        isOpen={!!keyToRevoke}
        title="Revoke API Key"
        message="Revoking will immediately deny all external requests authenticated with this secret key. Any active workflows using this key will immediately fail."
        confirmLabel="Revoke Key"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (keyToRevoke) {
            await api.revokeApiKey(keyToRevoke);
            setKeyToRevoke(null);
            showToast('API key revoked', 'info');
            loadAll();
          }
        }}
        onCancel={() => setKeyToRevoke(null)}
      />

      {/* Dialog for Deleting API Key */}
      <ConfirmDialog
        isOpen={!!keyToDelete}
        title="Delete API Key Record"
        message="Permanently delete this API key record from the database. This action cannot be reversed."
        confirmLabel="Delete Key"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (keyToDelete) {
            await api.deleteApiKey(keyToDelete);
            setKeyToDelete(null);
            showToast('API key permanently deleted', 'success');
            loadAll();
          }
        }}
        onCancel={() => setKeyToDelete(null)}
      />

      {/* Dialog for Deleting Webhook */}
      <ConfirmDialog
        isOpen={!!webhookToDelete}
        title="Delete Webhook Configuration"
        message="Permanently remove this webhook endpoint and delete all related delivery logs. External dispatches to this endpoint will stop immediately."
        confirmLabel="Delete Webhook"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (webhookToDelete) {
            await api.deleteWebhook(webhookToDelete);
            setWebhookToDelete(null);
            showToast('Webhook permanently deleted', 'success');
            loadAll();
          }
        }}
        onCancel={() => setWebhookToDelete(null)}
      />

      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 text-xs px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 border transition-all duration-300 animate-slideUp ${
            notification.type === 'error' 
              ? 'bg-[#111111] text-[#EF4444] border-[#DC2626]/40' 
              : notification.type === 'info'
              ? 'bg-[#111111] text-[#60A5FA] border-[#3B82F6]/40'
              : 'bg-[#111111] text-white border-[#333333]'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
          ) : notification.type === 'info' ? (
            <Info className="w-4 h-4 text-[#60A5FA] flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
          )}
          <span className="font-medium">{notification.text}</span>
        </div>
      )}
    </div>
  );
}
