'use client';

import React, { useState } from 'react';
import { 
  X, CheckCircle2, Loader2, ArrowRight, 
  CreditCard, DollarSign, Calendar, Hash, FileText 
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: any[];
  onPaymentSuccess: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onPaymentSuccess,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<string>('UPI');
  const [referenceId, setReferenceId] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    setError(null);
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      setAmount(inv.due_amount?.toString() || inv.total_amount?.toString() || '');
    }
  };

  const handleSetFullDue = () => {
    if (selectedInvoice) {
      setAmount(selectedInvoice.due_amount?.toString() || selectedInvoice.total_amount?.toString() || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      setError('Please select an invoice to apply payment.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post('/payments', {
        invoiceId: selectedInvoiceId,
        amount: numAmount,
        method,
        payment_date: paymentDate,
        reference_id: referenceId,
        notes,
      });

      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-xl border border-[#E5E5E5] shadow-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111111] leading-tight">
                Record Payment
              </h3>
              <p className="text-[11px] text-[#666666]">
                Credit client collection against invoice &amp; generate ledger receipt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-lg">
              {error}
            </div>
          )}

          {/* Invoice Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#404040] mb-1">
              Select Linked Invoice <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleSelectInvoice(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D4D4D4] rounded-lg focus:outline-none focus:border-[#111111]"
            >
              <option value="">-- Choose an Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} • {inv.account_name} (Due: ₹{inv.due_amount?.toLocaleString('en-IN') || inv.total_amount?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Invoice Details Pill */}
          {selectedInvoice && (
            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#111111]">{selectedInvoice.account_name}</span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded">
                  Status: {selectedInvoice.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1 border-t border-[#E5E5E5]" suppressHydrationWarning>
                <div>
                  <span className="text-[#888888] block text-[10px]">TOTAL</span>
                  <span className="font-semibold text-[#111111]">₹{formatNumber(selectedInvoice.total_amount)}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px]">PAID</span>
                  <span className="font-semibold text-[#16A34A]">₹{formatNumber(selectedInvoice.paid_amount || 0)}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px]">REMAINING DUE</span>
                  <span className="font-bold text-[#DC2626]">₹{formatNumber(selectedInvoice.due_amount ?? selectedInvoice.total_amount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input with 1-Click Pay Due Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#404040]">
                Payment Amount Received (₹) <span className="text-[#DC2626]">*</span>
              </label>
              {selectedInvoice && (
                <button
                  type="button"
                  onClick={handleSetFullDue}
                  className="text-[10px] text-[#2563EB] font-medium hover:underline cursor-pointer"
                >
                  Pay Full Balance (₹{formatNumber(selectedInvoice.due_amount ?? selectedInvoice.total_amount)})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-mono font-bold text-[#666666]">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold text-[#111111] bg-white border border-[#D4D4D4] rounded-lg focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          {/* Payment Method & Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#404040] mb-1">
                Payment Channel
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:outline-none focus:border-[#111111]"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Stripe">Stripe Online</option>
                <option value="Razorpay">Razorpay Gateway</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#404040] mb-1">
                Settlement Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D4D4D4] rounded-lg focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          {/* Reference ID / UTR */}
          <div>
            <label className="block text-[11px] font-semibold text-[#404040] mb-1">
              Transaction Hash / UTR / Reference ID
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. UTR-491028471920 or CHQ-991823"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D4D4D4] rounded-lg focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-[#404040] mb-1">
              Notes &amp; Internal Memo (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Part settlement for milestone 1"
              className="w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#404040] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Record &amp; Settle Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
