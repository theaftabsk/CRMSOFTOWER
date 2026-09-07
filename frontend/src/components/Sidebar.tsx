'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCRM } from '../context/CRMContext';
import { 
  LayoutDashboard, Target, Users, Building2, TrendingUp, 
  CheckSquare, Phone, Calendar, Package, FileText, ShoppingBag, 
  Receipt, CreditCard, BarChart3, Settings, ChevronLeft, ChevronRight,
  ShieldCheck, HelpCircle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeModule, setActiveModule, organization } = useCRM();
  const [collapsed, setCollapsed] = useState(false);

  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'SALES',
      items: [
        { id: 'leads', label: 'Leads', href: '/leads', icon: Target },
        { id: 'contacts', label: 'Contacts', href: '/contacts', icon: Users },
        { id: 'accounts', label: 'Accounts', href: '/accounts', icon: Building2 },
        { id: 'deals', label: 'Deals & Pipeline', href: '/deals', icon: TrendingUp },
      ],
    },
    {
      title: 'ACTIVITIES',
      items: [
        { id: 'tasks', label: 'Tasks & Calls', href: '/activities', icon: CheckSquare },
        { id: 'calendar', label: 'Calendar', href: '/calendar', icon: Calendar },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'products', label: 'Products', href: '/products', icon: Package },
        { id: 'quotes', label: 'Quotes', href: '/quotes', icon: FileText },
        { id: 'orders', label: 'Orders', href: '/orders', icon: ShoppingBag },
        { id: 'invoices', label: 'Invoices', href: '/invoices', icon: Receipt },
        { id: 'payments', label: 'Payments', href: '/payments', icon: CreditCard },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { id: 'reports', label: 'Reports', href: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside 
      className={`border-r border-[#E5E5E5] bg-white flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header with Collapsible Toggle */}
        <div className="h-16 px-3.5 flex items-center justify-between border-b border-[#E5E5E5]">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#111111] flex-shrink-0 flex items-center justify-center text-white font-bold text-xs tracking-wider">
              CR
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="font-semibold text-sm text-[#111111] tracking-tight truncate">
                  CRMSOFTOWER
                </h1>
                <p className="text-[10px] text-[#888888] font-mono leading-none">Enterprise SaaS</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="p-1 rounded-md text-[#777777] hover:text-[#111111] hover:bg-[#F4F4F5] transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Grouped Sidebar Navigation */}
        <nav className="p-2 space-y-3 overflow-y-auto max-h-[calc(100vh-130px)] custom-scrollbar">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-0.5">
              {!collapsed && sec.title && (
                <div className="px-2 text-[10px] font-semibold text-[#999999] tracking-wider uppercase mb-1">
                  {sec.title}
                </div>
              )}
              {collapsed && idx > 0 && (
                <div className="w-6 h-[1px] bg-[#E5E5E5] mx-auto my-1.5" />
              )}
              {sec.items.map(item => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href) || activeModule === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setActiveModule(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'px-3 space-x-2.5'} py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive 
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'text-[#444444] hover:bg-[#F8F8F8] hover:text-[#111111]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#777777]'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Tenant Info & Quick Help */}
      <div className="p-3 border-t border-[#E5E5E5] bg-[#FAFAFA]">
        {!collapsed ? (
          <div className="flex justify-between items-center text-[11px] text-[#666666]">
            <span className="flex items-center space-x-1.5 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-[#111111] flex-shrink-0" />
              <span className="truncate">Tenant:</span>
            </span>
            <span className="font-semibold text-[#111111] font-mono text-[11px]">{organization.id}</span>
          </div>
        ) : (
          <div className="flex justify-center" title={`Tenant: ${organization.id}`}>
            <ShieldCheck className="w-4 h-4 text-[#111111]" />
          </div>
        )}
      </div>
    </aside>
  );
};
