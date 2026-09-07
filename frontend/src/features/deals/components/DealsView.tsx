'use client';

import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { TrendingUp, Plus, DollarSign, Clock, Building2, User, ChevronRight, X } from 'lucide-react';
import { Deal } from '../../../types/crm';

const STAGES: Deal['stage'][] = [
  'Qualification',
  'Value Proposition',
  'Proposal Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

export const DealsView: React.FC = () => {
  const { deals, addDeal, updateDealStage } = useCRM();
  const [showModal, setShowModal] = useState(false);

  const [newDeal, setNewDeal] = useState({
    title: '',
    account_name: '',
    stage: 'Qualification' as Deal['stage'],
    value: 100000,
    closing_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    owner: 'Vikram Sales Manager',
    probability: 60,
  });

  const totalPipeline = deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
  const wonValue = deals.filter(d => d.stage === 'Closed Won').reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.title || !newDeal.account_name) return;
    addDeal(newDeal);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sales Deals & Pipeline" 
        subtitle="Manage deal stages, forecast revenue, and track pipeline momentum in real time."
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary cursor-pointer">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>+ Create Deal</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Total Pipeline</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">₹{(totalPipeline / 100000).toFixed(2)} Lakhs</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Closed Won Revenue</span>
          <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">₹{(wonValue / 100000).toFixed(2)} Lakhs</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Active Deals Count</span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">{deals.length} Opportunities</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const stageTotal = stageDeals.reduce((acc, d) => acc + d.value, 0);

          return (
            <div key={stage} className="w-72 flex-shrink-0 bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl p-3 flex flex-col">
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E5E5E5]">
                <div>
                  <span className="font-semibold text-xs text-[#111111] block">{stage}</span>
                  <span className="text-[10px] text-[#666666] font-mono">₹{(stageTotal / 1000).toFixed(0)}k</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-[#E5E5E5] text-[#111111]">
                  {stageDeals.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3 flex-1">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-6 text-[#999999] text-xs border border-dashed border-[#E5E5E5] rounded-lg">
                    No deals
                  </div>
                ) : (
                  stageDeals.map(deal => (
                    <div 
                      key={deal.id}
                      className="shadcn-card p-3.5 space-y-2 cursor-pointer hover:border-[#111111]"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-xs text-[#111111] leading-tight">{deal.title}</h4>
                        <span className="font-mono text-xs font-bold text-[#111111]">
                          ₹{(deal.value / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-[#666666]">
                        <Building2 className="w-3 h-3 text-[#888888]" />
                        <span>{deal.account_name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#888888] pt-2 border-t border-[#F0F0F0]">
                        <span>Owner: {(deal.owner || deal.owner_name || 'Admin').split(' ')[0]}</span>
                        <span>{deal.closing_date || deal.expected_close || 'N/A'}</span>
                      </div>

                      {/* Move Stage Quick Selector */}
                      <div className="pt-1">
                        <select
                          value={deal.stage}
                          onChange={(e) => updateDealStage(deal.id, e.target.value as any)}
                          className="w-full text-[10px] py-1 px-1.5 border border-[#E5E5E5] rounded bg-white text-[#444444] focus:outline-none"
                        >
                          {STAGES.map(s => (
                            <option key={s} value={s}>Move to: {s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Create Sales Deal</h3>
              <button onClick={() => setShowModal(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Deal Title *</label>
                <input 
                  required
                  type="text" 
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  className="shadcn-input w-full"
                  placeholder="e.g. Apex Hospital ERP Suite"
                />
              </div>
              <div>
                <label className="block text-[#444444] font-medium mb-1">Company / Account *</label>
                <input 
                  required
                  type="text" 
                  value={newDeal.account_name}
                  onChange={(e) => setNewDeal({ ...newDeal, account_name: e.target.value })}
                  className="shadcn-input w-full"
                  placeholder="e.g. Apex Health Systems"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Deal Value (₹)</label>
                  <input 
                    type="number" 
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Initial Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as any })}
                    className="shadcn-input w-full bg-white"
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
