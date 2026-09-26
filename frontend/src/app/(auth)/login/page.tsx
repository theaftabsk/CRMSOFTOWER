'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  ArrowRight, Eye, EyeOff, Mail, Lock, AlertCircle, X, ShieldCheck 
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
    <div className="min-h-screen bg-[#F6F7F9] relative flex flex-col justify-between p-4 sm:p-8 antialiased selection:bg-[#111111] selection:text-white">
      
      {/* Top Header - Just Clean Logo, No Top Right Button */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 sm:py-4">
        <Link href="/" className="inline-block">
          <ZyvoLogo height={30} className="text-[#111111]" />
        </Link>
      </header>

      {/* Embedded CSS Animations */}
      <style jsx>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-laptop-float {
          animation: subtleFloat 6s ease-in-out infinite;
        }
      `}</style>

      {/* Main Content: Two Columns */}
      <main className="w-full max-w-7xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Clean Login Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5E5E5] p-7 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            
            <div className="space-y-1.5 mb-7">
              <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-[#666666]">
                Sign in to your Zyvo account to continue to your workspace.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-start justify-between p-3.5 mb-5 bg-red-50/90 border border-red-200 rounded-xl text-xs text-[#DC2626] shadow-xs">
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
                  <Mail className="w-4 h-4 text-[#999999] absolute left-3.5 top-3 pointer-events-none" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition" 
                    placeholder="you@company.com" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-medium text-[#404040]">Password</label>
                  <Link href="/forgot-password" className="text-[11px] text-[#666666] hover:text-[#111111] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#999999] absolute left-3.5 top-3 pointer-events-none" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition" 
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

              {/* Keep me signed in */}
              <div className="flex items-center space-x-2 pt-1">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D4D4D4] text-[#111111] accent-[#111111] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-[#666666] cursor-pointer select-none">
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Continue CTA Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition duration-150 flex items-center justify-center space-x-2 shadow-sm mt-2"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Bottom link to Register */}
            <div className="mt-8 text-center text-xs text-[#666666]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#111111] font-bold hover:underline">
                Create Account
              </Link>
            </div>

          </div>
        </div>

        {/* Right Column: Only the Laptop Dashboard Image */}
        <div className="lg:col-span-7 flex items-center justify-center p-2 sm:p-6">
          <div className="relative w-full rounded-2xl overflow-hidden animate-laptop-float">
            <Image 
              src="/zyvo-laptop-dashboard.jpg" 
              alt="Zyvo CRM Dashboard Laptop Display"
              width={1400}
              height={787}
              priority
              className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
            />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between py-4 text-[11px] text-[#888888] border-t border-[#E5E5E5]/60 mt-auto">
        <div>&copy; 2026 Zyvo. All rights reserved.</div>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <Link href="#" className="hover:text-[#111111] transition">Terms of Service</Link>
          <Link href="#" className="hover:text-[#111111] transition">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#111111] transition">Help &amp; Support</Link>
        </div>
      </footer>

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
