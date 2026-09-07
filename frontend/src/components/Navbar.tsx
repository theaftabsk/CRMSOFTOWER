'use client';

import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  Search, Bell, Plus, Target, Users, Building2, TrendingUp, CheckSquare, Receipt
} from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { 
    currentUser, searchQuery, setSearchQuery, 
    leads, tasks, setActiveModule 
  } = useCRM();

  const [showQuickDropdown, setShowQuickDropdown] = useState(false);

  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;

  return (
    <header className="h-16 border-b border-[#E5E5E5] bg-white px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Global Search Input */}
      <div className="flex items-center space-x-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
          <input 
            type="text" 
            placeholder="Search leads, contacts, deals, invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-lg pl-9 pr-4 py-2 border border-[#E5E5E5] bg-white text-[#111111] placeholder-[#999999] transition focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        {/* "+ Create" Quick Action Menu (Primary Black Button) */}
        <div className="relative">
          <button 
            onClick={() => setShowQuickDropdown(!showQuickDropdown)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#111111] hover:bg-[#262626] text-white text-xs font-medium rounded-lg transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

          {showQuickDropdown && (
            <div className="absolute left-0 mt-2 w-52 border border-[#E5E5E5] rounded-xl shadow-lg bg-white p-1.5 z-50 animate-in fade-in">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                Quick Record Creation
              </div>
              <Link
                href="/leads"
                onClick={() => { setActiveModule('leads'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-[#222222] hover:bg-[#F8F8F8] transition"
              >
                <Target className="w-4 h-4 text-[#111111]" />
                <span>New Lead</span>
              </Link>
              <Link
                href="/contacts"
                onClick={() => { setActiveModule('contacts'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-[#222222] hover:bg-[#F8F8F8] transition"
              >
                <Users className="w-4 h-4 text-[#111111]" />
                <span>New Contact</span>
              </Link>
              <Link
                href="/accounts"
                onClick={() => { setActiveModule('accounts'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-[#222222] hover:bg-[#F8F8F8] transition"
              >
                <Building2 className="w-4 h-4 text-[#111111]" />
                <span>New Account</span>
              </Link>
              <Link
                href="/deals"
                onClick={() => { setActiveModule('deals'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-[#222222] hover:bg-[#F8F8F8] transition"
              >
                <TrendingUp className="w-4 h-4 text-[#111111]" />
                <span>New Deal</span>
              </Link>
              <Link
                href="/invoices"
                onClick={() => { setActiveModule('invoices'); setShowQuickDropdown(false); }}
                className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-[#222222] hover:bg-[#F8F8F8] transition"
              >
                <Receipt className="w-4 h-4 text-[#111111]" />
                <span>New Invoice</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & Current User Avatar */}
      <div className="flex items-center space-x-4">
        <button 
          title="Notifications"
          className="relative p-2 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition border border-[#E5E5E5]"
        >
          <Bell className="w-4 h-4" />
          {pendingTasksCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full" />
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-[#E5E5E5]">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-semibold text-xs">
            {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-medium text-[#111111] block leading-tight">
              {currentUser?.name || 'Aftab Admin'}
            </span>
            <span className="text-[10px] text-[#888888] font-mono">
              {currentUser?.role || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
