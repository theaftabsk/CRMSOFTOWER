'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Receipt, Plus, Search, Filter, Download, RefreshCw, 
  ExternalLink, MoreHorizontal, Edit3, Trash2, Copy, Check, 
  AlertTriangle, ArrowUpRight, ShieldCheck, CheckCircle2, 
  DollarSign, X, Printer, Send, CreditCard, ArrowRight, 
  Building2, Calendar, FileText, Layers, Clock, AlertCircle, QrCode
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatNumber } from '../../../lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface InvoicePayment {
  id: string;
  payment_number: string;
  amount: number;
  payment_date: string;
  method: string;
  notes?: string;
}

interface InvoiceItem {
  name?: string;
  product_name?: string;
  description?: string;
  qty?: number;
  unit_price?: number;
  total?: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  account_name: string;
  account_id?: string | null;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string; // Unpaid, Partial, Paid
  issue_date: string;
  due_date: string;
  payment_token?: string | null;
  items?: InvoiceItem[] | any;
  payments?: InvoicePayment[];
  account?: any;
}

interface InvoiceStats {
  totalCount: number;
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  overdueCount: number;
  collectionRatePercent: number;
}

export const InvoicesView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [historyInvoice, setHistoryInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('UPI');
  const [payNotes, setPayNotes] = useState<string>('');

  // Create/Edit form state
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formItems, setFormItems] = useState<Array<{ name: string; qty: number; unit_price: number }>>([
    { name: 'Custom SaaS Portal Development', qty: 1, unit_price: 50000 },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesData, statsData] = await Promise.all([
        api.getInvoices(),
        api.getInvoicesStats(),
      ]);

      if (Array.isArray(invoicesData)) {
        setInvoices(invoicesData);
      }
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.warn('Failed to load invoices:', err);
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
      if (!target.closest('.invoice-action-dock')) {
        setOpenDropdownId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const formCalculations = useMemo(() => {
    const subtotal = formItems.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.unit_price) || 0)), 0);
    const gstTax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstTax;
    return { subtotal, gstTax, grandTotal };
  }, [formItems]);

  const openCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    setFormInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormAccountName('');
    setFormIssueDate(today);
    setFormDueDate(due);
    setFormItems([{ name: 'Enterprise Cloud ERP Deployment', qty: 1, unit_price: 75000 }]);
    setShowCreateModal(true);
  };

  const openEditModal = (inv: Invoice) => {
    setEditingInvoice(inv);
    setFormInvoiceNumber(inv.invoice_number);
    setFormAccountName(inv.account_name);
    setFormIssueDate(inv.issue_date || new Date().toISOString().split('T')[0]);
    setFormDueDate(inv.due_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
    if (Array.isArray(inv.items) && inv.items.length > 0) {
      setFormItems(inv.items.map((it: any) => ({
        name: it.name || it.product_name || it.description || 'Deliverable',
        qty: Number(it.qty) || 1,
        unit_price: Number(it.unit_price) || 0,
      })));
    } else {
      setFormItems([{ name: 'Commercial Deliverable Scope', qty: 1, unit_price: inv.total_amount || 50000 }]);
    }
    setOpenDropdownId(null);
  };

  const openPaymentModal = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPayAmount(inv.due_amount);
    setPayMethod('UPI');
    setPayNotes('');
    setOpenDropdownId(null);
  };

  const handleAddItemRow = () => {
    setFormItems(prev => [...prev, { name: '', qty: 1, unit_price: 15000 }]);
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
        name: it.name || 'Commercial Item',
        qty: Number(it.qty) || 1,
        unit_price: Number(it.unit_price) || 0,
        total: (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
      }));

      await api.createInvoice({
        invoice_number: formInvoiceNumber,
        account_name: formAccountName,
        total_amount: formCalculations.grandTotal,
        paid_amount: 0,
        issue_date: formIssueDate,
        due_date: formDueDate,
        items: itemsPayload,
      });

      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create invoice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice || !formAccountName.trim()) return;

    setSubmitting(true);
    try {
      const itemsPayload = formItems.map(it => ({
        name: it.name || 'Commercial Item',
        qty: Number(it.qty) || 1,
        unit_price: Number(it.unit_price) || 0,
        total: (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
      }));

      await api.updateInvoice(editingInvoice.id, {
        invoice_number: formInvoiceNumber,
        account_name: formAccountName,
        total_amount: formCalculations.grandTotal,
        issue_date: formIssueDate,
        due_date: formDueDate,
        items: itemsPayload,
      });

      setEditingInvoice(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update invoice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice || payAmount <= 0) return;

    setSubmitting(true);
    try {
      await api.recordInvoicePayment(payingInvoice.id, {
        amount: payAmount,
        method: payMethod,
        notes: payNotes,
        payment_date: new Date().toISOString().split('T')[0],
      });

      setPayingInvoice(null);
      await loadData();
    } catch (err) {
      console.error('Failed to record payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await api.deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  const handleCopyPaymentReminder = (inv: Invoice) => {
    const text = `*INVOICE PAYMENT NOTICE: ${inv.invoice_number}*\nCustomer: ${inv.account_name}\nTotal Invoiced: ₹${formatNumber(inv.total_amount)}\nBalance Due: ₹${formatNumber(inv.due_amount)}\nDue Date: ${inv.due_date}\n\nPlease transfer payment to CRMSOFTOWER (UPI / Bank NEFT). Thank you!`;
    navigator.clipboard.writeText(text);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2500);
    setOpenDropdownId(null);
  };

  const handleCopyPayLink = (inv: Invoice) => {
    const url = `${window.location.origin}/pay?invoice=${inv.invoice_number}`;
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2500);
    setOpenDropdownId(null);
  };

  // Filtered Invoices
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.account_name.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'PAID') {
        matchesStatus = inv.status === 'Paid' || inv.due_amount <= 0;
      } else if (statusFilter === 'UNPAID') {
        matchesStatus = inv.status === 'Unpaid';
      } else if (statusFilter === 'PARTIAL') {
        matchesStatus = inv.status === 'Partial';
      } else if (statusFilter === 'OVERDUE') {
        matchesStatus = (inv.due_amount > 0) && (!!inv.due_date && inv.due_date < todayStr);
      }

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter, todayStr]);

  // Export CSV
  const handleExportCSV = () => {
    if (invoices.length === 0) return;
    const headers = ['Invoice Number', 'Customer / Account', 'Total Invoiced (INR)', 'Paid Amount (INR)', 'Due Balance (INR)', 'Status', 'Issue Date', 'Due Date'];
    const rows = invoices.map(i => [
      i.invoice_number,
      `"${i.account_name.replace(/"/g, '""')}"`,
      i.total_amount,
      i.paid_amount,
      i.due_amount,
      i.status,
      i.issue_date,
      i.due_date,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CRMSOFTOWER_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const computedStats = useMemo(() => {
    if (stats) return stats;
    const totalCount = invoices.length;
    const totalInvoiced = invoices.reduce((acc, i) => acc + (i.total_amount || 0), 0);
    const totalCollected = invoices.reduce((acc, i) => acc + (i.paid_amount || 0), 0);
    const totalOutstanding = invoices.reduce((acc, i) => acc + (i.due_amount || 0), 0);
    const paidCount = invoices.filter(i => i.status === 'Paid' || i.due_amount <= 0).length;
    const partialCount = invoices.filter(i => i.status === 'Partial').length;
    const unpaidCount = invoices.filter(i => i.status === 'Unpaid').length;
    const overdueCount = invoices.filter(i => i.due_amount > 0 && i.due_date && i.due_date < todayStr).length;
    const collectionRatePercent = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

    return {
      totalCount,
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      paidCount,
      partialCount,
      unpaidCount,
      overdueCount,
      collectionRatePercent,
    };
  }, [invoices, stats, todayStr]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-black text-white">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#111111]">Invoices & Billing Hub</h1>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Generate GST tax invoices, track accounts receivables, send payment reminders, and record collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh Invoices"
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

          <Link
            href="/payments"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#666666]" />
            <span>Payments Ledger</span>
          </Link>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111111] text-xs font-semibold text-white hover:bg-[#262626] transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Invoice</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Intelligence Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Total Invoiced</span>
            <Receipt className="w-4 h-4 text-[#111111]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            ₹{formatNumber(computedStats.totalInvoiced)}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            {computedStats.totalCount} total bills
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Collected Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#16A34A]">
            ₹{formatNumber(computedStats.totalCollected)}
          </div>
          <div className="mt-1 text-[11px] text-[#16A34A] font-semibold">
            {computedStats.paidCount} fully settled
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Outstanding Due</span>
            <AlertCircle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#DC2626]">
            ₹{formatNumber(computedStats.totalOutstanding)}
          </div>
          <div className="mt-1 text-[11px] text-[#DC2626] font-semibold">
            Receivables pending
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Unpaid Invoices</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            {computedStats.unpaidCount + computedStats.partialCount}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            {computedStats.partialCount} partial, {computedStats.unpaidCount} unpaid
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Overdue Invoices</span>
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#DC2626]">
            {computedStats.overdueCount}
          </div>
          <div className="mt-1 text-[11px] text-[#DC2626]">
            Passed payment deadline
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Collection Rate</span>
            <ArrowUpRight className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#16A34A]">
            {computedStats.collectionRatePercent}%
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            Recovery efficiency
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
            placeholder="Search by invoice #, customer / account name, or deliverable..."
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
          {(['ALL', 'UNPAID', 'PARTIAL', 'PAID', 'OVERDUE'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#666666] hover:bg-[#F4F4F5] border border-transparent'
              }`}
            >
              {tab === 'ALL' ? 'All Invoices' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Invoices Data Grid */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-visible shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <table className="crm-table w-full">
          <thead>
            <tr>
              <th className="text-left">Invoice # & Date</th>
              <th className="text-left">Customer / Account</th>
              <th className="text-right">Total Invoiced</th>
              <th className="text-right">Paid Amount</th>
              <th className="text-right">Balance Due</th>
              <th className="text-left">Payment Due Date</th>
              <th className="text-center">Status</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#888888]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#999999]" />
                  Loading invoices & receivables...
                </td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#888888]">
                  <Receipt className="w-8 h-8 text-[#CCCCCC] mx-auto mb-2" />
                  No invoices found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isDropdownOpen = openDropdownId === inv.id;
                const isOverdue = inv.due_amount > 0 && !!inv.due_date && inv.due_date < todayStr;

                return (
                  <tr key={inv.id} className="hover:bg-[#FAFAFA] transition-colors border-b border-[#F0F0F0]">
                    {/* Invoice # */}
                    <td className="py-3.5">
                      <div className="font-mono font-bold text-xs text-[#111111]">
                        {inv.invoice_number}
                      </div>
                      <div className="text-[11px] text-[#888888] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#AAAAAA]" />
                        <span>{inv.issue_date || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Customer Account */}
                    <td className="py-3.5">
                      <div className="font-semibold text-xs text-[#111111] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                        <span>{inv.account_name}</span>
                      </div>
                      <div className="text-[10px] text-[#888888] mt-0.5">
                        {inv.account_id ? `Account: ${inv.account_id}` : 'Direct Commercial B2B'}
                      </div>
                    </td>

                    {/* Total Invoiced */}
                    <td suppressHydrationWarning className="py-3.5 text-right font-mono font-bold text-xs text-[#111111]">
                      ₹{formatNumber(inv.total_amount)}
                    </td>

                    {/* Paid Amount */}
                    <td suppressHydrationWarning className="py-3.5 text-right font-mono text-xs">
                      {inv.paid_amount > 0 ? (
                        <button
                          onClick={() => setHistoryInvoice(inv)}
                          title="Click to view payment transaction details"
                          className="text-[#16A34A] hover:underline font-semibold inline-flex items-center gap-1 justify-end"
                        >
                          <span>₹{formatNumber(inv.paid_amount)}</span>
                          {inv.payments && inv.payments.length > 0 && (
                            <span className="text-[10px] px-1 py-0.2 bg-[#DCFCE7] text-[#15803D] rounded font-sans">
                              {inv.payments.length}
                            </span>
                          )}
                        </button>
                      ) : (
                        <span className="text-[#888888]">₹0</span>
                      )}
                    </td>

                    {/* Balance Due */}
                    <td suppressHydrationWarning className={`py-3.5 text-right font-mono font-bold text-xs ${inv.due_amount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                      ₹{formatNumber(inv.due_amount)}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5">
                      <div className="text-xs text-[#404040] font-mono">
                        {inv.due_date || 'Immediate'}
                      </div>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#DC2626] font-semibold mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overdue</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        inv.status === 'Paid' || inv.due_amount <= 0
                          ? 'bg-[#ECFDF5] text-[#16A34A] border-[#BBF7D0]'
                          : inv.status === 'Partial'
                          ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                          : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                      }`}>
                        {inv.due_amount <= 0 ? 'Paid' : inv.status}
                      </span>
                    </td>

                    {/* Actions Dock */}
                    <td className="py-3.5 text-right pr-4">
                      <div className="relative inline-block text-left invoice-action-dock">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.due_amount > 0 && (
                            <button
                              onClick={() => openPaymentModal(inv)}
                              className="px-2 py-1 rounded-lg bg-[#111111] text-white hover:bg-[#262626] text-xs font-semibold inline-flex items-center gap-1 transition-all shadow-sm"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Collect</span>
                            </button>
                          )}

                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            title="Print GST Tax Invoice"
                            className="p-1.5 rounded-lg border border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(isDropdownOpen ? null : inv.id);
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
                                Invoice: {inv.invoice_number}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setPreviewInvoice(inv);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#666666]" />
                              <span>View & Print GST Tax Invoice</span>
                            </button>

                            {inv.due_amount > 0 && (
                              <button
                                onClick={() => openPaymentModal(inv)}
                                className="w-full px-3 py-2 text-xs font-semibold text-[#16A34A] hover:bg-[#ECFDF5] flex items-center gap-2"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Record Direct Payment</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setHistoryInvoice(inv);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <Receipt className="w-3.5 h-3.5 text-[#666666]" />
                              <span>Payment Ledger ({inv.payments?.length || 0})</span>
                            </button>

                            <button
                              onClick={() => handleCopyPayLink(inv)}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
                              <span>Copy Public Payment Link</span>
                            </button>

                            <button
                              onClick={() => handleCopyPaymentReminder(inv)}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              {copiedId === inv.id ? (
                                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-[#666666]" />
                              )}
                              <span>Copy WhatsApp Reminder</span>
                            </button>

                            <div className="my-1 border-t border-[#F0F0F0]" />

                            <button
                              onClick={() => openEditModal(inv)}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#666666]" />
                              <span>Edit Invoice Details</span>
                            </button>

                            <button
                              onClick={() => {
                                setInvoiceToDelete(inv);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                              <span>Delete Invoice</span>
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

      {/* RECORD PAYMENT MODAL */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Record Inward Payment</h3>
                <p className="text-xs text-[#666666] mt-0.5">Log collected funds against {payingInvoice.invoice_number}.</p>
              </div>
              <button 
                onClick={() => setPayingInvoice(null)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex justify-between items-center font-mono">
                <span className="text-[#666666] font-sans">Current Balance Due:</span>
                <span suppressHydrationWarning className="font-bold text-sm text-[#DC2626]">
                  ₹{formatNumber(payingInvoice.due_amount)}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#111111]">
                    Payment Amount Received (₹) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPayAmount(payingInvoice.due_amount)}
                    className="text-[11px] font-semibold text-[#16A34A] hover:underline"
                  >
                    Pay Full Balance
                  </button>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max={payingInvoice.due_amount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] font-mono focus:border-[#111111] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:border-[#111111] focus:outline-none"
                >
                  <option value="UPI">UPI Instant (GPay / PhonePe / Paytm)</option>
                  <option value="Bank">Bank NEFT / RTGS Transfer</option>
                  <option value="Card">Corporate Credit / Debit Card</option>
                  <option value="Cash">Cash Receipt</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">
                  Transaction Notes / Bank Reference (UTR #)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR / Ref # 998822110033"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:border-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 rounded-lg border border-[#D4D4D4] bg-white font-semibold text-[#111111] hover:bg-[#F8F8F8] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || payAmount <= 0}
                  className="px-4 py-2 rounded-lg bg-[#111111] font-semibold text-white hover:bg-[#262626] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Generate GST Tax Invoice</h3>
                <p className="text-xs text-[#666666] mt-0.5">Create formal commercial bill with automatic 18% GST calculation.</p>
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
                    Invoice #
                  </label>
                  <input
                    type="text"
                    required
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] font-mono focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Customer / Account Name
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#111111]">Tax Invoice Line Items</span>
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
                        placeholder="Service / Deliverable Description"
                        required
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
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

              {/* Tax Summary Breakdown */}
              <div className="bg-[#F8F8F8] p-4 rounded-xl border border-[#E5E5E5] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Taxable Subtotal:</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Integrated GST (18%):</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.gstTax)}</span>
                </div>
                <div className="border-t border-[#E5E5E5] pt-1.5 flex justify-between font-bold text-sm text-[#111111]">
                  <span>Grand Total Invoice Amount:</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.grandTotal)}</span>
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
                  {submitting ? 'Generating...' : 'Issue GST Tax Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INVOICE MODAL */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Edit Invoice: {editingInvoice.invoice_number}</h3>
                <p className="text-xs text-[#666666] mt-0.5">Modify line items, customer details, or payment terms.</p>
              </div>
              <button 
                onClick={() => setEditingInvoice(null)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Invoice #
                  </label>
                  <input
                    type="text"
                    required
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] font-mono focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Customer / Account Name
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#111111]">Tax Invoice Line Items</span>
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
                        placeholder="Service / Deliverable Description"
                        required
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
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

              {/* Tax Summary Breakdown */}
              <div className="bg-[#F8F8F8] p-4 rounded-xl border border-[#E5E5E5] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Taxable Subtotal:</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Integrated GST (18%):</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.gstTax)}</span>
                </div>
                <div className="border-t border-[#E5E5E5] pt-1.5 flex justify-between font-bold text-sm text-[#111111]">
                  <span>Grand Total Invoice Amount:</span>
                  <span suppressHydrationWarning>₹{formatNumber(formCalculations.grandTotal)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="px-4 py-2 rounded-lg border border-[#D4D4D4] bg-white text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#111111] text-xs font-semibold text-white hover:bg-[#262626] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE GST TAX INVOICE MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-8 printable-invoice-modal">
            {/* Header with Print Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] print:hidden">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-black text-white">
                  <Receipt className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-[#111111]">Official GST Tax Invoice Document</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-xs font-semibold text-white hover:bg-[#262626] transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#F4F4F5]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Tax Invoice Sheet */}
            <div className="mt-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#111111]">CRMSOFTOWER SYSTEMS PVT LTD</h2>
                  <p className="text-xs text-[#666666] mt-0.5">Enterprise Cloud Architecture & CRM Solutions</p>
                  <p className="text-[11px] text-[#888888] mt-1">100 Cyber City, Sector 4, Bengaluru, KA 560100</p>
                  <p className="text-[11px] text-[#888888]">GSTIN: 29AABCT1330P1Z6 | HSN/SAC: 998313</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#888888]">
                    Tax Invoice / Bill of Supply
                  </div>
                  <span className="inline-block px-2.5 py-1 rounded bg-[#F4F4F5] border border-[#E5E5E5] text-xs font-mono font-bold text-[#111111] mt-1">
                    {previewInvoice.invoice_number}
                  </span>
                  <div className="text-[11px] text-[#888888] mt-1">
                    Date of Issue: {previewInvoice.issue_date || 'N/A'}
                  </div>
                  <div className="text-[11px] text-[#888888]">
                    Due Date: {previewInvoice.due_date || 'Immediate'}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#888888]">
                  Billed To (Customer Details):
                </div>
                <div className="text-sm font-bold text-[#111111] mt-1">
                  {previewInvoice.account_name}
                </div>
                <div className="text-xs text-[#666666] mt-0.5">
                  Tax Account Ref: {previewInvoice.account_id || 'CORP-CLIENT-TAX-ID'}
                </div>
                <div className="text-xs text-[#888888]">
                  Place of Supply: Karnataka (State Code: 29)
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-[#E5E5E5] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                    <th className="py-2.5">Description of Goods / Services</th>
                    <th className="py-2.5 text-center">HSN/SAC</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Rate (₹)</th>
                    <th className="py-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0] text-xs">
                  {Array.isArray(previewInvoice.items) && previewInvoice.items.length > 0 ? (
                    previewInvoice.items.map((it: any, idx: number) => {
                      const name = it.name || it.product_name || it.description || 'Enterprise Cloud Service';
                      const qty = Number(it.qty) || 1;
                      const rate = Number(it.unit_price) || Math.round(Number(it.total || 0) / qty);
                      const total = Number(it.total) || qty * rate;

                      return (
                        <tr key={idx}>
                          <td className="py-3 font-medium text-[#111111]">{name}</td>
                          <td className="py-3 text-center font-mono text-[#888888]">998313</td>
                          <td className="py-3 text-center font-mono text-[#666666]">{qty}</td>
                          <td suppressHydrationWarning className="py-3 text-right font-mono text-[#666666]">
                            ₹{formatNumber(rate)}
                          </td>
                          <td suppressHydrationWarning className="py-3 text-right font-mono font-bold text-[#111111]">
                            ₹{formatNumber(total)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="py-3 font-medium text-[#111111]">Enterprise SaaS Cloud Subscription & Licenses</td>
                      <td className="py-3 text-center font-mono text-[#888888]">998313</td>
                      <td className="py-3 text-center font-mono text-[#666666]">1</td>
                      <td suppressHydrationWarning className="py-3 text-right font-mono text-[#666666]">
                        ₹{formatNumber(previewInvoice.total_amount)}
                      </td>
                      <td suppressHydrationWarning className="py-3 text-right font-mono font-bold text-[#111111]">
                        ₹{formatNumber(previewInvoice.total_amount)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Tax & Balance Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-80 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#666666]">
                    <span>Invoice Total:</span>
                    <span suppressHydrationWarning>₹{formatNumber(previewInvoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-[#16A34A]">
                    <span>Amount Paid:</span>
                    <span suppressHydrationWarning>₹{formatNumber(previewInvoice.paid_amount)}</span>
                  </div>
                  <div className="border-t-2 border-[#111111] pt-2 flex justify-between font-bold text-sm text-[#111111]">
                    <span>Total Balance Due:</span>
                    <span suppressHydrationWarning className={previewInvoice.due_amount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}>
                      ₹{formatNumber(previewInvoice.due_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank & Remittance Information */}
              <div className="pt-4 border-t border-[#E5E5E5] grid grid-cols-2 gap-6 text-[11px] text-[#666666]">
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                  <div className="font-bold text-[#111111] mb-1">Bank Remittance Details:</div>
                  <p>Bank: HDFC Bank Limited (Commercial Tech Branch)</p>
                  <p>A/C Name: CRMSOFTOWER Systems Pvt Ltd</p>
                  <p>A/C Number: 50200088992211</p>
                  <p>IFSC Code: HDFC0001234 | UPI: crmsoftower@hdfcbank</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="inline-block border-b border-[#CCCCCC] w-48 ml-auto pb-1 mb-1" />
                  <div className="font-semibold text-[#111111]">Authorized Finance Controller</div>
                  <div className="text-[10px] text-[#888888]">CRMSOFTOWER Systems Private Limited</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY MODAL */}
      {historyInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Payment History: {historyInvoice.invoice_number}</h3>
                <p className="text-xs text-[#666666] mt-0.5">Collections ledger for {historyInvoice.account_name}</p>
              </div>
              <button 
                onClick={() => setHistoryInvoice(null)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-mono">
              <div>
                <span className="text-[#888888] block text-[10px] uppercase font-sans font-semibold">Total Invoiced</span>
                <span suppressHydrationWarning className="font-bold text-sm text-[#111111]">₹{formatNumber(historyInvoice.total_amount)}</span>
              </div>
              <div>
                <span className="text-[#888888] block text-[10px] uppercase font-sans font-semibold">Total Paid</span>
                <span suppressHydrationWarning className="font-bold text-sm text-[#16A34A]">₹{formatNumber(historyInvoice.paid_amount)}</span>
              </div>
              <div>
                <span className="text-[#888888] block text-[10px] uppercase font-sans font-semibold">Balance Due</span>
                <span suppressHydrationWarning className={`font-bold text-sm ${historyInvoice.due_amount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                  ₹{formatNumber(historyInvoice.due_amount)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-[#111111] mb-2 uppercase tracking-wider text-[10px]">
                Recorded Transactions ({historyInvoice.payments?.length || 0})
              </h4>

              {historyInvoice.payments && historyInvoice.payments.length > 0 ? (
                <div className="divide-y divide-[#E5E5E5] border border-[#E5E5E5] rounded-xl overflow-hidden bg-white">
                  {historyInvoice.payments.map((p, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-[#FAFAFA] transition-colors">
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-[#111111] flex items-center gap-1.5">
                          <span>{p.payment_number}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold bg-[#F4F4F5] text-[#666666]">
                            {p.method}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#888888] flex items-center gap-2">
                          <span>Date: {p.payment_date}</span>
                          {p.notes && <span>• Ref: {p.notes}</span>}
                        </div>
                      </div>
                      <div suppressHydrationWarning className="text-right font-mono font-bold text-[#16A34A]">
                        +₹{formatNumber(p.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-[#E5E5E5] rounded-xl text-xs text-[#888888]">
                  <CreditCard className="w-8 h-8 text-[#CCCCCC] mx-auto mb-2" />
                  No payments have been recorded yet for this invoice.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E5E5E5]">
              <Link
                href="/payments"
                className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
              >
                <span>Open Full Payments Ledger</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <div className="flex items-center gap-2">
                {historyInvoice.due_amount > 0 && (
                  <button
                    onClick={() => {
                      const target = historyInvoice;
                      setHistoryInvoice(null);
                      openPaymentModal(target);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#111111] text-white hover:bg-[#262626] text-xs font-semibold"
                  >
                    + Collect Remaining Due
                  </button>
                )}
                <button
                  onClick={() => setHistoryInvoice(null)}
                  className="px-3 py-1.5 rounded-lg border border-[#D4D4D4] bg-white text-xs font-semibold text-[#111111]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!invoiceToDelete}
        title="Delete Tax Invoice"
        message={`Are you sure you want to delete invoice ${invoiceToDelete?.invoice_number} for "${invoiceToDelete?.account_name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete Invoice"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteInvoice}
        onCancel={() => setInvoiceToDelete(null)}
      />
    </div>
  );
};
