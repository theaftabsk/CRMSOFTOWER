'use client';

import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Package, Plus, Search } from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, addProduct } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProd, setNewProd] = useState({
    code: 'PRD-NEW-01',
    name: '',
    category: 'Software Services',
    unit_price: 25000,
    stock: 50,
    gst_rate_percent: 18,
  });

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Products & Services" 
        subtitle="Catalog of software licenses, recurring services, and inventory pricing."
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>+ Add Product</span>
          </button>
        }
      />

      <div className="shadcn-card p-4 flex justify-between items-center">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search catalog..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="shadcn-input pl-9 w-full" />
        </div>
        <span className="text-xs text-[#666666]">{filtered.length} Products registered</span>
      </div>

      <div className="shadcn-card overflow-hidden">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock / Availability</th>
              <th>GST Rate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="font-mono text-xs font-semibold text-[#111111]">{p.code}</td>
                <td className="font-semibold text-[#111111]">{p.name}</td>
                <td className="text-xs text-[#666666]">{p.category}</td>
                <td className="font-mono font-bold text-[#111111]">₹{Number(p.unit_price).toLocaleString()}</td>
                <td className="text-xs text-[#444444]">{p.stock} units</td>
                <td className="text-xs text-[#666666]">{p.gst_rate_percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6">
            <h3 className="font-semibold text-base text-[#111111] pb-2 border-b border-[#E5E5E5]">Add Product to Catalog</h3>
            <form onSubmit={(e) => { e.preventDefault(); addProduct(newProd); setShowModal(false); }} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Product Name *</label>
                <input required type="text" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} className="shadcn-input w-full" placeholder="e.g. Annual CRM Maintenance" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Unit Price (₹)</label>
                  <input type="number" value={newProd.unit_price} onChange={(e) => setNewProd({ ...newProd, unit_price: Number(e.target.value) })} className="shadcn-input w-full" />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Stock</label>
                  <input type="number" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })} className="shadcn-input w-full" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
