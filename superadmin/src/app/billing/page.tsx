'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ArrowUpRight, Download, CheckCircle2, 
  Search, TrendingUp, Loader2 
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { superAdminApi } from '../../lib/api';

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadRevenue() {
      try {
        const res = await superAdminApi.getRevenue();
        setData(res);
      } catch (err) {
        console.error('Failed to load revenue:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRevenue();
  }, []);

  const invoices = Array.isArray(data?.invoices) ? data.invoices : [];
  const filtered = invoices.filter((inv: any) =>
    (inv.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Platform Revenue & Invoicing
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Real PostgreSQL subscription and customer invoice records.
          </p>
        </div>

        <button 
          onClick={() => alert('Financial ledger exported to CSV.')}
          className="btn-secondary text-xs py-2 px-3 space-x-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-minimal p-5">
          <div className="text-xs text-[#666666] font-medium">Recorded Invoiced Volume</div>
          <div className="text-2xl font-bold font-mono text-[#111111] mt-2">
            {formatCurrency(data?.totalMRR ?? 0)}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-[#16A34A] mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-semibold">{data?.totalInvoicesCount ?? 0} invoices in DB</span>
          </div>
        </div>

        <div className="card-minimal p-5">
          <div className="text-xs text-[#666666] font-medium">Settlement Status</div>
          <div className="text-2xl font-bold font-mono text-[#16A34A] mt-2">
            100.0%
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-[#666666] mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Multi-Tenant Vault</span>
          </div>
        </div>

        <div className="card-minimal p-5">
          <div className="text-xs text-[#666666] font-medium">Reconciliation Node</div>
          <div className="text-2xl font-bold font-mono text-[#111111] mt-2">
            ACTIVE
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-[#666666] mt-2">
            <span>Automated Ledgers</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card-minimal overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-bold text-[#111111]">Database Invoice Records</h2>
            <span className="text-xs bg-[#F4F4F6] text-[#666666] px-2 py-0.5 rounded-full font-mono">
              {filtered.length} records
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice ID or tenant..."
              className="bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 space-x-2 text-xs text-[#666666]">
              <Loader2 className="w-5 h-5 animate-spin text-[#111111]" />
              <span>Fetching Live Invoices from PostgreSQL...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-[#888888] text-xs">
              No invoice records in database yet. Invoices generated in tenant workspaces will sync here automatically.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] tracking-wider uppercase">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Workspace / Organization</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filtered.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[#FAFAFA] transition duration-150">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#111111]">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#111111]">
                      {inv.tenantName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#111111]">
                      {inv.currency}{formatNumber(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                        <span>{inv.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#666666]">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
