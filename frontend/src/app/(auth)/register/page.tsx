'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  ArrowRight, Eye, EyeOff, Mail, Lock, Building2, User, AlertCircle, X, ShieldCheck 
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
        
        {/* Left Column: Clean Registration Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5E5E5] p-7 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            
            <div className="space-y-1.5 mb-6">
              <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-[#666666]">
                Enter name and password to get started with your workspace.
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#404040] mb-1">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (fieldErrors.firstName) setFieldErrors(prev => ({ ...prev, firstName: '' }));
                    }}
                    className={`w-full bg-white border ${fieldErrors.firstName ? 'border-red-400' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl px-3 py-2 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition`} 
                    placeholder="First name" 
                  />
                  {fieldErrors.firstName && (
                    <p className="text-[10px] text-red-500 mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block font-medium text-[#404040] mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (fieldErrors.lastName) setFieldErrors(prev => ({ ...prev, lastName: '' }));
                    }}
                    className={`w-full bg-white border ${fieldErrors.lastName ? 'border-red-400' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl px-3 py-2 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition`} 
                    placeholder="Last name" 
                  />
                  {fieldErrors.lastName && (
                    <p className="text-[10px] text-red-500 mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Company / Workspace Name */}
              <div>
                <label className="block font-medium text-[#404040] mb-1">Company / Organization</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#999999] absolute left-3.5 top-2.5 pointer-events-none" />
                  <input 
                    type="text" 
                    required 
                    value={organizationName}
                    onChange={(e) => {
                      setOrganizationName(e.target.value);
                      if (fieldErrors.organizationName) setFieldErrors(prev => ({ ...prev, organizationName: '' }));
                    }}
                    className={`w-full bg-white border ${fieldErrors.organizationName ? 'border-red-400' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl pl-10 pr-3 py-2 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition`} 
                    placeholder="Company name" 
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
                  <Mail className="w-4 h-4 text-[#999999] absolute left-3.5 top-2.5 pointer-events-none" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full bg-white border ${fieldErrors.email ? 'border-red-400' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl pl-10 pr-3 py-2 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition`} 
                    placeholder="you@company.com" 
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[10px] text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#404040] mb-1">Password</label>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    minLength={6}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                    }}
                    className={`w-full bg-white border ${fieldErrors.password ? 'border-red-400' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl px-3 py-2 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition`} 
                    placeholder="Password" 
                  />
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
                      className="text-[10px] text-[#666666] hover:text-[#111111]"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    className={`w-full bg-white border ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-[#E5E5E5]'} focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-xl px-3 py-2 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition`} 
                    placeholder="Confirm" 
                  />
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
                    <span className="text-[#111111] underline underline-offset-2">Terms</span>
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
                className="w-full py-3 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition duration-150 flex items-center justify-center space-x-2 shadow-sm mt-3"
              >
                <span>{loading ? 'Creating workspace...' : 'Continue'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Bottom link to Login */}
            <div className="mt-7 text-center text-xs text-[#666666]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#111111] font-bold hover:underline">
                Sign In
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
