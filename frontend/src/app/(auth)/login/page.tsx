'use client';
import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-sm w-full p-6 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#111111] text-white font-bold text-xs mb-2">
            CRM
          </div>
          <h1 className="text-lg font-bold text-[#111111] tracking-tight">Sign In</h1>
          <p className="text-xs text-[#666666]">Production Multi-Tenant SaaS Platform</p>
        </div>
        <form className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#404040] mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
              placeholder="admin@abctechnologies.com" 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-medium text-[#404040]">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-[#666666] hover:text-[#111111] hover:underline">
                Forgot?
              </Link>
            </div>
            <input 
              type="password" 
              required 
              className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 bg-[#111111] hover:bg-[#262626] text-white font-medium rounded-lg text-xs transition"
          >
            Sign In
          </button>
        </form>
        <div className="text-center text-xs text-[#666666] border-t border-[#E5E5E5] pt-4">
          <Link href="/dashboard" className="text-[#111111] font-medium hover:underline">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
