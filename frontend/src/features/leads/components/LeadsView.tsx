'use client';

import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Target, Plus, Search, Filter, ArrowRightLeft, Mail, Phone, Building2, CheckCircle2, X } from 'lucide-react';
import { Lead } from '../../../types/crm';
import { formatNumber } from '../../../lib/utils';

export const LeadsView: React.FC = () => {
  const { leads, addLead, convertLead } = useCRM();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<Lead | null>(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New' as Lead['status'],
    source: 'Website',
    assigned_to: 'Vikram Sales Manager',
    expected_value: 50000,
    notes: '',
  });

  // Convert Form State
  const [convertDealTitle, setConvertDealTitle] = useState('');
  const [convertDealValue, setConvertDealValue] = useState(50000);

  const filteredLeads = leads.filter(lead => {
    const leadDisplayName = lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead';
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesSearch = leadDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalValue = leads.reduce((acc, l) => acc + (Number(l.expected_value) || 0), 0);
  const qualifiedCount = leads.filter(l => l.status === 'Qualified').length;
  const newCount = leads.filter(l => l.status === 'New').length;

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;
    addLead(newLead);
    setShowModal(false);
    setNewLead({
      name: '',
      company: '',
      email: '',
      phone: '',
      status: 'New',
      source: 'Website',
      assigned_to: 'Vikram Sales Manager',
      expected_value: 50000,
      notes: '',
    });
  };

  const handleConvert = (lead: Lead) => {
    convertLead(lead.id, {
      createDeal: true,
      dealTitle: convertDealTitle || `${lead.company} Deal`,
      dealValue: convertDealValue,
    });
    setShowConvertModal(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leads Management" 
        subtitle="Track incoming prospects, qualify leads, and convert them to accounts and deals."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Lead</span>
          </button>
        }
      />

      {/* KPI Stat Cards: Border > Shadow */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Total Leads</span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">{leads.length}</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">New Leads</span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">{newCount}</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Qualified</span>
          <span className="text-2xl font-bold text-[#16A34A] mt-1 block">{qualifiedCount}</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Pipeline Value</span>
          <span className="text-2xl font-bold text-[#111111] font-mono mt-1 block">₹{(totalValue / 1000).toFixed(0)}k</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="shadcn-card p-4 flex flex-col sm:flex-row justify-between gap-3 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadcn-input pl-9 w-full"
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#666666]" />
          <span className="text-xs text-[#666666]">Status:</span>
          {['ALL', 'New', 'Contacted', 'Qualified', 'Converted'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-2.5 py-1 rounded-md transition ${
                statusFilter === st 
                  ? 'bg-[#111111] text-white font-medium' 
                  : 'bg-[#F4F4F5] text-[#444444] hover:bg-[#E5E5E5]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Monochrome Leads Table */}
      <div className="shadcn-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Company</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Expected Value</th>
                <th>Assigned To</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#888888]">
                    No leads found matching your query.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <span className="font-semibold text-[#111111] block">
                        {lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead'}
                      </span>
                      <span className="text-[11px] text-[#666666]">Source: {lead.source}</span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-1.5 text-[#111111]">
                        <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                        <span>{lead.company}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center space-x-1 text-[#444444]">
                          <Mail className="w-3 h-3 text-[#888888]" />
                          <span>{lead.email}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[#666666]">
                          <Phone className="w-3 h-3 text-[#888888]" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`shadcn-badge ${
                        lead.status === 'Qualified' ? 'shadcn-badge-success' :
                        lead.status === 'Converted' ? 'shadcn-badge-default font-bold' :
                        lead.status === 'Contacted' ? 'shadcn-badge-warning' :
                        'shadcn-badge-default'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td suppressHydrationWarning className="font-mono font-medium text-[#111111]">
                      ₹{formatNumber(lead.expected_value)}
                    </td>
                    <td className="text-[#444444] text-xs">
                      {lead.assigned_to || lead.owner_name || 'Sales Team'}
                    </td>
                    <td className="text-right">
                      {lead.status !== 'Converted' ? (
                        <button
                          onClick={() => {
                            setShowConvertModal(lead);
                            setConvertDealTitle(`${lead.company} Deal`);
                            setConvertDealValue(Number(lead.expected_value) || 50000);
                          }}
                          className="btn-secondary text-xs py-1 px-2.5 space-x-1 inline-flex items-center"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Convert</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#16A34A] font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Converted
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-lg shadow-xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Create New Lead</h3>
              <button onClick={() => setShowModal(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Contact Name *</label>
                  <input 
                    required
                    type="text" 
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    className="shadcn-input w-full"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Company / School *</label>
                  <input 
                    required
                    type="text" 
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    className="shadcn-input w-full"
                    placeholder="e.g. ABC Technologies"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="shadcn-input w-full"
                    placeholder="name@company.com"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="shadcn-input w-full"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Expected Value (₹)</label>
                  <input 
                    type="number" 
                    value={newLead.expected_value}
                    onChange={(e) => setNewLead({ ...newLead, expected_value: Number(e.target.value) })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Status</label>
                  <select
                    value={newLead.status}
                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value as any })}
                    className="shadcn-input w-full bg-white"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#444444] font-medium mb-1">Lead Notes</label>
                <textarea 
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  className="shadcn-input w-full"
                  placeholder="Requirement details, budget expectations..."
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6">
            <h3 className="font-semibold text-base text-[#111111] pb-2 border-b border-[#E5E5E5]">
              Convert Lead: {showConvertModal.company}
            </h3>
            <p className="text-xs text-[#666666] my-3">
              This will convert lead <strong>{showConvertModal.name}</strong> into a verified Account, Contact, and create a Sales Deal.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Deal Title</label>
                <input 
                  type="text" 
                  value={convertDealTitle}
                  onChange={(e) => setConvertDealTitle(e.target.value)}
                  className="shadcn-input w-full"
                />
              </div>
              <div>
                <label className="block text-[#444444] font-medium mb-1">Deal Value (₹)</label>
                <input 
                  type="number" 
                  value={convertDealValue}
                  onChange={(e) => setConvertDealValue(Number(e.target.value))}
                  className="shadcn-input w-full"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-[#E5E5E5]">
              <button onClick={() => setShowConvertModal(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleConvert(showConvertModal)} className="btn-primary">
                Confirm & Convert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
