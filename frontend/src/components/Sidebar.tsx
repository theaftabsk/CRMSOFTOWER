'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCRM } from '../context/CRMContext';
import { 
  LayoutDashboard, Target, Users, Building2, TrendingUp, 
  CheckSquare, Calendar, Package, FileText, ShoppingBag, 
  Receipt, CreditCard, BarChart3, Settings, ChevronLeft, ChevronRight,
  ShieldCheck, Globe, Code2, Blocks, Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeModule, setActiveModule, organization, leads, tasks, invoices } = useCRM();
  const [collapsed, setCollapsed] = useState(false);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live badges
  const pendingTasksCount = tasks?.filter((t) => t.status === 'Pending').length || 0;
  const activeLeadsCount = leads?.length || 0;
  const pendingInvoicesCount = invoices?.filter((i) => i.status === 'Sent' || i.status === 'Overdue').length || 0;

  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'SALES PIPELINE',
      items: [
        { id: 'leads', label: 'Leads', href: '/leads', icon: Target, badge: activeLeadsCount > 0 ? String(activeLeadsCount) : undefined },
        { id: 'forms', label: 'Web Forms', href: '/forms', icon: Globe, badge: 'Live' },
        { id: 'contacts', label: 'Contacts', href: '/contacts', icon: Users },
        { id: 'accounts', label: 'Accounts', href: '/accounts', icon: Building2 },
        { id: 'deals', label: 'Deals & Pipeline', href: '/deals', icon: TrendingUp },
      ],
    },
    {
      title: 'ACTIVITIES',
      items: [
        { id: 'tasks', label: 'Tasks & Calls', href: '/activities', icon: CheckSquare, badge: pendingTasksCount > 0 ? String(pendingTasksCount) : undefined },
        { id: 'calendar', label: 'Calendar', href: '/calendar', icon: Calendar },
      ],
    },
    {
      title: 'COMMERCIAL & FINANCE',
      items: [
        { id: 'products', label: 'Products', href: '/products', icon: Package },
        { id: 'quotes', label: 'Quotes', href: '/quotes', icon: FileText },
        { id: 'orders', label: 'Orders', href: '/orders', icon: ShoppingBag },
        { id: 'invoices', label: 'Invoices', href: '/invoices', icon: Receipt, badge: pendingInvoicesCount > 0 ? String(pendingInvoicesCount) : undefined },
        { id: 'payments', label: 'Payments', href: '/payments', icon: CreditCard },
        { id: 'billing', label: 'Subscription & Billing', href: '/billing', icon: Sparkles, badge: 'Pro' },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { id: 'reports', label: 'Reports', href: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'DEVELOPER & SYSTEM',
      items: [
        { id: 'integrations', label: 'Apps & Integrations', href: '/integrations', icon: Blocks },
        { id: 'developers', label: 'Developer API Hub', href: '/developers', icon: Code2, badge: 'API' },
        { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside 
      className={`liquid-glass-sidebar flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 select-none border-r border-[#E5E5E5] bg-white/80 backdrop-blur-xl ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header: Clean Minimalist Typography */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E5E5E5] flex-shrink-0">
          {!collapsed ? (
            <Link 
              href="/dashboard" 
              className="flex items-center group cursor-pointer"
            >
              <span className="font-bold text-lg tracking-tight text-[#111111] group-hover:opacity-80 transition">
                Kaspro
              </span>
            </Link>
          ) : (
            <Link 
              href="/dashboard"
              className="mx-auto flex items-center justify-center font-bold text-lg text-[#111111] hover:opacity-80 transition font-mono"
            >
              K
            </Link>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
            className={`p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-black/[0.05] transition cursor-pointer ${
              collapsed ? 'hidden' : 'block'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsed Expand Quick Action Pill */}
        {collapsed && (
          <div className="pt-2 px-3 flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              title="Expand Sidebar (Ctrl+B)"
              className="p-1 rounded-md text-[#888888] hover:text-[#111111] hover:bg-black/[0.05] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Item Tree */}
        <nav className="p-2.5 space-y-3.5 overflow-y-auto flex-1 custom-scrollbar">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-0.5">
              {!collapsed && sec.title && (
                <div className="px-2.5 text-[9.5px] font-semibold text-[#888888] tracking-widest uppercase mb-1 flex items-center justify-between">
                  <span>{sec.title}</span>
                </div>
              )}

              {collapsed && idx > 0 && (
                <div className="w-6 h-[1px] bg-[#E5E5E5] mx-auto my-2" />
              )}

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/dashboard' 
                  ? pathname === '/dashboard' 
                  : (pathname === item.href || pathname.startsWith(`${item.href}/`));

                return (
                  <div key={item.id} className="relative group">
                    <Link
                      href={item.href}
                      onClick={() => setActiveModule(item.id)}
                      className={`w-full flex items-center ${
                        collapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
                      } rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                        isActive 
                          ? 'bg-[#111111] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-[#222222]'
                          : 'text-[#4A4A4A] hover:bg-black/[0.04] hover:text-[#111111] active:scale-[0.98]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-[#666666] group-hover:text-[#111111]'
                      }`} />
                      
                      {!collapsed && (
                        <>
                          <span className="truncate tracking-tight flex-1">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span 
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold leading-none ${
                                isActive 
                                  ? 'bg-white text-[#111111] shadow-xs' 
                                  : item.badge === 'Live' || item.badge === 'API'
                                  ? 'bg-[#DCFCE7] text-[#16A34A]'
                                  : 'bg-black/[0.06] text-[#555555]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>

                    {/* Desktop Tooltip for Collapsed Sidebar */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#111111] text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 flex items-center space-x-2 border border-white/10">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 bg-white/20 rounded text-[10px] font-mono leading-none">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Plan Upgrade Pill in Footer */}
        {!collapsed && (
          <div className="px-3 pt-2 pb-1 flex-shrink-0">
            <Link
              href="/billing"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#FAFAFA] hover:bg-[#F0F0F0] border border-[#E5E5E5] text-[11px] text-[#444444] transition group"
            >
              <span className="flex items-center space-x-1.5 font-medium text-[#111111]">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>14-Day Free Trial</span>
              </span>
              <span className="font-semibold text-[10px] text-[#111111] group-hover:underline">
                Upgrade →
              </span>
            </Link>
          </div>
        )}

        {/* Footer Tenant & Operational Status */}
        <div className="p-3 border-t border-[#E5E5E5] bg-white/60 backdrop-blur-md flex-shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-[11px] font-mono flex-shrink-0">
                  {organization?.name ? organization.name.charAt(0).toUpperCase() : 'K'}
                </div>
                <div className="min-w-0 truncate">
                  <p className="text-xs font-semibold text-[#111111] truncate leading-tight">
                    {organization?.name || 'Kaspro Online'}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] pulse-subtle" />
                    <span className="text-[10px] text-[#666666] font-mono leading-none">
                      Cloud Synced
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/settings"
                title="System Settings"
                className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-black/[0.05] rounded-lg transition"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex justify-center group relative cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs font-mono">
                {organization?.name ? organization.name.charAt(0).toUpperCase() : 'K'}
              </div>
              <div className="absolute left-full ml-3 bottom-0 px-2.5 py-1.5 bg-[#111111] text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 border border-white/10">
                <div className="font-semibold">{organization?.name || 'Kaspro Online'}</div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-subtle" />
                  <span>Cloud Synced</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
