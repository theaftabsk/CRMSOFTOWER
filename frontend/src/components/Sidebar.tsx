'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCRM } from '../context/CRMContext';
import { 
  LayoutDashboard, Target, Users, Building2, TrendingUp, 
  CheckSquare, Calendar, Package, Receipt, BarChart3, 
  Settings, CreditCard, Sparkles, ShoppingBag 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeModule, setActiveModule, organization, theme } = useCRM();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Lead Management', href: '/leads', icon: Target },
    { id: 'contacts', label: 'Contacts', href: '/contacts', icon: Users },
    { id: 'accounts', label: 'Accounts / Companies', href: '/accounts', icon: Building2 },
    { id: 'deals', label: 'Sales Pipeline (Kanban)', href: '/deals', icon: TrendingUp },
    { id: 'activities', label: 'Activities & Follow-ups', href: '/activities', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar View', href: '/calendar', icon: Calendar },
    { id: 'products', label: 'Products & Services', href: '/products', icon: Package },
    { id: 'quotes', label: 'Quotations', href: '/quotes', icon: Receipt },
    { id: 'orders', label: 'Sales Orders', href: '/orders', icon: ShoppingBag },
    { id: 'invoices', label: 'Invoices & Billing', href: '/invoices', icon: Receipt },
    { id: 'payments', label: 'Payments Log', href: '/payments', icon: CreditCard },
    { id: 'reports', label: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Audit Log', href: '/settings', icon: Settings },
  ];

  return (
    <aside className={`w-64 border-r flex flex-col justify-between h-screen sticky top-0 transition-colors duration-200 ${
      theme === 'light' 
        ? 'bg-white border-slate-200 text-slate-700' 
        : 'bg-slate-950 border-slate-800 text-slate-300'
    }`}>
      <div>
        {/* Brand Header */}
        <div className={`h-16 px-6 flex items-center space-x-3 border-b ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`font-bold text-base ${
              theme === 'light' ? 'text-indigo-950' : 'bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent'
            }`}>
              AGY Core CRM
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide">Multi-Tenant SaaS v2.0</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href) || activeModule === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive 
                    ? theme === 'light'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-sm'
                      : 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-950/50' 
                    : theme === 'light'
                      ? 'hover:bg-slate-100 hover:text-slate-900 text-slate-600 border border-transparent'
                      : 'hover:bg-slate-900 hover:text-slate-100 text-slate-400 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className={`p-4 border-t ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/50'}`}>
        <div className="text-[11px] text-slate-400 flex justify-between items-center">
          <span>Active Tenant:</span>
          <span className="font-semibold text-indigo-600 font-mono">{organization.id}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Lead → Contact → Deal → Invoice</p>
      </div>
    </aside>
  );
};
