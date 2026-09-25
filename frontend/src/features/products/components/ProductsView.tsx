'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Package, Plus, Search, Filter, Download, RefreshCw, 
  ExternalLink, MoreHorizontal, Edit3, Trash2, Copy, Check, 
  AlertTriangle, ArrowUpRight, ShieldCheck, Flame, Box, 
  Layers, CheckCircle2, TrendingUp, DollarSign, X, SlidersHorizontal
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatNumber } from '../../../lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit_price: number;
  stock: number;
  gst_rate_percent: number;
  created_at?: string;
  description?: string;
}

const DEFAULT_CATEGORIES = [
  'Software Licenses',
  'Cloud Subscriptions',
  'Professional Services',
  'Hardware & Infrastructure',
];

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<ProductItem | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    category: 'Software Licenses',
    unit_price: 45000,
    stock: 50,
    gst_rate_percent: 18,
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        // High-density Enterprise Demo Catalog Fallback
        setProducts([
          {
            id: 'prd_1',
            code: 'PRD-ERP-CORE',
            name: 'Enterprise Cloud ERP Platform (Annual Per-Seat)',
            category: 'Software Licenses',
            unit_price: 75000,
            stock: 120,
            gst_rate_percent: 18,
            description: 'Core multi-tenant ERP platform covering finance, CRM pipeline, and supply chain telemetry.',
          },
          {
            id: 'prd_2',
            code: 'PRD-API-DEV',
            name: 'Developer Webhooks & API Gateway Access Tier',
            category: 'Cloud Subscriptions',
            unit_price: 35000,
            stock: 999,
            gst_rate_percent: 18,
            description: 'High-throughput REST API and WebSocket events gateway with 99.99% committed SLA.',
          },
          {
            id: 'prd_3',
            code: 'PRD-MED-SUITE',
            name: 'Apex Healthcare EHR & Clinic Integration Module',
            category: 'Software Licenses',
            unit_price: 180000,
            stock: 8,
            gst_rate_percent: 18,
            description: 'HIPAA & HL7 compliant patient lifecycle module for multi-specialty hospitals.',
          },
          {
            id: 'prd_4',
            code: 'PRD-CONS-ARCH',
            name: 'Senior Cloud Solutions Architecture Consulting (40 hrs)',
            category: 'Professional Services',
            unit_price: 250000,
            stock: 15,
            gst_rate_percent: 18,
            description: 'Dedicated cloud architect for custom tenant migration, VPC peering, and security audit.',
          },
          {
            id: 'prd_5',
            code: 'PRD-HW-GATEWAY',
            name: 'Industrial IoT Telematics Edge Gateway Appliance',
            category: 'Hardware & Infrastructure',
            unit_price: 85000,
            stock: 4,
            gst_rate_percent: 18,
            description: 'Ruggedized on-premise hardware node for automated shop-floor telemetry ingestion.',
          },
          {
            id: 'prd_6',
            code: 'PRD-SEC-SOC2',
            name: 'Annual Cyber Compliance & SOC2 Security Retainer',
            category: 'Professional Services',
            unit_price: 120000,
            stock: 25,
            gst_rate_percent: 18,
            description: 'Quarterly third-party penetration testing and continuous vulnerability mitigation.',
          },
          {
            id: 'prd_7',
            code: 'PRD-ZOOM-BOT',
            name: 'Automated AI Meeting Scribe & Transcript Intelligence',
            category: 'Cloud Subscriptions',
            unit_price: 18000,
            stock: 0,
            gst_rate_percent: 18,
            description: 'Real-time NLP speech-to-text integration for automated CRM notes generation.',
          },
        ]);
      }
    } catch (e) {
      console.warn('Could not load products, using fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleClickAway = () => setOpenDropdownId(null);
    window.addEventListener('click', handleClickAway);
    return () => window.removeEventListener('click', handleClickAway);
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === 'IN_STOCK') matchesStock = p.stock > 10;
      else if (stockFilter === 'LOW_STOCK') matchesStock = p.stock > 0 && p.stock <= 10;
      else if (stockFilter === 'OUT_OF_STOCK') matchesStock = p.stock === 0;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  // Executive KPI Calculations
  const calculatedKPIs = useMemo(() => {
    const totalItems = products.length;
    const totalValuation = products.reduce((acc, p) => acc + (p.unit_price * (p.stock || 1)), 0);
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const softwareCount = products.filter(p => p.category.includes('Software') || p.category.includes('Cloud')).length;
    const avgGST = totalItems > 0 
      ? Math.round(products.reduce((acc, p) => acc + (p.gst_rate_percent || 18), 0) / totalItems)
      : 18;

    return {
      totalItems,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      softwareCount,
      avgGST,
    };
  }, [products]);

  // Create Product Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) return;
    setSubmitting(true);
    try {
      const code = createForm.code || `PRD-${Date.now().toString().slice(-4)}`;
      const payload = { ...createForm, code };
      await api.createProduct(payload);
      
      // Optimistic update
      setProducts(prev => [
        { id: `prd_${Date.now()}`, ...payload },
        ...prev,
      ]);
      setShowCreateModal(false);
      setCreateForm({
        code: '',
        name: '',
        category: 'Software Licenses',
        unit_price: 45000,
        stock: 50,
        gst_rate_percent: 18,
        description: '',
      });
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Product Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);
    try {
      await api.updateProduct(editingProduct.id, editingProduct);
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to update product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Stock Adjustment Submit
  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;
    setSubmitting(true);
    try {
      const newStock = Math.max(0, stockAdjustProduct.stock + stockDelta);
      await api.updateProduct(stockAdjustProduct.id, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === stockAdjustProduct.id ? { ...p, stock: newStock } : p));
      setStockAdjustProduct(null);
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.deleteProduct(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = (p: ProductItem) => {
    const clone: ProductItem = {
      ...p,
      id: `prd_${Date.now()}`,
      code: `${p.code}-COPY`,
      name: `${p.name} (Copy)`,
    };
    setProducts(prev => [clone, ...prev]);
    api.createProduct(clone);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['SKU Code', 'Product / Service Name', 'Category', 'Unit Price (INR)', 'Stock Quantity', 'GST Rate %']
    ];
    filteredProducts.forEach(p => {
      rows.push([
        p.code,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.unit_price.toString(),
        p.stock.toString(),
        `${p.gst_rate_percent}%`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'crm_products_catalog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16">
      {/* Top Header Card */}
      <div className="liquid-glass p-5 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1c1c1e] to-[#000000] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111111] tracking-tight">Products &amp; Service Catalog</h1>
              <p className="text-xs text-[#666666] mt-0.5">
                Centralized B2B CPQ catalog: software licenses, cloud SaaS plans, consulting retainers, and inventory telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            title="Export Catalog to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh Catalog"
            className="p-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-liquid px-3.5 py-2 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Operations Intelligence Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Total SKUs</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{calculatedKPIs.totalItems}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Catalog Offerings</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#111111] font-semibold uppercase tracking-wider block">Inventory Value</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            ₹{formatNumber(calculatedKPIs.totalValuation)}
          </span>
          <span className="text-[10px] text-[#16A34A] mt-0.5 block font-medium">Estimated Asset ARR</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#2563EB] font-semibold uppercase tracking-wider block">Software &amp; SaaS</span>
          <span className="text-2xl font-bold font-mono text-[#2563EB] mt-1 block">{calculatedKPIs.softwareCount}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Digital Licenses</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#DC2626] font-semibold uppercase tracking-wider block">Low Stock Alert</span>
          <span className="text-2xl font-bold font-mono text-[#DC2626] mt-1 block">{calculatedKPIs.lowStockCount}</span>
          <span className="text-[10px] text-[#DC2626] mt-0.5 block font-medium">&lt; 10 Units Remaining</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Out of Stock</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{calculatedKPIs.outOfStockCount}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Zero Inventory</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#16A34A] font-semibold uppercase tracking-wider block">Standard GST</span>
          <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">{calculatedKPIs.avgGST}%</span>
          <span className="text-[10px] text-[#16A34A] mt-0.5 block font-medium">B2B Tax Bracket</span>
        </div>
      </div>

      {/* Filter, Search & Segmented Category Bar */}
      <div className="liquid-glass p-3.5 rounded-2xl flex flex-col md:flex-row justify-between gap-3 items-center border border-white/80 shadow-xs">
        {/* Precision Search Input (No icon overlap) */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by SKU code, title, or category..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] transition shadow-2xs"
          />
        </div>

        {/* Category & Stock Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`text-xs px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-[#111111] text-white font-semibold shadow-xs'
                : 'bg-white border border-[#E5E5E5] text-[#555555] hover:text-[#111111]'
            }`}
          >
            All Categories
          </button>

          {DEFAULT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#111111] text-white font-semibold shadow-xs'
                  : 'bg-white border border-[#E5E5E5] text-[#555555] hover:text-[#111111]'
              }`}
            >
              {cat.split(' ')[0]}
            </button>
          ))}

          <span className="text-[#D4D4D4] mx-1">|</span>

          {/* Stock Health Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-white border border-[#D4D4D4] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock (&gt;10)</option>
            <option value="LOW_STOCK">Low Stock (1-10)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Main Products Data Grid Table */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#666666] flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
            <span>Loading Products Catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#666666] space-y-2">
            <Package className="w-8 h-8 text-[#999999] mx-auto" />
            <p className="font-semibold text-[#111111]">No products found matching your filter criteria.</p>
            <p className="text-[11px]">Click "+ Add Product" to register a new offering in your CPQ catalog.</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="crm-table">
              <thead>
                <tr>
                  <th className="w-32">SKU Code</th>
                  <th>Product / Service Specification</th>
                  <th>Category</th>
                  <th className="text-right">Unit Price (INR)</th>
                  <th className="text-center">Inventory &amp; Stock</th>
                  <th className="text-center">GST Slab</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 10;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAFA] transition group">
                      {/* SKU Code */}
                      <td>
                        <span className="font-mono text-xs font-bold text-[#111111] bg-[#F4F4F5] border border-[#E5E5E5] px-2 py-0.5 rounded">
                          {p.code}
                        </span>
                      </td>

                      {/* Name & Subtitle */}
                      <td>
                        <div className="space-y-0.5">
                          <span className="font-semibold text-xs text-[#111111] block">
                            {p.name}
                          </span>
                          {p.description && (
                            <p className="text-[11px] text-[#666666] line-clamp-1 max-w-md">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-[#E5E5E5] bg-[#F8F8F8] text-[#555555]">
                          {p.category}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="text-right">
                        <span suppressHydrationWarning className="font-mono font-bold text-xs text-[#111111]">
                          ₹{formatNumber(p.unit_price)}
                        </span>
                      </td>

                      {/* Stock Health */}
                      <td className="text-center">
                        <button
                          onClick={() => {
                            setStockAdjustProduct(p);
                            setStockDelta(10);
                          }}
                          className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold cursor-pointer border transition ${
                            isOut
                              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title="Click to adjust stock count"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOut ? 'bg-red-600' : isLow ? 'bg-amber-600' : 'bg-emerald-600'
                          }`} />
                          <span>{p.stock} units</span>
                        </button>
                      </td>

                      {/* GST Rate */}
                      <td className="text-center font-mono text-xs text-[#666666]">
                        {p.gst_rate_percent}%
                      </td>

                      {/* Action Dock */}
                      <td className="text-right whitespace-nowrap relative">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="px-2.5 py-1 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* 3-Dot More Actions Menu */}
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              title="More Options"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === p.id ? null : p.id);
                              }}
                              className={`p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-black/[0.06] transition inline-flex items-center cursor-pointer ${
                                openDropdownId === p.id ? 'bg-black/[0.08] text-[#111111]' : ''
                              }`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {openDropdownId === p.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#E5E5E5] rounded-xl shadow-xl p-1.5 z-50 text-left"
                              >
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                                  Catalog Actions
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setEditingProduct(p);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] transition text-left cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">Edit Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setStockAdjustProduct(p);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] transition text-left cursor-pointer"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">Adjust Inventory</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    handleDuplicateProduct(p);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] transition text-left cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">Duplicate SKU</span>
                                </button>

                                <div className="border-t border-black/[0.06] my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setProductToDelete({ id: p.id, name: p.name });
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#DC2626] hover:bg-red-50/80 transition text-left cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                  <span className="font-semibold">Delete SKU</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE PRODUCT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-lg shadow-2xl p-6 animate-in fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Register New Product / Service</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[#444444] font-medium mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                    placeholder="Auto-generated"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[#444444] font-medium mb-1">Product / Service Title *</label>
                  <input
                    required
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. Enterprise Cloud ERP Multi-Tenant License"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    {DEFAULT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Unit Price (INR ₹) *</label>
                  <input
                    required
                    type="number"
                    value={createForm.unit_price}
                    onChange={(e) => setCreateForm({ ...createForm, unit_price: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={createForm.stock}
                    onChange={(e) => setCreateForm({ ...createForm, stock: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">GST Tax Rate (%)</label>
                  <select
                    value={createForm.gst_rate_percent}
                    onChange={(e) => setCreateForm({ ...createForm, gst_rate_percent: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  >
                    <option value={18}>18% (Standard IT Services)</option>
                    <option value={12}>12% (Telecom &amp; Hardware)</option>
                    <option value={5}>5% (Concessional)</option>
                    <option value={0}>0% (Tax Exempted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Description / CPQ Scope</label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Included features, SLA guarantees, or billing milestones..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#D4D4D4] rounded-lg text-xs font-semibold hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#262626] disabled:opacity-40"
                >
                  {submitting ? 'Registering...' : 'Save to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-lg shadow-2xl p-6 animate-in fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Edit Product Specification</h3>
              <button onClick={() => setEditingProduct(null)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[#444444] font-medium mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={editingProduct.code}
                    onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[#444444] font-medium mb-1">Product Title</label>
                  <input
                    required
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    {DEFAULT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Unit Price (INR ₹)</label>
                  <input
                    type="number"
                    value={editingProduct.unit_price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit_price: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">GST Tax Rate (%)</label>
                  <select
                    value={editingProduct.gst_rate_percent}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gst_rate_percent: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  >
                    <option value={18}>18% (Standard IT Services)</option>
                    <option value={12}>12% (Hardware)</option>
                    <option value={5}>5% (Concessional)</option>
                    <option value={0}>0% (Tax Exempted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-[#D4D4D4] rounded-lg text-xs font-semibold hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#262626] disabled:opacity-40"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADJUST INVENTORY MODAL */}
      {stockAdjustProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-sm shadow-2xl p-6 animate-in fade-in space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Adjust Inventory Units</h3>
              <button onClick={() => setStockAdjustProduct(null)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#111111]">{stockAdjustProduct.name}</span>
              <p className="text-[11px] text-[#666666] font-mono">Current Stock: {stockAdjustProduct.stock} units</p>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Add / Deduct Units (+ / -)</label>
                <div className="flex items-center space-x-2">
                  {[-10, -1, 5, 10, 50].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setStockDelta(d)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition ${
                        stockDelta === d 
                          ? 'bg-[#111111] text-white border-[#111111]' 
                          : 'bg-[#F4F4F5] text-[#111111] border-[#E5E5E5] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      {d > 0 ? `+${d}` : d}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] font-mono mt-2 focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="p-3 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] text-[11px] flex justify-between items-center">
                <span className="text-[#666666]">Resulting Stock:</span>
                <span className="font-mono font-bold text-sm text-[#111111]">
                  {Math.max(0, stockAdjustProduct.stock + stockDelta)} units
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setStockAdjustProduct(null)}
                  className="px-3.5 py-1.5 border border-[#D4D4D4] rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#262626]"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Product Deletion */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Delete Product SKU"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}" from your product catalog? Active quotes and deals referencing this product code will be archived.`}
        confirmLabel="Delete SKU"
        cancelLabel="Keep Product"
        isDestructive={true}
        onConfirm={handleDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
