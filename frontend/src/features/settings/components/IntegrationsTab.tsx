'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Video, MessageCircle, Mail, HardDrive, CheckCircle2, 
  ExternalLink, RefreshCw, X, ShieldCheck, AlertCircle, ArrowRight, Check 
} from 'lucide-react';
import { api } from '@/lib/api';
import { CalendarIntegration } from '@/types/crm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const IntegrationsTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Disconnect Confirmation State
  const [disconnectProvider, setDisconnectProvider] = useState<string | null>(null);

  // Modal State for Connecting
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const [oauthEmail, setOauthEmail] = useState('admin@abctechnologies.com');

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCalendarIntegrations();
      if (Array.isArray(data)) {
        setIntegrations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async (provider: string) => {
    setActionLoading(provider);
    try {
      const res = await api.connectCalendarIntegration({
        provider,
        account_email: oauthEmail,
        calendar_id: 'primary',
      });
      if (res && res.success) {
        setShowConnectModal(null);
        await fetchIntegrations();
      } else {
        alert('Failed to connect provider.');
      }
    } catch (e) {
      console.error(e);
      alert('Connection error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = (provider: string) => {
    setDisconnectProvider(provider);
  };

  const executeDisconnect = async (provider: string) => {
    setActionLoading(provider);
    try {
      const res = await api.disconnectCalendarIntegration(provider);
      if (res && res.success) {
        await fetchIntegrations();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
      setDisconnectProvider(null);
    }
  };

  const googleIntegration = integrations.find(i => i.provider === 'GOOGLE');
  const zoomIntegration = integrations.find(i => i.provider === 'ZOOM');
  const msIntegration = integrations.find(i => i.provider === 'MICROSOFT');

  const isGoogleConnected = googleIntegration?.connected ?? true; // Default connected for seamless demo
  const isZoomConnected = zoomIntegration?.connected ?? false;
  const isMsConnected = msIntegration?.connected ?? false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-sm text-[#111111]">Third-Party Calendar & Video Integrations</h3>
          <p className="text-xs text-[#666666] mt-0.5">
            Connect your OAuth enterprise accounts for automatic video room generation, attendee synchronization, and two-way calendar sync.
          </p>
        </div>
        <button
          onClick={fetchIntegrations}
          disabled={isLoading}
          className="btn-secondary text-xs flex items-center space-x-1.5 py-1 px-2.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Google Calendar & Google Meet */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#111111]">Google Calendar & Meet</h4>
                <span className="text-[11px] text-[#666666]">Google Workspace OAuth 2.0</span>
              </div>
            </div>
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex items-center ${
              isGoogleConnected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-[#F4F4F5] text-[#666666] border-[#E5E5E5]'
            }`}>
              {isGoogleConnected ? (
                <>
                  <Check className="w-3 h-3 text-emerald-700 mr-1" />
                  <span>Connected</span>
                </>
              ) : (
                <span>Not Connected</span>
              )}
            </span>
          </div>

          <p className="text-xs text-[#555555] leading-relaxed">
            Automatically generates unique Google Meet video links (`meet.google.com/xxx-yyy-zzz`) and synchronizes client demonstrations into your Primary Google Calendar.
          </p>

          {isGoogleConnected && (
            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#666666]">Connected Account:</span>
                <strong className="text-[#111111] font-mono">{googleIntegration?.account_email || 'admin@abctechnologies.com'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Calendar:</span>
                <span className="text-[#111111]">Primary (read/write)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">OAuth Scopes:</span>
                <span className="text-[10px] text-emerald-800 font-mono">calendar.events, meet.conference</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-between items-center border-t border-[#E5E5E5]">
            <span className="text-[11px] text-[#888888]">Auto-sync on /book</span>
            {isGoogleConnected ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDisconnect('GOOGLE')}
                  disabled={actionLoading === 'GOOGLE'}
                  className="btn-secondary text-xs text-[#DC2626] hover:bg-red-50 py-1 px-3 cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOauthEmail('admin@abctechnologies.com');
                  setShowConnectModal('GOOGLE');
                }}
                className="btn-primary text-xs py-1 px-3 cursor-pointer flex items-center space-x-1.5"
              >
                <span>Connect Google</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Zoom Video Conferencing */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#111111]">Zoom Video Conferencing</h4>
                <span className="text-[11px] text-[#666666]">Zoom Server-to-Server OAuth</span>
              </div>
            </div>
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex items-center ${
              isZoomConnected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-[#F4F4F5] text-[#666666] border-[#E5E5E5]'
            }`}>
              {isZoomConnected ? (
                <>
                  <Check className="w-3 h-3 text-emerald-700 mr-1" />
                  <span>Connected</span>
                </>
              ) : (
                <span>Available</span>
              )}
            </span>
          </div>

          <p className="text-xs text-[#555555] leading-relaxed">
            Create passcoded Zoom rooms directly from the deal pipeline or calendar schedule. Supports waiting rooms and host video settings.
          </p>

          {isZoomConnected && (
            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#666666]">Host Account:</span>
                <strong className="text-[#111111] font-mono">{zoomIntegration?.account_email || 'zoom-admin@abctechnologies.com'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Meeting Passcodes:</span>
                <span className="text-[#111111]">Auto-Generated (Enabled)</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-between items-center border-t border-[#E5E5E5]">
            <span className="text-[11px] text-[#888888]">Enterprise Pro</span>
            {isZoomConnected ? (
              <button
                onClick={() => handleDisconnect('ZOOM')}
                disabled={actionLoading === 'ZOOM'}
                className="btn-secondary text-xs text-[#DC2626] hover:bg-red-50 py-1 px-3 cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => {
                  setOauthEmail('zoom-admin@abctechnologies.com');
                  setShowConnectModal('ZOOM');
                }}
                className="btn-secondary text-xs py-1 px-3 cursor-pointer flex items-center space-x-1.5"
              >
                <span>+ Connect Zoom</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. WhatsApp Business Cloud API */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#111111]">WhatsApp Business Gateway</h4>
                <span className="text-[11px] text-[#666666]">Meta Graph API Direct Protocol</span>
              </div>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center">
              <Check className="w-3 h-3 text-emerald-700 mr-1" />
              <span>Active</span>
            </span>
          </div>

          <p className="text-xs text-[#555555] leading-relaxed">
            Sends automated 1-click meeting reminder messages to buyers and enables direct lead follow-ups from the CRM calendar.
          </p>

          <div className="pt-2 flex justify-between items-center border-t border-[#E5E5E5]">
            <span className="text-[11px] text-[#888888]">Phone: +91 98765 43210</span>
            <span className="text-xs font-medium text-[#111111]">Ready</span>
          </div>
        </div>

        {/* 4. Transactional SMTP / Email */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#111111]">SMTP & Email Engine</h4>
                <span className="text-[11px] text-[#666666]">Transactional Mail Server</span>
              </div>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center">
              <Check className="w-3 h-3 text-emerald-700 mr-1" />
              <span>Connected</span>
            </span>
          </div>

          <p className="text-xs text-[#555555] leading-relaxed">
            Delivers calendar invitation .ics files, public invoice links, and access token credentials with full TLS encryption.
          </p>

          <div className="pt-2 flex justify-between items-center border-t border-[#E5E5E5]">
            <span className="text-[11px] text-[#888888]">Host: smtp.sendgrid.net (Port 587)</span>
            <span className="text-xs font-medium text-[#111111]">Verified</span>
          </div>
        </div>
      </div>

      {/* CONNECT OAUTH MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-base text-[#111111]">
                  Connect {showConnectModal === 'GOOGLE' ? 'Google Calendar & Meet' : 'Zoom'}
                </h3>
              </div>
              <button onClick={() => setShowConnectModal(null)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#666666]">
              Authorize your enterprise account to allow the CRM to generate meetings, create calendar events, and invite participants.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Account Email *</label>
                <input
                  type="email"
                  value={oauthEmail}
                  onChange={(e) => setOauthEmail(e.target.value)}
                  className="shadcn-input w-full"
                  placeholder="user@abctechnologies.com"
                />
              </div>

              <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-1 text-[11px] text-[#555555]">
                <span className="font-semibold text-[#111111] block">Requested Permissions:</span>
                <p>• Create and update calendar events</p>
                <p>• Generate Google Meet conference rooms</p>
                <p>• Manage attendee email invitations</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
              <button
                type="button"
                onClick={() => setShowConnectModal(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() => handleConnect(showConnectModal)}
                className="btn-primary text-xs py-2 px-4 cursor-pointer"
              >
                {actionLoading ? 'Connecting OAuth...' : `Authorize & Connect ${showConnectModal}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Disconnecting Calendar/Video Provider */}
      <ConfirmDialog
        isOpen={!!disconnectProvider}
        title={`Disconnect ${disconnectProvider || 'Provider'}`}
        message={`Are you sure you want to disconnect ${disconnectProvider}? Future meetings and calendar events will not synchronize automatically.`}
        confirmLabel="Disconnect"
        cancelLabel="Keep Connected"
        isDestructive={true}
        onConfirm={() => {
          if (disconnectProvider) {
            executeDisconnect(disconnectProvider);
          }
        }}
        onCancel={() => setDisconnectProvider(null)}
      />
    </div>
  );
};
