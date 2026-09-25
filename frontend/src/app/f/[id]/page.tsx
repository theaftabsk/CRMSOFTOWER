'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { FormRenderer } from '@/features/forms/components/FormRenderer';
import { WebForm } from '@/types/crm';

export default function PublicWebFormPage() {
  const params = useParams();
  const formId = params?.id as string;

  const [form, setForm] = useState<WebForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // UTM parameters from URL query string
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const utms: Record<string, string> = {};
      searchParams.forEach((val, key) => {
        if (key.startsWith('utm_') || key === 'ref' || key === 'source') {
          utms[key] = val;
        }
      });
      if (document.referrer) {
        utms['referrer'] = document.referrer;
      }
      setUtmParams(utms);
    }
  }, []);

  useEffect(() => {
    if (!formId) return;
    const fetchForm = async () => {
      try {
        const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'true';
        const url = `http://localhost:4000/api/v1/public/forms/${formId}${isPreview ? '?preview=true' : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Form not found or is no longer active.');
        const json = await res.json();
        const raw = json.data || json;
        if (raw && Array.isArray(raw.fields)) {
          raw.fields = raw.fields.map((f: any, idx: number) => ({
            ...f,
            id: f.id || f.name || `field_${idx}`,
          }));
        }
        setForm(raw);
      } catch (err: any) {
        setError(err.message || 'Unable to load form.');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  const handlePublicSubmit = async (values: Record<string, any>) => {
    setSubmitting(true);
    setError(null);

    const fullPayload = {
      ...values,
      ...utmParams,
    };

    try {
      const res = await fetch(`http://localhost:4000/api/v1/public/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Submission failed');

      setSubmitted(true);
      setSuccessMsg(json.data?.message || form?.success_message || 'Thank you! Your submission has been received.');

      if (json.data?.redirect_url || form?.redirect_url) {
        const url = json.data?.redirect_url || form?.redirect_url;
        setTimeout(() => {
          window.location.href = url!;
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-[#666666] font-mono text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
          <span>Loading inquiry form...</span>
        </div>
      </div>
    );
  }

  // Inactive Form State with Studio link
  if (form && form.is_active === false) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded-xl p-8 text-center space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-full bg-[#F4F4F5] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#666666]">
            <AlertCircle className="w-6 h-6 text-[#71717A]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#111111]">{form.title || 'Form Currently Inactive'}</h2>
            <p className="text-xs text-[#666666]">
              This form is currently paused or inactive. If you are an administrator, click below to open the Form Studio and activate it.
            </p>
          </div>
          <div className="pt-2 flex justify-center space-x-2">
            <a
              href={`/forms/${formId}`}
              className="px-4 py-2 bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg transition"
            >
              Open Form Studio
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded-xl p-6 text-center space-y-3 shadow-xs">
          <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
          <h2 className="text-sm font-bold text-[#111111]">Form Unavailable</h2>
          <p className="text-xs text-[#666666]">{error}</p>
          <div className="pt-2">
            <a
              href={`/forms/${formId}`}
              className="text-xs font-semibold text-[#111111] underline"
            >
              Go to Form Studio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 sm:p-8 flex flex-col justify-center"
      style={{ backgroundColor: form?.theme?.surface_color || '#F8F8F8' }}
    >
      {form?.is_preview && (
        <div className="max-w-xl mx-auto mb-4 px-3 py-1.5 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-lg text-xs flex items-center justify-between font-mono">
          <span>Live Preview Mode — Testing Active</span>
          <a href={`/forms/${formId}`} className="font-semibold underline ml-2">Back to Studio</a>
        </div>
      )}

      <FormRenderer
        form={form!}
        previewMode={false}
        device="desktop"
        onSubmit={handlePublicSubmit}
        submitting={submitting}
        submitted={submitted}
        successMessage={successMsg}
      />

      {/* Powered by minimal badge */}
      <div className="text-center mt-6">
        <span className="text-[10px] text-[#999999] tracking-wider uppercase font-mono">
          Protected by Honeypot &bull; Powered by CRM Forms
        </span>
      </div>
    </div>
  );
}
