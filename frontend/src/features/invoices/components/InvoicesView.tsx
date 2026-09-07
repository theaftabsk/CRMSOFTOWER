'use client';

import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Receipt, Plus, CreditCard, X } from 'lucide-react';
import { formatNumber } from '../../../lib/utils';

export const InvoicesView: React.FC = () => {
  const { invoices, addPayment } = useCRM();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'UPI' | 'Bank' | 'Cash' | 'Card'>('UPI');
  const [payNotes, setPayNotes] = useState('');

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total_amount, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.paid_amount, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.due_amount, 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    addPayment(selectedInvoice.id, payAmount, payMethod, payNotes);
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Invoices & Billing" 
        subtitle="Track customer billing, generate GST tax invoices, and record incoming payments."
      />

      {/* KPI Cards: Border > Shadow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Total Invoiced</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">₹{formatNumber(totalInvoiced)}</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Collected Revenue</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">₹{formatNumber(totalCollected)}</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Outstanding Due</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#DC2626] mt-1 block">₹{formatNumber(totalOutstanding)}</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="shadcn-card overflow-hidden">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer / Account</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Balance Due</th>
              <th>Status</th>
              <th>Due Date</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td className="font-mono font-semibold text-xs text-[#111111]">{inv.invoice_number}</td>
                <td className="font-semibold text-[#111111]">{inv.account_name}</td>
                <td suppressHydrationWarning className="font-mono font-bold text-[#111111]">₹{formatNumber(inv.total_amount)}</td>
                <td suppressHydrationWarning className="font-mono text-[#16A34A]">₹{formatNumber(inv.paid_amount)}</td>
                <td suppressHydrationWarning className="font-mono text-[#DC2626] font-bold">₹{formatNumber(inv.due_amount)}</td>
                <td>
                  <span className={`shadcn-badge ${
                    inv.status === 'Paid' ? 'shadcn-badge-success' :
                    inv.status === 'Partial' ? 'shadcn-badge-warning' :
                    'shadcn-badge-danger'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="text-xs text-[#888888]">{inv.due_date}</td>
                <td className="text-right">
                  {inv.due_amount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPayAmount(inv.due_amount);
                      }}
                      className="btn-primary text-xs py-1 px-2.5 inline-flex items-center space-x-1"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Record Payment for {selectedInvoice.invoice_number}</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Amount to Pay (₹) *</label>
                <input 
                  required
                  type="number"
                  max={selectedInvoice.due_amount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="shadcn-input w-full"
                />
              </div>
              <div>
                <label className="block text-[#444444] font-medium mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="shadcn-input w-full bg-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank">Bank NEFT/RTGS</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-[#444444] font-medium mb-1">Payment Notes / Reference</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="shadcn-input w-full"
                  placeholder="e.g. UTR #1234567890"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setSelectedInvoice(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
