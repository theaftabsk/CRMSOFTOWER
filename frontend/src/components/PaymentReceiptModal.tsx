'use client';

import React, { useState } from 'react';
import { 
  X, Printer, CheckCircle2, Copy, Check, 
  CreditCard, Building, Calendar, Hash, ArrowUpRight 
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  organization?: any;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  organization,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payment) return null;

  const handleCopyReceipt = () => {
    const text = `PAYMENT RECEIPT\nReceipt No: ${payment.payment_number}\nInvoice: ${payment.invoice?.invoice_number || payment.invoice_id || 'N/A'}\nClient: ${payment.invoice?.account_name || payment.account_name || 'Valued Client'}\nAmount: ₹${formatNumber(payment.amount)}\nMethod: ${payment.method}\nDate: ${payment.payment_date}\nNotes: ${payment.notes || 'Settled'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const orgName = organization?.name || 'ABC Technologies';
  const orgAddress = organization?.address || '123 Innovation Tech Park, Suite 402, City Hub';
  const clientName = payment.invoice?.account_name || payment.account_name || 'Client Account';
  const invoiceNumber = payment.invoice?.invoice_number || payment.invoice_id || 'N/A';
  const totalAmount = payment.invoice?.total_amount || payment.amount;
  const dueAmount = payment.invoice?.due_amount ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-xl border border-[#E5E5E5] shadow-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
              <CreditCard className="w-4 h-4 text-[#111111]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111111] leading-tight">
                Official Payment Receipt
              </h3>
              <p className="text-[11px] text-[#666666]">
                Transaction Voucher &amp; Proof of Settlement
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleCopyReceipt}
              className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] rounded-md transition"
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] rounded-md transition"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Voucher Content */}
        <div className="p-6 overflow-y-auto space-y-5 print:p-0 print:m-0" id="payment-voucher-content">
          {/* Voucher Header Strip */}
          <div className="border-b border-dashed border-[#D4D4D4] pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-[#111111] tracking-tight">{orgName}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-[#DCFCE7] text-[#16A34A] rounded border border-[#BBF7D0] flex items-center space-x-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>PAID</span>
                </span>
              </div>
              <p className="text-[11px] text-[#666666] mt-0.5 max-w-[260px] leading-relaxed">
                {orgAddress}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-[#888888] block">
                Receipt Number
              </span>
              <span className="text-xs font-mono font-bold text-[#111111]">
                {payment.payment_number}
              </span>
              <span className="text-[11px] text-[#666666] block mt-0.5 font-mono" suppressHydrationWarning>
                {payment.payment_date}
              </span>
            </div>
          </div>

          {/* Amount Hero Card */}
          <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] text-center space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#666666] block">
              Amount Received
            </span>
            <div 
              className="text-3xl font-bold font-mono text-[#111111] tracking-tight"
              suppressHydrationWarning
            >
              ₹{formatNumber(payment.amount)}
            </div>
            <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-white text-[#404040] rounded-md border border-[#E5E5E5] shadow-2xs font-mono">
              Mode: {payment.method}
            </span>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-[#E5E5E5] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888] block">
                Billed Client
              </span>
              <span className="font-semibold text-[#111111] block truncate">
                {clientName}
              </span>
              <span className="text-[11px] text-[#666666] block">
                Enterprise Account
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#E5E5E5] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888] block">
                Linked Invoice
              </span>
              <span className="font-mono font-bold text-[#111111] block">
                {invoiceNumber}
              </span>
              <div className="text-[11px] text-[#666666] flex items-center justify-between" suppressHydrationWarning>
                <span>Total: ₹{formatNumber(totalAmount)}</span>
                <span className="text-[#16A34A] font-medium">Due: ₹{formatNumber(dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Transaction Notes / UTR Reference */}
          <div className="p-3.5 bg-white rounded-lg border border-[#E5E5E5] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#111111] flex items-center space-x-1.5">
                <Hash className="w-3 h-3 text-[#666666]" />
                <span>Transaction &amp; Reference Notes</span>
              </span>
              <span className="text-[10px] text-[#888888] font-mono">
                Verified Ledger
              </span>
            </div>
            <p className="text-xs font-mono text-[#404040] bg-[#FAFAFA] p-2 rounded border border-[#F0F0F0] break-all">
              {payment.notes || `Direct ${payment.method} settlement against invoice ${invoiceNumber}`}
            </p>
          </div>

          {/* Digital Stamp / Verification Footer */}
          <div className="pt-3 border-t border-dashed border-[#D4D4D4] flex items-center justify-between text-[11px] text-[#888888]">
            <div className="flex items-center space-x-1.5 text-[#16A34A]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-medium text-[11px]">Electronically Signed &amp; Reconciled</span>
            </div>
            <span className="font-mono text-[10px]">
              CRM-LEDGER-{payment.id?.slice(-8) || 'VERIFIED'}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3.5 border-t border-[#E5E5E5] flex items-center justify-between bg-[#FAFAFA]">
          <button
            onClick={handleCopyReceipt}
            className="px-3 py-1.5 text-xs font-medium text-[#404040] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition flex items-center space-x-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Receipt' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#404040] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
