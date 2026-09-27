'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Calendar, Clock, ExternalLink, 
  Copy, Check, Trash2, MoreVertical, FileText, 
  Briefcase, Mail, CheckCircle2, ChevronRight
} from 'lucide-react';

export interface MeetingItem {
  id: string;
  title: string;
  description?: string | null;
  date_time?: string;
  start_at?: string;
  end_at?: string;
  timezone?: string;
  provider?: string;
  google_space_name?: string | null;
  google_meet_url?: string | null;
  meet_link?: string | null;
  status?: string;
  duration_minutes?: number;
  meeting_type?: string;
  account_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  participants?: string[];
  lead?: { id?: string; name: string; company?: string; email?: string } | null;
  contact?: { id?: string; name: string; email?: string } | null;
  deal?: { id?: string; title: string; value?: number } | null;
}

interface GoogleMeetCardProps {
  meeting: MeetingItem;
  onDelete?: (id: string) => void;
}

export function GoogleMeetCard({ meeting, onDelete }: GoogleMeetCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedSpace, setCopiedSpace] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const meetUrl = meeting.google_meet_url || meeting.meet_link;
  const spaceName = meeting.google_space_name || 'spaces/active';

  // Client Identification
  const clientName = 
    meeting.lead?.name || 
    meeting.contact?.name || 
    meeting.account_name || 
    'Direct Client';

  const clientCompany = 
    meeting.lead?.company || 
    (meeting.account_name && meeting.account_name !== clientName ? meeting.account_name : null);

  const clientEmail = 
    meeting.lead?.email || 
    meeting.contact?.email || 
    meeting.contact_email || 
    meeting.participants?.[0] || 
    'client@domain.com';

  const purpose = meeting.description || 'Enterprise CRM Architecture & Strategy Review';
  const meetingType = meeting.meeting_type || 'Product Demo';

  // Real-Time Status Calculation
  const now = Date.now();
  let startTime = meeting.start_at ? new Date(meeting.start_at).getTime() : 0;
  let endTime = meeting.end_at ? new Date(meeting.end_at).getTime() : 0;

  if (!startTime && meeting.date_time) {
    startTime = new Date(meeting.date_time).getTime();
  }
  if (!endTime && startTime) {
    endTime = startTime + (meeting.duration_minutes || 30) * 60000;
  }

  let statusType: 'LIVE' | 'SCHEDULED' | 'PAST' = 'SCHEDULED';
  if (startTime && endTime) {
    if (now >= startTime && now <= endTime) {
      statusType = 'LIVE';
    } else if (now > endTime) {
      statusType = 'PAST';
    } else {
      statusType = 'SCHEDULED';
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleCopyLink = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (meetUrl) {
      navigator.clipboard.writeText(meetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setMenuOpen(false);
    }
  };

  const handleCopySpace = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(spaceName);
    setCopiedSpace(true);
    setTimeout(() => setCopiedSpace(false), 2000);
    setMenuOpen(false);
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMenuOpen(false);
    if (!onDelete) return;

    if (window.confirm(`Delete meeting session "${meeting.title}" from database and calendar?`)) {
      setIsDeleting(true);
      try {
        await onDelete(meeting.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`relative bg-white/95 backdrop-blur-xs border rounded-xl p-4 sm:p-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#111111]/30 transition-all duration-200 group ${
      statusType === 'LIVE' 
        ? 'border-l-[4px] border-l-[#DC2626] border-[#FECACA]' 
        : 'border-l-[4px] border-l-[#16A34A] border-[#E5E5E5]'
    }`}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-start space-x-3 min-w-0">
          {/* Google Meet Multi-Color Icon Badge */}
          <div className="w-9 h-9 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:border-[#D4D4D4] transition mt-0.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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
              <h3 className="text-sm font-bold text-[#111111] tracking-tight">
                {meeting.title}
              </h3>
              
              {/* Meeting Type Badge */}
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F4F4F5] text-[#111111] rounded-md border border-[#E5E5E5]">
                {meetingType}
              </span>

              {/* Space ID chip with 1-click copy */}
              <button
                onClick={handleCopySpace}
                type="button"
                title="Click to copy official Google Meet Space ID"
                className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-medium text-[#16A34A] bg-[#DCFCE7] hover:bg-[#BBF7D0] rounded-md border border-[#BBF7D0] transition cursor-pointer"
              >
                <span>{spaceName}</span>
                {copiedSpace ? (
                  <Check className="w-2.5 h-2.5 text-[#16A34A]" />
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                )}
              </button>
            </div>

            {/* Purpose / Reason for Meeting ("Keno kora hoyeche") */}
            <div className="flex items-center space-x-1.5 text-xs text-[#666666] mt-1">
              <FileText className="w-3.5 h-3.5 text-[#737373] flex-shrink-0" />
              <span className="font-semibold text-[#333333]">Agenda:</span>
              <span className="text-[#555555] truncate max-w-lg" title={purpose}>
                {purpose}
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badge & Clean 3-Dot Dropdown Menu */}
        <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
          {/* Status Badge */}
          {statusType === 'LIVE' ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[11px] font-semibold text-[#DC2626]">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
              <span>🔴 Live Now</span>
            </div>
          ) : statusType === 'PAST' ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#F4F4F5] border border-[#E5E5E5] text-[11px] font-medium text-[#737373]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#999999]" />
              <span>Ended</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[11px] font-semibold text-[#16A34A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              <span>Scheduled</span>
            </div>
          )}

          {/* 3-Dot Action Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              disabled={isDeleting}
              title="More actions"
              className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] border border-transparent hover:border-[#E5E5E5] rounded-lg transition cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Glass Dropdown Panel */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white/95 backdrop-blur-md border border-[#E5E5E5] rounded-xl shadow-xl z-50 py-1 text-xs animate-scaleUp">
                {meetUrl && (
                  <button
                    onClick={handleCopyLink}
                    type="button"
                    className="w-full px-3 py-2 text-left text-[#111111] hover:bg-[#F8F8F8] flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#666666]" />
                    <span>Copy Google Meet Link</span>
                  </button>
                )}

                <button
                  onClick={handleCopySpace}
                  type="button"
                  className="w-full px-3 py-2 text-left text-[#111111] hover:bg-[#F8F8F8] flex items-center space-x-2 transition cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-[#666666]" />
                  <span>Copy Space ID</span>
                </button>

                {meetUrl && (
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-3 py-2 text-left text-[#111111] hover:bg-[#F8F8F8] flex items-center space-x-2 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
                    <span>Open in Google Meet</span>
                  </a>
                )}

                <div className="my-1 border-t border-[#F0F0F0]" />

                {onDelete && (
                  <button
                    onClick={handleDelete}
                    type="button"
                    className="w-full px-3 py-2 text-left text-[#DC2626] hover:bg-[#FEF2F2] flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Delete Meeting Record</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Grid: Client & Timing Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-3 text-xs">
        {/* Left Column: Client / Company Details ("Kon Client") */}
        <div className="flex items-center space-x-2.5 bg-[#FAFAFA]/80 backdrop-blur-2xs border border-[#E5E5E5] rounded-lg px-3 py-2 min-w-0">
          <Briefcase className="w-4 h-4 text-[#737373] flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider">Client:</span>
              <span className="font-bold text-[#111111] truncate">{clientName}</span>
              {clientCompany && (
                <span className="text-[11px] text-[#666666] truncate font-medium">({clientCompany})</span>
              )}
            </div>
            <div className="text-[11px] text-[#737373] font-mono truncate flex items-center space-x-1 mt-0.5" title={clientEmail}>
              <Mail className="w-3 h-3 text-[#999999] flex-shrink-0" />
              <span>{clientEmail}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule Date, Time & Duration */}
        <div className="flex items-center justify-between bg-[#FAFAFA]/80 backdrop-blur-2xs border border-[#E5E5E5] rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-4 h-4 text-[#737373] flex-shrink-0" />
            <div>
              <span className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider block">Scheduled:</span>
              <span suppressHydrationWarning className="font-bold text-[#111111] text-xs">
                {startTime
                  ? new Date(startTime).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Today'}
                {' • '}
                {startTime
                  ? new Date(startTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '12:00 PM'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[11px] font-semibold text-[#111111] bg-white px-2 py-1 rounded-md border border-[#E5E5E5] shadow-2xs">
            <Clock className="w-3 h-3 text-[#666666]" />
            <span>{meeting.duration_minutes || 30}m</span>
          </div>
        </div>
      </div>

      {/* Bottom Conference Link & Join Action */}
      {meetUrl && (
        <div className="bg-[#F8F8F8]/90 border border-[#E5E5E5] rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-0.5">
          {/* Real URL clickable display */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0" />
            <a
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-semibold text-[#111111] hover:text-[#2563EB] hover:underline truncate"
              title={meetUrl}
            >
              {meetUrl}
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-auto">
            <button
              onClick={handleCopyLink}
              type="button"
              className="px-2.5 py-1 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] hover:border-[#111111] transition flex items-center space-x-1 cursor-pointer shadow-2xs"
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
              className="px-3.5 py-1 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition flex items-center space-x-1 shadow-sm"
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
