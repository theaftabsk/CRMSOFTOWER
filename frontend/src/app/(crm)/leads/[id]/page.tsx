'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '../../../../components/layout/PageContainer';
import { PageHeader } from '../../../../components/layout/PageHeader';

export default function LeadsDetailPage() {
  const params = useParams();
  return (
    <PageContainer>
      <PageHeader title="Leads Record Details" subtitle={`ID: ${params.id}`} />
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <p className="text-xs text-slate-400">Detailed 360° record view for leads ID: <strong className="text-indigo-400 font-mono">{params.id}</strong></p>
      </div>
    </PageContainer>
  );
}
