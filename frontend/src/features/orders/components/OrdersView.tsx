'use client';

import React from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { ShoppingBag } from 'lucide-react';
import { formatNumber } from '../../../lib/utils';

export const OrdersView: React.FC = () => {
  const orders = [
    { id: 'ORD-001', order_number: 'ORD-2026-001', account_name: 'Apex Health Systems', total: 141600, status: 'Confirmed', date: '2026-09-02' },
    { id: 'ORD-002', order_number: 'ORD-2026-002', account_name: 'Delhi Public School', total: 59000, status: 'Processing', date: '2026-09-05' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sales Orders" 
        subtitle="Manage confirmed sales orders, fulfillment, and customer contracts."
      />

      <div className="shadcn-card overflow-hidden">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Account Name</th>
              <th>Total Amount</th>
              <th>Order Status</th>
              <th>Order Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(ord => (
              <tr key={ord.id}>
                <td className="font-mono font-semibold text-xs text-[#111111]">{ord.order_number}</td>
                <td className="font-semibold text-[#111111]">{ord.account_name}</td>
                <td suppressHydrationWarning className="font-mono font-bold text-[#111111]">₹{formatNumber(ord.total)}</td>
                <td>
                  <span className="shadcn-badge shadcn-badge-success">{ord.status}</span>
                </td>
                <td className="text-xs text-[#888888]">{ord.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
