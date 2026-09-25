'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing Google Workspace OAuth Handshake...');
  const [accountEmail, setAccountEmail] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Google Authorization declined or failed: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Missing authorization code in redirect URL.');
      return;
    }

    exchangeCode(code);
  }, [searchParams]);

  const exchangeCode = async (code: string) => {
    try {
      setMessage('Exchanging authorization code for Access & Refresh tokens...');
      const res = await api.post('/integrations/google-meet/exchange', { code });

      if (res && (res.success || res.statusCode === 201 || res.data?.success)) {
        setStatus('success');
        const email = res.data?.accountEmail || res.accountEmail || 'Google Account';
        setAccountEmail(email);
        setMessage(`Successfully connected ${email}! Stored credentials in Database.`);

        setTimeout(() => {
          router.push('/integrations');
        }, 2500);
      } else {
        setStatus('error');
        setMessage(res?.error?.message || res?.message || 'Token exchange failed. Please verify credentials.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Network error communicating with CRM server.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-8 text-center space-y-5">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mx-auto text-[#111111]">
              <Loader2 className="w-6 h-6 animate-spin text-[#111111]" />
            </div>
            <h2 className="text-base font-bold text-[#111111]">Authenticating with Google Workspace</h2>
            <p className="text-xs text-[#666666] leading-relaxed">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto text-[#16A34A]">
              <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
            </div>
            <h2 className="text-base font-bold text-[#111111]">Connected Successfully!</h2>
            <p className="text-xs text-[#666666] leading-relaxed">{message}</p>
            {accountEmail && (
              <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] text-xs font-mono text-[#111111] font-semibold">
                {accountEmail}
              </div>
            )}
            <p className="text-[11px] text-[#888888]">Redirecting back to Integrations...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto text-[#DC2626]">
              <AlertCircle className="w-6 h-6 text-[#DC2626]" />
            </div>
            <h2 className="text-base font-bold text-[#111111]">Connection Failed</h2>
            <p className="text-xs text-[#DC2626] leading-relaxed bg-[#FEF2F2] p-3 rounded-lg border border-[#FCA5A5] font-mono text-left">
              {message}
            </p>
            <button
              onClick={() => router.push('/integrations')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium text-white bg-[#111111] rounded-lg hover:bg-[#262626] transition shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Integrations</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#111111]" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
