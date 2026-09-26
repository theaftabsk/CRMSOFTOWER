'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight, KeyRound, TrendingUp, CreditCard, CheckCircle2, Lock } from 'lucide-react';
import ZyvoLogo from '../../../components/ZyvoLogo';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
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

  return (
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      {/* Main Split Floating Card Container */}
      <div className="w-full max-w-5xl bg-white border border-[#E5E5E5] rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          
          {/* Left Column: Sign In Form */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E5E5E5] bg-white">
            <div>
              {/* Brand Logo */}
              <div className="flex items-center space-x-2 mb-8">
                <ZyvoLogo height={28} className="text-[#111111]" />
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                  Continue to your account
                </h1>
                <p className="text-xs text-[#666666]">
                  Enter your credentials to access your sales workspace
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start space-x-2.5 p-3 mb-5 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#404040] mb-1">Work Email</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
                    placeholder="Enter your email" 
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
                    placeholder="Enter your password" 
                  />
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2 pt-1">
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D4D4D4] text-[#111111] accent-[#111111] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-[11px] text-[#666666] cursor-pointer select-none">
                    Remember this device for 30 days
                  </label>
                </div>

                {/* Continue CTA Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2.5 bg-[#111111] hover:bg-[#262626] disabled:opacity-50 text-white font-medium rounded-lg text-xs transition flex items-center justify-center space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                >
                  <span>{loading ? 'Authenticating...' : 'Continue'}</span>
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>
            </div>

            {/* Bottom Footer */}
            <div className="pt-6 border-t border-[#E5E5E5] mt-6 flex items-center justify-between text-xs text-[#666666]">
              <div className="flex items-center space-x-1.5 text-[11px] text-[#888888]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Encrypted Session</span>
              </div>
              <div>
                Don't have an account?{' '}
                <Link href="/register" className="text-[#111111] font-semibold hover:underline">
                  Create Workspace
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase & Live Product Mockup */}
          <div className="lg:col-span-7 bg-[#FAFAFA] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top Value Proposition Header */}
            <div className="relative z-10 max-w-lg mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight leading-snug">
                The modern CRM platform that saves you time, closes deals, and gets you paid fast!
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] mt-3 leading-relaxed">
                Run your entire sales & billing operations from one unified command center. Real-time leads, multi-stage pipelines, GST invoices, and Cashfree payments.
              </p>
            </div>

            {/* Interactive Live Mockup Showcase (Laptop Window + Phone Preview) */}
            <div className="relative z-10 w-full mt-auto pt-4 flex items-end justify-center">
              {/* Desktop Window Frame */}
              <div className="w-full bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300">
                {/* Window Titlebar */}
                <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#E5E5E5] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-[#888888] font-mono bg-white px-2.5 py-0.5 rounded border border-[#E5E5E5]">
                    <span>zyvocrm.in/dashboard</span>
                  </div>
                  <div className="w-10" />
                </div>

                {/* Dashboard Inner Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Top Metric Bar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg">
                      <div className="text-[10px] text-[#666666] font-medium">Revenue Summary</div>
                      <div className="text-lg font-bold font-mono text-[#111111] mt-0.5">₹18,42,500</div>
                      <div className="flex items-center space-x-1 text-[10px] text-[#16A34A] font-medium mt-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+24.5% vs last month</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg">
                      <div className="text-[10px] text-[#666666] font-medium">Active Deals</div>
                      <div className="text-lg font-bold font-mono text-[#111111] mt-0.5">328 Deals</div>
                      <div className="text-[10px] text-[#666666] mt-1">₹42.8L in pipeline</div>
                    </div>

                    <div className="p-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg">
                      <div className="text-[10px] text-[#666666] font-medium">Cashfree Payments</div>
                      <div className="text-lg font-bold font-mono text-[#111111] mt-0.5">100% Verified</div>
                      <div className="text-[10px] text-[#16A34A] font-medium mt-1">Instant settlements</div>
                    </div>
                  </div>

                  {/* Revenue Growth Chart Simulation */}
                  <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#111111]">Real-Time Cashflow & Deal Velocity</span>
                      <span className="text-[10px] text-[#666666] font-mono">Q3 Performance</span>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="h-16 w-full flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 60" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradientLogin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#111111" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#111111" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,50 Q40,45 80,38 T160,32 T240,22 T320,18 T400,6 L400,60 L0,60 Z"
                          fill="url(#chartGradientLogin)"
                        />
                        <path
                          d="M0,50 Q40,45 80,38 T160,32 T240,22 T320,18 T400,6"
                          fill="none"
                          stroke="#111111"
                          strokeWidth="2"
                        />
                        <circle cx="400" cy="6" r="3.5" fill="#111111" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Mobile Card Overlay */}
              <div className="hidden sm:block absolute -bottom-3 -right-2 sm:right-6 w-52 bg-white border border-[#E5E5E5] rounded-xl p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
                  <div className="flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#111111]" />
                    <span className="text-[10px] font-semibold text-[#111111]">Invoice #1029</span>
                  </div>
                  <span className="text-[9px] bg-green-50 text-[#16A34A] font-semibold px-1.5 py-0.5 rounded border border-green-200">
                    PAID
                  </span>
                </div>
                <div className="pt-2">
                  <div className="text-[14px] font-bold font-mono text-[#111111]">₹45,000.00</div>
                  <div className="text-[10px] text-[#666666] mt-0.5">Direct Cashfree Settlement</div>
                  <div className="flex items-center space-x-1 mt-2 text-[10px] text-[#16A34A]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="font-medium">Auto-synced to CRM</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Setup Flow Banner (Matching Reference Design) */}
      <div className="w-full max-w-5xl mt-5 bg-white border border-[#E5E5E5] rounded-xl px-6 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hidden md:flex items-center justify-between text-xs text-[#666666]">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-[#111111] font-semibold">
            <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px]">1</span>
            <span>Identity Verification</span>
          </div>
          <span className="text-[#D4D4D4] font-mono">/</span>
          <div className="flex items-center space-x-2 text-[#888888]">
            <span className="w-5 h-5 rounded-full border border-[#D4D4D4] flex items-center justify-center text-[10px]">2</span>
            <span>Tenant Routing</span>
          </div>
          <span className="text-[#D4D4D4] font-mono">/</span>
          <div className="flex items-center space-x-2 text-[#888888]">
            <span className="w-5 h-5 rounded-full border border-[#D4D4D4] flex items-center justify-center text-[10px]">3</span>
            <span>Encrypted Session Vault</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-[#666666]">
          <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Strict Multi-Tenant Isolation & Role-Based Access Control</span>
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
