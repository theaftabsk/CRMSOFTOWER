'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { TrialBanner } from '../../components/subscription/TrialBanner';
import { PaywallModal } from '../../components/subscription/PaywallModal';
import { api } from '../../lib/api';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Subscription State
  const [subData, setSubData] = useState<any | null>(null);

  const loadSubscription = async () => {
    try {
      const data = await api.getCurrentSubscription();
      if (data) setSubData(data);
    } catch (err) {
      console.warn('Subscription fetch error:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSubscription();
    }
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  const isLocked = Boolean(subData?.access?.isLocked && pathname !== '/billing');
  const remainingTrialDays = subData?.subscription?.remaining_trial_days ?? 14;
  const isExpired = Boolean(subData?.access?.isExpired);
  const subStatus = subData?.subscription?.status || 'TRIALING';

  // Loading State: Frosted Glass Launch Screen
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F4F5F8] text-[#111111] relative overflow-hidden select-none">
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        
        <div className="relative liquid-glass-modal p-8 flex flex-col items-center space-y-4 max-w-xs w-full text-center border border-white/80 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#222222] to-[#111111] text-white flex items-center justify-center font-bold text-sm shadow-[0_8px_16px_rgba(0,0,0,0.18)] border border-white/20 font-mono">
            ZY
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight text-[#111111]">Zyvo</h2>
            <p className="text-[11px] text-[#666666] font-mono flex items-center justify-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-ping inline-block" />
              <span>Verifying enterprise session...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, keep sleek loader while fast redirect occurs
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F4F5F8]">
        <div className="liquid-glass p-4 rounded-2xl flex items-center space-x-3 text-xs font-mono text-[#666666] border border-white/80 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#111111] animate-ping" />
          <span>Redirecting to Login...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden font-sans bg-[#F4F5F8] text-[#111111]">
      {/* Ambient Liquid Lighting Mesh Backdrop */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[34rem] h-[34rem] bg-gradient-to-br from-blue-200/35 to-indigo-200/20 rounded-full blur-[90px] opacity-75" />
      <div className="pointer-events-none absolute top-1/4 -right-28 w-[30rem] h-[30rem] bg-gradient-to-bl from-purple-200/30 to-pink-200/15 rounded-full blur-[80px] opacity-65" />
      <div className="pointer-events-none absolute -bottom-36 left-1/4 w-[36rem] h-[36rem] bg-gradient-to-tr from-emerald-100/35 to-teal-100/20 rounded-full blur-[100px] opacity-60" />

      {/* Translucent Liquid Glass Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col h-full overflow-hidden z-10 min-w-0 bg-[#F4F5F8]">
        <Navbar />

        {/* 14-Day Free Trial Banner & Status (Only displays for free trial/expired accounts) */}
        {subData && (
          <TrialBanner
            remainingDays={remainingTrialDays}
            isExpired={isExpired}
            status={subStatus}
            onRefresh={loadSubscription}
          />
        )}

        <main className="p-3 sm:p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0 bg-[#F4F5F8]">
          <div key={pathname} className="page-enter-animation flex-1 flex flex-col min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Security Paywall Modal (when 14-day trial has expired and not on /billing) */}
      <PaywallModal
        isOpen={isLocked}
        onUnlocked={loadSubscription}
      />
    </div>
  );
}
