'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  ArrowRight, Eye, EyeOff, Mail, Lock, User, AlertCircle, X, Sparkles, TrendingUp
} from 'lucide-react';
import ZyvoLogo from '../../../components/ZyvoLogo';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const organizationName = `${firstName}'s Workspace`;
      const res = await register(fullName, email, password, organizationName);
      if (res.success) {
        // Redirect directly to company setup onboarding
        router.push('/onboarding');
      } else {
        setError(res.error || 'Registration failed. Please check your inputs.');
      }
    } catch {
      setError('Unable to reach authentication server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#FFFFFF] text-[#111111] antialiased selection:bg-[#111111] selection:text-white flex flex-col justify-between relative">
      
      {/* Smooth Subtle Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-neutral-200/35 via-neutral-100/20 to-transparent blur-[120px]" />
        <div className="absolute -bottom-20 left-10 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-zinc-200/30 via-stone-100/20 to-transparent blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* 1. TOP HEADER */}
      <header className="w-full border-b border-[#E5E5E5] bg-white/95 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ZyvoLogo height={26} className="text-[#111111]" />
          </Link>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-[#666666] hidden sm:inline">Already have an account?</span>
            <Link 
              href="/login" 
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white rounded-lg font-medium transition duration-150 shadow-2xs"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN REGISTRATION CONTENT (Single Viewport Fit on Desktop) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT: Clean Compact Registration Card (~42% width) */}
          <div className="lg:col-span-5 bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            
            {/* Title & Subtitle */}
            <div className="mb-5 space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                Create your account
              </h1>
              <p className="text-xs text-[#666666]">
                Get started with your free workspace. No credit card required.
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="flex items-start justify-between p-3 mb-4 bg-[#FAFAFA] border border-[#DC2626]/40 rounded-xl text-xs text-[#DC2626] shadow-2xs">
                <div className="flex items-start space-x-2">
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {/* First Name & Last Name (Side by side) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-[#111111] mb-1">First Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required 
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-2xs" 
                      placeholder="John" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#111111] mb-1">Last Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required 
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-2xs" 
                      placeholder="Doe" 
                    />
                  </div>
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block font-medium text-[#111111] mb-1">Work Email</label>
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
                    className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl pl-9.5 pr-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-2xs" 
                    placeholder="you@company.com" 
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-[#111111]">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#666666] hover:text-[#111111]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3 top-2.5 pointer-events-none" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    minLength={6}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl pl-9.5 pr-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-2xs" 
                    placeholder="Minimum 6 characters" 
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center space-x-2 pt-0.5">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D4D4D4] text-[#000000] accent-[#000000] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-[#666666] cursor-pointer select-none">
                  I agree to the{' '}
                  <span className="text-[#111111] underline underline-offset-2">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-[#111111] underline underline-offset-2">Privacy Policy</span>
                </label>
              </div>

              {/* Create Account CTA Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 bg-[#000000] hover:bg-[#262626] disabled:opacity-50 text-white font-medium rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1.5 mt-2 group shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
              >
                <span>{loading ? 'Creating workspace...' : 'Create Account'}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            {/* OR DIVIDER */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E5E5]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2.5 text-[#888888] font-mono text-[9px] tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                type="button" 
                onClick={() => window.location.href = '/api/auth/sso?provider=google'}
                className="flex items-center justify-center space-x-2 py-2 px-3 border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#FAFAFA] rounded-xl text-xs font-medium text-[#111111] transition duration-150 shadow-2xs"
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
                className="flex items-center justify-center space-x-2 py-2 px-3 border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#FAFAFA] rounded-xl text-xs font-medium text-[#111111] transition duration-150 shadow-2xs"
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

            {/* Bottom Link */}
            <div className="mt-5 text-center text-xs text-[#666666]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#111111] font-bold hover:underline">
                Sign In
              </Link>
            </div>

          </div>

          {/* RIGHT: Clean, Powerful Hero Presentation with 3D Laptop/Phone Mockup (~58% width) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
            
            {/* Header copy */}
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-[#111111] rounded-full text-[11px] font-medium text-[#111111] mb-2.5">
                <Sparkles className="w-3 h-3 text-[#111111]" />
                <span>Modern CRM for Growing Businesses</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight leading-tight mb-1.5">
                Start Managing Your Business with Zyvo.
              </h2>

              <p className="text-xs sm:text-sm text-[#666666] max-w-lg leading-relaxed">
                Run your entire sales & billing operations from one unified command center. Real-time leads, multi-stage pipelines, GST invoices, and Cashfree payments.
              </p>
            </div>

            {/* Clean Realistic 3D Laptop & Phone Showcase Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-[#E5E5E5] bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.08)] group">
              <Image 
                src="/zyvo-3d-showcase.jpg" 
                alt="Zyvo CRM 3D Command Center & Invoice Showcase"
                width={1200}
                height={675}
                priority
                className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500 ease-out"
              />
              
              {/* Subtle Ambient Live Badge */}
              <div className="absolute bottom-3 left-3 flex items-center space-x-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-lg border border-[#E5E5E5] text-[10px] font-semibold text-[#111111] shadow-xs">
                <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Real-Time Deal Velocity • ₹18.4L MTD</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER (Compact minimal line) */}
      <footer className="w-full border-t border-[#E5E5E5] bg-white py-3 shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#666666] space-y-2 sm:space-y-0">
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
