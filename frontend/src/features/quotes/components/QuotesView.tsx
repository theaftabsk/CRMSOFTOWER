'use client';

import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { FileText, Plus } from 'lucide-react';
import { formatNumber } from '../../../lib/utils';

export const QuotesView: React.FC = () => {
  const { quotes, addQuote } = useCRM();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Formal Quotations" 
        subtitle="Manage commercial quotations, discounts, and customer acceptance."
      />

      <div className="shadcn-card overflow-hidden">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Account Name</th>
              <th>Subtotal</th>
              <th>Tax (18% GST)</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(q => (
              <tr key={q.id}>
                <td className="font-mono font-semibold text-xs text-[#111111]">{q.quote_number}</td>
                <td className="font-semibold text-[#111111]">{q.account_name}</td>
                <td suppressHydrationWarning className="font-mono text-xs text-[#666666]">₹{formatNumber(q.subtotal)}</td>
                <td suppressHydrationWarning className="font-mono text-xs text-[#666666]">₹{formatNumber(q.tax)}</td>
                <td suppressHydrationWarning className="font-mono font-bold text-[#111111]">₹{formatNumber(q.total)}</td>
                <td>
                  <span className={`shadcn-badge ${q.status === 'Accepted' ? 'shadcn-badge-success' : 'shadcn-badge-default'}`}>
                    {q.status}
                  </span>
                </td>
                <td className="text-xs text-[#888888]">{q.created_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
