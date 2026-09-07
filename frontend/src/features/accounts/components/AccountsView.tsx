'use client';

import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Building2, Plus, Search, Globe, Users, DollarSign, X } from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { accounts, addAccount } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [newAcc, setNewAcc] = useState({
    name: '',
    industry: 'Healthcare Technology',
    website: 'https://',
    annual_revenue: 15000000,
    employee_count: 50,
    billing_address: 'Tech Park, City Hub',
  });

  const filtered = accounts.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.name) return;
    addAccount(newAcc);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Accounts & Companies" 
        subtitle="Manage B2B company relationships, billing addresses, and enterprise accounts."
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary cursor-pointer">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>+ Add Account</span>
          </button>
        }
      />

      <div className="shadcn-card p-4 flex justify-between items-center">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search accounts by company name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadcn-input pl-9 w-full"
          />
        </div>
        <span className="text-xs text-[#666666] font-medium">{filtered.length} Enterprise Accounts</span>
      </div>

      <div className="shadcn-card overflow-hidden">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Industry</th>
              <th>Website</th>
              <th>Annual Revenue</th>
              <th>Employees</th>
              <th>Billing Address</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(acc => (
              <tr key={acc.id}>
                <td>
                  <span className="font-semibold text-[#111111] block">{acc.name}</span>
                  <span className="text-[10px] text-[#888888] font-mono">ID: {acc.id}</span>
                </td>
                <td className="text-xs text-[#444444]">{acc.industry}</td>
                <td>
                  {acc.website ? (
                    <a href={acc.website} target="_blank" rel="noreferrer" className="text-xs text-[#111111] hover:underline flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#888888]" />
                      <span>{acc.website.replace('https://', '')}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-[#888888]">-</span>
                  )}
                </td>
                <td className="font-mono font-medium text-[#111111]">
                  ₹{(acc.annual_revenue / 100000).toFixed(1)} Lakhs
                </td>
                <td className="text-xs text-[#666666]">{acc.employee_count} staff</td>
                <td className="text-xs text-[#666666] max-w-xs truncate">{acc.billing_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Add Enterprise Account</h3>
              <button onClick={() => setShowModal(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Company Name *</label>
                <input 
                  required
                  type="text" 
                  value={newAcc.name}
                  onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                  className="shadcn-input w-full"
                  placeholder="e.g. Tata Consultancy Services"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Industry</label>
                  <input 
                    type="text" 
                    value={newAcc.industry}
                    onChange={(e) => setNewAcc({ ...newAcc, industry: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Website</label>
                  <input 
                    type="text" 
                    value={newAcc.website}
                    onChange={(e) => setNewAcc({ ...newAcc, website: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Annual Revenue (₹)</label>
                  <input 
                    type="number" 
                    value={newAcc.annual_revenue}
                    onChange={(e) => setNewAcc({ ...newAcc, annual_revenue: Number(e.target.value) })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Employee Count</label>
                  <input 
                    type="number" 
                    value={newAcc.employee_count}
                    onChange={(e) => setNewAcc({ ...newAcc, employee_count: Number(e.target.value) })}
                    className="shadcn-input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#444444] font-medium mb-1">Billing Address</label>
                <input 
                  type="text" 
                  value={newAcc.billing_address}
                  onChange={(e) => setNewAcc({ ...newAcc, billing_address: e.target.value })}
                  className="shadcn-input w-full"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
