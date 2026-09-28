'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, Users, Layers, Search, Plus, Filter, 
  ExternalLink, MoreVertical, CheckCircle2, ShieldCheck, 
  Trash2, RefreshCw, Loader2, Eye, Download, Ban, Play
} from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { superAdminApi } from '../../lib/api';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [newTenant, setNewTenant] = useState({
    name: '',
    adminEmail: '',
    adminName: '',
    vertical: 'Software / SaaS & IT Services',
    plan: 'GROWTH',
  });

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminApi.getTenants({ search, plan: planFilter !== 'ALL' ? planFilter : undefined });
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setTenants(list);
    } catch (err) {
      console.error('Failed to load tenants:', err);
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [planFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTenants();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const res = await superAdminApi.toggleTenantStatus(id);
      setActiveDropdownId(null);
      loadTenants();
      alert(`Tenant status changed to: ${res.status}`);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDownloadData = async (id: string, name: string) => {
    try {
      const data = await superAdminApi.exportTenantData(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenant-${name.toLowerCase().replace(/\s+/g, '_')}-data.json`;
      a.click();
      URL.revokeObjectURL(url);
      setActiveDropdownId(null);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name.trim()) return;

    setIsSubmitting(true);
    try {
      await superAdminApi.createTenant({
        name: newTenant.name.trim(),
        adminEmail: newTenant.adminEmail.trim() || undefined,
        adminName: newTenant.adminName.trim() || undefined,
        vertical: newTenant.vertical,
        plan: newTenant.plan,
      });
      setShowCreateModal(false);
      setNewTenant({
        name: '',
        adminEmail: '',
        adminName: '',
        vertical: 'Software / SaaS & IT Services',
        plan: 'GROWTH',
      });
      loadTenants();
    } catch (err: any) {
      alert(`Tenant creation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete tenant "${name}" from PostgreSQL?`)) return;

    try {
      await superAdminApi.deleteTenant(id);
      setTenants(tenants.filter(t => t.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Tenant Organizations
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Real multi-tenant workspaces fetched directly from PostgreSQL.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => loadTenants()}
            className="btn-secondary text-xs py-2 px-3 space-x-1.5"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs py-2 px-3.5 space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision New Tenant</span>
          </button>
        </div>
      </div>

      {/* Tenant Directory Table Container */}
      <div className="card-minimal overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organization by name... (Press Enter)"
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition"
              />
            </div>
            <button type="submit" className="btn-secondary text-xs py-1.5 px-3">
              Search
            </button>
          </form>

          <div className="flex items-center space-x-2">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-2.5 py-1.5 text-xs text-[#111111] outline-none transition cursor-pointer"
            >
              <option value="ALL">All Plans</option>
              <option value="STARTER">Starter</option>
              <option value="GROWTH">Pro Growth</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 space-x-2 text-xs text-[#666666]">
              <Loader2 className="w-5 h-5 animate-spin text-[#111111]" />
              <span>Loading PostgreSQL Tenant Records...</span>
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center text-[#888888] text-xs">
              No organizations found. Click "+ Provision New Tenant" to create one.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] tracking-wider uppercase">
                  <th className="py-3 px-4">Workspace</th>
                  <th className="py-3 px-4">Industry Vertical</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Database Records</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {(Array.isArray(tenants) ? tenants : []).map((t) => (
                  <tr key={t.id} className="hover:bg-[#FAFAFA] transition duration-150 group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <Link 
                            href={`/tenants/${t.id}`}
                            className="font-semibold text-[#111111] hover:underline block"
                          >
                            {t.name}
                          </Link>
                          <div className="text-[10px] text-[#888888] font-mono">
                            ID: {t.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#404040]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] text-[11px] font-medium text-[#404040]">
                        {t.vertical}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F4F4F6] text-[#111111] border border-[#D4D4D4]">
                        {t.plan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-semibold text-[#111111]">{t.usersCount} users</span>
                      <span className="text-[#888888]"> • {t.dealsCount} deals • {t.leadsCount} leads</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#666666]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2 relative">
                        {/* Login Button */}
                        <a
                          href="http://localhost:3000/dashboard"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-white hover:bg-[#FAFAFA] border border-[#E5E5E5] rounded-md text-[11px] font-medium text-[#111111] transition flex items-center space-x-1"
                          title="Impersonate Tenant Session"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Login</span>
                        </a>

                        {/* 3-Dot Actions Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveDropdownId(activeDropdownId === t.id ? null : t.id)}
                            className="p-1 text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F6] rounded-md border border-[#E5E5E5] transition"
                            title="More Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeDropdownId === t.id && (
                            <div className="absolute right-0 top-8 z-30 w-52 bg-white border border-[#E5E5E5] rounded-xl shadow-lg py-1.5 text-left text-xs animate-in fade-in duration-150">
                              {/* 1. View Full Details */}
                              <Link
                                href={`/tenants/${t.id}`}
                                onClick={() => setActiveDropdownId(null)}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-[#111111] hover:bg-[#FAFAFA] transition"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#666666]" />
                                <span>View Details & Limits</span>
                              </Link>

                              {/* 2. Suspend / Activate */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(t.id, t.status)}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-[#111111] hover:bg-[#FAFAFA] transition"
                              >
                                <Ban className="w-3.5 h-3.5 text-[#F59E0B]" />
                                <span>Suspend / Reactivate</span>
                              </button>

                              {/* 3. Download Tenant Data JSON */}
                              <button
                                type="button"
                                onClick={() => handleDownloadData(t.id, t.name)}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-[#111111] hover:bg-[#FAFAFA] transition"
                              >
                                <Download className="w-3.5 h-3.5 text-[#16A34A]" />
                                <span>Export Data (JSON)</span>
                              </button>

                              <div className="my-1 border-t border-[#E5E5E5]" />

                              {/* 4. Delete Organization */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleDeleteTenant(t.id, t.name);
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-[#DC2626] hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Workspace</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Provision Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="card-minimal max-w-md w-full p-6 space-y-4 bg-white shadow-xl">
            <div className="border-b border-[#E5E5E5] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Provision New Tenant</h3>
                <p className="text-[11px] text-[#666666] mt-0.5">Creates isolated multi-tenant organization in PostgreSQL</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#888888] hover:text-[#111111] text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-[#404040] mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Horizon Group"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#404040] mb-1">Admin Email</label>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={newTenant.adminEmail}
                  onChange={(e) => setNewTenant({ ...newTenant, adminEmail: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#404040] mb-1">Industry Vertical Template</label>
                <select
                  value={newTenant.vertical}
                  onChange={(e) => setNewTenant({ ...newTenant, vertical: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                >
                  <option>Software / SaaS & IT Services</option>
                  <option>Real Estate & Property</option>
                  <option>Travel & Tour Packages</option>
                  <option>School / College & EdTech</option>
                  <option>Restaurant & Catering</option>
                  <option>Retail & Wholesale</option>
                  <option>Healthcare & Diagnostic Clinics</option>
                  <option>Consulting & Professional Services</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#404040] mb-1">Subscription Tier Plan</label>
                <select
                  value={newTenant.plan}
                  onChange={(e) => setNewTenant({ ...newTenant, plan: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none"
                >
                  <option value="STARTER">Starter Tier (Free)</option>
                  <option value="GROWTH">Pro Growth (₹2,499/mo)</option>
                  <option value="ENTERPRISE">Enterprise Scale (₹9,999/mo)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {isSubmitting ? 'Deploying...' : 'Deploy to PostgreSQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
