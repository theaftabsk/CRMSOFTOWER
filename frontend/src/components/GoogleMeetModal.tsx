'use client';

import React, { useState } from 'react';
import { 
  Video, Search, RefreshCw, X, Trash2, Sparkles, Filter, CheckCircle2 
} from 'lucide-react';
import { GoogleMeetCard, MeetingItem } from './GoogleMeetCard';

interface GoogleMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: MeetingItem[];
  onDelete?: (id: string) => void;
  onCleanupExpired?: () => void;
  onRefresh?: () => void;
  onCreateClick?: () => void;
  loading?: boolean;
  connectedEmail?: string;
}

export function GoogleMeetModal({
  isOpen,
  onClose,
  meetings,
  onDelete,
  onCleanupExpired,
  onRefresh,
  onCreateClick,
  loading = false,
  connectedEmail = 'aftabsk741156@gmail.com',
}: GoogleMeetModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'SCHEDULED' | 'PAST'>('ALL');
  const [isCleaning, setIsCleaning] = useState(false);

  if (!isOpen) return null;

  const now = Date.now();

  const filteredMeetings = meetings.filter((m) => {
    // 1. Text Search Filter
    const q = searchQuery.toLowerCase().trim();
    let matchesText = true;
    if (q) {
      matchesText =
        m.title.toLowerCase().includes(q) ||
        (m.google_space_name && m.google_space_name.toLowerCase().includes(q)) ||
        (m.contact_email && m.contact_email.toLowerCase().includes(q)) ||
        (m.account_name && m.account_name.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.lead?.name && m.lead.name.toLowerCase().includes(q)) ||
        (m.lead?.company && m.lead.company.toLowerCase().includes(q)) ||
        (m.contact?.name && m.contact.name.toLowerCase().includes(q));
    }
    if (!matchesText) return false;

    // 2. Status Category Filter
    let startTime = m.start_at ? new Date(m.start_at).getTime() : 0;
    let endTime = m.end_at ? new Date(m.end_at).getTime() : 0;
    if (!startTime && m.date_time) startTime = new Date(m.date_time).getTime();
    if (!endTime && startTime) endTime = startTime + (m.duration_minutes || 30) * 60000;

    let itemStatus: 'LIVE' | 'SCHEDULED' | 'PAST' = 'SCHEDULED';
    if (startTime && endTime) {
      if (now >= startTime && now <= endTime) itemStatus = 'LIVE';
      else if (now > endTime) itemStatus = 'PAST';
      else itemStatus = 'SCHEDULED';
    }

    if (statusFilter === 'LIVE') return itemStatus === 'LIVE';
    if (statusFilter === 'SCHEDULED') return itemStatus === 'SCHEDULED';
    if (statusFilter === 'PAST') return itemStatus === 'PAST';

    return true;
  });

  const handleCleanExpired = async () => {
    if (!onCleanupExpired) return;
    if (window.confirm('Clean up and delete all past / expired meeting sessions from the database?')) {
      setIsCleaning(true);
      try {
        await onCleanupExpired();
      } finally {
        setIsCleaning(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 space-y-4 animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#FFFFFF"/>
                <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z" fill="#00832D"/>
                <path d="M17 10.5L21 6.5V17.5L17 13.5V10.5Z" fill="#0066DA"/>
                <path d="M16 6H12V18H16C16.55 18 17 17.55 17 17V7C17 6.45 16.55 6 16 6Z" fill="#2684FC"/>
                <path d="M7 6H4C3.45 6 3 6.45 3 7V11H7V6Z" fill="#EA4335"/>
                <path d="M3 11H7V18H4C3.45 18 3 17.55 3 17V11Z" fill="#FBBC04"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#111111] tracking-tight">
                  Scheduled Google Meet Conferences
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#DCFCE7] text-[#16A34A] rounded-md border border-[#BBF7D0]">
                  {meetings.length} Recorded
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                Official Google Meet REST API v2 spaces with client context, purpose &amp; automatic calendar invites.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
            {/* Auto Cleanup Expired Meetings Button */}
            {onCleanupExpired && meetings.length > 0 && (
              <button
                onClick={handleCleanExpired}
                disabled={isCleaning}
                type="button"
                title="Auto-clean and remove expired/past meetings from database"
                className="px-2.5 py-1.5 text-xs font-medium text-[#666666] hover:text-[#DC2626] bg-[#FAFAFA] hover:bg-[#FEF2F2] border border-[#E5E5E5] hover:border-[#FECACA] rounded-lg transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isCleaning ? 'Cleaning...' : 'Auto-Clean Past'}</span>
              </button>
            )}

            {/* Create Space Button */}
            {onCreateClick && (
              <button
                onClick={onCreateClick}
                type="button"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>+ Create Meet Space</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="text-[#999999] hover:text-[#111111] p-1.5 rounded-lg hover:bg-[#F4F4F5] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search meetings by client, company, topic, purpose, space ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:bg-white focus:outline-none placeholder-[#999999]"
            />
          </div>

          <div className="flex items-center space-x-1 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#FAFAFA] text-[#666666] hover:text-[#111111] border border-[#E5E5E5]'
              }`}
            >
              All ({meetings.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SCHEDULED')}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                statusFilter === 'SCHEDULED'
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#FAFAFA] text-[#666666] hover:text-[#111111] border border-[#E5E5E5]'
              }`}
            >
              Scheduled
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('LIVE')}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                statusFilter === 'LIVE'
                  ? 'bg-[#DC2626] text-white'
                  : 'bg-[#FAFAFA] text-[#666666] hover:text-[#111111] border border-[#E5E5E5]'
              }`}
            >
              🔴 Live
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PAST')}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                statusFilter === 'PAST'
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#FAFAFA] text-[#666666] hover:text-[#111111] border border-[#E5E5E5]'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Scrollable Meeting Cards List */}
        <div className="overflow-y-auto pr-1 space-y-3 flex-1 max-h-[60vh]">
          {loading ? (
            <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666] space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#111111]" />
              <p>Fetching scheduled Google Meet conference spaces...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="p-8 text-center bg-[#FAFAFA] border border-dashed border-[#E5E5E5] rounded-xl text-xs text-[#737373] space-y-2">
              <Video className="w-8 h-8 text-[#999999] mx-auto" />
              <div className="space-y-0.5">
                <p className="font-semibold text-[#111111]">No Google Meet conferences match criteria.</p>
                <p className="text-[11px]">Click &quot;+ Create Meet Space&quot; above to schedule a new room with client data.</p>
              </div>
              {onCreateClick && (
                <button
                  onClick={onCreateClick}
                  type="button"
                  className="inline-block px-3.5 py-1.5 text-xs font-semibold text-white bg-[#111111] rounded-lg hover:bg-[#262626] transition cursor-pointer shadow-sm mt-1"
                >
                  Create New Meet Space
                </button>
              )}
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <GoogleMeetCard
                key={meeting.id}
                meeting={meeting}
                onDelete={onDelete}
              />
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-[#666666]">
            <span>Connected Account:</span>
            <span className="font-mono text-[11px] font-medium text-[#111111] bg-[#F4F4F5] px-2.5 py-0.5 rounded-md border border-[#E5E5E5]">
              {connectedEmail}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="px-3 py-1.5 text-xs font-medium text-[#666666] hover:text-[#111111] bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] rounded-lg transition cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
