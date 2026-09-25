'use client';

import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Bell, Plus, Target, Users, Building2, TrendingUp, Receipt, 
  LogOut, Settings, Shield, ChevronDown, Command, Menu
} from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { 
    searchQuery, setSearchQuery, 
    tasks, setActiveModule,
    mobileMenuOpen, setMobileMenuOpen
  } = useCRM();
  const { user, logout } = useAuth();

  const [showQuickDropdown, setShowQuickDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;

  const displayName = user?.name || 'Aftab Admin';
  const displayRole = user?.role || 'Admin';
  const displayOrg = user?.organizationName || 'ABC Technologies';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 liquid-glass-nav px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Mobile Hamburger, Spotlight Search Input & Quick Action */}
      <div className="flex items-center space-x-2 sm:space-x-3.5 flex-1 min-w-0 pr-2">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-xl text-[#444444] hover:text-[#111111] hover:bg-black/[0.05] transition shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-[190px] sm:max-w-xs md:w-84 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888] transition group-focus-within:text-[#111111]" />
          <input 
            type="text" 
            placeholder="Search leads, deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-xl pl-9 pr-8 sm:pr-14 py-2 bg-black/[0.035] hover:bg-black/[0.05] focus:bg-white text-[#111111] placeholder-[#888888] border border-black/[0.06] focus:border-black/30 focus:shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all duration-200 outline-none"
          />
          <div className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center space-x-0.5 px-1.5 py-0.5 rounded-md bg-black/[0.05] text-[10px] text-[#777777] font-mono pointer-events-none border border-black/[0.04]">
            <Command className="w-2.5 h-2.5 mr-0.5" />
            <span>K</span>
          </div>
        </div>

        {/* "+ Create" Action Menu */}
        <div className="relative shrink-0">
          <button 
            onClick={() => {
              setShowQuickDropdown(!showQuickDropdown);
              if (showUserMenu) setShowUserMenu(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white text-xs font-semibold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.16)] btn-liquid transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {showQuickDropdown && (
            <div className="absolute left-0 mt-2 w-56 liquid-glass-dropdown p-1.5 z-50 liquid-animate-in border border-white/80">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                Quick Record Creation
              </div>
              <Link
                href="/leads"
                onClick={() => { setActiveModule('leads'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
              >
                <Target className="w-4 h-4 text-[#111111]" />
                <span className="font-medium">New Lead</span>
              </Link>
              <Link
                href="/contacts"
                onClick={() => { setActiveModule('contacts'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
              >
                <Users className="w-4 h-4 text-[#111111]" />
                <span className="font-medium">New Contact</span>
              </Link>
              <Link
                href="/accounts"
                onClick={() => { setActiveModule('accounts'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
              >
                <Building2 className="w-4 h-4 text-[#111111]" />
                <span className="font-medium">New Account</span>
              </Link>
              <Link
                href="/deals"
                onClick={() => { setActiveModule('deals'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
              >
                <TrendingUp className="w-4 h-4 text-[#111111]" />
                <span className="font-medium">New Deal</span>
              </Link>
              <Link
                href="/invoices"
                onClick={() => { setActiveModule('invoices'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
              >
                <Receipt className="w-4 h-4 text-[#111111]" />
                <span className="font-medium">New Invoice</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & Current User Profile with Frosted Glass Menu */}
      <div className="flex items-center space-x-3.5">
        <button 
          title="Notifications"
          className="relative p-2 rounded-xl text-[#555555] hover:text-[#111111] hover:bg-black/[0.04] border border-black/[0.06] bg-white/50 backdrop-blur-md btn-liquid transition cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {pendingTasksCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* User Pill & Interactive Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              if (showQuickDropdown) setShowQuickDropdown(false);
            }}
            className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl border border-black/[0.06] bg-white/50 hover:bg-white/80 backdrop-blur-md btn-liquid transition cursor-pointer shadow-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#222222] to-[#111111] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {initial}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-semibold text-[#111111] block leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-[#777777] font-mono leading-none">
                {displayRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#888888]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 liquid-glass-dropdown p-2 z-50 liquid-animate-in border border-white/80">
              <div className="px-3 py-2.5 border-b border-black/[0.06] mb-1">
                <p className="text-xs font-bold text-[#111111]">{displayName}</p>
                <p className="text-[11px] text-[#666666] truncate">{user?.email || 'admin@abctechnologies.com'}</p>
                <div className="flex items-center space-x-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-black/[0.05] border border-black/[0.05] font-mono text-[9px] text-[#111111] font-semibold">
                    {displayOrg}
                  </span>
                  <span className="text-[10px] text-[#777777] font-mono">
                    {displayRole}
                  </span>
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
              >
                <Settings className="w-3.5 h-3.5 text-[#666666]" />
                <span className="font-medium">Organization Settings</span>
              </Link>

              <Link
                href="/settings/security"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
              >
                <Shield className="w-3.5 h-3.5 text-[#666666]" />
                <span className="font-medium">Security & Roles</span>
              </Link>

              <div className="border-t border-black/[0.06] my-1" />

              <button
                onClick={async () => {
                  setShowUserMenu(false);
                  await logout();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#DC2626] hover:bg-red-50/80 btn-liquid transition text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                <span className="font-semibold">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
