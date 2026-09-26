'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  Eye, EyeOff, AlertCircle, X, TrendingUp, CheckCircle2, 
  Calendar, CreditCard, ArrowRight
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
      setError('Please enter your email and password.');
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
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 antialiased selection:bg-[#111111] selection:text-white">
      
      {/* Master Container Card: 100% Mobile, Tablet & Desktop Responsive */}
      <div className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-[32px] lg:rounded-[36px] shadow-[0_20px_70px_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-5 sm:p-8 lg:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-5 flex flex-col justify-between w-full">
            <div>
              {/* Logo */}
              <div className="mb-6 sm:mb-8 lg:mb-10">
                <Link href="/" className="inline-block">
                  <ZyvoLogo height={28} className="text-[#111111] sm:h-[32px]" />
                </Link>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5 mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#111111] tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-[#666666]">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start justify-between p-3.5 mb-5 bg-red-50 border border-red-200 rounded-xl text-xs text-[#DC2626] animate-in fade-in duration-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#DC2626]" />
                    <span className="font-medium">{error}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-700 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-xs">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5 sm:mb-2">
                    Email address
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] outline-none transition" 
                    placeholder="Enter your email" 
                  />
                </div>

                {/* Password with Forgot password? right above */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <label className="block text-xs font-semibold text-[#111111]">
                      Password
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs font-semibold text-[#111111] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 rounded-xl pl-3.5 sm:pl-4 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] outline-none transition" 
                      placeholder="Enter your password" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 sm:top-3.5 text-[#999999] hover:text-[#111111] transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2 pt-0.5">
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D4D4D4] text-[#111111] accent-[#111111] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-[#555555] cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition duration-150 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Signing in...' : 'Login'}</span>
                </button>
              </form>

              {/* Switch link */}
              <div className="mt-5 sm:mt-6 text-xs text-[#666666]">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-[#111111] font-bold hover:underline">
                  Sign up
                </Link>
              </div>
            </div>

            {/* Bottom Copyright */}
            <div className="pt-6 sm:pt-8 text-[11px] text-[#999999]">
              &copy; 2026 Zyvo, All rights Reserved
            </div>
          </div>

          {/* Right Column: Monochrome White & Black Luxury Showcase Card */}
          <div className="hidden md:flex lg:col-span-7 bg-[#111111] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-[#27272A] min-h-[500px] lg:min-h-[560px]">
            
            {/* Background subtle light beam */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header Text */}
            <div className="space-y-2 mb-6 lg:mb-8 relative z-10 max-w-md">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">
                The simplest way to manage your workforce
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Enter your credentials to access your unified sales &amp; billing command center.
              </p>
            </div>

            {/* Interactive Multi-Layer Dashboard Mockup */}
            <div className="relative z-10 my-auto">
              
              {/* Main White Dashboard Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl text-[#111111] space-y-3.5 lg:space-y-4 max-w-lg border border-[#E5E5E5]">
                
                {/* Dashboard Top bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#111111]">Dashboard</span>
                    <span className="text-[10px] text-[#666666] bg-[#F4F4F6] px-2 py-0.5 rounded-md flex items-center space-x-1 font-medium border border-[#E5E5E5]">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>Dec 27, 2026 - Jan 03, 2027</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#111111] text-white text-[9px] font-bold text-center leading-5">AK</span>
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#555555] text-white text-[9px] font-bold text-center leading-5">RD</span>
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#16A34A] text-white text-[9px] font-bold text-center leading-5">+2</span>
                    </div>
                    <span className="text-[10px] text-[#111111] bg-[#F4F4F6] border border-[#E5E5E5] font-semibold px-2 py-0.5 rounded-md">
                      + Add members
                    </span>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FAFAFA] rounded-xl p-3 border border-[#E5E5E5]">
                    <div className="text-[10px] text-[#666666] font-medium">Productive Time / Day</div>
                    <div className="text-base font-bold font-mono text-[#111111] mt-0.5">12.4 hr</div>
                    <div className="flex items-center space-x-1 text-[9px] text-[#16A34A] font-semibold mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+23% last week</span>
                    </div>
                  </div>

                  <div className="bg-[#FAFAFA] rounded-xl p-3 border border-[#E5E5E5]">
                    <div className="text-[10px] text-[#666666] font-medium">Active Pipeline Value</div>
                    <div className="text-base font-bold font-mono text-[#111111] mt-0.5">₹42.8L</div>
                    <div className="text-[9px] text-[#666666] mt-1 font-medium">328 Active Deals</div>
                  </div>
                </div>

                {/* Utilization Progress Table */}
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold text-[#111111]">Team&apos;s Utilization</div>
                  
                  <div className="flex items-center justify-between text-[10px] py-1 border-b border-[#F4F4F6]">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                      <span className="text-[#333333] font-medium">Marketing Operations</span>
                    </div>
                    <span className="text-[#16A34A] font-semibold bg-green-50 px-1.5 py-0.5 rounded text-[9px]">HIGH</span>
                    <span className="font-mono text-[#111111]">60.00%</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] py-1 border-b border-[#F4F4F6]">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      <span className="text-[#333333] font-medium">Direct Sales Team</span>
                    </div>
                    <span className="text-[#111111] font-semibold bg-neutral-100 px-1.5 py-0.5 rounded text-[9px]">OPTIMAL</span>
                    <span className="font-mono text-[#111111]">85.00%</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] py-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                      <span className="text-[#333333] font-medium">Billing &amp; Collections</span>
                    </div>
                    <span className="text-[#16A34A] font-semibold bg-green-50 px-1.5 py-0.5 rounded text-[9px]">SYNCED</span>
                    <span className="font-mono text-[#111111]">100.00%</span>
                  </div>
                </div>

              </div>

              {/* Overlapping Floating Modal */}
              <div className="hidden lg:block absolute -bottom-5 -right-3 w-56 bg-white rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.28)] border border-[#E5E5E5] p-3.5 text-[#111111] animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-[#111111]">
                    <CreditCard className="w-3 h-3 text-[#111111]" />
                    <span>Invoice #1029</span>
                  </div>
                  <span className="text-[9px] bg-green-50 text-[#16A34A] font-bold px-1.5 py-0.5 rounded border border-green-200">
                    PAID
                  </span>
                </div>
                <div className="pt-2">
                  <div className="text-sm font-bold font-mono text-[#111111]">₹45,000.00</div>
                  <div className="text-[9px] text-[#666666] mt-0.5">Instant Gateway Settlement</div>
                  <div className="flex items-center space-x-1 text-[9px] text-[#16A34A] font-semibold mt-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto-synced to CRM</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <span className="text-xs font-mono text-[#666666]">Loading authentication...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
