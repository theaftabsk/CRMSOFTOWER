'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, RefreshCw, ArrowLeft, Copy, Check, 
  Zap, Save, ExternalLink, CheckCircle2, AlertCircle,
  Unlink, ArrowRight, Settings2, Sparkles, Building2,
  Layers, CheckCircle, Radio, X, ChevronDown, CheckCheck
} from 'lucide-react';
import { api } from '@/lib/api';

export default function MetaSettingsPage() {
  const [connection, setConnection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isSimulatingLead, setIsSimulatingLead] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<any>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Asset Selection Wizard Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<{
    businesses?: any[];
    adAccounts: any[];
    pages: any[];
    instagramAccounts: any[];
  }>({ businesses: [], adAccounts: [], pages: [], instagramAccounts: [] });

  const [selectedAssetForm, setSelectedAssetForm] = useState({
    business_name: '',
    ad_account_id: '',
    ad_account_name: '',
    page_id: '',
    page_name: '',
    instagram_username: '',
  });

  const [automationRules, setAutomationRules] = useState({
    auto_sync: true,
    auto_whatsapp: true,
  });

  const loadData = async () => {
    try {
      const connData = await api.getMetaConnection();
      if (connData) {
        setConnection(connData);
        if (connData.config) {
          setAutomationRules({
            auto_sync: connData.config.auto_sync !== false,
            auto_whatsapp: connData.config.auto_whatsapp !== false,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load Meta connection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  useEffect(() => {
    loadData();

    // Handle Meta OAuth redirect callback params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        showToast('error', errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : 'Meta authorization was cancelled or denied.');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (code) {
        window.history.replaceState({}, document.title, window.location.pathname);
        showToast('success', 'Exchanging token with Meta and connecting assets...');
        api.handleMetaOAuthCallback(code).then((res: any) => {
          if (res?.success) {
            showToast('success', '🎉 Meta account & assets connected seamlessly via Facebook Login!');
            loadData();
          } else {
            handleOpenConnectModal();
          }
        });
      }
    }
  }, []);

  // Real Facebook OAuth 2.0 Login Redirect
  const handleFacebookOAuthLogin = async () => {
    try {
      const redirectUri = typeof window !== 'undefined'
        ? `${window.location.origin}/meta-ads/settings?oauth=callback`
        : undefined;
      const res = await api.getMetaOAuthUrl(redirectUri);
      if (res?.url) {
        window.location.href = res.url;
      } else {
        handleOpenConnectModal();
      }
    } catch (e) {
      console.error('Failed to get OAuth URL:', e);
      handleOpenConnectModal();
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(key);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  // Step 1: Open Connect Meta Dialog & Fetch Available Assets
  const handleOpenConnectModal = async () => {
    setIsLoadingAssets(true);
    setIsAssetModalOpen(true);
    try {
      const assets = await api.getMetaAssets();
      setAvailableAssets(assets);

      // Pre-select first discovered assets if available
      const firstBiz = assets?.businesses?.[0];
      const firstAdAcc = assets?.adAccounts?.[0];
      const firstPage = assets?.pages?.[0];
      const firstIg = assets?.instagramAccounts?.[0];

      setSelectedAssetForm({
        business_name: firstBiz?.name || 'Meta Business Portfolio',
        ad_account_id: firstAdAcc?.id || '',
        ad_account_name: firstAdAcc?.name || '',
        page_id: firstPage?.id || '',
        page_name: firstPage?.name || '',
        instagram_username: firstIg?.username || '',
      });
    } catch (err) {
      console.error('Failed to fetch Meta assets:', err);
      showToast('error', 'Failed to fetch Meta assets.');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Step 2: Confirm & Save Selected Meta Assets
  const handleSaveAssets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForm.ad_account_id || !selectedAssetForm.page_id) {
      showToast('error', 'Please select both an Ad Account and a Facebook Page.');
      return;
    }

    try {
      const res = await api.selectMetaAssets(selectedAssetForm);
      if (res?.success) {
        setIsAssetModalOpen(false);
        showToast('success', 'Meta account & assets connected successfully!');
        await loadData();
      } else {
        showToast('error', res?.message || 'Failed to save Meta connection.');
      }
    } catch (err) {
      console.error('Failed to save Meta assets:', err);
      showToast('error', 'Failed to connect Meta assets.');
    }
  };

  // Disconnect Meta
  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Meta Ads Center? Lead ingestion and sync will be paused.')) {
      return;
    }
    setIsDisconnecting(true);
    try {
      await api.disconnectMeta();
      showToast('success', 'Meta Ads Center disconnected successfully.');
      await loadData();
    } catch (err) {
      console.error('Disconnect error:', err);
      showToast('error', 'Failed to disconnect Meta.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Test Webhook Handshake
  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const res = await api.testWebhookHandshake();
      setWebhookTestResult(res);
      if (res?.verified) {
        showToast('success', `Webhook Handshake Verified (${res.latency_ms}ms)`);
      }
    } catch (err) {
      console.error('Webhook test error:', err);
      showToast('error', 'Webhook handshake failed.');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Simulate a live lead ingestion
  const handleSimulateLead = async () => {
    setIsSimulatingLead(true);
    setSimulatedResult(null);
    try {
      const res = await api.simulateMetaLead();
      setSimulatedResult(res);
      showToast('success', `Live Lead Ingested: ${res?.leadName || 'Lead'} (Assigned to ${res?.assignedTo})`);
    } catch (err) {
      console.error('Failed to simulate lead:', err);
      showToast('error', 'Lead simulation failed.');
    } finally {
      setIsSimulatingLead(false);
    }
  };

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.hostname}:4000/api/v1/meta/webhook`
    : 'http://localhost:4000/api/v1/meta/webhook';

  const isConnected = connection?.isConnected ?? false;
  const config = connection?.config || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <Link 
              href="/meta-ads"
              className="p-1.5 rounded-lg border border-[#E5E5E5] text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Meta Connect & Webhook Configuration
            </h1>
            {isConnected ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                Disconnected
              </span>
            )}
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Connect your Meta Business assets to manage supported advertising operations and automatically receive Lead Ads leads inside your CRM.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Meta App Setup Guide
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Status
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
          notification.type === 'success' 
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900' 
            : 'border-rose-200 bg-rose-50 text-rose-900'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Connection Status Card */}
      {!isConnected ? (
        /* DISCONNECTED STATE HERO CARD */
        <div className="p-8 rounded-xl bg-white border border-[#E5E5E5] shadow-xs text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1877F2] text-white font-bold text-2xl shadow-xs">
                f
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">
                  Connect Your Meta Business & Advertising Assets
                </h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                  Link your Meta Business Suite, Facebook Pages, Instagram Accounts, and Ad Accounts. Once connected, leads submitted on Facebook & Instagram Lead Ads will automatically flow into your CRM pipeline in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-[#555555]">
                <div className="flex items-center space-x-2">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time Lead Ads Webhook synchronization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Smart deduplication on Phone & Email</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Persistent round-robin sales rep routing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>True closed-won deal ROAS attribution</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center sm:items-end justify-center pt-2 space-y-2.5">
              <button
                onClick={handleFacebookOAuthLogin}
                className="px-6 py-3 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm"
              >
                <div className="w-4 h-4 rounded-full bg-white text-[#1877F2] flex items-center justify-center font-bold text-xs">
                  f
                </div>
                <span>Continue with Facebook Login</span>
              </button>

              <button
                onClick={handleOpenConnectModal}
                className="text-[11px] text-[#666666] hover:text-[#111111] hover:underline transition"
              >
                Or select assets manually
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CONNECTED STATE ASSET OVERVIEW CARD */
        <div className="p-6 rounded-xl bg-white border border-[#E5E5E5] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-xl">
                f
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#111111]">
                    Meta Business Integration Active
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
                    Live Sync Active
                  </span>
                </div>
                <p className="text-xs text-[#666666] mt-0.5">
                  Connected to <span className="font-semibold text-[#111111]">{config.page_name || 'Facebook Page'}</span> and Ad Account <span className="font-mono text-[#111111]">{config.ad_account_id}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleOpenConnectModal}
                className="px-3.5 py-1.5 rounded-lg border border-[#D4D4D4] bg-white hover:bg-[#F8F8F8] text-[#111111] text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Assets</span>
              </button>

              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect'}</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5E5]">
            <h4 className="text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-3">
              Connected Assets Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5]">
                <div className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Business Manager</div>
                <div className="text-xs font-bold text-[#111111] mt-1">{config.business_name || 'Meta Business Suite'}</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
                  <Check className="w-3 h-3 mr-1" /> Authorized
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5]">
                <div className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Ad Account ID</div>
                <div className="text-xs font-bold font-mono text-[#111111] mt-1">{config.ad_account_id}</div>
                <div className="text-[11px] text-[#666666] mt-1 truncate">{config.ad_account_name || 'Primary Ad Account'}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5]">
                <div className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Facebook Page</div>
                <div className="text-xs font-bold text-[#111111] mt-1">{config.page_name}</div>
                <div className="text-[11px] text-[#666666] font-mono mt-1">ID: {config.page_id}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5]">
                <div className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Instagram & Webhook</div>
                <div className="text-xs font-bold text-[#111111] mt-1">{config.instagram_username || 'Not Linked'}</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
                  Webhook Active
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Automations + Webhook Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Automation Rules & Developer Sandbox */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-5 rounded-xl bg-white border border-[#E5E5E5]">
            <h3 className="text-sm font-semibold text-[#111111] mb-1">Lead Automation & Ingestion Rules</h3>
            <p className="text-xs text-[#666666] mb-5">
              Automated workflows executed immediately when a customer submits a Meta Instant Lead Form.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#111111]">Real-time Webhook Ingestion</div>
                  <div className="text-[11px] text-[#666666]">
                    Instantly capture new lead entries via Meta Webhooks with 0-second latency.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={automationRules.auto_sync}
                  onChange={(e) => setAutomationRules({ ...automationRules, auto_sync: e.target.checked })}
                  className="w-4 h-4 accent-[#111111]"
                />
              </div>

              <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#111111]">Smart Lead Deduplication</div>
                  <div className="text-[11px] text-[#666666]">
                    Cross-references Phone Number & Email. Updates existing CRM lead instead of duplicating.
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Always Active
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#111111]">Round-Robin Sales Rep Assignment</div>
                  <div className="text-[11px] text-[#666666]">
                    Rotates incoming Meta leads evenly across active team members using database-safe rotation.
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#111111] bg-[#F8F8F8] px-2 py-1 rounded border border-[#E5E5E5]">
                  Active Team Members
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#111111]">Instant WhatsApp Confirmation</div>
                  <div className="text-[11px] text-[#666666]">
                    Sends automated WhatsApp template notification to lead immediately upon form submit.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={automationRules.auto_whatsapp}
                  onChange={(e) => setAutomationRules({ ...automationRules, auto_whatsapp: e.target.checked })}
                  className="w-4 h-4 accent-[#111111]"
                />
              </div>
            </div>
          </div>

          {/* Sandbox & Developer Lead Simulator Box */}
          <div className="p-5 rounded-xl bg-white border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-[#111111]">Developer Sandbox & Live Ingestion Test</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 uppercase tracking-wider">
                DEVELOPMENT / TEST MODE
              </span>
            </div>
            <p className="text-xs text-[#666666] mb-4">
              Test your full pipeline right now: click below to simulate an incoming Meta lead. The system checks deduplication, assigns via round-robin, saves to PostgreSQL, and logs activity.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleSimulateLead}
                disabled={isSimulatingLead}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold transition flex items-center justify-center space-x-2"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-300 ${isSimulatingLead ? 'animate-spin' : ''}`} />
                <span>{isSimulatingLead ? 'Ingesting Simulated Lead...' : '⚡ Test & Ingest Sample Lead'}</span>
              </button>

              <Link
                href="/meta-ads/leads"
                className="w-full sm:w-auto px-3.5 py-2 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] text-[#111111] text-xs font-medium transition text-center flex items-center justify-center space-x-1"
              >
                <span>View Ingested Leads Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Simulation Result Box */}
            {simulatedResult && (
              <div className="mt-4 p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-950 text-xs animate-fadeIn">
                <div className="font-semibold flex items-center space-x-1.5 mb-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Lead Pipeline Ingestion Verified Successfully!</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono mt-2 pt-2 border-t border-emerald-200">
                  <div>
                    <span className="text-emerald-700 block">Lead Name</span>
                    <span className="font-bold">{simulatedResult.leadName}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Lead ID</span>
                    <span className="truncate block">{simulatedResult.leadId}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Assigned To</span>
                    <span className="font-bold">{simulatedResult.assignedTo}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Status</span>
                    <span className="font-bold">{simulatedResult.action}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Webhook Setup Box */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white border border-[#E5E5E5]">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Meta Webhook Settings
              </h4>
            </div>
            <p className="text-xs text-[#666666] mb-4">
              Enter these into your Meta App Dashboard under <strong>Webhooks → Page → leadgen</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-[#666666] block mb-1">Callback URL</span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] text-[#111111] select-all"
                  />
                  <button
                    onClick={() => handleCopy(webhookUrl, 'url')}
                    className="p-1.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] text-[#666666] transition"
                    title="Copy URL"
                  >
                    {copySuccess === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#666666] block mb-1">Verify Token</span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    readOnly
                    value="zyvo_meta_verify_2026"
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] text-[#111111] select-all"
                  />
                  <button
                    onClick={() => handleCopy('zyvo_meta_verify_2026', 'token')}
                    className="p-1.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] text-[#666666] transition"
                    title="Copy Token"
                  >
                    {copySuccess === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E5E5E5] space-y-3">
              <button
                onClick={handleTestWebhook}
                disabled={isTestingWebhook}
                className="w-full py-2 px-3 rounded-lg border border-[#D4D4D4] bg-white hover:bg-[#F8F8F8] text-[#111111] text-xs font-semibold transition flex items-center justify-center space-x-1.5"
              >
                <Radio className={`w-3.5 h-3.5 text-emerald-600 ${isTestingWebhook ? 'animate-pulse' : ''}`} />
                <span>{isTestingWebhook ? 'Testing Handshake...' : '⚡ Test Webhook Handshake'}</span>
              </button>

              {webhookTestResult && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                  <div className="font-semibold flex items-center justify-between">
                    <span>Handshake Verified</span>
                    <span className="font-mono">{webhookTestResult.latency_ms}ms</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5 truncate">
                    Target: {webhookTestResult.webhook_url}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Sub-Navigation */}
          <div className="p-4 rounded-xl bg-white border border-[#E5E5E5]">
            <h5 className="text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-2">
              Meta Ads Center Navigation
            </h5>
            <div className="space-y-1 text-xs">
              <Link
                href="/meta-ads"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F8F8] text-[#111111] transition"
              >
                <span>Overview & ROI Funnel</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#999999]" />
              </Link>
              <Link
                href="/meta-ads/campaigns"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F8F8] text-[#111111] transition"
              >
                <span>Campaigns Manager</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#999999]" />
              </Link>
              <Link
                href="/meta-ads/forms"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F8F8] text-[#111111] transition"
              >
                <span>Instant Lead Forms</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#999999]" />
              </Link>
              <Link
                href="/meta-ads/leads"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F8F8] text-[#111111] transition"
              >
                <span>Ingested Leads Log</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#999999]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ASSET SELECTION WIZARD MODAL */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-xl border border-[#E5E5E5] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
                  f
                </div>
                <h3 className="text-sm font-bold text-[#111111]">
                  Select Meta Assets to Connect
                </h3>
              </div>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="p-1 rounded-md text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingAssets ? (
              <div className="py-8 text-center text-xs text-[#666666] flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#111111]" />
                <span>Fetching accessible Meta Business assets...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveAssets} className="space-y-4 text-xs">
                {availableAssets.businesses && availableAssets.businesses.length > 0 && (
                  <div>
                    <label className="font-semibold text-[#111111] block mb-1">
                      Meta Business Portfolio
                    </label>
                    <select
                      value={selectedAssetForm.business_name}
                      onChange={(e) => setSelectedAssetForm({ ...selectedAssetForm, business_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                    >
                      {availableAssets.businesses.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} (ID: {b.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#111111] block">
                      Ad Account
                    </label>
                    <span className="text-[10px] text-[#888888]">
                      {availableAssets.adAccounts.length > 0 ? 'Select from list or type' : 'Enter Ad Account ID'}
                    </span>
                  </div>

                  {availableAssets.adAccounts.length > 0 ? (
                    <select
                      value={selectedAssetForm.ad_account_id}
                      onChange={(e) => {
                        const selected = availableAssets.adAccounts.find((a) => a.id === e.target.value);
                        setSelectedAssetForm({
                          ...selectedAssetForm,
                          ad_account_id: e.target.value,
                          ad_account_name: selected?.name || e.target.value,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                      required
                    >
                      <option value="" disabled>-- Select Ad Account --</option>
                      {availableAssets.adAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.id}) [{acc.currency}]
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. act_123456789 or Primary Ad Account"
                      value={selectedAssetForm.ad_account_id}
                      onChange={(e) => setSelectedAssetForm({
                        ...selectedAssetForm,
                        ad_account_id: e.target.value,
                        ad_account_name: selectedAssetForm.ad_account_name || e.target.value,
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#111111] block">
                      Facebook Page
                    </label>
                    <span className="text-[10px] text-[#888888]">
                      {availableAssets.pages.length > 0 ? 'Select from list or type' : 'Enter Page Name or ID'}
                    </span>
                  </div>

                  {availableAssets.pages.length > 0 ? (
                    <select
                      value={selectedAssetForm.page_id}
                      onChange={(e) => {
                        const selected = availableAssets.pages.find((p) => p.id === e.target.value);
                        setSelectedAssetForm({
                          ...selectedAssetForm,
                          page_id: e.target.value,
                          page_name: selected?.name || e.target.value,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                      required
                    >
                      <option value="" disabled>-- Select Facebook Page --</option>
                      {availableAssets.pages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (ID: {p.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. My Business Official Page"
                      value={selectedAssetForm.page_name}
                      onChange={(e) => setSelectedAssetForm({
                        ...selectedAssetForm,
                        page_name: e.target.value,
                        page_id: selectedAssetForm.page_id || `page_${Date.now()}`,
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  )}
                </div>

                <div>
                  <label className="font-semibold text-[#111111] block mb-1">
                    Linked Instagram Account (Optional)
                  </label>
                  <select
                    value={selectedAssetForm.instagram_username}
                    onChange={(e) => setSelectedAssetForm({ ...selectedAssetForm, instagram_username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="">None / Not Linked</option>
                    {availableAssets.instagramAccounts.map((ig) => (
                      <option key={ig.id} value={ig.username}>
                        {ig.username} ({ig.page_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAssetModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] text-[#111111] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#262626] text-white font-semibold flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Connect Meta Assets</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* META DEVELOPER SETUP GUIDE MODAL */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-xl border border-[#E5E5E5] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-[#111111]">
                  Official Meta Developer App Setup Guide
                </h3>
              </div>
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="p-1 rounded-md text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#444444]">
              <div className="p-3.5 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5] space-y-1.5">
                <div className="font-bold text-[#111111]">Step 1: Register as Meta Developer & Create App</div>
                <p>
                  Visit <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">developers.facebook.com</a>. Click <strong>Create App</strong> and choose <strong>Other ➔ Business</strong> as your app type.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5] space-y-2">
                <div className="font-bold text-[#111111]">Step 2: Add Webhooks & Marketing API Products</div>
                <p>In your App Dashboard, add the following products:</p>
                <ul className="list-disc list-inside space-y-1 text-[#666666]">
                  <li><strong>Webhooks:</strong> Select <code>Page</code> from dropdown and subscribe to the <code>leadgen</code> field.</li>
                  <li><strong>Marketing API / Facebook Login for Business:</strong> Used for managing campaigns and reading lead forms.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5] space-y-2">
                <div className="font-bold text-[#111111]">Step 3: Webhook Endpoint Configuration</div>
                <div>
                  <span className="font-semibold text-[#111111] block mb-0.5">Callback URL:</span>
                  <div className="p-2 rounded bg-white border border-[#E5E5E5] font-mono text-[11px] text-[#111111]">
                    {webhookUrl}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-[#111111] block mb-0.5">Verify Token:</span>
                  <div className="p-2 rounded bg-white border border-[#E5E5E5] font-mono text-[11px] text-[#111111]">
                    zyvo_meta_verify_2026
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5] space-y-1.5">
                <div className="font-bold text-[#111111]">Step 4: Required Scopes & Permissions</div>
                <p className="font-mono text-[11px] text-[#111111]">
                  leads_retrieval, pages_manage_ads, pages_read_engagement, ads_management, ads_read, business_management
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] flex justify-end">
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#111111] text-white font-semibold text-xs hover:bg-[#262626]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
