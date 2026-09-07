'use client';
import React from 'react';
import { PageContainer } from '../../../../components/layout/PageContainer';
import { PageHeader } from '../../../../components/layout/PageHeader';

export default function SettingsRolesPage() {
  return (
    <PageContainer>
      <PageHeader title="Settings — Roles" subtitle="Configure organization rules & security" />
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <p className="text-xs text-slate-400">Roles management panel.</p>
      </div>
    </PageContainer>
  );
}
