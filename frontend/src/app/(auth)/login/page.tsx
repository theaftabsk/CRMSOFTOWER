'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  ArrowRight, Eye, EyeOff, Mail, Lock, AlertCircle, X,
  FileText, TrendingUp, BarChart3, Settings2, ShieldCheck, Clock,
  Headphones, CreditCard, Sparkles, Activity
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

    if (!email.trim() || !password) {
      setError('Please enter both your work email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setError('Unable to reach authentication server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] antialiased selection:bg-[#111111] selection:text-white flex flex-col justify-between">
      
      {/* 1. TOP HEADER */}
      <header className="w-full border-b border-[#E5E5E5] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Left: Zyvo Logo in Black */}
          <Link href="/" className="flex items-center space-x-2 group">
            <ZyvoLogo height={28} className="text-[#111111]" />
          </Link>

          {/* Right: Create Account CTA */}
          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <span className="text-[#666666] hidden sm:inline">Don't have an account?</span>
            <Link 
              href="/register" 
              className="inline-flex items-center space-x-1.5 px-4 py-2 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white rounded-lg font-medium transition duration-150"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN LOGIN LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT: Sign In Form Card (~44% width on desktop) */}
          <div className="lg:col-span-5 bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-9 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            
            {/* Title & Subtitle */}
            <div className="mb-6 space-y-1.5">
              <h1 className="text-2xl sm:text-[26px] font-bold text-[#111111] tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-[#666666]">
                Sign in to your Zyvo account to continue to your workspace.
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="flex items-start justify-between p-3.5 mb-5 bg-[#FAFAFA] border border-[#DC2626]/40 rounded-xl text-xs text-[#DC2626] shadow-xs">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#DC2626]" />
                  <span className="font-medium">{error}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setError(null)}
                  className="text-[#666666] hover:text-[#111111] ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#111111] mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3 top-2.5 pointer-events-none" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl pl-9.5 pr-3 py-2.5 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-2xs" 
                    placeholder="you@company.com" 
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-medium text-[#111111]">Password</label>
                  <Link href="/forgot-password" className="text-[11px] text-[#111111] hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3 top-2.5 pointer-events-none" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl pl-9.5 pr-10 py-2.5 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-2xs" 
                    placeholder="Enter your password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#888888] hover:text-[#111111] transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Keep me signed in */}
              <div className="flex items-center space-x-2.5 pt-1">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D4D4D4] text-[#000000] accent-[#000000] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-[11px] text-[#666666] cursor-pointer select-none">
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Sign In CTA */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-[#000000] hover:bg-[#262626] disabled:opacity-50 text-white font-medium rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-2 mt-2 group shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.16)]"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            {/* OR DIVIDER */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E5E5]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-[#888888] font-mono text-[10px] tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* SOCIAL AUTHENTICATION BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => window.location.href = '/api/auth/sso?provider=google'}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#FAFAFA] rounded-xl text-xs font-medium text-[#111111] transition duration-150 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button 
                type="button" 
                onClick={() => window.location.href = '/api/auth/sso?provider=microsoft'}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#FAFAFA] rounded-xl text-xs font-medium text-[#111111] transition duration-150 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                <span>Continue with Microsoft</span>
              </button>
            </div>

            {/* Bottom Text */}
            <div className="mt-8 text-center text-xs text-[#666666]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#111111] font-bold hover:underline">
                Create Account
              </Link>
            </div>

          </div>

          {/* RIGHT: CRM Product Marketing & Product Preview (~56% width on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            
            {/* Top Marketing Section */}
            <div>
              {/* Badge: Modern CRM for Growing Businesses */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-[#111111] rounded-full text-xs font-medium text-[#111111] mb-5">
                <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
                <span>Modern CRM for Growing Businesses</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-[#111111] tracking-tight leading-[1.08] mb-4">
                Close More Deals. <br />
                Grow Faster.
              </h2>

              {/* Supporting Paragraph */}
              <p className="text-sm sm:text-base text-[#666666] max-w-xl leading-relaxed">
                Zyvo helps you manage leads, track sales, generate GST invoices, and automate your entire business workflow — all in one unified platform.
              </p>
            </div>

            {/* FEATURE HIGHLIGHTS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-y border-[#E5E5E5]">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#999999]">01</div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#111111]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Sales Pipeline</span>
                </div>
                <p className="text-[11px] text-[#666666] leading-tight">Track & convert leads</p>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#999999]">02</div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#111111]">
                  <FileText className="w-3.5 h-3.5 text-[#111111]" />
                  <span>GST Invoicing</span>
                </div>
                <p className="text-[11px] text-[#666666] leading-tight">Create & send invoices</p>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#999999]">03</div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#111111]">
                  <BarChart3 className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Smart Analytics</span>
                </div>
                <p className="text-[11px] text-[#666666] leading-tight">Make data-driven decisions</p>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#999999]">04</div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#111111]">
                  <Settings2 className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Automation</span>
                </div>
                <p className="text-[11px] text-[#666666] leading-tight">Save time & scale</p>
              </div>
            </div>

            {/* PRODUCT MOCKUP: Realistic SaaS Dashboard + Overlapping Phone */}
            <div className="relative pt-2">
              <div className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                {/* Titlebar */}
                <div className="px-3.5 py-2.5 bg-[#FAFAFA] border-b border-[#E5E5E5] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-[#666666] font-mono bg-white px-2.5 py-0.5 rounded border border-[#E5E5E5]">
                    <Lock className="w-2.5 h-2.5 text-[#111111]" />
                    <span>zyvocrm.in/dashboard</span>
                  </div>
                  <div className="w-8" />
                </div>

                {/* Dashboard Inner Shell */}
                <div className="grid grid-cols-12 min-h-[300px] text-xs">
                  {/* Dashboard Sidebar */}
                  <div className="col-span-3 border-r border-[#E5E5E5] p-3 space-y-3 bg-[#FAFAFA]">
                    <div className="px-1 text-[11px] font-bold text-[#111111] uppercase tracking-wider">
                      Zyvo CRM
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="px-2 py-1 bg-[#111111] text-white rounded font-medium">Dashboard</div>
                      <div className="px-2 py-1 text-[#666666] hover:text-[#111111]">Leads</div>
                      <div className="px-2 py-1 text-[#666666] hover:text-[#111111]">Deals</div>
                      <div className="px-2 py-1 text-[#666666] hover:text-[#111111]">Customers</div>
                      <div className="px-2 py-1 text-[#666666] hover:text-[#111111]">Invoices</div>
                      <div className="px-2 py-1 text-[#666666] hover:text-[#111111]">Reports</div>
                      <div className="px-2 py-1 text-[#666666] hover:text-[#111111]">Settings</div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="col-span-9 p-4 space-y-3.5 bg-white">
                    {/* Header */}
                    <div>
                      <h3 className="text-sm font-bold text-[#111111]">Dashboard</h3>
                      <p className="text-[10px] text-[#666666]">Here's what's happening with your business today.</p>
                    </div>

                    {/* KPI Cards: 4 metrics */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA]">
                        <div className="text-[9px] text-[#666666]">Total Leads</div>
                        <div className="text-sm font-bold font-mono text-[#111111]">248</div>
                        <div className="text-[8px] text-[#111111] font-mono">+12% vs last mo</div>
                      </div>

                      <div className="p-2 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA]">
                        <div className="text-[9px] text-[#666666]">Active Deals</div>
                        <div className="text-sm font-bold font-mono text-[#111111]">76</div>
                        <div className="text-[8px] text-[#111111] font-mono">+8%</div>
                      </div>

                      <div className="p-2 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA]">
                        <div className="text-[9px] text-[#666666]">Revenue</div>
                        <div className="text-sm font-bold font-mono text-[#111111]">₹18,42,500</div>
                        <div className="text-[8px] text-[#111111] font-mono">+24%</div>
                      </div>

                      <div className="p-2 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA]">
                        <div className="text-[9px] text-[#666666]">Invoices</div>
                        <div className="text-sm font-bold font-mono text-[#111111]">148</div>
                        <div className="text-[8px] text-[#111111] font-mono">+18%</div>
                      </div>
                    </div>

                    {/* Sales Overview Chart */}
                    <div className="border border-[#E5E5E5] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-[#111111]">Sales Overview</span>
                        <span className="text-[8px] font-mono text-[#666666]">Jan - Sep 2026</span>
                      </div>
                      <div className="h-16 w-full flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 360 60" preserveAspectRatio="none">
                          <line x1="0" y1="15" x2="360" y2="15" stroke="#F0F0F0" strokeDasharray="3 3" />
                          <line x1="0" y1="35" x2="360" y2="35" stroke="#F0F0F0" strokeDasharray="3 3" />
                          <path
                            d="M0,50 Q45,45 90,38 T180,28 T270,18 T360,8"
                            fill="none"
                            stroke="#111111"
                            strokeWidth="2"
                          />
                          <circle cx="360" cy="8" r="3" fill="#111111" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-[#999999] pt-1 border-t border-[#F0F0F0]">
                        <span>Jan</span>
                        <span>Mar</span>
                        <span>May</span>
                        <span>Jul</span>
                        <span>Sep</span>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 border border-[#E5E5E5] rounded bg-[#FAFAFA] flex items-center justify-between">
                        <span className="text-[#111111]">New Lead: Tech Mahindra</span>
                        <span className="text-[#888888] font-mono text-[9px]">2m ago</span>
                      </div>
                      <div className="p-2 border border-[#E5E5E5] rounded bg-[#FAFAFA] flex items-center justify-between">
                        <span className="text-[#111111]">Invoice #1029 Paid</span>
                        <span className="text-[#888888] font-mono text-[9px]">Just now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlapping Mobile Mockup */}
              <div className="hidden sm:block absolute -bottom-4 -right-3 w-48 bg-[#000000] p-1.5 rounded-[26px] shadow-[0_20px_35px_rgba(0,0,0,0.22)] border border-[#333333]">
                <div className="w-12 h-2.5 bg-[#000000] rounded-full mx-auto mb-1 flex items-center justify-center">
                  <span className="w-2 h-0.5 bg-[#333333] rounded-full" />
                </div>
                <div className="bg-white rounded-[20px] p-2.5 border border-[#E5E5E5] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#E5E5E5]">
                    <span className="text-[9px] font-bold text-[#111111]">Today</span>
                    <span className="text-[8px] font-mono text-[#888888]">Live</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[8px]">
                    <div className="p-1 bg-[#FAFAFA] rounded border border-[#E5E5E5]">
                      <div className="text-[#666666]">Leads</div>
                      <div className="font-bold font-mono text-[#111111]">248</div>
                    </div>
                    <div className="p-1 bg-[#FAFAFA] rounded border border-[#E5E5E5]">
                      <div className="text-[#666666]">Deals</div>
                      <div className="font-bold font-mono text-[#111111]">76</div>
                    </div>
                  </div>
                  <div className="p-1.5 bg-[#FAFAFA] rounded border border-[#E5E5E5] text-[8px]">
                    <div className="text-[#666666]">Revenue</div>
                    <div className="font-bold font-mono text-[#111111] text-[10px]">₹18,42,500</div>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTTOM BENEFITS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E5E5E5]">
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#111111]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111111]">Free 14-Day Trial</div>
                  <div className="text-[11px] text-[#666666]">No credit card required</div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111111]">Secure & Encrypted</div>
                  <div className="text-[11px] text-[#666666]">Your data is protected</div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5 text-[#111111]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111111]">Cancel Anytime</div>
                  <div className="text-[11px] text-[#666666]">No long-term commitment</div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                  <Headphones className="w-3.5 h-3.5 text-[#111111]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111111]">Dedicated Support</div>
                  <div className="text-[11px] text-[#666666]">We’re here to help</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#E5E5E5] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666] space-y-3 sm:space-y-0">
          <div>
            &copy; 2026 Zyvo. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/terms" className="hover:text-[#111111] transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#111111] transition">Privacy Policy</Link>
            <Link href="/support" className="hover:text-[#111111] transition">Help & Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="text-xs font-mono text-[#666666]">Loading authentication...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
