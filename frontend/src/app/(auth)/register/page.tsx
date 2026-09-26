'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  Eye, EyeOff, AlertCircle, X, TrendingUp, CheckCircle2, 
  Calendar, CreditCard, ArrowRight, ArrowLeft, ShieldCheck, Mail, KeyRound
} from 'lucide-react';
import ZyvoLogo from '../../../components/ZyvoLogo';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  // Form State
  const [step, setStep] = useState<'DETAILS' | 'VERIFY_OTP'>('DETAILS');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Feedback State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Validate details and send real OTP
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please enter a valid work email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 2-step password verification
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both passwords.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms & Privacy to continue.');
      return;
    }

    setLoading(true);

    try {
      // Dispatch real 6-digit OTP code to the user's email via Resend
      const res = await fetch('/api/mail/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          type: 'VERIFICATION',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('VERIFY_OTP');
        setResendCooldown(45);
      } else {
        setError(data.message || 'Failed to dispatch verification code. Please check your email.');
      }
    } catch {
      setError('Unable to reach verification server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/mail/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          type: 'VERIFICATION',
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResendCooldown(45);
      } else {
        setError(data.message || 'Failed to resend verification code.');
      }
    } catch {
      setError('Unable to reach verification server.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP and complete registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify OTP with real PostgreSQL database
      const verifyRes = await fetch('/api/mail/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otpCode: cleanOtp,
          type: 'VERIFICATION',
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setError(verifyData.message || 'Invalid or expired verification code.');
        setLoading(false);
        return;
      }

      // 2. Complete registration on backend
      const orgName = `${name.trim()}'s Workspace`;
      const regRes = await register(name, email, password, orgName);

      if (regRes.success) {
        // Proceed directly into the 7-step onboarding flow
        router.push('/onboarding');
      } else {
        setError(regRes.error || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('An error occurred during verification. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 antialiased selection:bg-[#111111] selection:text-white">
      
      {/* Master Container Card */}
      <div className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-[32px] lg:rounded-[36px] shadow-[0_20px_70px_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-5 sm:p-8 lg:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Multi-Step Registration Form */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full min-h-[580px]">
            <div>
              {/* Logo */}
              <div className="mb-8">
                <Link href="/" className="inline-block">
                  <ZyvoLogo height={32} className="text-[#111111]" />
                </Link>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5 mb-7">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
                  {step === 'DETAILS' ? 'Get Started Now' : 'Verify Your Email'}
                </h1>
                <p className="text-xs sm:text-sm text-[#666666]">
                  {step === 'DETAILS' 
                    ? 'Enter your credentials to create your workspace account' 
                    : `We've sent a 6-digit security code to ${email}`}
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

              {/* STEP 1: Details Form */}
              {step === 'DETAILS' && (
                <form onSubmit={handleInitiateSignup} className="space-y-3.5 text-xs">
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
                      className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] outline-none transition" 
                      placeholder="Enter your name" 
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
                      className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] outline-none transition" 
                      placeholder="Enter your email" 
                    />
                  </div>

                  {/* Password (1st time) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Password
                    </label>
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
                        className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 rounded-xl pl-4 pr-11 py-2.5 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] outline-none transition" 
                        placeholder="Enter your password" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-[#999999] hover:text-[#111111] transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (2nd time password verification) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        required 
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 rounded-xl pl-4 pr-11 py-2.5 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] outline-none transition" 
                        placeholder="Confirm your password" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3 text-[#999999] hover:text-[#111111] transition"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                      className="w-4 h-4 rounded border-[#D4D4D4] text-[#111111] accent-[#111111] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs text-[#555555] cursor-pointer select-none">
                      I agree to the <span className="text-[#111111] underline underline-offset-2">Terms &amp; Privacy</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition duration-150 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center space-x-2 mt-2"
                  >
                    <span>{loading ? 'Sending verification code...' : 'Continue with Verification →'}</span>
                  </button>
                </form>
              )}

              {/* STEP 2: OTP Verification Form */}
              {step === 'VERIFY_OTP' && (
                <form onSubmit={handleVerifyAndRegister} className="space-y-5 text-xs animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-2">
                      6-Digit Security Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#999999] absolute left-4 top-3.5 pointer-events-none" />
                      <input 
                        type="text" 
                        required 
                        maxLength={6}
                        autoFocus
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, ''));
                          if (error) setError(null);
                        }}
                        className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] focus:bg-white focus:ring-2 focus:ring-[#111111]/10 rounded-xl pl-11 pr-4 py-3 text-lg font-mono tracking-widest text-[#111111] placeholder:text-[#BBBBBB] outline-none transition" 
                        placeholder="••••••" 
                      />
                    </div>
                  </div>

                  {/* Resend OTP Bar */}
                  <div className="flex items-center justify-between text-xs text-[#666666]">
                    <span>Didn&apos;t receive code?</span>
                    {resendCooldown > 0 ? (
                      <span className="font-mono text-[#888888]">Resend in {resendCooldown}s</span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-[#111111] font-bold hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  {/* Verify & Launch Button */}
                  <button 
                    type="submit" 
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3.5 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition duration-150 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Verifying & launching...' : 'Verify Email & Launch Workspace →'}</span>
                  </button>

                  {/* Back to Edit Details */}
                  <button 
                    type="button" 
                    onClick={() => {
                      setStep('DETAILS');
                      setOtpCode('');
                      setError(null);
                    }}
                    className="w-full text-center text-xs text-[#666666] hover:text-[#111111] flex items-center justify-center space-x-1 pt-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Edit registration details</span>
                  </button>
                </form>
              )}

              {/* Switch link */}
              {step === 'DETAILS' && (
                <div className="mt-5 text-xs text-[#666666]">
                  Have an account?{' '}
                  <Link href="/login" className="text-[#111111] font-bold hover:underline">
                    Sign in
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Copyright */}
            <div className="pt-6 text-xs text-[#999999]">
              &copy; 2026 Zyvo, All rights Reserved
            </div>
          </div>

          {/* Right Column: Monochrome White & Black Luxury Showcase Card */}
          <div className="hidden md:flex lg:col-span-7 bg-[#111111] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-[#27272A] min-h-[500px] lg:min-h-[560px]">
            
            {/* Background subtle light beam */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header Text */}
            <div className="space-y-2 mb-8 relative z-10 max-w-md">
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-white">
                The simplest way to manage your workforce
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Enter your credentials to access your unified sales &amp; billing command center.
              </p>
            </div>

            {/* Interactive Multi-Layer Dashboard Mockup */}
            <div className="relative z-10 my-auto">
              
              {/* Main White Dashboard Card */}
              <div className="bg-white rounded-2xl p-5 shadow-2xl text-[#111111] space-y-4 max-w-lg border border-[#E5E5E5]">
                
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

              {/* Overlapping Floating Modal (Invoice / Cashfree Settlement) */}
              <div className="hidden sm:block absolute -bottom-5 -right-3 w-56 bg-white rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.28)] border border-[#E5E5E5] p-3.5 text-[#111111] animate-in fade-in slide-in-from-bottom-3 duration-500">
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
