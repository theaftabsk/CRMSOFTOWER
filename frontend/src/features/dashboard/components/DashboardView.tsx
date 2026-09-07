'use client';

import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { 
  Target, TrendingUp, Users, CreditCard,
  ArrowUpRight, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, CartesianGrid 
} from 'recharts';
import Link from 'next/link';

export const DashboardView: React.FC = () => {
  const { leads, deals, tasks, invoices, organization } = useCRM();

  // Calculated KPI Values
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
  
  const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0);
  const wonDealsValue = deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + d.value, 0);
  
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const urgentTasks = tasks.filter(t => t.priority === 'Urgent' && t.status === 'Pending').length;

  const totalCollectedRevenue = invoices.reduce((sum, i) => sum + i.paid_amount, 0);

  // Revenue Chart Data
  const revenueData = [
    { month: 'Apr', revenue: 45000, pipeline: 80000 },
    { month: 'May', revenue: 58000, pipeline: 105000 },
    { month: 'Jun', revenue: 74000, pipeline: 130000 },
    { month: 'Jul', revenue: 89000, pipeline: 160000 },
    { month: 'Aug', revenue: 112000, pipeline: 210000 },
    { month: 'Sep', revenue: totalCollectedRevenue, pipeline: totalPipelineValue },
  ];

  // Pipeline Stages Distribution Data
  const stageData = [
    { stage: 'Qual', count: deals.filter(d => d.stage === 'Qualification').length || 2 },
    { stage: 'Value Prop', count: deals.filter(d => d.stage === 'Value Proposition').length || 1 },
    { stage: 'Proposal', count: deals.filter(d => d.stage === 'Proposal Sent').length || 2 },
    { stage: 'Negotiation', count: deals.filter(d => d.stage === 'Negotiation').length || 1 },
    { stage: 'Won', count: deals.filter(d => d.stage === 'Closed Won').length || 1 },
  ];

  const formatNum = (num: number) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Monochrome Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="shadcn-badge shadcn-badge-default font-mono text-[10px]">
                {organization.name}
              </span>
              <span className="text-xs text-[#888888]">Tenant ID: {organization.id}</span>
            </div>
            <h1 className="text-xl font-bold text-[#111111] mt-2 tracking-tight">
              Executive CRM Dashboard
            </h1>
            <p className="text-xs text-[#666666] mt-0.5">
              Live enterprise overview. Closed revenue is up <strong className="text-[#16A34A]">+14.8%</strong> this quarter.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/leads" className="btn-primary space-x-1">
              <span>View Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/deals" className="btn-secondary">
              Pipeline Kanban
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Crisp KPI Cards: Border > Shadow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="shadcn-card p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">Total Leads</span>
            <Target className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#111111]">{totalLeads}</span>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-[#16A34A] font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{newLeads} new this week</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="shadcn-card p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">Qualified Leads</span>
            <Users className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#111111]">{qualifiedLeads}</span>
            <div className="text-[11px] text-[#666666] mt-1 font-medium">
              Ready for deal conversion
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="shadcn-card p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-[#111111]">₹{formatNum(totalPipelineValue)}</span>
            <div className="text-[11px] text-[#16A34A] mt-1 font-medium">
              ₹{formatNum(wonDealsValue)} won closed
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="shadcn-card p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">Realized Revenue</span>
            <CreditCard className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-[#16A34A]">₹{formatNum(totalCollectedRevenue)}</span>
            <div className="text-[11px] text-[#666666] mt-1 font-medium">
              From paid invoices
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 shadcn-card p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Revenue & Pipeline Velocity</h3>
              <p className="text-xs text-[#666666]">Monthly comparison of pipeline vs collected revenue</p>
            </div>
            <span className="shadcn-badge shadcn-badge-default font-mono text-[10px]">
              2026 YTD
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#E5E5E5',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="pipeline" stroke="#666666" fill="#F4F4F5" strokeWidth={1.5} name="Pipeline Value" />
                <Area type="monotone" dataKey="revenue" stroke="#111111" fill="#E5E5E5" strokeWidth={2} name="Collected Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Stages Bar Distribution */}
        <div className="shadcn-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#111111]">Pipeline Distribution</h3>
            <p className="text-xs text-[#666666]">Deals count by stage</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="stage" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#E5E5E5',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="count" fill="#111111" radius={[4, 4, 0, 0]} name="Deals Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Leads & Due Follow-up Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="shadcn-card p-5">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E5E5E5]">
            <h3 className="text-sm font-semibold text-[#111111]">Recent Leads</h3>
            <Link href="/leads" className="text-xs text-[#111111] hover:underline font-medium">View All →</Link>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {leads.slice(0, 4).map(lead => (
              <div key={lead.id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-semibold text-[#111111]">{lead.name}</h4>
                  <p className="text-[11px] text-[#666666]">{lead.company} • {lead.source}</p>
                </div>
                <div className="text-right">
                  <span className={`shadcn-badge ${
                    lead.status === 'Qualified' ? 'shadcn-badge-success' :
                    lead.status === 'Contacted' ? 'shadcn-badge-warning' :
                    'shadcn-badge-default'
                  }`}>
                    {lead.status}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#111111] block mt-1">
                    ₹{Number(lead.expected_value || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Follow-Up Actions */}
        <div className="shadcn-card p-5">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E5E5E5]">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-[#111111]">Pending Action Items</h3>
              {urgentTasks > 0 && (
                <span className="shadcn-badge shadcn-badge-danger text-[10px]">
                  {urgentTasks} Urgent
                </span>
              )}
            </div>
            <Link href="/activities" className="text-xs text-[#111111] hover:underline font-medium">All Activities →</Link>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {tasks.slice(0, 4).map(task => (
              <div key={task.id} className="py-2.5 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className={`w-4 h-4 ${task.status === 'Completed' ? 'text-[#16A34A]' : 'text-[#D4D4D4]'}`} />
                  <div>
                    <h4 className={`font-medium ${task.status === 'Completed' ? 'line-through text-[#888888]' : 'text-[#111111]'}`}>
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-[#666666]">Assigned: {task.assigned_to}</p>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-[#666666]">
                  {task.due_date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
