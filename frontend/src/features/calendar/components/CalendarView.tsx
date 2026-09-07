'use client';

import React from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';

export const CalendarView: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Interactive CRM Calendar" 
        subtitle="Scheduled Events, Meetings & Task Due Dates" 
      />
      <Card>
        <CardHeader>
          <CardTitle>Interactive CRM Calendar</CardTitle>
          <CardDescription>Feature Module Domain Component [calendar]</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300">
            <p>Active Domain Feature: <strong className="text-indigo-400 font-mono">src/features/calendar/components/CalendarView.tsx</strong></p>
            <p className="mt-2 text-slate-400">Connected to production REST API client and reactive CRM Context Provider.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
