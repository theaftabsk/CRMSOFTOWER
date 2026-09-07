'use client';

import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { CreditCard } from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { payments } = useCRM();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payment Transactions Log" 
        subtitle="Complete ledger of client payments, transaction hashes, and payment channels."
      />

      <div className="shadcn-card overflow-hidden">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Invoice ID</th>
              <th>Amount Received</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td className="font-mono font-semibold text-xs text-[#111111]">{p.payment_number}</td>
                <td className="font-mono text-xs text-[#666666]">{p.invoice_id}</td>
                <td className="font-mono font-bold text-[#16A34A]">₹{p.amount.toLocaleString()}</td>
                <td>
                  <span className="shadcn-badge shadcn-badge-default">{p.method}</span>
                </td>
                <td className="text-xs text-[#666666]">{p.payment_date}</td>
                <td className="text-xs text-[#888888]">{p.notes || 'Direct payment'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
