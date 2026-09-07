'use client';
import React from 'react';
import { PageContainer } from '../../../../components/layout/PageContainer';
import { PageHeader } from '../../../../components/layout/PageHeader';

export default function SettingsPipelinesPage() {
  return (
    <PageContainer>
      <PageHeader title="Settings — Pipelines" subtitle="Configure organization rules & security" />
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <p className="text-xs text-slate-400">Pipelines management panel.</p>
      </div>
    </PageContainer>
  );
}
