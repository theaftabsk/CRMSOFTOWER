'use client';

import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  Search, Bell, Building2, Plus, Sun, Moon, 
  Target, Users, TrendingUp, CheckSquare, Calendar, Receipt, ShieldCheck 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    organization, users, currentUser, setCurrentUser, 
    searchQuery, setSearchQuery, leads, tasks, 
    theme, toggleTheme, setActiveModule
  } = useCRM();

  const [showQuickDropdown, setShowQuickDropdown] = useState(false);

  // Calculate pending follow-ups due today
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingFollowupsCount = leads.filter(l => l.next_followup_date && l.next_followup_date.startsWith(todayStr)).length;
  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const totalNotifications = pendingFollowupsCount + pendingTasksCount;

  return (
    <header className={`h-16 border-b backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200 ${
      theme === 'light' 
        ? 'bg-white/90 border-slate-200 text-slate-900 shadow-sm' 
        : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      {/* Left: Global Search Input & Quick Create */}
      <div className="flex items-center space-x-3">
        <div className="relative w-80">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
          <input 
            type="text" 
            placeholder="Search Leads, Contacts, Deals, Invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs rounded-xl pl-9 pr-4 py-2 border transition focus:outline-none focus:ring-2 ${
              theme === 'light'
                ? 'bg-slate-100/80 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-indigo-500/20 focus:border-indigo-600'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-200 placeholder-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Floating "+ Create" Quick Action Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowQuickDropdown(!showQuickDropdown)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>

          {showQuickDropdown && (
            <div className={`absolute left-0 mt-2 w-48 border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 ${
              theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              {[
                { label: 'New Lead', module: 'leads', icon: Target },
                { label: 'New Contact', module: 'contacts', icon: Users },
                { label: 'New Account', module: 'accounts', icon: Building2 },
                { label: 'New Sales Deal', module: 'deals', icon: TrendingUp },
                { label: 'New Task', module: 'activities', icon: CheckSquare },
                { label: 'Schedule Meeting', module: 'calendar', icon: Calendar },
                { label: 'Create Quote', module: 'finance', icon: Receipt },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveModule(item.module);
                      setShowQuickDropdown(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Light / Dark Mode Toggle */}
        <button 
          onClick={toggleTheme} 
          title="Toggle Light / Dark Mode"
          className={`p-2 rounded-xl border transition ${
            theme === 'light' 
              ? 'bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200' 
              : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
          }`}
        >
          {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Active Organization Badge */}
        <div className={`flex items-center space-x-2 border px-3 py-1.5 rounded-xl ${
          theme === 'light' ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-950/50 border-indigo-500/30'
        }`}>
          <Building2 className="w-4 h-4 text-indigo-500" />
          <div className="text-xs">
            <span className={`font-semibold block ${theme === 'light' ? 'text-indigo-950' : 'text-indigo-200'}`}>{organization.name}</span>
            <span className="text-[10px] text-indigo-500 font-mono">ID: {organization.id}</span>
          </div>
        </div>

        {/* Notifications Badge */}
        <div className="relative group cursor-pointer">
          <div className={`p-2 rounded-xl border transition ${
            theme === 'light' ? 'bg-slate-100 border-slate-200 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
          }`}>
            <Bell className="w-4 h-4 text-slate-500" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {totalNotifications}
              </span>
            )}
          </div>
        </div>

        {/* User Role Switcher */}
        <div className={`flex items-center space-x-2 border px-3 py-1.5 rounded-xl ${
          theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
        }`}>
          <img 
            src={currentUser.profile_photo} 
            alt={currentUser.name} 
            className="w-6 h-6 rounded-full object-cover border border-indigo-400/40"
          />
          <div className="text-left">
            <select 
              value={currentUser.id} 
              onChange={(e) => {
                const selected = users.find(u => u.id === e.target.value);
                if (selected) setCurrentUser(selected);
              }}
              className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              {users.map(u => (
                <option key={u.id} value={u.id} className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-200'}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
