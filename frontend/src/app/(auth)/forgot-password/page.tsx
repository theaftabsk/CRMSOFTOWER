'use client';
import React from 'react';
import Link from 'next/link';

export default function ForgotpasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-extrabold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400">Enterprise Multi-Tenant SaaS CRM Platform</p>
        </div>
        <form className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Email Address</label>
            <input type="email" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200" placeholder="admin@abctechnologies.com" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <input type="password" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition">
            Reset Password
          </button>
        </form>
        <div className="text-center text-xs text-slate-500">
          <Link href="/dashboard" className="text-indigo-400 hover:underline">Go to Dashboard →</Link>
        </div>
      </div>
    </div>
  );
}
