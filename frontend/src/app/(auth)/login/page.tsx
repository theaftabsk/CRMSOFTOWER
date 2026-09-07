'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setError(res.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (role: 'admin' | 'manager') => {
    if (role === 'admin') {
      setEmail('admin@abctechnologies.com');
      setPassword('password123');
    } else {
      setEmail('vikram@abctechnologies.com');
      setPassword('password123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4 antialiased">
      <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-sm w-full p-6 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#111111] text-white font-bold text-sm mb-2 shadow-sm">
            CRM
          </div>
          <h1 className="text-xl font-bold text-[#111111] tracking-tight">Enterprise Sign In</h1>
          <p className="text-xs text-[#666666]">Protected Multi-Tenant Management Portal</p>
        </div>

        {/* Security Alert Badge */}
        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#404040] mb-1.5">Work Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
              placeholder="admin@abctechnologies.com" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block font-medium text-[#404040]">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-[#666666] hover:text-[#111111] hover:underline">
                Forgot?
              </Link>
            </div>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-[#111111] hover:bg-[#262626] disabled:opacity-50 text-white font-medium rounded-lg text-xs transition flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* 1-Click Quick Demo Sign-in Chip */}
        <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-3 space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#111111]">
            <KeyRound className="w-3 h-3 text-[#666666]" />
            <span>Quick Demo Credentials</span>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="flex-1 py-1 px-2 text-[10px] font-medium bg-white hover:bg-[#F4F4F5] border border-[#D4D4D4] rounded text-[#111111] transition"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('manager')}
              className="flex-1 py-1 px-2 text-[10px] font-medium bg-white hover:bg-[#F4F4F5] border border-[#D4D4D4] rounded text-[#111111] transition"
            >
              Manager Demo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#666666] border-t border-[#E5E5E5] pt-4 flex flex-col space-y-1">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-[#888888]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>End-to-End Encrypted Session</span>
          </div>
          <div>
            Don't have an account?{' '}
            <Link href="/register" className="text-[#111111] font-medium hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <span className="text-xs font-mono text-[#666666]">Loading authentication...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
