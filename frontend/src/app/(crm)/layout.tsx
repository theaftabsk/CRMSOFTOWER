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
      if (typeof window !== 'undefined') {
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  const isLocked = Boolean(subData?.access?.isLocked && pathname !== '/billing');
  const remainingTrialDays = subData?.subscription?.remaining_trial_days ?? 14;
  const isExpired = Boolean(subData?.access?.isExpired);
  const subStatus = subData?.subscription?.status || 'TRIALING';

  // Loading State: Frosted Glass Launch Screen
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FFFFFF] text-[#111111] select-none">
        <div className="p-8 flex flex-col items-center space-y-4 max-w-xs w-full text-center border border-[#E5E5E5] rounded-xl shadow-sm bg-white">
          <div className="w-12 h-12 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-sm font-mono">
            CRM
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight text-[#111111]">Enterprise CRM</h2>
            <p className="text-[11px] text-[#666666] font-mono flex items-center justify-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-ping inline-block" />
              <span>Verifying enterprise session...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, keep clean redirect card
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8F8F8]">
        <div className="p-6 rounded-xl bg-white border border-[#E5E5E5] shadow-sm flex flex-col items-center space-y-3 max-w-sm text-center">
          <div className="w-10 h-10 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
            CRM
          </div>
          <h3 className="text-sm font-semibold text-[#111111]">Authentication Required</h3>
          <p className="text-xs text-[#666666]">
            Redirecting you to the secure login portal...
          </p>
          <a
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="w-full py-2 px-4 bg-[#111111] hover:bg-[#262626] text-white rounded-lg text-xs font-medium transition"
          >
            Click here to Sign In
          </a>
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
