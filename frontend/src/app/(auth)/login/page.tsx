'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  ShieldCheck, AlertCircle, ArrowRight, TrendingUp, CreditCard, 
  CheckCircle2, Lock, Eye, EyeOff, Mail, Sparkles, ArrowUpRight 
} from 'lucide-react';
import ZyvoLogo from '../../../components/ZyvoLogo';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-[#F6F6F8] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 antialiased selection:bg-[#111111] selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_0%,#E4E4E7_0%,transparent_75%)]" />

      {/* Main Split Floating Card Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white border border-[#E5E5E5] rounded-2xl sm:rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
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
                <div className="flex items-start space-x-2.5 p-3 mb-5 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626] animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#404040] mb-1.5">Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#999999] absolute left-3 top-2.5 pointer-events-none" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg pl-9.5 pr-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
                      placeholder="Enter your email" 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block font-medium text-[#404040]">Password</label>
                    <Link href="/forgot-password" className="text-[11px] text-[#666666] hover:text-[#111111] hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#999999] absolute left-3 top-2.5 pointer-events-none" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg pl-9.5 pr-10 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
                      placeholder="Enter your password" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#999999] hover:text-[#111111] transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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
                  className="w-full py-2.5 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] disabled:opacity-50 text-white font-medium rounded-lg text-xs transition duration-150 flex items-center justify-center space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
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

          {/* Right Column: Hero Showcase with 3D Perspective Laptop & Overlapping Phone */}
          <div className="lg:col-span-7 bg-[#FAFAFA] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle background dot grid pattern */}
            <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top Value Proposition Header */}
            <div className="relative z-10 max-w-lg mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight leading-snug">
                The modern CRM platform that saves you time, closes deals, and gets you paid fast!
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] mt-3 leading-relaxed">
                Run your entire sales & billing operations from one unified command center. Real-time leads, multi-stage pipelines, GST invoices, and Cashfree payments.
              </p>
            </div>

            {/* 3D Perspective Showcase Container */}
            <div className="relative z-10 w-full mt-auto pt-4 flex items-end justify-center perspective-[1200px]">
              
              {/* 3D Angled Laptop/Browser Window Frame */}
              <div 
                className="w-full bg-white border border-[#E5E5E5] rounded-xl sm:rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-700 ease-out hover:rotate-0 hover:scale-[1.01]"
                style={{
                  transform: 'perspective(1200px) rotateY(-6deg) rotateX(3deg) scale(0.98)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Window Titlebar */}
                <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#E5E5E5] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-[#888888] font-mono bg-white px-2.5 py-0.5 rounded border border-[#E5E5E5]">
                    <Lock className="w-2.5 h-2.5 text-[#16A34A]" />
                    <span>zyvocrm.in/dashboard</span>
                  </div>
                  <div className="w-10" />
                </div>

                {/* Dashboard Inner Content */}
                <div className="p-4 sm:p-5 space-y-3.5 bg-white">
                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                      <div className="text-[10px] text-[#666666] font-medium">Revenue Summary</div>
                      <div className="text-base sm:text-lg font-bold font-mono text-[#111111] mt-0.5">₹18,42,500</div>
                      <div className="flex items-center space-x-1 text-[9px] sm:text-[10px] text-[#16A34A] font-medium mt-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+24.5% vs last mo</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                      <div className="text-[10px] text-[#666666] font-medium">Active Deals</div>
                      <div className="text-base sm:text-lg font-bold font-mono text-[#111111] mt-0.5">328 Deals</div>
                      <div className="text-[9px] sm:text-[10px] text-[#666666] mt-1">₹42.8L pipeline</div>
                    </div>

                    <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                      <div className="text-[10px] text-[#666666] font-medium">Cashfree Payments</div>
                      <div className="text-base sm:text-lg font-bold font-mono text-[#111111] mt-0.5">100% Verified</div>
                      <div className="text-[9px] sm:text-[10px] text-[#16A34A] font-medium mt-1">Instant settlements</div>
                    </div>
                  </div>

                  {/* Real-Time Cashflow Chart */}
                  <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                        <span className="text-[11px] font-semibold text-[#111111]">Real-Time Cashflow & Deal Velocity</span>
                      </div>
                      <span className="text-[9px] text-[#666666] font-mono bg-[#F4F4F6] px-1.5 py-0.5 rounded">Live Engine</span>
                    </div>

                    {/* SVG Curve Chart */}
                    <div className="h-16 sm:h-20 w-full flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 65" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradientLogin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#111111" stopOpacity="0.14" />
                            <stop offset="100%" stopColor="#111111" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,52 Q40,48 80,40 T160,34 T240,24 T320,16 T400,6 L400,65 L0,65 Z"
                          fill="url(#chartGradientLogin)"
                        />
                        <path
                          d="M0,52 Q40,48 80,40 T160,34 T240,24 T320,16 T400,6"
                          fill="none"
                          stroke="#111111"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx="400" cy="6" r="4" fill="#111111" />
                        <circle cx="400" cy="6" r="8" fill="#111111" fillOpacity="0.15" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlapping Realistic Mobile Phone Mockup */}
              <div 
                className="hidden sm:block absolute -bottom-3 -right-2 sm:right-4 w-56 sm:w-60 bg-[#111111] p-1.5 rounded-[28px] shadow-[0_22px_45px_rgba(0,0,0,0.22)] border border-[#27272A] z-20 transition-transform duration-500 hover:scale-105"
              >
                {/* Phone Notch / Speaker Pill */}
                <div className="w-16 h-3 bg-[#111111] rounded-full mx-auto mb-1.5 flex items-center justify-center">
                  <span className="w-2.5 h-1 bg-[#27272A] rounded-full" />
                </div>

                {/* Inner Phone Screen Content */}
                <div className="bg-white rounded-[22px] p-3.5 border border-[#E5E5E5] space-y-2.5">
                  {/* Phone Header Notification */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
                    <div className="flex items-center space-x-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#111111]" />
                      <span className="text-[10px] font-bold text-[#111111]">Invoice #1029</span>
                    </div>
                    <span className="text-[9px] bg-green-50 text-[#16A34A] font-bold px-1.5 py-0.5 rounded border border-green-200 flex items-center space-x-0.5">
                      <span>PAID</span>
                    </span>
                  </div>

                  {/* Settlement Amount */}
                  <div className="pt-0.5">
                    <div className="text-[15px] font-bold font-mono text-[#111111] tracking-tight">₹45,000.00</div>
                    <div className="text-[10px] text-[#666666] mt-0.5 font-medium">Direct Cashfree Settlement</div>
                  </div>

                  {/* Real-time Status Badge */}
                  <div className="flex items-center justify-between p-2 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-[9px]">
                    <div className="flex items-center space-x-1 text-[#16A34A] font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Auto-synced to CRM</span>
                    </div>
                    <span className="text-[#888888] font-mono">Just now</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom Security / Trust Architecture Badge */}
      <div className="relative z-10 w-full max-w-5xl mt-5 bg-white border border-[#E5E5E5] rounded-xl px-6 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hidden md:flex items-center justify-between text-xs text-[#666666]">
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
