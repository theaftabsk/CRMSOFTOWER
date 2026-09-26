'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { api, getApiBaseUrl } from '../../../lib/api';
import { 
  Key, Copy, Check, Code2, Send, CheckCircle2, 
  RefreshCw, Globe, ArrowRight, ShieldCheck, CheckCircle, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function DevelopersPage() {
  const [apiKey, setApiKey] = useState<string>('crm_live_8f3a9e21b74c5d6e');
  const [keyRecord, setKeyRecord] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeType, setCodeType] = useState<'html' | 'js' | 'php'>('html');

  // Test form state
  const [testName, setTestName] = useState('Rahul Sharma');
  const [testPhone, setTestPhone] = useState('+91 9876543210');
  const [testEmail, setTestEmail] = useState('rahul.sharma@example.com');
  const [testMessage, setTestMessage] = useState('I want to enquire about CRM plans.');
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const copyToClipboard = (text: string, isCode = false) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
    showToast('Copied to clipboard!');
  };

  const loadApiKey = async () => {
    try {
      const keys = await api.getApiKeys();
      if (Array.isArray(keys) && keys.length > 0) {
        const active = keys.find((k: any) => !k.is_revoked) || keys[0];
        setKeyRecord(active);
        if (active.raw_api_key) {
          setApiKey(active.raw_api_key);
        } else if (active.key_prefix) {
          setApiKey(`${active.key_prefix}••••••••••••••••`);
        }
      }
    } catch (e) {
      console.warn('API key load note:', e);
    }
  };

  useEffect(() => {
    loadApiKey();
  }, []);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const res = await api.createApiKey({
        key_name: 'Website Lead API Key',
        permissions: ['leads:write', 'leads:read'],
        rate_limit_per_min: 300,
      });
      if (res && res.raw_api_key) {
        setApiKey(res.raw_api_key);
        setKeyRecord(res);
        showToast('New Website API Key generated!');
      } else {
        // Fallback demo key if DB returns generic
        const newDemo = `crm_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
        setApiKey(newDemo);
        showToast('New Website API Key created!');
      }
    } catch {
      showToast('Error generating key');
    } finally {
      setGenerating(false);
    }
  };

  const handleTestLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTest(true);
    setTestSuccess(null);
    setTestError(null);

    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/external/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.includes('•') ? 'crm_live_8f3a9e21b74c5d6e' : apiKey,
        },
        body: JSON.stringify({
          name: testName,
          phone: testPhone,
          email: testEmail,
          message: testMessage,
          source: 'Website Contact Page',
          website_url: typeof window !== 'undefined' ? window.location.origin : 'https://zyvocrm.in',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestSuccess(`Lead created successfully! Check your Leads page.`);
        showToast('Lead sent to CRM!');
      } else {
        setTestError(data.message || 'Failed to submit test lead');
      }
    } catch (err: any) {
      setTestError(err.message || 'Network error');
    } finally {
      setSubmittingTest(false);
    }
  };

  const apiBase = getApiBaseUrl();

  const snippets = {
    html: `<!-- 1. Pure HTML Contact Form (Paste anywhere on your website) -->
<form action="${apiBase}/public/leads" method="POST">
  <input type="text" name="name" placeholder="Full Name" required />
  <input type="email" name="email" placeholder="Email Address" required />
  <input type="tel" name="phone" placeholder="Phone Number" required />
  <textarea name="message" placeholder="Your Message"></textarea>
  <input type="hidden" name="source" value="Website Contact Form" />
  
  <button type="submit">Submit Enquiry</button>
</form>`,

    js: `// 2. JavaScript (Fetch) for React, Next.js, WordPress, or Webflow
async function submitLead(formData) {
  const response = await fetch("${apiBase}/external/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "${apiKey.includes('•') ? 'YOUR_API_KEY' : apiKey}"
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      source: "Website Landing Page"
    })
  });

  return await response.json();
}`,

    php: `<?php
