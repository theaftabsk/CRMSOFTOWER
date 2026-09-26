'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  ShieldCheck, AlertCircle, ArrowRight, TrendingUp, CreditCard, 
  Lock, Eye, EyeOff, Mail, Sparkles, X, CheckCircle2 
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
    <div className="min-h-screen bg-[#F6F7F9] relative flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 antialiased selection:bg-[#111111] selection:text-white overflow-hidden">
      
      {/* Liquid Glass Ambient Aurora Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[12%] -left-[10%] w-[580px] h-[580px] rounded-full bg-gradient-to-br from-neutral-300/40 via-neutral-200/20 to-transparent blur-[120px] animate-pulse duration-1000" />
        <div className="absolute -bottom-[18%] -right-[12%] w-[680px] h-[680px] rounded-full bg-gradient-to-tl from-zinc-300/35 via-stone-200/20 to-transparent blur-[140px]" />
        <div className="absolute top-[35%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-gradient-to-r from-emerald-100/25 via-zinc-200/20 to-neutral-300/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Embedded CSS Animations */}
      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-0.3deg); }
        }
        .animate-glass-float {
          animation: floatSlow 5s ease-in-out infinite;
        }
        .glass-reflection {
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);
        }
      `}</style>

      {/* Main Liquid Glass Container (Inverted: Showcase on Left, Form on Right) */}
      <div className="relative z-10 w-full max-w-5xl bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl shadow-[0_24px_70px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Column: Hero Showcase (Inverted layout for Login) */}
          <div className="lg:col-span-7 order-2 lg:order-1 bg-gradient-to-br from-[#FAFAFA] via-[#F4F4F6] to-[#ECECEE] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-r border-[#E5E5E5] animate-in fade-in slide-in-from-left-6 duration-600 ease-out">
            {/* Subtle Glass Reflection Light Beam */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-white/70 via-white/10 to-transparent pointer-events-none rounded-full blur-3xl" />

            {/* Top Value Proposition Header */}
            <div className="relative z-10 max-w-lg mb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight leading-snug">
                The modern CRM platform that saves you time, closes deals, and gets you paid fast!
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] mt-3 leading-relaxed">
                Run your entire sales & billing operations from one unified command center. Real-time leads, multi-stage pipelines, GST invoices, and Cashfree payments.
              </p>
            </div>

            {/* Hyper-Realistic 3D Showcase Frame with Smooth Float Animation */}
            <div className="relative z-10 w-full mt-auto pt-2 flex items-center justify-center">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18)] border border-white/80 bg-white/40 backdrop-blur-xl animate-glass-float group">
                
                {/* 3D Render Display */}
                <Image 
                  src="/zyvo-3d-showcase.jpg" 
                  alt="Zyvo CRM 3D Command Center & Invoice Showcase"
                  width={1200}
                  height={675}
                  priority
                  className="w-full h-auto object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />

                {/* Diagonal Liquid Glass Reflection Overlay */}
                <div className="absolute inset-0 glass-reflection pointer-events-none" />

                {/* Floating Live Badge: Verified Settlement */}
                <div className="absolute top-3.5 right-3.5 hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-medium shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                  </span>
                  <span>Cashfree Verified Settlement</span>
                </div>

                {/* Floating Live Badge: Deal Engine */}
                <div className="absolute bottom-3.5 left-3.5 hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg border border-[#E5E5E5] text-[#111111] text-[10px] font-semibold shadow-md">
                  <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Real-Time Deal Velocity • ₹18.4L MTD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Form (Inverted layout for Login) */}
          <div className="lg:col-span-5 order-1 lg:order-2 p-6 sm:p-10 flex flex-col justify-between bg-white/90 backdrop-blur-md animate-in fade-in slide-in-from-right-6 duration-600 ease-out">
            <div>
              {/* Brand Logo Header & Quick Navigation Switch */}
              <div className="flex items-center justify-between mb-8">
                <ZyvoLogo height={28} className="text-[#111111]" />
                
                {/* Seamless Switch Pills */}
                <div className="flex items-center p-1 bg-[#F4F4F6] rounded-lg border border-[#E5E5E5] text-xs">
                  <span className="px-2.5 py-1 bg-white text-[#111111] font-semibold rounded-md shadow-xs transition">
                    Sign In
                  </span>
                  <Link 
                    href="/register" 
                    className="px-2.5 py-1 text-[#666666] hover:text-[#111111] transition"
                  >
                    Register
                  </Link>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs text-[#666666]">
                  Enter your credentials to access your sales workspace
                </p>
              </div>

              {/* Interactive Smooth Error Alert */}
              {error && (
                <div className="flex items-start justify-between p-3.5 mb-5 bg-red-50/90 backdrop-blur-sm border border-red-200/80 rounded-xl text-xs text-[#DC2626] shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start space-x-2.5">
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg pl-9.5 pr-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-sm" 
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg pl-9.5 pr-10 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-sm" 
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
                  className="w-full py-2.5 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] disabled:opacity-50 text-white font-medium rounded-lg text-xs transition duration-150 flex items-center justify-center space-x-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
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
