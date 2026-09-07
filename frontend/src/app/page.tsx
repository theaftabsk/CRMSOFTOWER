'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-sm font-semibold text-indigo-300">Loading Production SaaS CRM...</span>
      </div>
    </div>
  );
}
