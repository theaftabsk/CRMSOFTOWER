'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { 
  Key, Plus, Copy, Check, ShieldAlert, Code2, Play, 
  Webhook, RefreshCw, X, AlertCircle, CheckCircle2, Terminal
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

export const DeveloperSettingsTab: React.FC = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<any | null>(null);

  // Revoke Key State
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

  // New Key Form State
  const [keyName, setKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['leads:write', 'leads:read']);
  const [creatingKey, setCreatingKey] = useState(false);

  // New Webhook Form State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['lead.created', 'deal.won', 'invoice.paid']);
  const [creatingWebhook, setCreatingWebhook] = useState(false);

  // Code Snippet Tab
  const [codeTab, setCodeTab] = useState<'curl' | 'js' | 'python'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Live Sandbox Tester State
  const [testKey, setTestKey] = useState('crm_live_demo_key_super_secure_123');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(false);
    const [keysData, webhooksData] = await Promise.all([
      api.getApiKeys(),
      api.getWebhooks(),
    ]);
    setKeys(Array.isArray(keysData) ? keysData : []);
    setWebhooks(Array.isArray(webhooksData) ? webhooksData : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;
    setCreatingKey(true);
    const result = await api.createApiKey({
      key_name: keyName,
      permissions: selectedScopes,
    });
    setCreatingKey(false);
    setShowKeyModal(false);
    setKeyName('');
    if (result && result.raw_api_key) {
      setGeneratedKey(result);
    }
    loadData();
  };

  const handleRevokeKey = (id: string) => {
    setKeyToRevoke(id);
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
    loadData();
  };

  const handleTestPing = async (id: string) => {
    const res = await api.testWebhook(id);
    alert(res?.message || 'Test event dispatched!');
    loadData();
  };

  const handleRunTest = async () => {
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

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const cURLSnippet = `curl -X POST http://localhost:4000/api/v1/external/leads \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Idempotency-Key: partner-req-${Date.now()}" \\
  -d '{
    "name": "Arun Verma",
    "email": "arun@techcorp.in",
    "phone": "+91 9876543210",
    "company": "TechCorp India",
    "expected_value": 85000,
    "source": "External Partner Software"
  }'`;

  const jsSnippet = `const response = await fetch("http://localhost:4000/api/v1/external/leads", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",
    "Idempotency-Key": "partner-req-" + Date.now()
  },
  body: JSON.stringify({
    name: "Arun Verma",
    email: "arun@techcorp.in",
    phone: "+91 9876543210",
    company: "TechCorp India",
    expected_value: 85000,
    source: "External Partner App"
  })
});
const result = await response.json();
console.log("Lead Created:", result);`;

  const pythonSnippet = `import requests
import time

url = "http://localhost:4000/api/v1/external/leads"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",
    "Idempotency-Key": f"partner-req-{int(time.time())}"
}
payload = {
    "name": "Arun Verma",
    "email": "arun@techcorp.in",
    "phone": "+91 9876543210",
    "company": "TechCorp India",
    "expected_value": 85000,
    "source": "Python Client"
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())`;

  return (
    <div className="space-y-8">
      {/* 1. API Keys Section */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E5E5] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
              <Key className="w-4 h-4 text-[#111111]" />
              <span>Partner API Keys (One-Way Hashed)</span>
            </h3>
            <p className="text-xs text-[#666666]">
              Issue granular API keys to external collaborator applications. Keys are hashed with SHA-256 and never stored in plain text.
            </p>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New API Key</span>
          </button>
        </div>

        {/* API Keys Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[#666666] uppercase text-[11px] tracking-wider">
                <th className="pb-3 font-semibold">Key Name</th>
                <th className="pb-3 font-semibold">Prefix</th>
                <th className="pb-3 font-semibold">Scopes / Permissions</th>
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
                  <td className="py-3 font-mono text-[#666666]">{k.rate_limit_per_min}/min</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        k.is_revoked
                          ? 'bg-[#FEF2F2] text-[#DC2626]'
                          : 'bg-[#DCFCE7] text-[#16A34A]'
                      }`}
                    >
                      {k.is_revoked ? 'Revoked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {!k.is_revoked && (
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="text-xs text-[#DC2626] hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-[#666666]">
                    No API keys created yet. Click "Generate New API Key" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Interactive Documentation & Code Snippets */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E5E5] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-[#111111]" />
              <span>Partner Integration Code Snippets</span>
            </h3>
            <p className="text-xs text-[#666666]">
              Copy-paste examples for connecting external applications using your API key and idempotency headers.
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

      {/* 3. Live Sandbox API Tester */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#111111]" />
            <span>Live API Sandbox Tester</span>
          </h3>
          <p className="text-xs text-[#666666]">
            Test your API Key live against the authentication gateway (<code className="font-mono text-[#111111]">GET /api/v1/external/auth/verify</code>).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Paste your crm_live_... API key here"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            className="flex-1 text-xs font-mono bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
          />
          <button
            onClick={handleRunTest}
            disabled={testing || !testKey}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] disabled:opacity-50 transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{testing ? 'Verifying...' : 'Run Live Test'}</span>
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
              <span>HTTP Status: {testResult.status} {testResult.ok ? 'OK (Authorized)' : 'Unauthorized'}</span>
            </div>
            <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(testResult.data || testResult.error, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 4. Webhooks Dispatcher Section */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E5E5] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
              <Webhook className="w-4 h-4 text-[#111111]" />
              <span>Outgoing Webhooks (With 3-Attempt Auto Retry)</span>
            </h3>
            <p className="text-xs text-[#666666]">
              Real-time events dispatched to your server when leads are created, deals are won, or invoices are paid.
            </p>
          </div>
          <button
            onClick={() => setShowWebhookModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Webhook Endpoint</span>
          </button>
        </div>

        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="p-4 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA] space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-xs text-[#111111]">{wh.target_url}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {wh.events.map((ev: string) => (
                      <span key={ev} className="px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded text-[10px] font-mono text-[#666666]">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestPing(wh.id)}
                    className="px-2 py-1 bg-white border border-[#D4D4D4] rounded text-[11px] font-medium text-[#111111] hover:bg-[#F8F8F8]"
                  >
                    Test Ping
                  </button>
                </div>
              </div>

              {/* Webhook logs */}
              {wh.logs && wh.logs.length > 0 && (
                <div className="pt-2 border-t border-[#E5E5E5]">
                  <span className="text-[10px] text-[#666666] uppercase font-semibold">Recent Delivery Attempts:</span>
                  <div className="space-y-1 mt-1">
                    {wh.logs.slice(0, 3).map((l: any) => (
                      <div key={l.id} className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#333333]">{l.event} (Attempt {l.attempt}/{l.max_attempts})</span>
                        <span className={l.status_code >= 200 && l.status_code < 300 ? 'text-[#16A34A]' : 'text-[#DC2626]'}>
                          {l.status_code ? `HTTP ${l.status_code}` : 'Network Timeout'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {webhooks.length === 0 && (
            <p className="text-center py-4 text-xs text-[#666666]">
              No webhooks configured yet.
            </p>
          )}
        </div>
      </div>

      {/* One-Time Key Display Modal */}
      {generatedKey && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center space-x-2 text-[#16A34A]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-[#111111]">API Key Generated Successfully</h3>
            </div>

            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#991B1B] space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Save this secret key now!</span>
              </div>
              <p>For your security, this key is one-way hashed and will NEVER be shown again.</p>
            </div>

            <div className="relative bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-3 font-mono text-xs text-[#111111] break-all">
              {generatedKey.raw_api_key}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  copyText(generatedKey.raw_api_key);
                  alert('API Key copied to clipboard!');
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
                I Have Saved It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Generate Partner API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="text-[#666666] hover:bg-[#F8F8F8] p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Key Name / Client System *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App, Zapier Connector, Partner XYZ"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full text-xs bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-2">Granular Scopes & Permissions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-[#E5E5E5] rounded-lg p-3">
                  {AVAILABLE_SCOPES.map((sc) => {
                    const checked = selectedScopes.includes(sc.id);
                    return (
                      <label key={sc.id} className="flex items-start space-x-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedScopes(selectedScopes.filter((s) => s !== sc.id));
                            } else {
                              setSelectedScopes([...selectedScopes, sc.id]);
                            }
                          }}
                          className="mt-0.5 rounded border-[#D4D4D4] text-[#111111] focus:ring-0"
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
                  disabled={creatingKey || !keyName}
                  className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] disabled:opacity-50"
                >
                  {creatingKey ? 'Generating...' : 'Generate Secret Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Add Webhook Endpoint</h3>
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
                  placeholder="https://yourpartner.com/api/webhooks"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-2">Subscribed Events</label>
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
                  {creatingWebhook ? 'Adding...' : 'Register Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Revoking API Key */}
      <ConfirmDialog
        isOpen={!!keyToRevoke}
        title="Revoke API Key"
        message="Are you sure you want to revoke this API key? Collaborators, CLI scripts, and webhooks using it will immediately lose access."
        confirmLabel="Revoke Key"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (keyToRevoke) {
            await api.revokeApiKey(keyToRevoke);
            setKeyToRevoke(null);
            loadData();
          }
        }}
        onCancel={() => setKeyToRevoke(null)}
      />
    </div>
  );
};