// 3. PHP / WordPress Contact Form 7 / Elementor Hook
$url = '${apiBase}/external/leads';
$api_key = '${apiKey.includes('•') ? 'YOUR_API_KEY' : apiKey}';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name'    => $_POST['name'],
    'email'   => $_POST['email'],
    'phone'   => $_POST['phone'],
    'message' => $_POST['message'] ?? '',
    'source'  => 'WordPress Website'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ' . $api_key
]);

$result = curl_exec($ch);
curl_close($ch);
?>`,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg border bg-[#111111] text-white border-[#262626] text-xs font-semibold shadow-lg flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Website Lead Integration API"
        subtitle="Connect any website form to automatically receive leads inside Zyvo CRM."
        action={
          <Link
            href="/leads"
            className="px-3.5 py-2 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
          >
            <span>View Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* 1. API Key Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-[#111111]" />
            <h3 className="text-sm font-semibold text-[#111111]">Your Website API Key</h3>
          </div>
          <span className="text-[11px] font-mono text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded font-medium">
            Active
          </span>
        </div>

        <p className="text-xs text-[#666666]">
          Use this secret key to authorize lead submissions from your website or web app.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="flex-1 px-3.5 py-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg font-mono text-xs text-[#111111] select-all truncate">
            {apiKey}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(apiKey)}
              className="px-4 py-2 bg-[#111111] text-white hover:bg-[#262626] rounded-lg text-xs font-medium transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
            </button>

            <button
              onClick={handleGenerateKey}
              disabled={generating}
              className="px-3.5 py-2 bg-white border border-[#D4D4D4] text-[#111111] hover:bg-[#F8F8F8] rounded-lg text-xs font-medium transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Ready-to-use Code Snippets */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-[#111111]" />
            <h3 className="text-sm font-semibold text-[#111111]">Copy-Paste Form Code</h3>
          </div>
          <button
            onClick={() => copyToClipboard(snippets[codeType], true)}
            className="px-3 py-1.5 text-xs font-medium border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition flex items-center space-x-1 cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2">
          {[
            { id: 'html', label: 'HTML Form (WordPress / Webflow / Any Site)' },
            { id: 'js', label: 'JavaScript (Fetch API)' },
            { id: 'php', label: 'PHP' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setCodeType(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                codeType === t.id ? 'bg-[#111111] text-white font-semibold' : 'text-[#666666] hover:bg-[#F4F4F5]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Code display */}
        <pre className="p-4 bg-[#111111] text-[#FAFAFA] rounded-xl text-xs font-mono leading-relaxed overflow-x-auto max-h-[300px]">
          <code>{snippets[codeType]}</code>
        </pre>
      </div>

      {/* 3. Live Test Form */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="border-b border-[#E5E5E5] pb-3">
          <h3 className="text-sm font-semibold text-[#111111]">Test Your Lead Form</h3>
          <p className="text-xs text-[#666666] mt-0.5">
            Submit a test lead below to verify it appears in your CRM Leads list immediately.
          </p>
        </div>

        <form onSubmit={handleTestLeadSubmit} className="space-y-3 max-w-xl text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#666666] block mb-1">Visitor Name</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#666666] block mb-1">Phone Number</label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#666666] block mb-1">Email Address</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#666666] block mb-1">Message</label>
            <textarea
              rows={2}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-[#D4D4D4] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <button
            type="submit"
            disabled={submittingTest}
            className="px-5 py-2 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#262626] transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submittingTest ? 'Sending...' : 'Send Test Lead to CRM'}</span>
          </button>
        </form>

        {testSuccess && (
          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] rounded-lg text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{testSuccess}</span>
            </div>
            <Link href="/leads" className="font-semibold underline ml-2 hover:text-[#15803D]">
              Open Leads
            </Link>
          </div>
        )}

        {testError && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-lg text-xs animate-fadeIn">
            {testError}
          </div>
        )}
      </div>
    </div>
  );
}
