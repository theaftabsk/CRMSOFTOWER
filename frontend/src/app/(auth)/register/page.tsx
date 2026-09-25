'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import ZyvoLogo from '../../../components/ZyvoLogo';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await register(name, email, password, organizationName);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Registration failed. Please check inputs and try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4 antialiased">
      <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-sm w-full p-6 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <ZyvoLogo height={32} className="text-[#111111] mx-auto mb-2" />
          <h1 className="text-xl font-bold text-[#111111] tracking-tight">Create Workspace</h1>
          <p className="text-xs text-[#666666]">Deploy your Dedicated SaaS Organization</p>
        </div>

        {/* Error Alert Badge */}
        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-[#404040] mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
              placeholder="Aftab Hussain" 
            />
          </div>

          <div>
            <label className="block font-medium text-[#404040] mb-1">Company / Organization</label>
            <input 
              type="text" 
              required 
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
              placeholder="Enterprise Global Ltd" 
            />
          </div>

          <div>
            <label className="block font-medium text-[#404040] mb-1">Work Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
              placeholder="admin@enterprise.com" 
            />
          </div>

          <div>
            <label className="block font-medium text-[#404040] mb-1">Password</label>
            <input 
              type="password" 
              required 
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition" 
              placeholder="Minimum 6 characters" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-[#111111] hover:bg-[#262626] disabled:opacity-50 text-white font-medium rounded-lg text-xs transition flex items-center justify-center space-x-1.5 mt-2"
          >
            <span>{loading ? 'Creating workspace...' : 'Register Workspace'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-[#666666] border-t border-[#E5E5E5] pt-4 flex flex-col space-y-1">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-[#888888]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Automatic Tenant Partitioning</span>
          </div>
          <div>
            Already registered?{' '}
            <Link href="/login" className="text-[#111111] font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
