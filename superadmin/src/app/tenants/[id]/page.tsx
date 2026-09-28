'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, Users, Layers, ArrowLeft, ExternalLink, 
  Download, Ban, Play, Trash2, CheckCircle2, AlertTriangle, 
  Server, HardDrive, Database, ShieldCheck, RefreshCw, 
  Loader2, Sparkles, FileText, Calendar, Clock, Globe
} from 'lucide-react';
import { formatNumber, formatCurrency } from '../../../lib/utils';
import { superAdminApi } from '../../../lib/api';

export default function TenantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadTenant = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await superAdminApi.getTenantById(id);
      setTenant(data);
    } catch (err: any) {
      console.error('Failed to load tenant details:', err);
      setError(err.message || 'Tenant not found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenant();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!tenant) return;
    setIsUpdatingStatus(true);
    try {
      const res = await superAdminApi.toggleTenantStatus(tenant.id);
      setTenant({ ...tenant, status: res.status });
      alert(`Tenant status changed to: ${res.status}`);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDownloadData = async () => {
    if (!tenant) return;
    try {
      const data = await superAdminApi.exportTenantData(tenant.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenant-${tenant.name.toLowerCase().replace(/\s+/g, '_')}-full-data.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleDeleteTenant = async () => {
    if (!tenant) return;
    if (!confirm(`Are you sure you want to permanently delete "${tenant.name}" from PostgreSQL? This action cannot be undone.`)) return;

    try {
      await superAdminApi.deleteTenant(tenant.id);
      alert(`Tenant "${tenant.name}" has been deleted.`);
      router.push('/tenants');
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#111111]" />
        <span className="text-xs text-[#666666] font-mono">Loading Tenant Quotas & Database Records...</span>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto p-6 card-minimal text-center">
        <AlertTriangle className="w-8 h-8 text-[#DC2626] mx-auto" />
        <h2 className="text-base font-bold text-[#111111]">Tenant Not Found</h2>
        <p className="text-xs text-[#666666]">{error || 'The requested tenant organization does not exist in the database.'}</p>
        <Link href="/tenants" className="btn-secondary text-xs inline-flex items-center space-x-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tenant Directory</span>
        </Link>
      </div>
    );
  }

  const { quotas, counts, users, plan, vertical } = tenant;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Link
              href="/tenants"
              className="text-[#666666] hover:text-[#111111] p-1 rounded-md hover:bg-[#FAFAFA] transition"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight flex items-center space-x-2.5">
              <span>{tenant.name}</span>
            </h1>
            <span className={`inline-flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
              tenant.status === 'ACTIVE'
                ? 'text-[#16A34A] bg-emerald-50 border-emerald-200'
                : 'text-[#DC2626] bg-red-50 border-red-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'ACTIVE' ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
              <span>{tenant.status}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] pl-6 font-mono">
            <span>ID: <code className="text-[#111111] font-semibold">{tenant.id}</code></span>
            <span>•</span>
            <span>Domain: <code className="text-[#111111]">{tenant.slug}.zyvocrm.in</code></span>
            <span>•</span>
            <span>Created: {new Date(tenant.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Login Workspace */}
          <a
            href="http://localhost:3000/dashboard"
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-xs py-2 px-3 space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            title="Launch CRM Workspace Session"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch CRM</span>
          </a>

          {/* 2. Suspend / Activate */}
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            className={`btn-secondary text-xs py-2 px-3 space-x-1.5 ${
              tenant.status === 'SUSPENDED' ? 'text-[#16A34A] border-emerald-300' : 'text-[#DC2626] border-red-200'
            }`}
          >
            {tenant.status === 'SUSPENDED' ? (
              <>
                <Play className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Reactivate Workspace</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Suspend Workspace</span>
              </>
            )}
          </button>

          {/* 3. Export Data */}
          <button
            type="button"
            onClick={handleDownloadData}
            className="btn-secondary text-xs py-2 px-3 space-x-1.5"
            title="Export full tenant JSON dump"
          >
            <Download className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Export JSON</span>
          </button>

          {/* 4. Delete */}
          <button
            type="button"
            onClick={handleDeleteTenant}
            className="p-2 text-[#888888] hover:text-[#DC2626] hover:bg-red-50 rounded-lg border border-[#E5E5E5] transition"
            title="Permanently Delete Organization"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECTION 1: QUOTAS & REAL LIMIT CONSUMPTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#888888]">
            Plan Limits & Real Resource Consumption
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F4F4F6] text-[#111111] border border-[#E5E5E5]">
            Plan: {plan.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Seat Quota */}
          <div className="card-minimal p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111111]">User Seats</span>
              <Users className="w-4 h-4 text-[#666666]" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#111111]">
                {quotas.seats.used} <span className="text-xs text-[#888888] font-normal">/ {quotas.seats.max} seats</span>
              </div>
              <div className="w-full h-1.5 bg-[#F4F4F6] rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    quotas.seats.percentage > 85 ? 'bg-[#DC2626]' : 'bg-[#111111]'
                  }`}
                  style={{ width: `${quotas.seats.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#888888] mt-1.5 font-mono">
                <span>{quotas.seats.percentage}% consumed</span>
                <span>{quotas.seats.max - quotas.seats.used} available</span>
              </div>
            </div>
          </div>

          {/* Deal Records Quota */}
          <div className="card-minimal p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111111]">Deals Capacity</span>
              <Layers className="w-4 h-4 text-[#666666]" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#111111]">
                {quotas.deals.used} <span className="text-xs text-[#888888] font-normal">/ {formatNumber(quotas.deals.max)} deals</span>
              </div>
              <div className="w-full h-1.5 bg-[#F4F4F6] rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    quotas.deals.percentage > 85 ? 'bg-[#DC2626]' : 'bg-[#111111]'
                  }`}
                  style={{ width: `${quotas.deals.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#888888] mt-1.5 font-mono">
                <span>{quotas.deals.percentage}% consumed</span>
                <span>{quotas.deals.max - quotas.deals.used} remaining</span>
              </div>
            </div>
          </div>

          {/* Lead Records Quota */}
          <div className="card-minimal p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111111]">Leads Capacity</span>
              <FileText className="w-4 h-4 text-[#666666]" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#111111]">
                {quotas.leads.used} <span className="text-xs text-[#888888] font-normal">/ {formatNumber(quotas.leads.max)} leads</span>
              </div>
              <div className="w-full h-1.5 bg-[#F4F4F6] rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    quotas.leads.percentage > 85 ? 'bg-[#DC2626]' : 'bg-[#111111]'
                  }`}
                  style={{ width: `${quotas.leads.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#888888] mt-1.5 font-mono">
                <span>{quotas.leads.percentage}% consumed</span>
                <span>{quotas.leads.max - quotas.leads.used} remaining</span>
              </div>
            </div>
          </div>

          {/* Storage Vault Consumed */}
          <div className="card-minimal p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111111]">Storage Vault</span>
              <HardDrive className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#111111]">
                {quotas.storageMB.used} MB <span className="text-xs text-[#888888] font-normal">/ {quotas.storageMB.max >= 1000 ? `${quotas.storageMB.max / 1000} GB` : `${quotas.storageMB.max} MB`}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F4F4F6] rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    quotas.storageMB.percentage > 85 ? 'bg-[#DC2626]' : 'bg-[#16A34A]'
                  }`}
                  style={{ width: `${quotas.storageMB.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#888888] mt-1.5 font-mono">
                <span>{quotas.storageMB.percentage}% consumed</span>
                <span>PostgreSQL DB Storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ORGANIZATION PROFILE & RECORD BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-5 card-minimal p-6 space-y-4">
          <div className="border-b border-[#E5E5E5] pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Workspace Configuration
            </h3>
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-[#F4F4F6]">
              <span className="text-[#666666]">Industry Vertical</span>
              <span className="font-semibold text-[#111111]">{vertical.name}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-[#F4F4F6]">
              <span className="text-[#666666]">Currency Format</span>
              <span className="font-mono font-semibold text-[#111111]">{tenant.currency}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-[#F4F4F6]">
              <span className="text-[#666666]">Timezone</span>
              <span className="font-mono text-[#111111]">{tenant.timezone}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-[#F4F4F6]">
              <span className="text-[#666666]">Registered Office</span>
              <span className="font-medium text-[#111111] max-w-[200px] text-right truncate">
                {tenant.address}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-[#F4F4F6]">
              <span className="text-[#666666]">Data Isolation</span>
              <span className="font-mono text-[11px] text-[#16A34A]">Row-Level Security (RLS)</span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-[#666666]">Created In Database</span>
              <span className="font-mono text-[#111111]">
                {new Date(tenant.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Database Records Summary Grid */}
        <div className="lg:col-span-7 card-minimal p-6 space-y-4">
          <div className="border-b border-[#E5E5E5] pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              PostgreSQL Tables & Record Volume
            </h3>
            <Database className="w-4 h-4 text-[#111111]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
              <div className="text-[11px] text-[#666666]">Users</div>
              <div className="font-mono font-bold text-lg text-[#111111] mt-1">{counts.users}</div>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
              <div className="text-[11px] text-[#666666]">Deals</div>
              <div className="font-mono font-bold text-lg text-[#111111] mt-1">{counts.deals}</div>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
              <div className="text-[11px] text-[#666666]">Leads</div>
              <div className="font-mono font-bold text-lg text-[#111111] mt-1">{counts.leads}</div>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
              <div className="text-[11px] text-[#666666]">Contacts</div>
              <div className="font-mono font-bold text-lg text-[#111111] mt-1">{counts.contacts}</div>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
              <div className="text-[11px] text-[#666666]">Accounts</div>
              <div className="font-mono font-bold text-lg text-[#111111] mt-1">{counts.accounts}</div>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
              <div className="text-[11px] text-[#666666]">Invoices</div>
              <div className="font-mono font-bold text-lg text-[#111111] mt-1">{counts.invoices}</div>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
              <div className="text-[11px] text-[#666666]">Tasks</div>
              <div className="font-mono font-bold text-lg text-[#111111] mt-1">{counts.tasks}</div>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
              <div className="text-[11px] text-[#666666]">Web Forms</div>
              <div className="font-mono font-bold text-lg text-[#111111] mt-1">{counts.webForms}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: WORKSPACE MEMBERS / USERS TABLE */}
      <div className="card-minimal overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-[#111111]" />
            <h3 className="text-sm font-bold text-[#111111]">Workspace Members & Credentials</h3>
            <span className="text-xs bg-[#F4F4F6] text-[#666666] px-2 py-0.5 rounded-full font-mono">
              {users.length} members
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] tracking-wider uppercase">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-[#FAFAFA] transition duration-150">
                  <td className="py-3 px-4 font-semibold text-[#111111]">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#666666]">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#F4F4F6] border border-[#E5E5E5] font-mono text-[10px] text-[#111111]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      <span>{u.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#888888]">
                    {new Date(u.created_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
