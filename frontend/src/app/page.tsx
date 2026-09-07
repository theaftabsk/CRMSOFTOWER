'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen bg-white text-[#111111] items-center justify-center font-sans antialiased selection:bg-[#111111] selection:text-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-9 h-9 rounded-full border-2 border-[#E5E5E5] border-t-[#111111] animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-semibold tracking-tight text-[#111111]">CRM Cloud</h2>
          <p className="text-xs text-[#737373]">Loading Production SaaS CRM...</p>
        </div>
      </div>
    </div>
  );
}
