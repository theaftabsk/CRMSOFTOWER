'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Loading State: Clean Monochrome Minimalist SaaS Spinner
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FFFFFF] text-[#111111]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            CRM
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#666666]">
            <span className="w-2 h-2 rounded-full bg-[#111111] animate-ping" />
            <span>Verifying secure enterprise session...</span>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, block all rendering
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#F8F8F8] text-[#111111]">
      {/* Collapsible SaaS Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />
        <main className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
