'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, LayoutDashboard, Building2, Layers, 
  CreditCard, Activity, Cpu, Settings, LogOut, ChevronRight,
  ExternalLink, Sparkles
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navSections = [
  {
    title: 'PLATFORM CORE',
    items: [
      { label: 'Overview', href: '/', icon: LayoutDashboard },
      { label: 'Tenants & Orgs', href: '/tenants', icon: Building2, badge: 'Live' },
      { label: 'SaaS Plans & Quotas', href: '/subscriptions', icon: Layers },
      { label: 'Industry Verticals', href: '/verticals', icon: Sparkles, badge: '8 Active' },
    ],
  },
  {
    title: 'FINANCE & SCALE',
    items: [
      { label: 'Platform Revenue', href: '/billing', icon: CreditCard },
      { label: 'System Telemetry', href: '/system', icon: Activity },
      { label: 'Global Audit Logs', href: '/system#audit', icon: Cpu },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { label: 'Super Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#E5E5E5] bg-white h-screen flex flex-col justify-between shrink-0 sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-15 border-b border-[#E5E5E5] px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold font-mono text-sm">
              Z
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-[#111111] flex items-center space-x-1.5">
                <span>Zyvo SuperAdmin</span>
              </div>
              <div className="text-[10px] text-[#666666] font-mono">Master Tenant Node</div>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAFAFA] border border-[#E5E5E5] text-[#16A34A] font-semibold">
            PROD
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <div className="text-[10px] font-semibold text-[#888888] tracking-wider uppercase px-2 mb-1">
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#111111] text-white'
                        : 'text-[#404040] hover:bg-[#FAFAFA] hover:text-[#111111]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#666666]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-[#F4F4F6] text-[#666666] border border-[#E5E5E5]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Super Admin Profile Footer */}
      <div className="p-4 border-t border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
              SA
            </div>
            <div>
              <div className="text-xs font-semibold text-[#111111]">Platform Admin</div>
              <div className="text-[10px] text-[#666666] truncate max-w-[120px]">root@zyvocrm.in</div>
            </div>
          </div>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            title="Open CRM Tenant Portal"
            className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-white rounded border border-transparent hover:border-[#E5E5E5] transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
}
