'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  Eye, EyeOff, AlertCircle, X, TrendingUp, CheckCircle2, 
  Calendar, CreditCard, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import ZyvoLogo from '../../../components/ZyvoLogo';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms & Privacy to continue.');
      return;
    }

    setLoading(true);

    try {
      // Organization name defaults cleanly from user's name if omitted
      const orgName = `${name.trim()}'s Workspace`;
      const res = await register(name, email, password, orgName);
      if (res.success) {
        router.push('/onboarding');
      } else {
        setError(res.error || 'Registration failed. Please check inputs and try again.');
      }
    } catch {
      setError('Unable to reach authentication server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F6] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 antialiased selection:bg-[#3B5BFF] selection:text-white">
      
      {/* Master Container Card */}
      <div className="w-full max-w-6xl bg-white rounded-3xl sm:rounded-[36px] shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-[#E8ECF2] p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full min-h-[560px]">
            <div>
              {/* Logo */}
              <div className="mb-10">
                <Link href="/" className="inline-block">
                  <ZyvoLogo height={32} className="text-[#111111]" />
                </Link>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
                  Get Started Now
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
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                    Name
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-white border border-[#DDE2EA] focus:border-[#3B5BFF] focus:ring-4 focus:ring-[#3B5BFF]/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] outline-none transition" 
                    placeholder="Rafiqur Rahman" 
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
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
                    className="w-full bg-white border border-[#DDE2EA] focus:border-[#3B5BFF] focus:ring-4 focus:ring-[#3B5BFF]/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] outline-none transition" 
                    placeholder="rafiqur51@company.com" 
                  />
                </div>

                {/* Password with Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#111111]">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      minLength={6}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full bg-white border border-[#DDE2EA] focus:border-[#3B5BFF] focus:ring-4 focus:ring-[#3B5BFF]/10 rounded-xl pl-4 pr-11 py-3 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] outline-none transition" 
                      placeholder="min 8 chars" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[#999999] hover:text-[#111111] transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="flex items-center space-x-2 pt-1">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DDE2EA] text-[#3B5BFF] accent-[#3B5BFF] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-[#555555] cursor-pointer select-none">
                    I agree to the <span className="text-[#111111] underline underline-offset-2">Terms &amp; Privacy</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-[#3B5BFF] hover:bg-[#2B47EE] active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition duration-150 shadow-[0_4px_16px_rgba(59,91,255,0.25)] flex items-center justify-center space-x-2 mt-2"
                >
                  <span>{loading ? 'Creating workspace...' : 'Get Started'}</span>
                </button>
              </form>

              {/* Switch link */}
              <div className="mt-6 text-xs text-[#666666]">
                Have an account?{' '}
                <Link href="/login" className="text-[#3B5BFF] font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </div>

            {/* Bottom Copyright */}
            <div className="pt-8 text-xs text-[#999999]">
              &copy; 2026 Zyvo, All rights Reserved
            </div>
          </div>

          {/* Right Column: Reference-Style Showcase Card */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#3B5BFF] to-[#2544E8] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(59,91,255,0.28)] min-h-[580px]">
            
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Text */}
            <div className="space-y-2 mb-8 relative z-10 max-w-md">
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                The simplest way to manage your workforce
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Enter your credentials to access your unified sales &amp; billing command center.
              </p>
            </div>

            {/* Interactive Multi-Layer Dashboard Mockup */}
            <div className="relative z-10 my-auto">
              
              {/* Main White Dashboard Card */}
              <div className="bg-white rounded-2xl p-5 shadow-2xl text-[#111111] space-y-4 max-w-lg">
                
                {/* Dashboard Top bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#111111]">Dashboard</span>
                    <span className="text-[10px] text-[#666666] bg-[#F4F4F6] px-2 py-0.5 rounded-md flex items-center space-x-1 font-medium">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>Dec 27, 2026 - Jan 03, 2027</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#111111] text-white text-[9px] font-bold text-center leading-5">AK</span>
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#3B5BFF] text-white text-[9px] font-bold text-center leading-5">RD</span>
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#16A34A] text-white text-[9px] font-bold text-center leading-5">+2</span>
                    </div>
                    <span className="text-[10px] text-[#3B5BFF] bg-[#3B5BFF]/10 font-semibold px-2 py-0.5 rounded-md">
                      + Add members
                    </span>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8F9FC] rounded-xl p-3 border border-[#EAEFF8]">
                    <div className="text-[10px] text-[#666666] font-medium">Productive Time / Day</div>
                    <div className="text-base font-bold font-mono text-[#111111] mt-0.5">12.4 hr</div>
                    <div className="flex items-center space-x-1 text-[9px] text-[#16A34A] font-semibold mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+23% last week</span>
                    </div>
                  </div>

                  <div className="bg-[#F8F9FC] rounded-xl p-3 border border-[#EAEFF8]">
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
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3B5BFF]" />
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
                    <span className="text-[#3B5BFF] font-semibold bg-blue-50 px-1.5 py-0.5 rounded text-[9px]">OPTIMAL</span>
                    <span className="font-mono text-[#111111]">85.00%</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] py-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      <span className="text-[#333333] font-medium">Billing &amp; Collections</span>
                    </div>
                    <span className="text-[#16A34A] font-semibold bg-green-50 px-1.5 py-0.5 rounded text-[9px]">SYNCED</span>
                    <span className="font-mono text-[#111111]">100.00%</span>
                  </div>
                </div>

              </div>

              {/* Overlapping Floating Modal (Invoice / Cashfree Settlement) */}
              <div className="hidden sm:block absolute -bottom-5 -right-3 w-56 bg-white rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-[#E5E5E5] p-3.5 text-[#111111] animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-[#111111]">
                    <CreditCard className="w-3 h-3 text-[#3B5BFF]" />
                    <span>Invoice #1029</span>
                  </div>
                  <span className="text-[9px] bg-green-50 text-[#16A34A] font-bold px-1.5 py-0.5 rounded border border-green-200">
                    PAID
                  </span>
                </div>
                <div className="pt-2">
                  <div className="text-sm font-bold font-mono text-[#111111]">₹45,000.00</div>
                  <div className="text-[9px] text-[#666666] mt-0.5">Direct Cashfree Settlement</div>
                  <div className="flex items-center space-x-1 text-[9px] text-[#16A34A] font-semibold mt-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto-synced to CRM</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Partner Trust Logos */}
            <div className="pt-8 border-t border-white/15 flex items-center justify-between text-xs text-white/70 font-semibold tracking-wide">
              <span>Cashfree</span>
              <span>GST Portal</span>
              <span>Stripe</span>
              <span>Razorpay</span>
              <span>AWS</span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
