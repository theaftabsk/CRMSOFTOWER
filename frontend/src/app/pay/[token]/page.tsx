'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Printer, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface InvoiceData {
  invoice_number: string;
  account_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  items: Array<{ name: string; qty: number; unit_price: number; total: number }>;
  organization: {
    name: string;
    logo_url?: string;
    currency: string;
    address?: string;
  };
}

export default function PublicInvoicePaymentPage() {
  const params = useParams();
  const token = params?.token as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/public/invoices/${token}`);
      if (!res.ok) throw new Error('Invoice not found or link has expired');
      const json = await res.json();
      setInvoice(json.data || json);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInvoice();
  }, [token]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/public/invoices/${token}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: selectedMethod,
          gateway_ref: `PG_${selectedMethod}_${Date.now().toString().slice(-8)}`,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Payment processing failed');

      setPaymentSuccess(true);
      fetchInvoice();
    } catch (err: any) {
      alert(err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-[#666666] font-mono text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
          <span>Loading secure invoice payment portal...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 max-w-md w-full text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
          <h2 className="text-base font-semibold text-[#111111] mb-1">Invoice Portal Error</h2>
          <p className="text-sm text-[#666666]">{error || 'Invalid payment token'}</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'Paid';

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Action Bar (hidden in print) */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2 text-xs text-[#666666]">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>256-Bit SSL Encrypted Payment Portal</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#D4D4D4] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F8F8F8] transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Invoice Card */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-[#E5E5E5] gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {invoice.organization.logo_url ? (
                  <img
                    src={invoice.organization.logo_url}
                    alt={invoice.organization.name}
                    className="w-10 h-10 rounded object-cover border border-[#E5E5E5]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-[#111111] text-white flex items-center justify-center font-bold text-sm">
                    {invoice.organization.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-[#111111]">{invoice.organization.name}</h2>
                  <p className="text-xs text-[#666666]">{invoice.organization.address || 'Corporate Headquarters'}</p>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#666666]">Tax Invoice</span>
              <h1 className="text-xl font-bold font-mono text-[#111111]">{invoice.invoice_number}</h1>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold font-mono"
                style={{
                  backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7',
                  color: isPaid ? '#16A34A' : '#D97706',
                }}
              >
                {invoice.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#E5E5E5] text-xs">
            <div>
              <span className="text-[#666666] block text-[11px]">Billed To</span>
              <span className="font-semibold text-[#111111]">{invoice.account_name}</span>
            </div>
            <div>
              <span className="text-[#666666] block text-[11px]">Issue Date</span>
              <span className="font-mono text-[#111111]">{invoice.issue_date}</span>
            </div>
            <div>
              <span className="text-[#666666] block text-[11px]">Due Date</span>
              <span className="font-mono text-[#111111]">{invoice.due_date}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-[#666666] block text-[11px]">Outstanding Due</span>
              <span suppressHydrationWarning className="font-mono font-bold text-sm text-[#111111]">
                {invoice.organization.currency}{formatNumber(invoice.due_amount)}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 border-b border-[#E5E5E5]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#666666] uppercase text-[11px] tracking-wider">
                  <th className="pb-3 font-semibold">Item & Description</th>
                  <th className="pb-3 text-center font-semibold">Qty</th>
                  <th className="pb-3 text-right font-semibold">Unit Price</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={idx} className="py-3">
                      <td className="py-3 font-medium text-[#111111]">{item.name}</td>
                      <td className="py-3 text-center font-mono text-[#666666]">{item.qty}</td>
                      <td suppressHydrationWarning className="py-3 text-right font-mono text-[#666666]">
                        {invoice.organization.currency}{formatNumber(item.unit_price)}
                      </td>
                      <td suppressHydrationWarning className="py-3 text-right font-mono font-semibold text-[#111111]">
                        {invoice.organization.currency}{formatNumber(item.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="py-3">
                    <td className="py-3 font-medium text-[#111111]">Enterprise CRM License & Services</td>
                    <td className="py-3 text-center font-mono text-[#666666]">1</td>
                    <td suppressHydrationWarning className="py-3 text-right font-mono text-[#666666]">
                      {invoice.organization.currency}{formatNumber(invoice.total_amount)}
                    </td>
                    <td suppressHydrationWarning className="py-3 text-right font-mono font-semibold text-[#111111]">
                      {invoice.organization.currency}{formatNumber(invoice.total_amount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Totals */}
          <div className="pt-6 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-[#666666]">
                <span>Total Amount:</span>
                <span suppressHydrationWarning className="font-mono font-medium text-[#111111]">
                  {invoice.organization.currency}{formatNumber(invoice.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Amount Paid:</span>
                <span suppressHydrationWarning className="font-mono font-medium text-[#16A34A]">
                  {invoice.organization.currency}{formatNumber(invoice.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#E5E5E5] text-[#111111]">
                <span>Balance Due:</span>
                <span suppressHydrationWarning className="font-mono text-base text-[#111111]">
                  {invoice.organization.currency}{formatNumber(invoice.due_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Checkout Panel (hidden if already Paid, hidden in print) */}
        {!isPaid && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] print:hidden space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">Complete Payment</h3>
                <p className="text-xs text-[#666666]">Select your preferred instant payment method</p>
              </div>
              <span suppressHydrationWarning className="text-lg font-mono font-bold text-[#111111]">
                {invoice.organization.currency}{formatNumber(invoice.due_amount)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'UPI', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                { id: 'Card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard' },
                { id: 'NetBanking', label: 'Net Banking', desc: 'All Indian Banks' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id as any)}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedMethod === m.id
                      ? 'border-[#111111] bg-[#F8F8F8]'
                      : 'border-[#E5E5E5] hover:border-[#D4D4D4]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#111111]">{m.label}</div>
                  <div className="text-[11px] text-[#666666]">{m.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full flex items-center justify-center py-3 px-4 bg-[#111111] text-white rounded-lg text-sm font-medium hover:bg-[#262626] disabled:opacity-50 transition shadow-sm"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying Transaction...
                </>
              ) : (
                <span suppressHydrationWarning>
                  Pay {invoice.organization.currency}{formatNumber(invoice.due_amount)} Now
                </span>
              )}
            </button>
          </div>
        )}

        {isPaid && (
          <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-xl p-4 flex items-center space-x-3 text-[#16A34A] print:hidden">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-medium">
              This invoice is fully paid. You can print or download this receipt for your records.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
