'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, Plus, Search, Filter, Download, RefreshCw, 
  ExternalLink, MoreHorizontal, Edit3, Trash2, Copy, Check, 
  AlertTriangle, ArrowUpRight, ShieldCheck, CheckCircle2, 
  DollarSign, X, Printer, Send, ShoppingBag, ArrowRight, 
  Building2, Calendar, FileCheck, Layers
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatNumber } from '../../../lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface QuoteItem {
  id?: string;
  product_name: string;
  qty: number;
  unit_price: number;
  total: number;
}

interface Quote {
  id: string;
  quote_number: string;
  account_name: string;
  account_id?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: string; // Draft, Sent, Accepted, Rejected
  created_date?: string;
  items?: QuoteItem[];
  account?: any;
}

interface QuoteStats {
  totalCount: number;
  totalValue: number;
  acceptedCount: number;
  acceptedValue: number;
  sentCount: number;
  sentValue: number;
  draftCount: number;
  draftValue: number;
  rejectedCount: number;
  avgValue: number;
  winRatePercent: number;
}

export const QuotesView: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create/Edit
  const [formQuoteNumber, setFormQuoteNumber] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formStatus, setFormStatus] = useState('Draft');
  const [formItems, setFormItems] = useState<Array<{ product_name: string; qty: number; unit_price: number }>>([
    { product_name: 'Custom SaaS Portal Development', qty: 1, unit_price: 50000 },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [quotesData, statsData] = await Promise.all([
        api.getQuotes(),
        api.getQuotesStats(),
      ]);

      if (Array.isArray(quotesData)) {
        setQuotes(quotesData);
      }
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.warn('Failed to load quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.quote-action-dock')) {
        setOpenDropdownId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Form Subtotal and Total calculations
  const formCalculations = useMemo(() => {
    const subtotal = formItems.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.unit_price) || 0)), 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [formItems]);

  const openCreateModal = () => {
    setFormQuoteNumber(`QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormAccountName('');
    setFormStatus('Draft');
    setFormItems([{ product_name: 'Custom SaaS Portal Development', qty: 1, unit_price: 50000 }]);
    setShowCreateModal(true);
  };

  const openEditModal = (q: Quote) => {
    setEditingQuote(q);
    setFormQuoteNumber(q.quote_number);
    setFormAccountName(q.account_name);
    setFormStatus(q.status);
    if (q.items && q.items.length > 0) {
      setFormItems(q.items.map(it => ({ product_name: it.product_name, qty: it.qty, unit_price: it.unit_price })));
    } else {
      setFormItems([{ product_name: 'Service Offering', qty: 1, unit_price: q.subtotal || 50000 }]);
    }
    setOpenDropdownId(null);
  };

  const handleAddItemRow = () => {
    setFormItems(prev => [...prev, { product_name: '', qty: 1, unit_price: 10000 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (formItems.length <= 1) return;
    setFormItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    setFormItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccountName.trim()) return;

    setSubmitting(true);
    try {
      const itemsPayload = formItems.map(it => ({
        product_name: it.product_name || 'Standard Service',
        qty: Number(it.qty) || 1,
        unit_price: Number(it.unit_price) || 0,
        total: (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
      }));

      await api.createQuote({
        quote_number: formQuoteNumber,
        account_name: formAccountName,
        status: formStatus,
        subtotal: formCalculations.subtotal,
        tax: formCalculations.tax,
        total: formCalculations.total,
        items: itemsPayload,
      });

      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create quote:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote || !formAccountName.trim()) return;

    setSubmitting(true);
    try {
      const itemsPayload = formItems.map(it => ({
        product_name: it.product_name || 'Standard Service',
        qty: Number(it.qty) || 1,
        unit_price: Number(it.unit_price) || 0,
        total: (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
      }));

      await api.updateQuote(editingQuote.id, {
        quote_number: formQuoteNumber,
        account_name: formAccountName,
        status: formStatus,
        subtotal: formCalculations.subtotal,
        tax: formCalculations.tax,
        total: formCalculations.total,
        items: itemsPayload,
      });

      setEditingQuote(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update quote:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    setOpenDropdownId(null);
    try {
      await api.updateQuoteStatus(quoteId, newStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleConvertToOrder = async (quote: Quote) => {
    setOpenDropdownId(null);
    try {
      const res = await api.convertQuoteToOrder(quote.id);
      if (res && res.success) {
        await loadData();
        alert(`Quote ${quote.quote_number} successfully converted to Order ${res.order?.order_number || ''}!`);
      }
    } catch (err) {
      console.error('Failed to convert to order:', err);
    }
  };

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    try {
      await api.deleteQuote(quoteToDelete.id);
      setQuoteToDelete(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete quote:', err);
    }
  };

  const handleCopySummary = (q: Quote) => {
    const text = `*COMMERCIAL QUOTATION: ${q.quote_number}*\nClient: ${q.account_name}\nSubtotal: ₹${formatNumber(q.subtotal)}\nGST (18%): ₹${formatNumber(q.tax)}\nGrand Total: ₹${formatNumber(q.total)}\nStatus: ${q.status}\n\nThank you for choosing CRMSOFTOWER Enterprise Solutions.`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2500);
    setOpenDropdownId(null);
  };

  // Filtered Quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchesSearch = 
        q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.items && q.items.some(it => it.product_name.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesStatus = statusFilter === 'ALL' || q.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchTerm, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (quotes.length === 0) return;
    const headers = ['Quote Number', 'Client / Account', 'Subtotal (INR)', 'GST Tax 18% (INR)', 'Grand Total (INR)', 'Status', 'Date'];
    const rows = quotes.map(q => [
      q.quote_number,
      `"${q.account_name.replace(/"/g, '""')}"`,
      q.subtotal,
      q.tax,
      q.total,
      q.status,
      q.created_date ? new Date(q.created_date).toLocaleDateString('en-IN') : 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CRMSOFTOWER_Quotes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const computedStats = useMemo(() => {
    if (stats) return stats;
    const totalCount = quotes.length;
    const totalValue = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
    const acceptedCount = quotes.filter(q => q.status === 'Accepted').length;
    const acceptedValue = quotes.filter(q => q.status === 'Accepted').reduce((acc, q) => acc + (q.total || 0), 0);
    const sentCount = quotes.filter(q => q.status === 'Sent').length;
    const sentValue = quotes.filter(q => q.status === 'Sent').reduce((acc, q) => acc + (q.total || 0), 0);
    const draftCount = quotes.filter(q => q.status === 'Draft').length;
    const draftValue = quotes.filter(q => q.status === 'Draft').reduce((acc, q) => acc + (q.total || 0), 0);
    const rejectedCount = quotes.filter(q => q.status === 'Rejected').length;
    const avgValue = totalCount > 0 ? Math.round(totalValue / totalCount) : 0;
    const winRatePercent = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      totalValue,
      acceptedCount,
      acceptedValue,
      sentCount,
      sentValue,
      draftCount,
      draftValue,
      rejectedCount,
      avgValue,
      winRatePercent,
    };
  }, [quotes, stats]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-black text-white">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#111111]">Commercial Quotations</h1>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Build, dispatch, and track high-value enterprise quotes, commercial discounts, and client acceptance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh Quotes"
            className="p-2 rounded-lg border border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <Download className="w-3.5 h-3.5 text-[#666666]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111111] text-xs font-semibold text-white hover:bg-[#262626] transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Quote</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Intelligence Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Total Quotes</span>
            <FileText className="w-4 h-4 text-[#999999]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            {computedStats.totalCount}
          </div>
          <div className="mt-1 text-[11px] text-[#666666] flex items-center gap-1">
            <span>All records</span>
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Quoted Pipeline</span>
            <DollarSign className="w-4 h-4 text-[#111111]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            ₹{formatNumber(computedStats.totalValue)}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            Total proposals
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Won / Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#16A34A]">
            ₹{formatNumber(computedStats.acceptedValue)}
          </div>
          <div className="mt-1 text-[11px] text-[#16A34A] font-semibold">
            {computedStats.acceptedCount} quote{computedStats.acceptedCount === 1 ? '' : 's'} won
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Sent & In-Review</span>
            <Send className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            ₹{formatNumber(computedStats.sentValue)}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            {computedStats.sentCount} awaiting client
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Draft Proposals</span>
            <Layers className="w-4 h-4 text-[#999999]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            ₹{formatNumber(computedStats.draftValue)}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            {computedStats.draftCount} in preparation
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Win Rate</span>
            <ArrowUpRight className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            {computedStats.winRatePercent}%
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            Avg Size: ₹{formatNumber(computedStats.avgValue)}
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by quote #, client / account name, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#666666] hover:bg-[#F4F4F5] border border-transparent'
              }`}
            >
              {tab === 'ALL' ? 'All Quotes' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Quotations Data Grid */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-visible shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <table className="crm-table w-full">
          <thead>
            <tr>
              <th className="text-left">Quote # & Date</th>
              <th className="text-left">Client / Account</th>
              <th className="text-left">Items Breakdown</th>
              <th className="text-right">Subtotal</th>
              <th className="text-right">GST (18%)</th>
              <th className="text-right">Grand Total</th>
              <th className="text-center">Status</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#888888]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#999999]" />
                  Loading commercial quotations...
                </td>
              </tr>
            ) : filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#888888]">
                  <FileText className="w-8 h-8 text-[#CCCCCC] mx-auto mb-2" />
                  No quotations found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredQuotes.map((q) => {
                const isDropdownOpen = openDropdownId === q.id;
                const itemsCount = q.items?.length || 0;
                const firstItem = q.items?.[0]?.product_name || 'Standard Quotation Package';

                return (
                  <tr key={q.id} className="hover:bg-[#FAFAFA] transition-colors border-b border-[#F0F0F0]">
                    {/* Quote # */}
                    <td className="py-3.5">
                      <div className="font-mono font-bold text-xs text-[#111111]">
                        {q.quote_number}
                      </div>
                      <div className="text-[11px] text-[#888888] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#AAAAAA]" />
                        <span>
                          {q.created_date ? new Date(q.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                        </span>
                      </div>
                    </td>

                    {/* Account Name */}
                    <td className="py-3.5">
                      <div className="font-semibold text-xs text-[#111111] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                        <span>{q.account_name}</span>
                      </div>
                      <div className="text-[10px] text-[#888888] mt-0.5">
                        {q.account_id ? `Linked Account: ${q.account_id}` : 'Direct Commercial Client'}
                      </div>
                    </td>

                    {/* Line Items Preview */}
                    <td className="py-3.5 max-w-[260px]">
                      <div className="text-xs text-[#404040] truncate" title={firstItem}>
                        {firstItem}
                      </div>
                      {itemsCount > 1 && (
                        <div className="text-[10px] text-[#888888] mt-0.5">
                          +{itemsCount - 1} additional service item{itemsCount > 2 ? 's' : ''}
                        </div>
                      )}
                    </td>

                    {/* Subtotal */}
                    <td suppressHydrationWarning className="py-3.5 text-right font-mono text-xs text-[#666666]">
                      ₹{formatNumber(q.subtotal)}
                    </td>

                    {/* Tax */}
                    <td suppressHydrationWarning className="py-3.5 text-right font-mono text-xs text-[#666666]">
                      ₹{formatNumber(q.tax)}
                    </td>

                    {/* Total */}
                    <td suppressHydrationWarning className="py-3.5 text-right font-mono font-bold text-xs text-[#111111]">
                      ₹{formatNumber(q.total)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        q.status === 'Accepted'
                          ? 'bg-[#ECFDF5] text-[#16A34A] border-[#BBF7D0]'
                          : q.status === 'Sent'
                          ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                          : q.status === 'Rejected'
                          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                          : 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]'
                      }`}>
                        {q.status}
                      </span>
                    </td>

                    {/* Actions Dock */}
                    <td className="py-3.5 text-right pr-4">
                      <div className="relative inline-block text-left quote-action-dock">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewQuote(q)}
                            title="Preview / Print Formal Quotation"
                            className="p-1.5 rounded-lg border border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(isDropdownOpen ? null : q.id);
                            }}
                            className="p-1.5 rounded-lg border border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition-all"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* 3-Dot Dropdown */}
                        {isDropdownOpen && (
                          <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-[#E5E5E5] shadow-xl z-50 py-1 text-left animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-3 py-1.5 border-b border-[#F0F0F0]">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                                Actions: {q.quote_number}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setPreviewQuote(q);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-[#666666]" />
                              <span>View & Print PDF</span>
                            </button>

                            <button
                              onClick={() => handleCopySummary(q)}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              {copiedId === q.id ? (
                                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-[#666666]" />
                              )}
                              <span>Copy WhatsApp Text</span>
                            </button>

                            <div className="my-1 border-t border-[#F0F0F0]" />

                            {/* Status controls */}
                            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                              Update Status
                            </div>

                            {q.status !== 'Sent' && (
                              <button
                                onClick={() => handleStatusChange(q.id, 'Sent')}
                                className="w-full px-3 py-1.5 text-xs text-[#2563EB] hover:bg-[#EFF6FF] flex items-center gap-2"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Mark as Sent</span>
                              </button>
                            )}

                            {q.status !== 'Accepted' && (
                              <button
                                onClick={() => handleStatusChange(q.id, 'Accepted')}
                                className="w-full px-3 py-1.5 text-xs text-[#16A34A] hover:bg-[#ECFDF5] flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark as Accepted</span>
                              </button>
                            )}

                            {/* Convert to Order */}
                            <button
                              onClick={() => handleConvertToOrder(q)}
                              className="w-full px-3 py-1.5 text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-[#111111]" />
                              <span>Convert to Order</span>
                            </button>

                            <div className="my-1 border-t border-[#F0F0F0]" />

                            <button
                              onClick={() => openEditModal(q)}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#666666]" />
                              <span>Edit Details</span>
                            </button>

                            <button
                              onClick={() => {
                                setQuoteToDelete(q);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                              <span>Delete Quote</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE QUOTATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Generate Commercial Quotation</h3>
                <p className="text-xs text-[#666666] mt-0.5">Itemize products, calculate GST, and issue formal quote.</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Quote Reference #
                  </label>
                  <input
                    type="text"
                    required
                    value={formQuoteNumber}
                    onChange={(e) => setFormQuoteNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] font-mono focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Client / Account Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Health Systems"
                    value={formAccountName}
                    onChange={(e) => setFormAccountName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Initial Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent to Client</option>
                  <option value="Accepted">Accepted / Won</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Line Items Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#111111]">Line Items & Scope</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 border border-[#E5E5E5] p-3 rounded-lg bg-[#FAFAFA]">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Product / Service Description"
                        required
                        value={item.product_name}
                        onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white text-[#111111] focus:border-[#111111] focus:outline-none"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        required
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        className="w-16 px-2.5 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white text-[#111111] font-mono text-center focus:border-[#111111] focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Unit Price"
                        required
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                        className="w-28 px-2.5 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white text-[#111111] font-mono text-right focus:border-[#111111] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={formItems.length <= 1}
                        className={`p-1.5 rounded text-[#888888] hover:text-[#DC2626] ${formItems.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="bg-[#F8F8F8] p-4 rounded-xl border border-[#E5E5E5] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal:</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Tax (18% Standard GST):</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.tax)}</span>
                </div>
                <div className="border-t border-[#E5E5E5] pt-1.5 flex justify-between font-bold text-sm text-[#111111]">
                  <span>Grand Total:</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.total)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#D4D4D4] bg-white text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#111111] text-xs font-semibold text-white hover:bg-[#262626] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Save & Issue Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUOTATION MODAL */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Edit Quotation: {editingQuote.quote_number}</h3>
                <p className="text-xs text-[#666666] mt-0.5">Modify line items, client account, or quotation status.</p>
              </div>
              <button 
                onClick={() => setEditingQuote(null)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Quote Reference #
                  </label>
                  <input
                    type="text"
                    required
                    value={formQuoteNumber}
                    onChange={(e) => setFormQuoteNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] font-mono focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Client / Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formAccountName}
                    onChange={(e) => setFormAccountName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent to Client</option>
                  <option value="Accepted">Accepted / Won</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Line Items Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#111111]">Line Items & Scope</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 border border-[#E5E5E5] p-3 rounded-lg bg-[#FAFAFA]">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Product / Service Description"
                        required
                        value={item.product_name}
                        onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white text-[#111111] focus:border-[#111111] focus:outline-none"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        required
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        className="w-16 px-2.5 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white text-[#111111] font-mono text-center focus:border-[#111111] focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Unit Price"
                        required
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                        className="w-28 px-2.5 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white text-[#111111] font-mono text-right focus:border-[#111111] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={formItems.length <= 1}
                        className={`p-1.5 rounded text-[#888888] hover:text-[#DC2626] ${formItems.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="bg-[#F8F8F8] p-4 rounded-xl border border-[#E5E5E5] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal:</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Tax (18% Standard GST):</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.tax)}</span>
                </div>
                <div className="border-t border-[#E5E5E5] pt-1.5 flex justify-between font-bold text-sm text-[#111111]">
                  <span>Grand Total:</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.total)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-4 py-2 rounded-lg border border-[#D4D4D4] bg-white text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#111111] text-xs font-semibold text-white hover:bg-[#262626] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE / PRO-FORMA QUOTATION SHEET PREVIEW MODAL */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-8 printable-quote-modal">
            {/* Header with Print Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] print:hidden">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-black text-white">
                  <Printer className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-[#111111]">Official Commercial Quotation Sheet</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-xs font-semibold text-white hover:bg-[#262626] transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setPreviewQuote(null)}
                  className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#F4F4F5]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Formal Pro-Forma Quotation Body */}
            <div className="mt-6 space-y-6">
              {/* Company & Client Details */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#111111]">CRMSOFTOWER ENTERPRISE</h2>
                  <p className="text-xs text-[#666666] mt-0.5">Cloud Enterprise CRM & Architecture Systems</p>
                  <p className="text-[11px] text-[#888888] mt-1">100 Cyber City, Level 5, Bengaluru, KA 560100</p>
                  <p className="text-[11px] text-[#888888]">GSTIN: 29AABCT1330P1Z6 | CIN: U72200KA2024PTC001234</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-[#F4F4F5] border border-[#E5E5E5] text-[11px] font-mono font-bold text-[#111111]">
                    {previewQuote.quote_number}
                  </span>
                  <div className="text-[11px] text-[#888888] mt-1">
                    Date: {previewQuote.created_date ? new Date(previewQuote.created_date).toLocaleDateString('en-IN') : '25 Sep 2026'}
                  </div>
                  <div className="text-[11px] text-[#888888]">
                    Valid Until: 30 Days from Issue
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#888888]">
                  Quotation Prepared Exclusively For:
                </div>
                <div className="text-sm font-bold text-[#111111] mt-1">
                  {previewQuote.account_name}
                </div>
                <div className="text-xs text-[#666666] mt-0.5">
                  Attn: Procurement & Technology Operations Department
                </div>
                <div className="text-xs text-[#888888]">
                  Commercial Account Ref: {previewQuote.account_id || 'ACC-DIRECT-CORP'}
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-[#E5E5E5] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                    <th className="py-2.5">Scope / Item Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price (₹)</th>
                    <th className="py-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0] text-xs">
                  {previewQuote.items && previewQuote.items.length > 0 ? (
                    previewQuote.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-3 font-medium text-[#111111]">{it.product_name}</td>
                        <td className="py-3 text-center font-mono text-[#666666]">{it.qty}</td>
                        <td suppressHydrationWarning className="py-3 text-right font-mono text-[#666666]">
                          ₹{formatNumber(it.unit_price)}
                        </td>
                        <td suppressHydrationWarning className="py-3 text-right font-mono font-bold text-[#111111]">
                          ₹{formatNumber(it.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 font-medium text-[#111111]">Enterprise CRM Suite Commercial License</td>
                      <td className="py-3 text-center font-mono text-[#666666]">1</td>
                      <td suppressHydrationWarning className="py-3 text-right font-mono text-[#666666]">
                        ₹{formatNumber(previewQuote.subtotal)}
                      </td>
                      <td suppressHydrationWarning className="py-3 text-right font-mono font-bold text-[#111111]">
                        ₹{formatNumber(previewQuote.subtotal)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Tax & Total Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-72 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#666666]">
                    <span>Subtotal:</span>
                    <span suppressHydrationWarning>₹{formatNumber(previewQuote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#666666]">
                    <span>Integrated GST (18%):</span>
                    <span suppressHydrationWarning>₹{formatNumber(previewQuote.tax)}</span>
                  </div>
                  <div className="border-t-2 border-[#111111] pt-2 flex justify-between font-bold text-sm text-[#111111]">
                    <span>Total Amount (INR):</span>
                    <span suppressHydrationWarning>₹{formatNumber(previewQuote.total)}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Authorization */}
              <div className="pt-4 border-t border-[#E5E5E5] grid grid-cols-2 gap-6 text-[11px] text-[#666666]">
                <div>
                  <div className="font-bold text-[#111111] mb-1">Standard Terms & Conditions:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Prices are inclusive of standard 99.9% uptime cloud hosting.</li>
                    <li>Payment terms: 50% on commercial sign-off, 50% post-deployment.</li>
                    <li>Standard GST invoices will be issued upon formal acceptance.</li>
                  </ul>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="inline-block border-b border-[#CCCCCC] w-48 ml-auto pb-1 mb-1" />
                  <div className="font-semibold text-[#111111]">Authorized Commercial Signatory</div>
                  <div className="text-[10px] text-[#888888]">CRMSOFTOWER Systems Private Limited</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!quoteToDelete}
        title="Delete Commercial Quotation"
        message={`Are you sure you want to delete quotation ${quoteToDelete?.quote_number} for "${quoteToDelete?.account_name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete Quote"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteQuote}
        onCancel={() => setQuoteToDelete(null)}
      />
    </div>
  );
};
