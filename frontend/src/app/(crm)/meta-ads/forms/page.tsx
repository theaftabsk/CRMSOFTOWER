'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, RefreshCw, ArrowLeft, ArrowUpRight, 
  ExternalLink, CheckCircle2, ShieldCheck, Zap
} from 'lucide-react';
import { api } from '@/lib/api';

export default function MetaLeadFormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulatingLead, setIsSimulatingLead] = useState(false);

  const loadData = async () => {
    try {
      const formData = await api.getMetaLeadForms();
      if (Array.isArray(formData)) setForms(formData);
    } catch (err) {
      console.error('Failed to load lead forms:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleSimulateLead = async () => {
    setIsSimulatingLead(true);
    try {
      await api.simulateMetaLead();
      await loadData();
    } catch (err) {
      console.error('Failed to simulate lead:', err);
    } finally {
      setIsSimulatingLead(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <Link 
              href="/meta-ads"
              className="p-1.5 rounded-lg border border-[#E5E5E5] text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Instant Lead Forms
            </h1>
            <span className="text-xs font-mono text-[#666666] bg-[#F8F8F8] px-2.5 py-1 rounded-md border border-[#E5E5E5]">
              Webhook: Subscribed
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Facebook and Instagram Instant Forms published under your linked Facebook Pages.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSimulateLead}
            disabled={isSimulatingLead}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#D4D4D4] bg-white text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] transition shadow-xs disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 mr-1.5 text-amber-500 ${isSimulatingLead ? 'animate-spin' : ''}`} />
            {isSimulatingLead ? 'Simulating...' : '⚡ Test Ingest'}
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Forms Grid or Empty State */}
      {forms.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E5E5E5] rounded-xl bg-white p-8">
          <MessageSquare className="w-10 h-10 text-[#999999] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#111111]">No Lead Forms Synced Yet</h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto mt-1 mb-5">
            Published Lead Forms on your Facebook Page will stream here once your Page is linked in Meta Settings.
          </p>
          <Link
            href="/meta-ads/settings"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#262626] transition shadow-xs"
          >
            Configure Facebook Page
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="p-5 rounded-xl bg-white border border-[#E5E5E5] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#111111]">{form.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#666666] mt-1">Page: {form.page_name}</p>

                <div className="mt-4 pt-3 border-t border-[#E5E5E5]">
                  <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider block mb-2">
                    Collected Questions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {form.questions.map((q: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-[#F4F4F5] text-[11px] text-[#404040]">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#666666]">Ingested:</span>{' '}
                  <span className="font-mono font-bold text-[#111111]">{form.leads_count} leads</span>
                </div>
                <button
                  onClick={handleSimulateLead}
                  className="text-xs font-semibold text-[#111111] hover:underline flex items-center space-x-1"
                >
                  <span>Test Ingest</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
