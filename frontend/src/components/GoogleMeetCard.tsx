'use client';

import React, { useState } from 'react';
import { 
  Video, Calendar, Clock, Users, ExternalLink, 
  Copy, Check, Trash2, CheckCircle2, ShieldCheck, Sparkles 
} from 'lucide-react';

export interface MeetingItem {
  id: string;
  title: string;
  date_time: string;
  start_at?: string;
  end_at?: string;
  provider: string;
  google_space_name?: string | null;
  google_meet_url?: string | null;
  meet_link?: string | null;
  status: string;
  duration_minutes?: number;
  contact_email?: string | null;
  participants?: string[];
  lead?: { name: string; company?: string; email?: string } | null;
  contact?: { name: string; email?: string } | null;
}

interface GoogleMeetCardProps {
  meeting: MeetingItem;
  onDelete?: (id: string) => void;
}

export function GoogleMeetCard({ meeting, onDelete }: GoogleMeetCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedSpace, setCopiedSpace] = useState(false);

  const meetUrl = meeting.google_meet_url || meeting.meet_link;
  const spaceName = meeting.google_space_name || 'spaces/active';
  const attendee = meeting.contact_email || meeting.participants?.[0] || 'Invited Guest';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (meetUrl) {
      navigator.clipboard.writeText(meetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopySpace = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(spaceName);
    setCopiedSpace(true);
    setTimeout(() => setCopiedSpace(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] hover:border-[#D4D4D4] border-l-[4px] border-l-[#00832D] rounded-xl p-3.5 sm:p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all duration-200 group">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F0F0F0]">
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Official Google Meet Multi-Color Icon Badge */}
          <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:border-[#D4D4D4] transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#FFFFFF"/>
              <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z" fill="#00832D"/>
              <path d="M17 10.5L21 6.5V17.5L17 13.5V10.5Z" fill="#0066DA"/>
              <path d="M16 6H12V18H16C16.55 18 17 17.55 17 17V7C17 6.45 16.55 6 16 6Z" fill="#2684FC"/>
              <path d="M7 6H4C3.45 6 3 6.45 3 7V11H7V6Z" fill="#EA4335"/>
              <path d="M3 11H7V18H4C3.45 18 3 17.55 3 17V11Z" fill="#FBBC04"/>
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#111111] tracking-tight truncate">
                {meeting.title}
              </h3>
              {/* Space ID chip with 1-click copy */}
              <button
                onClick={handleCopySpace}
                type="button"
                title="Click to copy official Google Meet Space ID"
                className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-medium text-[#16A34A] bg-[#DCFCE7] hover:bg-[#BBF7D0] rounded border border-[#BBF7D0] transition cursor-pointer"
              >
                <span>{spaceName}</span>
                {copiedSpace ? (
                  <Check className="w-2.5 h-2.5 text-[#16A34A]" />
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-[#737373]">
              <span className="font-mono">ID: {meeting.id.slice(0, 10)}...</span>
              {meeting.lead && (
                <>
                  <span>•</span>
                  <span className="truncate text-[#111111] font-medium">
                    Lead: {meeting.lead.name} {meeting.lead.company ? `(${meeting.lead.company})` : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="font-medium text-[#111111]">
              {meeting.status === 'SCHEDULED' ? 'Scheduled' : meeting.status || 'Active'}
            </span>
          </div>

          <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#F4F4F5] text-[#111111] rounded border border-[#E5E5E5]">
            Meet v2 API
          </span>

          {onDelete && (
            <button
              onClick={() => onDelete(meeting.id)}
              title="Delete conference record"
              type="button"
              className="p-1 text-[#999999] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Middle Metadata Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#666666] pt-2.5 pb-2.5">
        {/* Date */}
        <div className="flex items-center space-x-1.5 bg-[#FAFAFA] px-2 py-0.5 rounded-md border border-[#E5E5E5] text-[11px]">
          <Calendar className="w-3 h-3 text-[#737373]" />
          <span suppressHydrationWarning className="font-medium text-[#111111]">
            {meeting.start_at 
              ? new Date(meeting.start_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                }) 
              : 'Sep 21, 2026'}
          </span>
        </div>

        {/* Time / Duration */}
        <div className="flex items-center space-x-1.5 bg-[#FAFAFA] px-2 py-0.5 rounded-md border border-[#E5E5E5] text-[11px]">
          <Clock className="w-3 h-3 text-[#737373]" />
          <span className="font-medium text-[#111111]">
            {meeting.duration_minutes || 30} mins
          </span>
        </div>

        {/* Attendee / Guest */}
        <div className="flex items-center space-x-1.5 bg-[#FAFAFA] px-2 py-0.5 rounded-md border border-[#E5E5E5] text-[11px] max-w-[280px]">
          <Users className="w-3 h-3 text-[#737373]" />
          <span className="font-mono text-[#111111] truncate" title={attendee}>
            {attendee}
          </span>
        </div>
      </div>

      {/* Bottom Conference Link & Action Bar */}
      {meetUrl && (
        <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg px-3 py-1.5 sm:py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* URL clickable display */}
          <div className="flex items-center space-x-2 min-w-0">
            <Video className="w-3.5 h-3.5 text-[#00832D] flex-shrink-0" />
            <a
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-semibold text-[#111111] hover:text-[#0066DA] hover:underline truncate"
              title={meetUrl}
            >
              {meetUrl}
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 flex-shrink-0 self-end sm:self-auto">
            <button
              onClick={handleCopy}
              type="button"
              className="px-2.5 py-1 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded-md hover:bg-[#F8F8F8] hover:border-[#111111] transition flex items-center space-x-1 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <Check className="w-3 h-3 text-[#16A34A]" />
              ) : (
                <Copy className="w-3 h-3 text-[#666666]" />
              )}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-md transition flex items-center space-x-1 shadow-sm"
            >
              <span>Join</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
