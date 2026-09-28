'use client';

import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, Key, Database, Globe, 
  Save, AlertTriangle, CheckCircle2, Lock 
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'Zyvo Enterprise Cloud CRM',
    rootAdminEmail: 'root@zyvocrm.in',
    allowSelfRegistration: true,
    defaultTrialDays: 14,
    enforce2FA: true,
    dataIsolationMode: 'ROW_LEVEL_RLS',
    maxConcurrentSessions: 5,
    autoBackupIntervalHours: 6,
    masterWebhookUrl: 'https://telemetry.zyvocrm.in/events',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            SuperAdmin Platform Settings
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Global security parameters, multi-tenant isolation policies, and master administrative keys.
          </p>
        </div>

        {saved && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Platform Identity */}
        <div className="card-minimal p-6 space-y-4">
          <div className="border-b border-[#E5E5E5] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Platform Identity & White-labeling
            </h3>
            <p className="text-[11px] text-[#666666] mt-0.5">Brand name and primary administrative identity</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[#404040] mb-1.5">Platform Brand Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#404040] mb-1.5">Master Root Admin Email</label>
              <input
                type="email"
                value={settings.rootAdminEmail}
                onChange={(e) => setSettings({ ...settings, rootAdminEmail: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Multi-Tenant Governance */}
        <div className="card-minimal p-6 space-y-4">
          <div className="border-b border-[#E5E5E5] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Multi-Tenant Isolation & Trial Governance
            </h3>
            <p className="text-[11px] text-[#666666] mt-0.5">Control how new workspaces are onboarded and isolated</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl">
              <div>
                <div className="font-semibold text-[#111111]">Allow Public Tenant Self-Registration</div>
                <div className="text-[11px] text-[#666666]">Permit visitors to create organizations via /register and /onboarding</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSelfRegistration}
                onChange={(e) => setSettings({ ...settings, allowSelfRegistration: e.target.checked })}
                className="w-4 h-4 rounded text-[#111111] accent-[#111111] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl">
              <div>
                <div className="font-semibold text-[#111111]">Enforce Two-Factor Authentication (2FA) for Admins</div>
                <div className="text-[11px] text-[#666666]">Mandates OTP verification on new admin session logins</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enforce2FA}
                onChange={(e) => setSettings({ ...settings, enforce2FA: e.target.checked })}
                className="w-4 h-4 rounded text-[#111111] accent-[#111111] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-medium text-[#404040] mb-1.5">Default Free Trial Duration (Days)</label>
                <input
                  type="number"
                  value={settings.defaultTrialDays}
                  onChange={(e) => setSettings({ ...settings, defaultTrialDays: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#404040] mb-1.5">Tenant Data Isolation Mode</label>
                <select
                  value={settings.dataIsolationMode}
                  onChange={(e) => setSettings({ ...settings, dataIsolationMode: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                >
                  <option value="ROW_LEVEL_RLS">Row-Level Security (organization_id FK)</option>
                  <option value="SCHEMA_PER_TENANT">Schema-Per-Tenant (PostgreSQL Schemas)</option>
                  <option value="DATABASE_PER_TENANT">Database-Per-Tenant (Dedicated Clusters)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Master API Webhooks */}
        <div className="card-minimal p-6 space-y-4">
          <div className="border-b border-[#E5E5E5] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Global Telemetry Webhook Sink
            </h3>
            <p className="text-[11px] text-[#666666] mt-0.5">Stream audit events and platform telemetry to an external Datadog or Sentry sink</p>
          </div>

          <div className="text-xs">
            <label className="block font-medium text-[#404040] mb-1.5">Global Event Webhook URL</label>
            <input
              type="text"
              value={settings.masterWebhookUrl}
              onChange={(e) => setSettings({ ...settings, masterWebhookUrl: e.target.value })}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] font-mono outline-none"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary text-xs py-2 px-5 space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Global Platform Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
