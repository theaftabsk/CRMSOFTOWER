'use client';

import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { useCRM } from '../../context/CRMContext';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useCRM();

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#F8F8F8] text-[#111111]">
      {/* Sidebar */}
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
