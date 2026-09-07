'use client';

import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { 
  Target, TrendingUp, Users, CreditCard, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock, AlertCircle, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, CartesianGrid 
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { leads, deals, tasks, invoices, theme } = useCRM();

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
    { month: 'Jan', revenue: 45000, pipeline: 80000 },
    { month: 'Feb', revenue: 52000, pipeline: 95000 },
    { month: 'Mar', revenue: 61000, pipeline: 110000 },
    { month: 'Apr', revenue: 58000, pipeline: 105000 },
    { month: 'May', revenue: 74000, pipeline: 130000 },
    { month: 'Jun', revenue: 89000, pipeline: 160000 },
    { month: 'Jul', revenue: 95000, pipeline: 175000 },
    { month: 'Aug', revenue: 112000, pipeline: 210000 },
    { month: 'Sep', revenue: 128000, pipeline: 240000 },
  ];

  // Pipeline Stages Distribution Data
  const stageData = [
    { stage: 'Qualification', count: deals.filter(d => d.stage === 'Qualification').length || 3 },
    { stage: 'Value Prop', count: deals.filter(d => d.stage === 'Value Proposition').length || 2 },
    { stage: 'Proposal Sent', count: deals.filter(d => d.stage === 'Proposal Sent').length || 4 },
    { stage: 'Negotiation', count: deals.filter(d => d.stage === 'Negotiation').length || 2 },
    { stage: 'Closed Won', count: deals.filter(d => d.stage === 'Closed Won').length || 5 },
  ];

  const formatNum = (num: number) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  const isLight = theme === 'light';

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Executive Welcome Banner */}
      <div className={`p-6 rounded-2xl border transition ${
        isLight 
          ? 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white border-indigo-700 shadow-lg' 
          : 'bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-950 border-indigo-500/30 shadow-2xl shadow-indigo-950/50'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-400/30 uppercase tracking-wider">
              Executive Multi-Tenant Dashboard
            </span>
            <h1 className="text-xl font-extrabold mt-2 text-white">
              Welcome back, Aftab! 🚀
            </h1>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
              Here is your live SaaS performance overview. Pipeline conversion is up <strong className="text-emerald-300">+14.2%</strong> this month.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <div className="text-left text-xs">
              <span className="text-slate-400 block text-[10px]">Tenant Database:</span>
              <span className="font-bold font-mono text-indigo-300">PostgreSQL Isolated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className={`p-5 rounded-2xl border transition duration-200 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Total Leads</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{totalLeads}</span>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{newLeads} new this week</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className={`p-5 rounded-2xl border transition duration-200 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Qualified Pipeline</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{qualifiedLeads} Leads</span>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-amber-400 font-semibold">
              <span>Ready for Deal Conversion</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className={`p-5 rounded-2xl border transition duration-200 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Active Deals Value</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹{formatNum(totalPipelineValue)}</span>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>₹{formatNum(wonDealsValue)} Won Deals</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className={`p-5 rounded-2xl border transition duration-200 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Collected Revenue</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>₹{formatNum(totalCollectedRevenue)}</span>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-indigo-400 font-semibold">
              <span>Paid Invoices Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Pipeline Growth Chart (2 cols) */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80 shadow-xl'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Revenue vs Sales Pipeline Growth</h3>
              <p className="text-xs text-slate-400">Monthly breakdown of closed revenue against forecasted deal values</p>
            </div>
            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-500/20">
              2026 YTD
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPipe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                    borderColor: isLight ? '#e2e8f0' : '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="pipeline" stroke="#10b981" fillOpacity={1} fill="url(#colorPipe)" strokeWidth={2} name="Pipeline Value" />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} name="Collected Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Stage Bar Distribution (1 col) */}
        <div className={`p-6 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80 shadow-xl'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Pipeline Stages</h3>
              <p className="text-xs text-slate-400">Deal count by stage</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                    borderColor: isLight ? '#e2e8f0' : '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} name="Deals Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Leads & Due Follow-up Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className={`p-6 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80 shadow-xl'
        }`}>
          <h3 className={`text-sm font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Recent Leads Pipeline</h3>
          <div className="divide-y divide-slate-800/60">
            {leads.slice(0, 4).map(lead => (
              <div key={lead.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{lead.company || (lead as any).name}</h4>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{lead.company} • {lead.source}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full block mb-1 ${
                    lead.status === 'Qualified' ? 'bg-emerald-500/20 text-emerald-400' :
                    lead.status === 'Contacted' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {lead.status}
                  </span>
                  <span className="font-mono text-indigo-400 font-bold">
                    ₹{formatNum(lead.expected_value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Due Follow-Up Tasks */}
        <div className={`p-6 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80 shadow-xl'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Pending Follow-Up Actions</h3>
            {urgentTasks > 0 && (
              <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {urgentTasks} Urgent
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-800/60">
            {tasks.slice(0, 4).map(task => (
              <div key={task.id} className="py-3.5 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className={`w-4 h-4 ${task.status === 'Completed' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <h4 className={`font-bold ${task.status === 'Completed' ? 'line-through text-slate-500' : isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">Assigned: {task.assigned_to}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-indigo-400 block">{task.due_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
