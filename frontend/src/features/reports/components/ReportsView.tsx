'use client';

import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { BarChart3, TrendingUp, DollarSign, Target, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

export const ReportsView: React.FC = () => {
  const { leads, deals, invoices } = useCRM();

  const totalRevenue = invoices.reduce((acc, i) => acc + i.paid_amount, 0);
  const totalPipeline = deals.reduce((acc, d) => acc + d.value, 0);
  const wonDeals = deals.filter(d => d.stage === 'Closed Won').length;
  const winRate = deals.length > 0 ? ((wonDeals / deals.length) * 100).toFixed(1) : '0';

  const monthlySales = [
    { month: 'Apr', revenue: 45000, target: 40000 },
    { month: 'May', revenue: 78000, target: 60000 },
    { month: 'Jun', revenue: 95000, target: 80000 },
    { month: 'Jul', revenue: 112000, target: 100000 },
    { month: 'Aug', revenue: 135000, target: 120000 },
    { month: 'Sep', revenue: totalRevenue, target: 150000 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Sales pipeline velocity, conversion metrics, and revenue realization."
      />

      {/* KPI Cards: Border > Shadow */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Realized Revenue</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">₹{(totalRevenue / 100000).toFixed(2)}L</span>
          <span className="text-[11px] text-[#16A34A] font-medium mt-0.5 block">↑ 14.8% vs last month</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Win Rate</span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">{winRate}%</span>
          <span className="text-[11px] text-[#666666] mt-0.5 block">{wonDeals} deals closed won</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Total Pipeline</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">₹{(totalPipeline / 100000).toFixed(2)}L</span>
          <span className="text-[11px] text-[#666666] mt-0.5 block">Active sales opportunities</span>
        </div>
        <div className="shadcn-card p-4">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider block">Lead Conversion</span>
          <span className="text-2xl font-bold text-[#16A34A] mt-1 block">38.4%</span>
          <span className="text-[11px] text-[#666666] mt-0.5 block">Lead to Deal conversion</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="shadcn-card p-5">
          <h3 className="text-sm font-semibold text-[#111111] mb-1">Monthly Revenue vs Target (₹)</h3>
          <p className="text-xs text-[#666666] mb-4">Actual collections vs forecasted enterprise target</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip />
                <Bar dataKey="target" fill="#E5E5E5" name="Target (₹)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="#111111" name="Actual (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="shadcn-card p-5">
          <h3 className="text-sm font-semibold text-[#111111] mb-1">Revenue Trajectory (YTD)</h3>
          <p className="text-xs text-[#666666] mb-4">Cumulative monthly collection curve</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#111111" fill="#F4F4F5" strokeWidth={2} name="Collected Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
