'use client';

import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Calendar as CalIcon, Clock, CheckCircle2 } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { meetings, tasks } = useCRM();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="CRM Schedule & Calendar" 
        subtitle="Chronological timeline of upcoming client demonstrations, pitch calls, and task deadlines."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scheduled Meetings */}
        <div className="shadcn-card p-5 space-y-4">
          <h3 className="font-semibold text-sm text-[#111111] flex items-center gap-2 border-b border-[#E5E5E5] pb-2">
            <CalIcon className="w-4 h-4 text-[#111111]" />
            <span>Upcoming Client Meetings</span>
          </h3>
          <div className="space-y-3">
            {meetings.map(m => (
              <div key={m.id} className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs text-[#111111]">{m.title}</h4>
                  <span className="shadcn-badge shadcn-badge-success">{m.status}</span>
                </div>
                <div className="text-[11px] text-[#666666] flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#888888]" />
                  <span>{m.date_time}</span>
                  <span>•</span>
                  <span>{m.location}</span>
                </div>
                <p className="text-[10px] text-[#888888] pt-1">With: {m.participants.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Task Deadlines */}
        <div className="shadcn-card p-5 space-y-4">
          <h3 className="font-semibold text-sm text-[#111111] flex items-center gap-2 border-b border-[#E5E5E5] pb-2">
            <CheckCircle2 className="w-4 h-4 text-[#111111]" />
            <span>Due Action Items</span>
          </h3>
          <div className="space-y-3">
            {tasks.map(t => (
              <div key={t.id} className="p-3.5 rounded-lg border border-[#E5E5E5] bg-white space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs text-[#111111]">{t.title}</h4>
                  <span className={`shadcn-badge ${t.priority === 'Urgent' ? 'shadcn-badge-danger' : 'shadcn-badge-default'}`}>
                    {t.priority}
                  </span>
                </div>
                <div className="text-[11px] text-[#666666]">
                  Due: <strong className="font-mono text-[#111111]">{t.due_date}</strong> • Assignee: {t.assigned_to}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
