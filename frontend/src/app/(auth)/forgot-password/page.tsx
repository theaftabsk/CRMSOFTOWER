'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ZyvoLogo from '../../../components/ZyvoLogo';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<'REQUEST_OTP' | 'VERIFY_AND_RESET' | 'SUCCESS'>('REQUEST_OTP');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 1. Request OTP via Real Backend & Resend
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/mail/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`A 6-digit verification code has been dispatched to ${email}`);
        setStep('VERIFY_AND_RESET');
      } else {
        setError(data.message || 'Failed to dispatch verification code. Please check your email.');
      }
    } catch {
      setError('Connection error. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit OTP and New Password to Real Backend
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/mail/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otpCode: otpCode.trim(),
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep('SUCCESS');
        setTimeout(() => {
          router.push('/login');
        }, 2200);
      } else {
        setError(data.message || 'Invalid or expired OTP code. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F8] flex flex-col items-center justify-center p-4 antialiased text-[#111111]">
      <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            <ZyvoLogo height={28} className="text-[#111111]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#111111]">
            {step === 'REQUEST_OTP' && 'Reset your password'}
            {step === 'VERIFY_AND_RESET' && 'Enter Verification Code'}
            {step === 'SUCCESS' && 'Password Reset Complete'}
          </h1>
          <p className="text-xs text-[#666666] mt-1.5 max-w-xs">
            {step === 'REQUEST_OTP' && 'Enter your work email address to receive a secure 6-digit recovery OTP.'}
            {step === 'VERIFY_AND_RESET' && `We've sent a 6-digit security code to ${email}`}
            {step === 'SUCCESS' && 'Your credentials have been securely updated in the database.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start space-x-2.5 p-3 mb-5 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626] animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Info Message */}
        {message && step === 'VERIFY_AND_RESET' && !error && (
          <div className="flex items-start space-x-2.5 p-3 mb-5 bg-green-50 border border-green-200 rounded-lg text-xs text-[#16A34A] animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* STEP 1: REQUEST OTP FORM */}
        {step === 'REQUEST_OTP' && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#404040] mb-1.5">Work Email Address</label>
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-[#111111] hover:bg-[#262626] disabled:opacity-50 text-white font-medium rounded-lg text-xs transition flex items-center justify-center space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              <span>{loading ? 'Dispatching OTP...' : 'Send Recovery Code'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP AND SET NEW PASSWORD */}
        {step === 'VERIFY_AND_RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-medium text-[#404040]">6-Digit Security OTP</label>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="text-[11px] text-[#666666] hover:text-[#111111] hover:underline"
                >
                  Resend code
                </button>
              </div>
              <input 
                type="text" 
                required 
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg px-3 py-2.5 text-[#111111] font-mono text-center tracking-[8px] text-lg font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:text-[#999999] outline-none transition" 
                placeholder="Enter 6-digit code" 
              />
            </div>

            <div>
              <label className="block font-medium text-[#404040] mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#999999] absolute left-3 top-2.5 pointer-events-none" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg pl-9.5 pr-10 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
                  placeholder="Enter new password (min. 6 chars)" 
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

            <div>
              <label className="block font-medium text-[#404040] mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#999999] absolute left-3 top-2.5 pointer-events-none" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-lg pl-9.5 pr-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
                  placeholder="Confirm new password" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-[#111111] hover:bg-[#262626] disabled:opacity-50 text-white font-medium rounded-lg text-xs transition flex items-center justify-center space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              <span>{loading ? 'Verifying & Updating...' : 'Reset Password & Save'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'SUCCESS' && (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto text-[#16A34A]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#111111]">Password Updated Successfully</h2>
              <p className="text-xs text-[#666666]">
                Redirecting you to the authentication page...
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block mt-2 px-5 py-2 bg-[#111111] text-white text-xs font-medium rounded-lg hover:bg-[#262626] transition"
            >
              Sign In Now &rarr;
            </Link>
          </div>
        )}

        {/* Back to Login Footer */}
        <div className="pt-6 border-t border-[#E5E5E5] mt-6 flex items-center justify-between text-xs text-[#666666]">
          <Link href="/login" className="flex items-center space-x-1 hover:text-[#111111] transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
          <div className="flex items-center space-x-1 text-[11px] text-[#888888]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Encrypted Vault</span>
          </div>
        </div>

      </div>
    </div>
  );
}
