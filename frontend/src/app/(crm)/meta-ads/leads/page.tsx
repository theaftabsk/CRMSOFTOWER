'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Target, RefreshCw, ArrowLeft, ExternalLink, ChevronRight, 
  Zap, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { api } from '../../../../lib/api';

export default function MetaIngestedLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulatingLead, setIsSimulatingLead] = useState(false);
  const [simulatedLeadResult, setSimulatedLeadResult] = useState<any>(null);

  const loadData = async () => {
    try {
      const leadData = await api.getMetaLeads();
      if (Array.isArray(leadData)) setLeads(leadData);
    } catch (err) {
      console.error('Failed to load Meta leads:', err);
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
    setSimulatedLeadResult(null);
    try {
      const res = await api.simulateMetaLead();
      setSimulatedLeadResult(res);
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
              Ingested Meta Leads
            </h1>
            <span className="text-xs font-mono text-[#666666] bg-[#F8F8F8] px-2.5 py-1 rounded-md border border-[#E5E5E5]">
              {leads.length} Records in PostgreSQL
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Real leads captured from Facebook and Instagram with full campaign attribution, deduplication, and sales rep routing.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSimulateLead}
            disabled={isSimulatingLead}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#D4D4D4] bg-white text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] transition shadow-xs disabled:opacity-50"
            title="Simulate a live Meta Lead submission"
          >
            <Zap className={`w-3.5 h-3.5 mr-1.5 text-amber-500 ${isSimulatingLead ? 'animate-spin' : ''}`} />
            {isSimulatingLead ? 'Ingesting...' : '⚡ Test Lead Ingest'}
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            href="/leads"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold transition shadow-xs"
          >
            <span>Open Sales Grid</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* Simulated Lead Feedback Banner */}
      {simulatedLeadResult && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between text-xs text-emerald-900 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-semibold">
                {simulatedLeadResult.action === 'CREATED_NEW_LEAD' ? 'New Lead Ingested into Database:' : 'Duplicate Lead Updated:'}
              </span>{' '}
              {simulatedLeadResult.leadName || 'Meta Lead'} was processed via Webhook and assigned to{' '}
              <span className="font-semibold">{simulatedLeadResult.assignedTo || 'Sales Rep'}</span>.
            </div>
          </div>
          <Link
            href={`/leads?id=${simulatedLeadResult.leadId}`}
            className="font-medium underline hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Open Profile</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Leads Table or Empty State */}
      {leads.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E5E5E5] rounded-xl bg-white p-8">
          <Target className="w-10 h-10 text-[#999999] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#111111]">No Meta Leads Ingested Yet</h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto mt-1 mb-5">
            When users submit your Facebook or Instagram Lead Ad forms, they will be captured via Webhook and listed here in real time.
          </p>
          <button
            onClick={handleSimulateLead}
            disabled={isSimulatingLead}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#262626] transition shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            <span>Simulate Sample Lead Ingestion</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[11px] font-semibold text-[#666666] tracking-wider uppercase bg-[#FAFAFA]">
                <th className="py-3 px-4">Lead Name & Contact</th>
                <th className="py-3 px-4">Campaign Attribution</th>
                <th className="py-3 px-4">Target Ad Set</th>
                <th className="py-3 px-4">Assigned Rep</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">CRM Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-xs">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-[#FAFAFA] transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#111111]">{l.name}</div>
                    <div className="text-[11px] text-[#666666] mt-0.5">{l.email} • {l.phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#111111]">{l.campaign}</span>
                    <div className="text-[10px] text-emerald-600 font-mono mt-0.5">Source: Meta Ads</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#666666]">
                    {l.ad_set || 'Metro Target'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F4F4F5] text-[11px] font-medium text-[#111111]">
                      {l.assigned_to || 'Sales Team'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                    {l.lead_score || 85}
                  </td>
                  <td className="py-3.5 px-4 text-[#666666] font-mono text-[11px]">
                    {typeof l.created_date === 'string' ? l.created_date.split('T')[0] : 'Just now'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/leads?id=${l.id}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] text-[11px] font-medium transition"
                    >
                      <span>View Lead</span>
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
