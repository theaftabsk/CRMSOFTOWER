'use client';

import React, { useState } from 'react';
import { 
  X, QrCode, Copy, Check, ExternalLink, 
  Share2, ArrowRight, ShieldCheck, Zap 
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: any[];
}

export const PaymentLinkModal: React.FC<PaymentLinkModalProps> = ({
  isOpen,
  onClose,
  invoices,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(invoices[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);

  if (!isOpen) return null;

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId) || invoices[0];
  const payableAmount = selectedInvoice ? (selectedInvoice.due_amount ?? selectedInvoice.total_amount) : 5000;
  const paymentToken = selectedInvoice?.payment_token || selectedInvoice?.id || 'pay_demo_token_8892';
  
  // Construct online payment link
  const paymentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/pay/${paymentToken}` 
    : `http://localhost:3000/pay/${paymentToken}`;

  const vpa = 'billing@abctechnologies.upi';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `upi://pay?pa=${vpa}&pn=ABC%20Technologies&am=${payableAmount}&cu=INR&tn=Invoice%20${selectedInvoice?.invoice_number || 'Settlement'}`
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(vpa);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-xl border border-[#E5E5E5] shadow-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111111] leading-tight">
                Instant Payment Link &amp; UPI QR
              </h3>
              <p className="text-[11px] text-[#666666]">
                Shareable checkout link for instant client settlements
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Invoice Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#404040] mb-1">
              Select Invoice to Collect
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D4D4D4] rounded-lg focus:outline-none focus:border-[#111111]"
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} • {inv.account_name} (Due: ₹{inv.due_amount?.toLocaleString('en-IN') || inv.total_amount?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* QR Code & UPI Box */}
          <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl flex flex-col items-center text-center space-y-3">
            <div className="p-2 bg-white rounded-lg border border-[#E5E5E5] shadow-2xs">
              <img 
                src={qrUrl} 
                alt="UPI Payment QR Code" 
                className="w-36 h-36 object-contain"
              />
            </div>

            <div>
              <div className="text-lg font-bold font-mono text-[#111111]" suppressHydrationWarning>
                ₹{formatNumber(payableAmount)}
              </div>
              <span className="text-[11px] text-[#666666]">
                Scan with Google Pay, PhonePe, Paytm or BHIM
              </span>
            </div>

            {/* UPI ID Pill */}
            <div className="flex items-center space-x-1 px-3 py-1 bg-white border border-[#E5E5E5] rounded-full text-[11px] font-mono text-[#111111]">
              <span>UPI ID: {vpa}</span>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="ml-1 text-[#2563EB] hover:underline"
              >
                {copiedUPI ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Shareable Online Link */}
          <div>
            <label className="block text-[11px] font-semibold text-[#404040] mb-1">
              Shareable Direct Checkout Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={paymentUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 text-xs font-medium text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition flex items-center space-x-1.5 shadow-2xs cursor-pointer flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg flex items-center space-x-2 text-[11px] text-[#15803D]">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Secured with Razorpay &amp; Stripe end-to-end encryption.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#E5E5E5] flex items-center justify-between bg-[#FAFAFA]">
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#2563EB] hover:underline flex items-center space-x-1"
          >
            <span>Open Checkout Preview</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#111111] bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] rounded-lg transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
