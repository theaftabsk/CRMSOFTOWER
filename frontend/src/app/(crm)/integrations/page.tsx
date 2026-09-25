'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Video, Calendar, CheckCircle2, AlertCircle, 
  ExternalLink, RefreshCw, Key, ShieldCheck, 
  Copy, Check, Plus, Terminal, Activity, ArrowUpRight, X,
  Lock, Globe, Link2, Info, User, CheckCircle, List, Search
} from 'lucide-react';
import { api } from '@/lib/api';
import { GoogleMeetCard, MeetingItem } from '@/components/GoogleMeetCard';
import { GoogleMeetModal } from '@/components/GoogleMeetModal';
import { CreateGoogleMeetModal } from '@/components/CreateGoogleMeetModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface AppItem {
  app_id: string;
  name: string;
  category: 'CALENDAR';
  description: string;
  icon: string;
  badge: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  health_status: 'HEALTHY' | 'ERROR' | 'UNCONFIGURED' | 'READY';
  account_identifier?: string | null;
  account_name?: string | null;
  avatar_url?: string | null;
  config: Record<string, any>;
  last_tested_at?: string | null;
  error_message?: string | null;
  connected: boolean;
}

export default function IntegrationsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [meetingCount, setMeetingCount] = useState<number>(0);
  const [meetingSearch, setMeetingSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Disconnect Confirmation State
  const [disconnectTarget, setDisconnectTarget] = useState<'google' | 'zoom' | null>(null);

  // Modal Dialog States
  const [isMeetsModalOpen, setIsMeetsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Modal Configuration State
  const [activeModalApp, setActiveModalApp] = useState<AppItem | null>(null);
  const [testingAppId, setTestingAppId] = useState<string | null>(null);
  const [connectingOAuth, setConnectingOAuth] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [appsRes, meetingsRes] = await Promise.allSettled([
        api.get('/integrations'),
        api.get('/integrations/google-meet/meetings'),
      ]);

      if (appsRes.status === 'fulfilled') {
        const raw = appsRes.value;
        const appsList: AppItem[] = Array.isArray(raw) ? raw : (raw?.data || []);
        
        // Filter strictly to Google Meet & Zoom only
        const videoApps = appsList
          .filter((a) => a.app_id === 'google_calendar' || a.app_id === 'zoom')
          .map((app) => {
            if (app.app_id === 'google_calendar' && app.connected) {
              return {
                ...app,
                account_identifier: app.account_identifier || 'aftabsk741156@gmail.com',
                account_name: app.account_name || 'A gameing Tech',
                avatar_url: app.avatar_url || 'https://lh3.googleusercontent.com/a/ACg8ocIpyV898mMl23VjWABjMSijjZgooRYKiqicQ5I1EZCE_-XMKQ=s96-c',
              };
            }
            if (app.app_id === 'zoom') {
              return {
                ...app,
                config: {
                  client_id: 'z0VW6KC1SrYapvu5Ibpzw',
                  client_secret: 'DyxVeH3NMnEcvHNWELq2MS1socQr2tD0',
                  redirect_uri: 'http://localhost:3000/integrations/zoom/callback',
                  allow_list: 'http://localhost:3000',
                  ...app.config,
                },
              };
            }
            return app;
          });

        setApps(videoApps);
      }

      if (meetingsRes.status === 'fulfilled') {
        const rawMeetings = meetingsRes.value;
        const list: MeetingItem[] = Array.isArray(rawMeetings) ? rawMeetings : (rawMeetings?.data || []);
        setMeetings(list);
        setMeetingCount(list.length);
      }
    } catch (err) {
      console.error('Failed to load integrations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await api.delete(`/integrations/google-meet/meetings/${id}`);
      showToast('Meeting record removed');
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      setMeetingCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      showToast(err.message || 'Failed to remove meeting', 'error');
    }
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
    showToast('Copied to clipboard!');
  };

  // Google OAuth Flow
  const handleConnectGoogle = async () => {
    try {
      setConnectingOAuth(true);
      const res = await api.get('/integrations/google-meet/auth-url');
      const url = res?.oauthUrl || res?.data?.oauthUrl;
      if (url) {
        showToast('Opening Google Cloud OAuth 2.0 authorization screen...', 'info');
        window.location.href = url;
      } else {
        showToast('Google OAuth Client ID not configured in backend/.env', 'error');
        setConnectingOAuth(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Could not initiate Google OAuth flow.', 'error');
      setConnectingOAuth(false);
    }
  };

  const handleDisconnectGoogle = () => {
    setDisconnectTarget('google');
  };

  const executeDisconnectGoogle = async () => {
    try {
      await api.delete('/integrations/google-meet/disconnect');
      showToast('Google Workspace disconnected successfully.');
      await loadAllData();
      if (activeModalApp?.app_id === 'google_calendar') {
        setActiveModalApp(null);
      }
    } catch (err: any) {
      showToast(`Disconnect failed: ${err.message}`, 'error');
    } finally {
      setDisconnectTarget(null);
    }
  };

  const handleConnectZoom = async () => {
    try {
      setConnectingOAuth(true);
      const res = await api.get('/integrations/zoom/auth-url');
      const authUrl = res?.data?.url || res?.url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        showToast('Could not retrieve Zoom OAuth authorization URL.', 'error');
        setConnectingOAuth(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Could not initiate Zoom OAuth flow.', 'error');
      setConnectingOAuth(false);
    }
  };

  const handleDisconnectZoom = () => {
    setDisconnectTarget('zoom');
  };

  const executeDisconnectZoom = async () => {
    try {
      await api.delete('/integrations/zoom/disconnect');
      showToast('Zoom disconnected successfully.');
      await loadAllData();
      if (activeModalApp?.app_id === 'zoom') {
        setActiveModalApp(null);
      }
    } catch (err: any) {
      showToast(`Disconnect failed: ${err.message}`, 'error');
    } finally {
      setDisconnectTarget(null);
    }
  };

  // Health Ping Test
  const handleTestHealth = async (appId: string) => {
    try {
      setTestingAppId(appId);
      const endpoint = appId === 'google_calendar' ? '/integrations/google-meet/test' : `/integrations/${appId}/test`;
      const res = await api.post(endpoint, {});
      const data = res?.data || res;
      if (data?.success) {
        showToast(data.message || 'Integration verified operational (200 OK)');
      } else {
        showToast(data?.message || 'Handshake returned status note', 'info');
      }
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Health check handshake error', 'error');
    } finally {
      setTestingAppId(null);
    }
  };



  const renderAppIcon = (appId: string) => {
    if (appId === 'google_calendar') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#FFFFFF"/>
          <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z" fill="#00832D"/>
          <path d="M17 10.5L21 6.5V17.5L17 13.5V10.5Z" fill="#0066DA"/>
          <path d="M16 6H12V18H16C16.55 18 17 17.55 17 17V7C17 6.45 16.55 6 16 6Z" fill="#2684FC"/>
          <path d="M7 6H4C3.45 6 3 6.45 3 7V11H7V6Z" fill="#EA4335"/>
          <path d="M3 11H7V18H4C3.45 18 3 17.55 3 17V11Z" fill="#FBBC04"/>
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M4.5 7.5C4.5 6.67157 5.17157 6 6 6H13.5C14.3284 6 15 6.67157 15 7.5V16.5C15 17.3284 14.3284 18 13.5 18H6C5.17157 18 4.5 17.3284 4.5 16.5V7.5Z" fill="#2D8CFF"/>
        <path d="M16.5 9.75L19.5 7.5V16.5L16.5 14.25V9.75Z" fill="#2D8CFF"/>
      </svg>
    );
  };

  const filteredMeetings = meetings.filter((m) => {
    const q = meetingSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      (m.google_space_name && m.google_space_name.toLowerCase().includes(q)) ||
      (m.contact_email && m.contact_email.toLowerCase().includes(q)) ||
      (m.lead?.name && m.lead.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fadeIn pb-24 text-[#111111]">
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Video &amp; Calendar Integrations
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-mono font-semibold bg-[#F4F4F5] text-[#111111] rounded-md border border-[#E5E5E5]">
              Google Meet &amp; Zoom
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
            Manage your official Google Workspace and Zoom Video Conferencing connections.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition shadow-sm cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>+ Create Meet</span>
          </button>
          <button
            onClick={() => setIsMeetsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition cursor-pointer"
          >
            <List className="w-3.5 h-3.5 text-[#666666]" />
            <span>Scheduled Meets ({meetings.length})</span>
          </button>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2 COMPACT APP CARDS (Side-by-Side Clean Grid)                   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app) => {
          const isGoogle = app.app_id === 'google_calendar';
          const isConnected = app.connected;

          return (
            <div 
              key={app.app_id}
              className={`p-5 bg-white border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all hover:border-[#D4D4D4] ${
                isGoogle 
                  ? 'border-[#111111] ring-1 ring-[#111111]/10' 
                  : isConnected 
                  ? 'border-[#BBF7D0]' 
                  : 'border-[#E5E5E5]'
              }`}
            >
              <div>
                {/* Header: Icon + Title + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
                      {renderAppIcon(app.app_id)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-sm font-bold text-[#111111] tracking-tight">
                          {app.name}
                        </h2>
                        {isGoogle && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold bg-[#111111] text-white rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <span className="inline-block text-[10px] font-mono text-[#666666]">
                        {app.badge}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#16A34A] animate-pulse' : 'bg-[#999999]'}`} />
                    <span className="text-[11px] font-semibold text-[#111111]">
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>

                {/* Compact Description */}
                <p className="text-xs text-[#666666] mt-2 leading-relaxed line-clamp-2">
                  {app.description}
                </p>

                {/* Account Details Pill */}
                <div className="mt-3 pt-2.5 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
                  {isConnected ? (
                    <div className="flex items-center space-x-2">
                      {isGoogle && app.avatar_url ? (
                        <img 
                          src={app.avatar_url} 
                          alt="Account"
                          className="w-4 h-4 rounded-full object-cover border border-[#E5E5E5]"
                        />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                      )}
                      <span className="font-mono text-[11px] font-semibold text-[#111111] truncate max-w-[180px]">
                        {app.account_identifier || 'Connected Account'}
                      </span>
                      {isGoogle && (
                        <span className="text-[9px] font-medium bg-[#DCFCE7] text-[#16A34A] px-1 py-0.2 rounded border border-[#BBF7D0]">
                          Verified
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#888888]">
                      {isGoogle ? 'Ready for Google OAuth 2.0' : 'Client ID: z0VW6KC1SrYapvu5...'}
                    </span>
                  )}

                  {isGoogle && (
                    <span className="text-[10px] font-mono text-[#666666]">
                      Meet v2 API
                    </span>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  {isGoogle ? (
                    isConnected ? (
                      <>
                        <button
                          onClick={() => handleTestHealth(app.app_id)}
                          disabled={testingAppId === app.app_id}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                        >
                          <Activity className={`w-3 h-3 ${testingAppId === app.app_id ? 'animate-spin text-[#F59E0B]' : 'text-[#666666]'}`} />
                          <span>{testingAppId === app.app_id ? 'Checking...' : 'Ping'}</span>
                        </button>
                        <button
                          onClick={handleDisconnectGoogle}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] rounded-lg transition cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleConnectGoogle}
                        disabled={connectingOAuth}
                        className="px-3 py-1 text-[11px] font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{connectingOAuth ? 'Connecting...' : 'Connect'}</span>
                      </button>
                    )
                  ) : (
                    isConnected ? (
                      <>
                        <button
                          onClick={() => handleTestHealth(app.app_id)}
                          disabled={testingAppId === app.app_id}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                        >
                          <Activity className={`w-3 h-3 ${testingAppId === app.app_id ? 'animate-spin text-[#F59E0B]' : 'text-[#666666]'}`} />
                          <span>{testingAppId === app.app_id ? 'Checking...' : 'Ping'}</span>
                        </button>
                        <button
                          onClick={handleDisconnectZoom}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] rounded-lg transition cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleConnectZoom}
                        disabled={connectingOAuth}
                        className="px-3 py-1 text-[11px] font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Video className="w-3 h-3 text-[#2D8CFF]" />
                        <span>{connectingOAuth ? 'Connecting...' : 'Connect'}</span>
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  {isGoogle && isConnected && (
                    <>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition flex items-center space-x-1 shadow-xs cursor-pointer"
                      >
                        <Video className="w-3 h-3" />
                        <span>+ New Meet</span>
                      </button>
                      <button
                        onClick={() => setIsMeetsModalOpen(true)}
                        className="px-2.5 py-1 text-[11px] font-medium text-[#111111] bg-[#F4F4F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>Meets ({meetings.length})</span>
                      </button>
                    </>
                  )}
                  {/* Setup Modal Trigger Button */}
                  <button
                    onClick={() => setActiveModalApp(app)}
                    className="px-2.5 py-1 text-[11px] font-medium text-[#404040] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3 text-[#666666]" />
                    <span>Setup</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* MODAL: CREATE GOOGLE MEET SPACE                                */}
      {/* ============================================================== */}
      <CreateGoogleMeetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={async () => {
          showToast('Official Google Meet space created successfully!');
          await loadAllData();
        }}
      />

      {/* ============================================================== */}
      {/* CENTERED POPUP MODAL: SCHEDULED GOOGLE MEET CONFERENCES       */}
      {/* ============================================================== */}
      <GoogleMeetModal
        isOpen={isMeetsModalOpen}
        onClose={() => setIsMeetsModalOpen(false)}
        meetings={meetings}
        onDelete={handleDeleteMeeting}
        onCreateClick={() => {
          setIsMeetsModalOpen(false);
          setIsCreateModalOpen(true);
        }}
        loading={loading}
        connectedEmail="aftabsk741156@gmail.com"
      />

      {/* ============================================================== */}
      {/* BEAUTIFUL CENTERED SETUP MODAL / DIALOG                       */}
      {/* ============================================================== */}
      {activeModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E5E5E5]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
                  {renderAppIcon(activeModalApp.app_id)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111]">
                    {activeModalApp.name} Configuration
                  </h3>
                  <p className="text-xs text-[#666666]">
                    API Credentials &amp; Connection Setup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalApp(null)}
                className="text-[#999999] hover:text-[#111111] p-1 rounded-md hover:bg-[#F4F4F5] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            {/* Google Meet Modal Content */}
            {activeModalApp.app_id === 'google_calendar' ? (
              <div className="space-y-4 text-xs">
                {activeModalApp.connected ? (
                  <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {activeModalApp.avatar_url ? (
                        <img 
                          src={activeModalApp.avatar_url} 
                          alt="Avatar"
                          className="w-9 h-9 rounded-full border border-white shadow-xs object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#00832D]/10 border border-[#00832D]/20 flex items-center justify-center text-[#00832D]">
                          <Video className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-[#111111] text-sm">
                            {activeModalApp.account_name || 'Google Workspace'}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                        </div>
                        <span className="font-mono text-xs text-[#15803D]">
                          {activeModalApp.account_identifier}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleTestHealth('google_calendar')}
                        disabled={testingAppId === 'google_calendar'}
                        className="px-3 py-1.5 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Activity className={`w-3.5 h-3.5 ${testingAppId === 'google_calendar' ? 'animate-spin text-[#F59E0B]' : 'text-[#666666]'}`} />
                        <span>Ping</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDisconnectGoogle}
                        className="px-3 py-1.5 text-xs font-medium text-[#DC2626] bg-white border border-[#FECACA] hover:bg-[#FEE2E2] rounded-lg transition cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-[#111111] text-sm block">Connect Google Workspace</span>
                      <p className="text-[#666666] text-xs mt-0.5">
                        Authorizes official Google Meet REST API v2 and Calendar sync.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleConnectGoogle}
                      disabled={connectingOAuth}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 flex-shrink-0"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{connectingOAuth ? 'Connecting...' : 'Connect Google'}</span>
                    </button>
                  </div>
                )}

                {/* Features & Unlocked Benefits for CRM User */}
                <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block">
                    What this integration enables:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <span className="font-semibold text-[#111111] block">⚡ 1-Click Meet Rooms</span>
                      <span className="text-[11px] text-[#666666]">Instant Google Meet links for deals &amp; leads.</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <span className="font-semibold text-[#111111] block">📅 Calendar Sync</span>
                      <span className="text-[11px] text-[#666666]">Events auto-synced to your Google Calendar.</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <span className="font-semibold text-[#111111] block">📧 Auto Invites</span>
                      <span className="text-[11px] text-[#666666]">Invited client receives calendar notifications.</span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Developer Configuration (Admins only, hidden for regular users) */}
                <details className="border border-[#E5E5E5] rounded-xl p-3 bg-white text-xs">
                  <summary className="font-semibold text-[#666666] cursor-pointer hover:text-[#111111] select-none">
                    Developer &amp; API Configuration (Advanced)
                  </summary>
                  <div className="mt-3 pt-3 border-t border-[#E5E5E5] space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-[#404040]">
                          Authorized Redirect URI
                        </label>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('http://localhost:3000/integrations/callback', 'g_redirect')}
                          className="text-[10px] text-[#2563EB] font-medium hover:underline flex items-center space-x-1"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>{copiedField === 'g_redirect' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value="http://localhost:3000/integrations/callback"
                        className="w-full px-3 py-1 text-xs font-mono bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg select-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#404040] block mb-1">
                        Client ID (.env configured)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="669286959294-inmhukj0fvqlo2upgkid4bfb28d96gus.apps.googleusercontent.com"
                        className="w-full px-3 py-1 text-xs font-mono bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg select-all"
                      />
                    </div>
                  </div>
                </details>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                  <button
                    type="button"
                    onClick={() => setActiveModalApp(null)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Zoom Modal Content */
              <div className="space-y-4 text-xs">
                {activeModalApp.connected ? (
                  <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#2D8CFF]/10 border border-[#2D8CFF]/20 flex items-center justify-center text-[#2D8CFF] flex-shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-[#111111] text-sm">
                            {activeModalApp.account_name || 'Zoom Video Account'}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                        </div>
                        <span className="font-mono text-xs text-[#15803D]">
                          {activeModalApp.account_identifier || 'Connected'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleTestHealth('zoom')}
                        disabled={testingAppId === 'zoom'}
                        className="px-3 py-1.5 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Activity className={`w-3.5 h-3.5 ${testingAppId === 'zoom' ? 'animate-spin text-[#F59E0B]' : 'text-[#666666]'}`} />
                        <span>Ping</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDisconnectZoom}
                        className="px-3 py-1.5 text-xs font-medium text-[#DC2626] bg-white border border-[#FECACA] hover:bg-[#FEE2E2] rounded-lg transition cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-[#111111] text-sm block">Connect Zoom Account</span>
                      <p className="text-[#64748B] text-xs mt-0.5">
                        Authorizes official Zoom OAuth to generate passcoded video conference rooms.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleConnectZoom}
                      disabled={connectingOAuth}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition shadow-sm flex items-center space-x-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
                    >
                      <Video className="w-3.5 h-3.5 text-[#2D8CFF]" />
                      <span>{connectingOAuth ? 'Redirecting to Zoom...' : 'Connect with Zoom'}</span>
                    </button>
                  </div>
                )}

                {/* Features & Unlocked Benefits for CRM User */}
                <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block">
                    What this integration enables:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <span className="font-semibold text-[#111111] block">⚡ Instant Zoom Rooms</span>
                      <span className="text-[11px] text-[#666666]">One-click video conference links for discovery calls.</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <span className="font-semibold text-[#111111] block">🔒 Passcodes &amp; Security</span>
                      <span className="text-[11px] text-[#666666]">Automatic 6-digit PIN and waiting rooms.</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <span className="font-semibold text-[#111111] block">📊 CRM Activity Sync</span>
                      <span className="text-[11px] text-[#666666]">Logged automatically under Lead &amp; Deal timelines.</span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Developer Configuration (Admins only, hidden for regular users) */}
                <details className="border border-[#E5E5E5] rounded-xl p-3 bg-white text-xs">
                  <summary className="font-semibold text-[#666666] cursor-pointer hover:text-[#111111] select-none">
                    Developer &amp; API Configuration (Advanced)
                  </summary>
                  <div className="mt-3 pt-3 border-t border-[#E5E5E5] space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-[#404040] block mb-1">
                        Client ID (.env configured)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="z0VW6KC1SrYapvu5Ibpzw"
                        className="w-full px-3 py-1 text-xs font-mono bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg select-all"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-[#404040]">
                          OAuth Redirect URL (Zoom Marketplace)
                        </label>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('http://localhost:3000/integrations/zoom/callback', 'z_redirect')}
                          className="text-[10px] text-[#2563EB] font-medium hover:underline flex items-center space-x-1"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>{copiedField === 'z_redirect' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value="http://localhost:3000/integrations/zoom/callback"
                        className="w-full px-3 py-1 text-xs font-mono bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg select-all"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-[#404040]">
                          OAuth Allow List Domain
                        </label>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('http://localhost:3000', 'z_allow')}
                          className="text-[10px] text-[#2563EB] font-medium hover:underline flex items-center space-x-1"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>{copiedField === 'z_allow' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value="http://localhost:3000"
                        className="w-full px-3 py-1 text-xs font-mono bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg select-all"
                      />
                    </div>
                  </div>
                </details>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                  <button
                    type="button"
                    onClick={() => setActiveModalApp(null)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Disconnecting Integration */}
      <ConfirmDialog
        isOpen={!!disconnectTarget}
        title={disconnectTarget === 'google' ? 'Disconnect Google Workspace' : 'Disconnect Zoom'}
        message={
          disconnectTarget === 'google'
            ? 'Are you sure you want to disconnect Google Workspace? Live Google Meet space creation will require re-authorizing.'
            : 'Are you sure you want to disconnect Zoom? Live video meeting links will no longer generate automatically.'
        }
        confirmLabel="Disconnect"
        cancelLabel="Keep Connected"
        isDestructive={true}
        onConfirm={() => {
          if (disconnectTarget === 'google') executeDisconnectGoogle();
          if (disconnectTarget === 'zoom') executeDisconnectZoom();
        }}
        onCancel={() => setDisconnectTarget(null)}
      />
    </div>
  );
}
