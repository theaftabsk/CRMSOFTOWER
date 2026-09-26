'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, TrendingUp, 
  CreditCard, Building2, User, Mail, Lock, Eye, EyeOff, Sparkles, X
} from 'lucide-react';
import ZyvoLogo from '../../../components/ZyvoLogo';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: { [key: string]: string } = {};

    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!organizationName.trim()) errors.organizationName = 'Company name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Enter a valid work email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      errors.terms = 'Please accept the Terms of Service';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      setError('Please review the highlighted fields below and try again.');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim() || firstName;
      const res = await register(fullName, email, password, organizationName);
      if (res.success) {
        router.push('/onboarding');
      } else {
        setError(res.error || 'Registration failed. Please check inputs and try again.');
      }
    } catch {
      setError('Unable to connect to authentication server. Please try again.');
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
        <div className="absolute top-[35%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-gradient-to-r from-emerald-100/25 via-zinc-200/20 to-neutral-300/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Embedded CSS Animations */}
      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-0.3deg); }
        }
        @keyframes glassShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-glass-float {
          animation: floatSlow 5s ease-in-out infinite;
        }
        .glass-reflection {
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);
        }
      `}</style>

      {/* Main Liquid Glass Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl shadow-[0_24px_70px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
          
          {/* Left Column: Form Section */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E5E5E5] bg-white/90 backdrop-blur-md animate-in fade-in slide-in-from-left-6 duration-600 ease-out">
            <div>
              {/* Brand Logo Header & Quick Navigation Switch */}
              <div className="flex items-center justify-between mb-8">
                <ZyvoLogo height={28} className="text-[#111111]" />

                {/* Seamless Switch Pills */}
                <div className="flex items-center p-1 bg-[#F4F4F6] rounded-lg border border-[#E5E5E5] text-xs">
                  <Link 
                    href="/login" 
                    className="px-2.5 py-1 text-[#666666] hover:text-[#111111] transition"
                  >
                    Sign In
                  </Link>
                  <span className="px-2.5 py-1 bg-white text-[#111111] font-semibold rounded-md shadow-xs transition">
                    Register
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                  Continue to your account
                </h1>
                <p className="text-xs text-[#666666]">
                  Enter name and password to get started with your workspace
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

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {/* First Name & Last Name (Side by Side) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#404040] mb-1">First Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required 
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (fieldErrors.firstName) setFieldErrors(prev => ({ ...prev, firstName: '' }));
                        }}
                        className={`w-full bg-white border ${fieldErrors.firstName ? 'border-red-400 ring-1 ring-red-400/40' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-sm`} 
                        placeholder="Enter your first name" 
                      />
                    </div>
                    {fieldErrors.firstName && (
                      <p className="text-[10px] text-red-500 mt-1">{fieldErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-medium text-[#404040] mb-1">Last Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required 
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (fieldErrors.lastName) setFieldErrors(prev => ({ ...prev, lastName: '' }));
                        }}
                        className={`w-full bg-white border ${fieldErrors.lastName ? 'border-red-400 ring-1 ring-red-400/40' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-sm`} 
                        placeholder="Enter your last name" 
                      />
                    </div>
                    {fieldErrors.lastName && (
                      <p className="text-[10px] text-red-500 mt-1">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Company / Workspace Name */}
                <div>
                  <label className="block font-medium text-[#404040] mb-1">Company / Organization</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#999999] absolute left-3 top-2.5 pointer-events-none" />
                    <input 
                      type="text" 
                      required 
                      value={organizationName}
                      onChange={(e) => {
                        setOrganizationName(e.target.value);
                        if (fieldErrors.organizationName) setFieldErrors(prev => ({ ...prev, organizationName: '' }));
                      }}
                      className={`w-full bg-white border ${fieldErrors.organizationName ? 'border-red-400 ring-1 ring-red-400/40' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg pl-9.5 pr-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-sm`} 
                      placeholder="Enter your company name" 
                    />
                  </div>
                  {fieldErrors.organizationName && (
                    <p className="text-[10px] text-red-500 mt-1">{fieldErrors.organizationName}</p>
                  )}
                </div>

                {/* Work Email */}
                <div>
                  <label className="block font-medium text-[#404040] mb-1">Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#999999] absolute left-3 top-2.5 pointer-events-none" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={`w-full bg-white border ${fieldErrors.email ? 'border-red-400 ring-1 ring-red-400/40' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg pl-9.5 pr-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-sm`} 
                      placeholder="Enter your email" 
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[10px] text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#404040] mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        minLength={6}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                        }}
                        className={`w-full bg-white border ${fieldErrors.password ? 'border-red-400 ring-1 ring-red-400/40' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-sm`} 
                        placeholder="Enter password" 
                      />
                    </div>
                    {fieldErrors.password && (
                      <p className="text-[10px] text-red-500 mt-1">{fieldErrors.password}</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-medium text-[#404040]">Confirm</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-[#666666] hover:text-[#111111] flex items-center space-x-0.5"
                      >
                        {showPassword ? <span>Hide</span> : <span>Show</span>}
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }}
                        className={`w-full bg-white border ${fieldErrors.confirmPassword ? 'border-red-400 ring-1 ring-red-400/40' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition shadow-sm`} 
                        placeholder="Confirm password" 
                      />
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[10px] text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="pt-1">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        if (fieldErrors.terms) setFieldErrors(prev => ({ ...prev, terms: '' }));
                      }}
                      className="w-4 h-4 rounded border-[#D4D4D4] text-[#111111] accent-[#111111] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-[11px] text-[#666666] cursor-pointer select-none">
                      Agree to our{' '}
                      <span className="text-[#111111] underline underline-offset-2">Terms of Service</span>
                      {' '}and{' '}
                      <span className="text-[#111111] underline underline-offset-2">Privacy Policy</span>
                    </label>
                  </div>
                  {fieldErrors.terms && (
                    <p className="text-[10px] text-red-500 mt-1">{fieldErrors.terms}</p>
                  )}
                </div>

                {/* Continue CTA Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2.5 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] disabled:opacity-50 text-white font-medium rounded-lg text-xs transition duration-150 flex items-center justify-center space-x-1.5 mt-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                >
                  <span>{loading ? 'Creating workspace...' : 'Continue'}</span>
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>
            </div>

            {/* Bottom Footer */}
            <div className="pt-6 border-t border-[#E5E5E5] mt-6 flex items-center justify-between text-xs text-[#666666]">
              <div className="flex items-center space-x-1.5 text-[11px] text-[#888888]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Encrypted Tenant Vault</span>
              </div>
              <div>
                Already have an account?{' '}
                <Link href="/login" className="text-[#111111] font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase with 3D Render & Liquid Glass Atmosphere */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#FAFAFA] via-[#F4F4F6] to-[#ECECEE] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden animate-in fade-in slide-in-from-right-6 duration-600 ease-out">
            {/* Subtle Glass Reflection Light Beam */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-white/70 via-white/10 to-transparent pointer-events-none rounded-full blur-3xl" />

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
        </div>
      </div>

    </div>
  );
}
