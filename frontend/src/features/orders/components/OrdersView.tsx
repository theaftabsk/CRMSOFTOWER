'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Plus, Search, Filter, Download, RefreshCw, 
  ExternalLink, MoreHorizontal, Edit3, Trash2, Copy, Check, 
  AlertTriangle, ArrowUpRight, ShieldCheck, CheckCircle2, 
  DollarSign, X, Printer, Send, Package, Truck, ArrowRight, 
  Building2, Calendar, FileText, Layers, Clock, Receipt
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatNumber } from '../../../lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ZyvoLogo } from '../../../components/ZyvoLogo';

interface OrderItem {
  id?: string;
  product_name: string;
  qty: number;
  unit_price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  account_name: string;
  account_id?: string | null;
  total_amount: number;
  status: string; // Pending, Confirmed, Shipped, Delivered, Cancelled
  created_date?: string;
  items?: OrderItem[];
  account?: any;
}

interface OrderStats {
  totalCount: number;
  totalRevenue: number;
  deliveredCount: number;
  deliveredRevenue: number;
  confirmedCount: number;
  confirmedRevenue: number;
  shippedCount: number;
  shippedRevenue: number;
  pendingCount: number;
  pendingRevenue: number;
  cancelledCount: number;
  activePipeline: number;
  avgOrderValue: number;
  fulfillmentRatePercent: number;
}

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [manifestOrder, setManifestOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create/Edit
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formStatus, setFormStatus] = useState('Confirmed');
  const [formItems, setFormItems] = useState<Array<{ product_name: string; qty: number; unit_price: number }>>([
    { product_name: 'Custom SaaS Portal Development', qty: 1, unit_price: 50000 },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        api.getOrders(),
        api.getOrdersStats(),
      ]);

      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      }
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.warn('Failed to load orders:', err);
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
      if (!target.closest('.order-action-dock')) {
        setOpenDropdownId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Form Total calculation
  const formCalculations = useMemo(() => {
    const subtotal = formItems.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.unit_price) || 0)), 0);
    return { subtotal, total: subtotal };
  }, [formItems]);

  const openCreateModal = () => {
    setFormOrderNumber(`ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormAccountName('');
    setFormStatus('Confirmed');
    setFormItems([{ product_name: 'Enterprise Cloud Deployment Package', qty: 1, unit_price: 75000 }]);
    setShowCreateModal(true);
  };

  const openEditModal = (o: Order) => {
    setEditingOrder(o);
    setFormOrderNumber(o.order_number);
    setFormAccountName(o.account_name);
    setFormStatus(o.status);
    if (o.items && o.items.length > 0) {
      setFormItems(o.items.map(it => ({ product_name: it.product_name, qty: it.qty, unit_price: it.unit_price })));
    } else {
      setFormItems([{ product_name: 'Fulfillment Order Scope', qty: 1, unit_price: o.total_amount || 50000 }]);
    }
    setOpenDropdownId(null);
  };

  const handleAddItemRow = () => {
    setFormItems(prev => [...prev, { product_name: '', qty: 1, unit_price: 15000 }]);
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
        product_name: it.product_name || 'Commercial Item',
        qty: Number(it.qty) || 1,
        unit_price: Number(it.unit_price) || 0,
        total: (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
      }));

      await api.createOrder({
        order_number: formOrderNumber,
        account_name: formAccountName,
        status: formStatus,
        total_amount: formCalculations.total,
        items: itemsPayload,
      });

      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !formAccountName.trim()) return;

    setSubmitting(true);
    try {
      const itemsPayload = formItems.map(it => ({
        product_name: it.product_name || 'Commercial Item',
        qty: Number(it.qty) || 1,
        unit_price: Number(it.unit_price) || 0,
        total: (Number(it.qty) || 1) * (Number(it.unit_price) || 0),
      }));

      await api.updateOrder(editingOrder.id, {
        order_number: formOrderNumber,
        account_name: formAccountName,
        status: formStatus,
        total_amount: formCalculations.total,
        items: itemsPayload,
      });

      setEditingOrder(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setOpenDropdownId(null);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleConvertToInvoice = async (order: Order) => {
    setOpenDropdownId(null);
    try {
      const res = await api.convertOrderToInvoice(order.id);
      if (res && res.success) {
        alert(`Order ${order.order_number} successfully billed! Generated Invoice ${res.invoice?.invoice_number || ''}.`);
      }
    } catch (err) {
      console.error('Failed to bill invoice:', err);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await api.deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const handleCopySummary = (o: Order) => {
    const text = `*SALES ORDER DISPATCH: ${o.order_number}*\nCustomer: ${o.account_name}\nOrder Value: ₹${formatNumber(o.total_amount)}\nStatus: ${o.status}\nDate: ${o.created_date ? new Date(o.created_date).toLocaleDateString('en-IN') : 'Today'}\n\nCRMSOFTOWER Order & Logistics Operations`;
    navigator.clipboard.writeText(text);
    setCopiedId(o.id);
    setTimeout(() => setCopiedId(null), 2500);
    setOpenDropdownId(null);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.items && o.items.some(it => it.product_name.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesStatus = statusFilter === 'ALL' || o.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Client / Account', 'Total Amount (INR)', 'Fulfillment Status', 'Order Date'];
    const rows = orders.map(o => [
      o.order_number,
      `"${o.account_name.replace(/"/g, '""')}"`,
      o.total_amount,
      o.status,
      o.created_date ? new Date(o.created_date).toLocaleDateString('en-IN') : 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CRMSOFTOWER_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const computedStats = useMemo(() => {
    if (stats) return stats;
    const totalCount = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    const deliveredRevenue = orders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const confirmedCount = orders.filter(o => o.status === 'Confirmed').length;
    const confirmedRevenue = orders.filter(o => o.status === 'Confirmed').reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const shippedCount = orders.filter(o => o.status === 'Shipped').length;
    const shippedRevenue = orders.filter(o => o.status === 'Shipped').reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const pendingRevenue = orders.filter(o => o.status === 'Pending').reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;
    const activePipeline = confirmedCount + shippedCount;
    const avgOrderValue = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;
    const validOrders = totalCount - cancelledCount;
    const fulfillmentRatePercent = validOrders > 0 ? Math.round((deliveredCount / validOrders) * 100) : 0;

    return {
      totalCount,
      totalRevenue,
      deliveredCount,
      deliveredRevenue,
      confirmedCount,
      confirmedRevenue,
      shippedCount,
      shippedRevenue,
      pendingCount,
      pendingRevenue,
      cancelledCount,
      activePipeline,
      avgOrderValue,
      fulfillmentRatePercent,
    };
  }, [orders, stats]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-black text-white">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#111111]">Sales Orders & Fulfillment</h1>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Track confirmed sales orders, fulfillment stages, shipping manifests, and automatic invoice billing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh Orders"
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
            <span>+ Create Order</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Intelligence Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#999999]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            {computedStats.totalCount}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            All booked orders
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Booked Revenue</span>
            <DollarSign className="w-4 h-4 text-[#111111]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            ₹{formatNumber(computedStats.totalRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            Contracted value
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Fulfilled / Done</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#16A34A]">
            ₹{formatNumber(computedStats.deliveredRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-[#16A34A] font-semibold">
            {computedStats.deliveredCount} delivered
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>In Fulfillment</span>
            <Truck className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            {computedStats.activePipeline}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            Confirmed & Shipped
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Pending Intake</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            ₹{formatNumber(computedStats.pendingRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            {computedStats.pendingCount} awaiting processing
          </div>
        </div>

        <div className="liquid-glass-card p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#666666] text-xs">
            <span>Fulfillment Rate</span>
            <ArrowUpRight className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div suppressHydrationWarning className="mt-2 text-2xl font-bold font-mono text-[#111111]">
            {computedStats.fulfillmentRatePercent}%
          </div>
          <div className="mt-1 text-[11px] text-[#666666]">
            Avg Size: ₹{formatNumber(computedStats.avgOrderValue)}
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
            placeholder="Search by order #, client / account name, or item description..."
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
          {(['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'PENDING', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#666666] hover:bg-[#F4F4F5] border border-transparent'
              }`}
            >
              {tab === 'ALL' ? 'All Orders' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Orders Data Grid */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-visible shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <table className="crm-table w-full">
          <thead>
            <tr>
              <th className="text-left">Order # & Date</th>
              <th className="text-left">Customer / Account</th>
              <th className="text-left">Fulfillment Scope & Items</th>
              <th className="text-right">Total Amount</th>
              <th className="text-center">Fulfillment Status</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-[#888888]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#999999]" />
                  Loading sales orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-[#888888]">
                  <ShoppingBag className="w-8 h-8 text-[#CCCCCC] mx-auto mb-2" />
                  No sales orders found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const isDropdownOpen = openDropdownId === o.id;
                const itemsCount = o.items?.length || 0;
                const firstItem = o.items?.[0]?.product_name || 'Standard Deliverable';

                return (
                  <tr key={o.id} className="hover:bg-[#FAFAFA] transition-colors border-b border-[#F0F0F0]">
                    {/* Order # */}
                    <td className="py-3.5">
                      <div className="font-mono font-bold text-xs text-[#111111]">
                        {o.order_number}
                      </div>
                      <div className="text-[11px] text-[#888888] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#AAAAAA]" />
                        <span>
                          {o.created_date ? new Date(o.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                        </span>
                      </div>
                    </td>

                    {/* Customer Account */}
                    <td className="py-3.5">
                      <div className="font-semibold text-xs text-[#111111] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                        <span>{o.account_name}</span>
                      </div>
                      <div className="text-[10px] text-[#888888] mt-0.5">
                        {o.account_id ? `Account Ref: ${o.account_id}` : 'Direct Commercial Client'}
                      </div>
                    </td>

                    {/* Scope Preview */}
                    <td className="py-3.5 max-w-[280px]">
                      <div className="text-xs text-[#404040] truncate" title={firstItem}>
                        {firstItem}
                      </div>
                      {itemsCount > 1 && (
                        <div className="text-[10px] text-[#888888] mt-0.5">
                          +{itemsCount - 1} additional fulfillment item{itemsCount > 2 ? 's' : ''}
                        </div>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td suppressHydrationWarning className="py-3.5 text-right font-mono font-bold text-xs text-[#111111]">
                      ₹{formatNumber(o.total_amount)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        o.status === 'Delivered'
                          ? 'bg-[#ECFDF5] text-[#16A34A] border-[#BBF7D0]'
                          : o.status === 'Shipped'
                          ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                          : o.status === 'Confirmed'
                          ? 'bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]'
                          : o.status === 'Cancelled'
                          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                          : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                      }`}>
                        {o.status}
                      </span>
                    </td>

                    {/* Actions Dock */}
                    <td className="py-3.5 text-right pr-4">
                      <div className="relative inline-block text-left order-action-dock">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setManifestOrder(o)}
                            title="Print Delivery Manifest / Slip"
                            className="p-1.5 rounded-lg border border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(isDropdownOpen ? null : o.id);
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
                                Order: {o.order_number}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setManifestOrder(o);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#666666]" />
                              <span>Delivery Manifest Slip</span>
                            </button>

                            <button
                              onClick={() => handleCopySummary(o)}
                              className="w-full px-3 py-2 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              {copiedId === o.id ? (
                                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-[#666666]" />
                              )}
                              <span>Copy WhatsApp Text</span>
                            </button>

                            <div className="my-1 border-t border-[#F0F0F0]" />

                            {/* Status Progression */}
                            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                              Progress Status
                            </div>

                            {o.status !== 'Confirmed' && o.status !== 'Delivered' && (
                              <button
                                onClick={() => handleStatusChange(o.id, 'Confirmed')}
                                className="w-full px-3 py-1.5 text-xs text-[#15803D] hover:bg-[#F0FDF4] flex items-center gap-2"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Mark Confirmed</span>
                              </button>
                            )}

                            {o.status !== 'Shipped' && o.status !== 'Delivered' && (
                              <button
                                onClick={() => handleStatusChange(o.id, 'Shipped')}
                                className="w-full px-3 py-1.5 text-xs text-[#2563EB] hover:bg-[#EFF6FF] flex items-center gap-2"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Mark Shipped</span>
                              </button>
                            )}

                            {o.status !== 'Delivered' && (
                              <button
                                onClick={() => handleStatusChange(o.id, 'Delivered')}
                                className="w-full px-3 py-1.5 text-xs text-[#16A34A] hover:bg-[#ECFDF5] flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Delivered</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-[#F0F0F0]" />

                            {/* Bill to Invoice */}
                            <button
                              onClick={() => handleConvertToInvoice(o)}
                              className="w-full px-3 py-1.5 text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <Receipt className="w-3.5 h-3.5 text-[#111111]" />
                              <span>Bill to Invoice</span>
                            </button>

                            <button
                              onClick={() => openEditModal(o)}
                              className="w-full px-3 py-1.5 text-xs text-[#111111] hover:bg-[#F8F8F8] flex items-center gap-2"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#666666]" />
                              <span>Edit Order</span>
                            </button>

                            <button
                              onClick={() => {
                                setOrderToDelete(o);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                              <span>Delete Order</span>
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

      {/* CREATE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Register Sales Order</h3>
                <p className="text-xs text-[#666666] mt-0.5">Record customer sales contract and schedule fulfillment.</p>
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
                    Order Reference #
                  </label>
                  <input
                    type="text"
                    required
                    value={formOrderNumber}
                    onChange={(e) => setFormOrderNumber(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Pending">Pending Processing</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Line Items Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#111111]">Order Deliverables & Scope</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Deliverable</span>
                  </button>
                </div>

                <div className="space-y-2 border border-[#E5E5E5] p-3 rounded-lg bg-[#FAFAFA]">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item / Service Description"
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

              {/* Total Summary */}
              <div className="bg-[#F8F8F8] p-4 rounded-xl border border-[#E5E5E5] flex justify-between items-center font-mono text-xs">
                <span className="font-sans font-semibold text-[#666666]">Total Contract Value:</span>
                <span suppressHydrationWarning className="font-bold text-base text-[#111111]">
                  ₹{formatNumber(formCalculations.total)}
                </span>
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
                  {submitting ? 'Registering...' : 'Save & Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Edit Sales Order: {editingOrder.order_number}</h3>
                <p className="text-xs text-[#666666] mt-0.5">Modify fulfillment items, customer account, or status.</p>
              </div>
              <button 
                onClick={() => setEditingOrder(null)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Order Reference #
                  </label>
                  <input
                    type="text"
                    required
                    value={formOrderNumber}
                    onChange={(e) => setFormOrderNumber(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Pending">Pending Processing</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Line Items Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#111111]">Order Deliverables & Scope</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Deliverable</span>
                  </button>
                </div>

                <div className="space-y-2 border border-[#E5E5E5] p-3 rounded-lg bg-[#FAFAFA]">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item / Service Description"
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

              {/* Total Summary */}
              <div className="bg-[#F8F8F8] p-4 rounded-xl border border-[#E5E5E5] flex justify-between items-center font-mono text-xs">
                <span className="font-sans font-semibold text-[#666666]">Total Contract Value:</span>
                <span suppressHydrationWarning className="font-bold text-base text-[#111111]">
                  ₹{formatNumber(formCalculations.total)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
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

      {/* PRINTABLE ORDER FULFILLMENT MANIFEST MODAL */}
      {manifestOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-8 printable-order-modal">
            {/* Header with Print Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] print:hidden">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-black text-white">
                  <Truck className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-[#111111]">Official Order Fulfillment & Dispatch Manifest</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-xs font-semibold text-white hover:bg-[#262626] transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setManifestOrder(null)}
                  className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#F4F4F5]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Formal Manifest Slip */}
            <div className="mt-6 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <ZyvoLogo height={24} className="text-[#111111] mb-2" />
                  <h2 className="text-xl font-bold tracking-tight text-[#111111]">ZYVO LOGISTICS</h2>
                  <p className="text-xs text-[#666666] mt-0.5">Enterprise Delivery & Cloud Provisioning Center</p>
                  <p className="text-[11px] text-[#888888] mt-1">Hub: Bengaluru Tech Park, Zone 4, KA</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-[#F4F4F5] border border-[#E5E5E5] text-[11px] font-mono font-bold text-[#111111]">
                    {manifestOrder.order_number}
                  </span>
                  <div className="text-[11px] text-[#888888] mt-1">
                    Booked Date: {manifestOrder.created_date ? new Date(manifestOrder.created_date).toLocaleDateString('en-IN') : 'Today'}
                  </div>
                  <div className="text-[11px] text-[#888888] font-semibold text-[#15803D]">
                    Status: {manifestOrder.status}
                  </div>
                </div>
              </div>

              {/* Delivery Consignee */}
              <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#888888]">
                  Consignee & Delivery Account:
                </div>
                <div className="text-sm font-bold text-[#111111] mt-1">
                  {manifestOrder.account_name}
                </div>
                <div className="text-xs text-[#666666] mt-0.5">
                  Fulfillment Destination: Authorized Customer Premises / Secure Cloud Instance
                </div>
              </div>

              {/* Deliverable Items Schedule */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-[#E5E5E5] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                    <th className="py-2.5">Scope Description</th>
                    <th className="py-2.5 text-center">Fulfillment Qty</th>
                    <th className="py-2.5 text-right">Unit Value (₹)</th>
                    <th className="py-2.5 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0] text-xs">
                  {manifestOrder.items && manifestOrder.items.length > 0 ? (
                    manifestOrder.items.map((it, idx) => (
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
                      <td className="py-3 font-medium text-[#111111]">Enterprise Fulfillment Order Package</td>
                      <td className="py-3 text-center font-mono text-[#666666]">1</td>
                      <td suppressHydrationWarning className="py-3 text-right font-mono text-[#666666]">
                        ₹{formatNumber(manifestOrder.total_amount)}
                      </td>
                      <td suppressHydrationWarning className="py-3 text-right font-mono font-bold text-[#111111]">
                        ₹{formatNumber(manifestOrder.total_amount)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Value */}
              <div className="flex justify-end pt-2">
                <div className="w-72 space-y-1.5 font-mono text-xs">
                  <div className="border-t-2 border-[#111111] pt-2 flex justify-between font-bold text-sm text-[#111111]">
                    <span>Total Booked Value:</span>
                    <span suppressHydrationWarning>₹{formatNumber(manifestOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Receipt Sign-off */}
              <div className="pt-4 border-t border-[#E5E5E5] grid grid-cols-2 gap-6 text-[11px] text-[#666666]">
                <div>
                  <div className="font-bold text-[#111111] mb-1">Fulfillment Verification:</div>
                  <p>All items inspected, quality-checked, and dispatched in compliance with enterprise SLA.</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="inline-block border-b border-[#CCCCCC] w-48 ml-auto pb-1 mb-1" />
                  <div className="font-semibold text-[#111111]">Recipient Authorized Signature</div>
                  <div className="text-[10px] text-[#888888]">Received in Good Order</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!orderToDelete}
        title="Delete Sales Order"
        message={`Are you sure you want to delete sales order ${orderToDelete?.order_number} for "${orderToDelete?.account_name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete Order"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteOrder}
        onCancel={() => setOrderToDelete(null)}
      />
    </div>
  );
};
