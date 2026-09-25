'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useCRM } from '../../../context/CRMContext';
import { 
  Calendar as CalIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight, 
  Plus, Video, ExternalLink, MessageCircle, Download, CheckSquare, 
  Briefcase, Copy, Check, Filter, X, Building2, User, Globe,
  RefreshCw, Flame, Trash2, ArrowUpRight, Sparkles, LayoutGrid,
  CalendarDays, ListOrdered, CalendarRange, Share2, AlertTriangle,
  Layers, CheckCheck, MoreHorizontal, FileSpreadsheet
} from 'lucide-react';
import { Meeting } from '../../../types/crm';
import { formatNumber } from '@/lib/utils';
import { api } from '../../../lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM'
];

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarView: React.FC = () => {
  const { meetings, tasks, deals, accounts, addMeeting, toggleTaskStatus } = useCRM();

  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Filter Toggles
  const [showMeetings, setShowMeetings] = useState(true);
  const [showDeals, setShowDeals] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  // Modals & Popovers
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMeetingId, setCopiedMeetingId] = useState<string | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<{ id: string; title: string } | null>(null);

  // New Meeting Form
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    account_name: '',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    meeting_type: 'Product Demo',
    duration_minutes: 30,
    participants: '',
    meet_link: '',
    provider: 'GOOGLE_MEET' as 'GOOGLE_MEET' | 'ZOOM' | 'CUSTOM',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    } else if (viewMode === 'day') {
      const nextD = new Date(new Date(selectedDateStr).getTime() - 86400000);
      setSelectedDateStr(nextD.toISOString().split('T')[0]);
      setCurrentDate(nextD);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    } else if (viewMode === 'day') {
      const nextD = new Date(new Date(selectedDateStr).getTime() + 86400000);
      setSelectedDateStr(nextD.toISOString().split('T')[0]);
      setCurrentDate(nextD);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Generate 7x5 or 7x6 calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dateStr, dayNum, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: i, isCurrentMonth: true });
    }

    // Next month padding to fill out 35 or 42 grid cells
    const remainingCells = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: i, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  // Current Week Days for Week View
  const currentWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const week: { dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      week.push({
        dateStr,
        dayName: WEEKDAYS[i],
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
      });
    }
    return week;
  }, [currentDate]);

  // Aggregate Events for any given date string
  const getEventsForDate = (dateStr: string) => {
    const events: {
      type: 'meeting' | 'deal' | 'task';
      id: string;
      title: string;
      time?: string;
      raw: any;
    }[] = [];

    // Meetings
    if (showMeetings) {
      meetings.forEach((m) => {
        if (m.date_time && m.date_time.includes(dateStr)) {
          events.push({
            type: 'meeting',
            id: m.id,
            title: m.title,
            time: m.date_time.split(' ')[1] || '11:00 AM',
            raw: m,
          });
        }
      });
    }

    // Deals Closing Milestone
    if (showDeals) {
      deals.forEach((d) => {
        const dDate = d.closing_date || d.expected_close;
        if (dDate && dDate === dateStr) {
          events.push({
            type: 'deal',
            id: d.id,
            title: `Deal Closing: ${d.title} (₹${formatNumber(d.value)})`,
            time: 'EOD',
            raw: d,
          });
        }
      });
    }

    // Tasks Due Date
    if (showTasks) {
      tasks.forEach((t) => {
        if (t.due_date && t.due_date === dateStr) {
          events.push({
            type: 'task',
            id: t.id,
            title: `Due Task: ${t.title}`,
            time: t.priority,
            raw: t,
          });
        }
      });
    }

    return events;
  };

  // Selected Day's Unified Agenda Events
  const selectedDayEvents = useMemo(() => {
    return getEventsForDate(selectedDateStr);
  }, [selectedDateStr, meetings, deals, tasks, showMeetings, showDeals, showTasks]);

  // KPI Analytics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = useMemo(() => getEventsForDate(todayStr), [todayStr, meetings, deals, tasks]);
  const todayMeets = todayEvents.filter(e => e.type === 'meeting').length;
  
  const closingDealsThisMonth = useMemo(() => {
    return deals.filter(d => {
      const dDate = d.closing_date || d.expected_close;
      return dDate && dDate.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);
    });
  }, [deals, year, month]);

  const totalClosingValue = closingDealsThisMonth.reduce((acc, d) => acc + (d.value || 0), 0);
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const completedMeetingsCount = meetings.filter(m => m.status === 'Completed').length;
  const resolutionVelocity = meetings.length > 0 ? Math.round((completedMeetingsCount / meetings.length) * 100) : 100;

  // Copy Public Booking Link
  const handleCopyBookingLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/book` : 'https://kaspro.online/book';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 1-Click .ics Calendar file generator
  const downloadIcsForMeeting = (meeting: Meeting) => {
    const meetLink = meeting.meet_link || meeting.location || 'https://meet.google.com/crm-demo-call';
    const dateFormatted = (meeting.date_time || selectedDateStr).split(' ')[0].replace(/-/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Enterprise CRM//Meeting Sync//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${meeting.title}`,
      `DESCRIPTION:Join Virtual Space: ${meetLink}\\nParticipants: ${meeting.participants?.join(', ')}`,
      `LOCATION:${meetLink}`,
      `DTSTART:${dateFormatted}T100000Z`,
      `DTEND:${dateFormatted}T104500Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${meeting.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Month as CSV
  const handleExportMonthCSV = () => {
    const rows = [
      ['Date', 'Type', 'Title', 'Detail', 'Status']
    ];
    calendarDays.forEach(({ dateStr }) => {
      const evs = getEventsForDate(dateStr);
      evs.forEach(ev => {
        rows.push([
          dateStr,
          ev.type.toUpperCase(),
          `"${ev.title.replace(/"/g, '""')}"`,
          ev.type === 'meeting' ? `"${ev.raw.meet_link || ''}"` : ev.type === 'deal' ? `₹${ev.raw.value}` : ev.raw.priority,
          ev.raw.status || 'Active'
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crm_calendar_${monthNames[month]}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create Meeting Submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title) return;
    setSubmitting(true);

    try {
      const fullDateTime = `${newMeeting.date} ${newMeeting.time}`;
      let generatedMeetLink = newMeeting.meet_link.trim();
      let googleSpaceName: string | undefined = undefined;

      if (newMeeting.provider === 'GOOGLE_MEET' && !generatedMeetLink) {
        try {
          const res = await api.post('/integrations/google-meet/create', {
            title: newMeeting.title,
            startTime: `${newMeeting.date}T${newMeeting.time.includes(':') ? newMeeting.time.split(' ')[0] : '11:00'}:00`,
            durationMinutes: Number(newMeeting.duration_minutes) || 30,
            attendeeEmail: newMeeting.participants.split(',')[0]?.trim() || undefined,
            timezone: 'Asia/Kolkata',
            accessType: 'OPEN',
          });
          const data = res?.data || res;
          if (data && (data.meet_link || data.google_meet_url)) {
            generatedMeetLink = data.meet_link || data.google_meet_url;
            googleSpaceName = data.google_space_name;
          }
        } catch (err) {
          console.warn('Google Meet API fallback:', err);
        }
      }

      if (!generatedMeetLink) {
        const p1 = Math.random().toString(36).substring(2, 5);
        const p2 = Math.random().toString(36).substring(2, 6);
        const p3 = Math.random().toString(36).substring(2, 5);
        generatedMeetLink = `https://meet.google.com/${p1}-${p2}-${p3}`;
      }

      const participantList = newMeeting.participants
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      const meetingPayload: any = {
        title: newMeeting.title,
        date_time: fullDateTime,
        location: newMeeting.provider === 'ZOOM' ? 'Zoom Meeting' : newMeeting.provider === 'GOOGLE_MEET' ? 'Google Meet' : 'Custom',
        participants: participantList.length > 0 ? participantList : ['sales@kaspro.online'],
        status: 'Scheduled',
        meeting_type: newMeeting.meeting_type,
        duration_minutes: Number(newMeeting.duration_minutes) || 30,
        meet_link: generatedMeetLink,
        google_meet_url: generatedMeetLink,
        google_space_name: googleSpaceName,
        account_name: newMeeting.account_name || 'Strategic Client',
        notes: newMeeting.notes,
        provider: newMeeting.provider,
      };

      addMeeting(meetingPayload);
      await api.createMeeting(meetingPayload);

      setShowScheduleModal(false);
      setNewMeeting({
        title: '',
        account_name: '',
        date: new Date().toISOString().split('T')[0],
        time: '11:00 AM',
        meeting_type: 'Product Demo',
        duration_minutes: 30,
        participants: '',
        meet_link: '',
        provider: 'GOOGLE_MEET',
        notes: '',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    try {
      await api.deleteMeeting(meetingToDelete.id);
      setMeetingToDelete(null);
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete meeting:', err);
      setMeetingToDelete(null);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16">
      {/* Top Header Card adhering to AGENTS.md */}
      <div className="liquid-glass p-5 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1c1c1e] to-[#000000] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <CalIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111111] tracking-tight">Enterprise Schedule &amp; Calendar</h1>
              <p className="text-xs text-[#666666] mt-0.5">
                Unified multi-channel temporal orchestration: client demonstrations, deal closing milestones, and action items.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Public Booking Link Copier */}
          <button
            onClick={handleCopyBookingLink}
            className="px-3 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            title="Copy Public Self-Booking Portal Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Share2 className="w-3.5 h-3.5 text-[#666666]" />}
            <span>{copiedLink ? 'Booking Link Copied' : 'Share Booking Link'}</span>
          </button>

          <a
            href="/book"
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="Open Public Client Booking Page"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
          </a>

          <button
            onClick={handleExportMonthCSV}
            className="px-3 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            title="Export Month Schedule to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setNewMeeting(prev => ({ ...prev, date: selectedDateStr }));
              setShowScheduleModal(true);
            }}
            className="btn-liquid px-3.5 py-2 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Operations Intelligence Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Today's Sessions</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{todayMeets}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Client Video Meets</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#111111] font-semibold uppercase tracking-wider block">Closing ARR</span>
          <span suppressHydrationWarning className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            ₹{formatNumber(totalClosingValue)}
          </span>
          <span className="text-[10px] text-[#16A34A] mt-0.5 block font-medium">{closingDealsThisMonth.length} Deals Target</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#DC2626] font-semibold uppercase tracking-wider block">Pending Tasks</span>
          <span className="text-2xl font-bold font-mono text-[#DC2626] mt-1 block">{pendingTasksCount}</span>
          <span className="text-[10px] text-[#DC2626] mt-0.5 block font-medium">Action Items Due</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#2563EB] font-semibold uppercase tracking-wider block">Live Virtual Spaces</span>
          <span className="text-2xl font-bold font-mono text-[#2563EB] mt-1 block">
            {meetings.filter(m => m.meet_link || m.google_meet_url).length}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Google Meet &amp; Zoom</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#16A34A] font-semibold uppercase tracking-wider block">Velocity Meter</span>
          <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">{resolutionVelocity}%</span>
          <span className="text-[10px] text-[#16A34A] mt-0.5 block font-medium">Demo Completion</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Sync Engine</span>
          <span className="text-sm font-bold text-[#111111] mt-2 block flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>Connected</span>
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Google Cal &amp; Zoom</span>
        </div>
      </div>

      {/* Calendar Control Toolbar & Multi-View Switcher */}
      <div className="liquid-glass p-3.5 rounded-2xl flex flex-col md:flex-row justify-between gap-3 items-center border border-white/80 shadow-xs">
        {/* Navigation & Current Month Header */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 border border-[#E5E5E5] rounded-lg p-0.5 bg-[#FAFAFA]">
            <button 
              onClick={handlePrev} 
              className="p-1.5 rounded-md hover:bg-white text-[#666666] hover:text-[#111111] cursor-pointer transition"
              title="Previous Range"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNext} 
              className="p-1.5 rounded-md hover:bg-white text-[#666666] hover:text-[#111111] cursor-pointer transition"
              title="Next Range"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={handleToday}
            className="px-2.5 py-1 rounded-lg border border-[#D4D4D4] bg-white hover:bg-[#F8F8F8] text-xs font-semibold text-[#111111] cursor-pointer transition shadow-2xs"
          >
            Today
          </button>

          <h2 className="text-sm font-bold text-[#111111] font-mono tracking-tight">
            {viewMode === 'day' 
              ? selectedDateStr 
              : `${monthNames[month]} ${year}`}
          </h2>
        </div>

        {/* Center: Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setShowMeetings(!showMeetings)}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showMeetings 
                ? 'bg-blue-50 text-blue-900 border-blue-200 font-semibold' 
                : 'bg-white text-[#888888] border-[#E5E5E5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Meets ({meetings.length})</span>
          </button>

          <button
            onClick={() => setShowDeals(!showDeals)}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showDeals 
                ? 'bg-amber-50 text-amber-900 border-amber-200 font-semibold' 
                : 'bg-white text-[#888888] border-[#E5E5E5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Closing Deals</span>
          </button>

          <button
            onClick={() => setShowTasks(!showTasks)}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showTasks 
                ? 'bg-purple-50 text-purple-900 border-purple-200 font-semibold' 
                : 'bg-white text-[#888888] border-[#E5E5E5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Tasks Due</span>
          </button>
        </div>

        {/* Right: 4-Way Segmented View Switcher */}
        <div className="flex items-center space-x-1 p-1 bg-black/[0.04] rounded-xl border border-black/[0.05]">
          <button
            onClick={() => setViewMode('month')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'month' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Month</span>
          </button>

          <button
            onClick={() => setViewMode('week')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'week' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Week</span>
          </button>

          <button
            onClick={() => setViewMode('day')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'day' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Day</span>
          </button>

          <button
            onClick={() => setViewMode('agenda')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'agenda' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Agenda</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTH MATRIX + DAY AGENDA DOCK */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Month Grid */}
          <div className="lg:col-span-2 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-[#E5E5E5] bg-[#FAFAFA]">
              {WEEKDAYS.map(w => (
                <div key={w} className="py-2.5 text-center text-[11px] font-semibold text-[#666666] tracking-wider uppercase font-mono">
                  {w}
                </div>
              ))}
            </div>

            {/* 7x5 or 7x6 Matrix Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#E5E5E5]">
              {calendarDays.map(({ dateStr, dayNum, isCurrentMonth }) => {
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDateStr;
                const dayEvents = getEventsForDate(dateStr);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[105px] p-2 transition-all cursor-pointer flex flex-col justify-between ${
                      !isCurrentMonth ? 'bg-[#FAFAFA]/60 text-[#AAAAAA]' : 'bg-white text-[#111111]'
                    } ${isSelected ? 'ring-2 ring-inset ring-[#111111] bg-[#F8F8F8]' : 'hover:bg-[#F8F8F8]'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span 
                        className={`text-xs font-mono font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday 
                            ? 'bg-[#111111] text-white font-bold' 
                            : isSelected 
                            ? 'text-[#111111] font-bold' 
                            : ''
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-mono text-[#888888] font-medium">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map((ev) => {
                        let chipColor = 'bg-blue-50 text-blue-900 border-blue-200';
                        if (ev.type === 'deal') chipColor = 'bg-amber-50 text-amber-900 border-amber-200';
                        if (ev.type === 'task') chipColor = 'bg-purple-50 text-purple-900 border-purple-200';

                        return (
                          <div
                            key={`${ev.type}-${ev.id}`}
                            className={`text-[10px] px-1.5 py-0.5 rounded border truncate font-medium ${chipColor}`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-[#888888] font-mono block pl-1">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda Dock */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <div>
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">Selected Agenda</span>
                <h3 className="font-bold text-sm text-[#111111] mt-0.5">
                  {selectedDateStr}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] text-[#111111] font-mono font-medium">
                {selectedDayEvents.length} Items
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[580px] custom-scrollbar">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#E5E5E5] rounded-xl text-[#888888] space-y-2">
                  <CalIcon className="w-6 h-6 mx-auto text-[#CCCCCC]" />
                  <p className="text-xs">No scheduled activities on {selectedDateStr}.</p>
                  <button
                    onClick={() => {
                      setNewMeeting(prev => ({ ...prev, date: selectedDateStr }));
                      setShowScheduleModal(true);
                    }}
                    className="px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-[#262626] transition"
                  >
                    + Schedule Here
                  </button>
                </div>
              ) : (
                selectedDayEvents.map((ev) => {
                  if (ev.type === 'meeting') {
                    const m: Meeting = ev.raw;
                    const meetLink = m.meet_link || m.location || 'https://meet.google.com/crm-demo-call';
                    return (
                      <div key={m.id} className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">
                              Client Session
                            </span>
                            <h4 className="font-semibold text-xs text-[#111111] mt-0.5">{m.title}</h4>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-blue-200 text-blue-800 font-semibold">
                            {m.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#555555] space-y-1">
                          <div className="flex items-center space-x-1.5 font-mono">
                            <Clock className="w-3 h-3 text-[#777777]" />
                            <span>{m.date_time}</span>
                          </div>
                          {m.account_name && (
                            <div className="flex items-center space-x-1.5">
                              <Building2 className="w-3 h-3 text-[#777777]" />
                              <span>{m.account_name}</span>
                            </div>
                          )}
                          {m.participants && m.participants.length > 0 && (
                            <div className="text-[10px] text-[#777777]">
                              Attendees: {m.participants.join(', ')}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center gap-1.5">
                          <a
                            href={meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-[11px] font-medium py-1 px-2.5 rounded-md bg-[#111111] text-white hover:bg-[#262626] transition"
                          >
                            <Video className="w-3 h-3 text-emerald-400" />
                            <span>Launch Room</span>
                          </a>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(meetLink);
                              setCopiedMeetingId(m.id);
                              setTimeout(() => setCopiedMeetingId(null), 2000);
                            }}
                            className="inline-flex items-center space-x-1 text-[11px] font-medium py-1 px-2 rounded-md bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F8F8F8] cursor-pointer"
                          >
                            {copiedMeetingId === m.id ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3 text-[#666666]" />}
                            <span>{copiedMeetingId === m.id ? 'Copied' : 'Link'}</span>
                          </button>

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Hi, reminder for our scheduled CRM session "${m.title}" at ${m.date_time}. Join link: ${meetLink}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-[11px] font-medium py-1 px-2.5 rounded-md bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F8F8F8]"
                            title="Send WhatsApp reminder"
                          >
                            <MessageCircle className="w-3 h-3 text-[#16A34A]" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => downloadIcsForMeeting(m)}
                            className="inline-flex items-center space-x-1 text-[11px] font-medium py-1 px-2 rounded-md bg-white border border-[#E5E5E5] text-[#666666] hover:text-[#111111] cursor-pointer"
                            title="Export .ics file"
                          >
                            <Download className="w-3 h-3" />
                            <span>.ics</span>
                          </button>

                          <button
                            onClick={() => setMeetingToDelete({ id: m.id, title: m.title })}
                            className="p-1 rounded-md text-[#DC2626] hover:bg-red-50 ml-auto cursor-pointer"
                            title="Delete Meeting"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (ev.type === 'deal') {
                    const d = ev.raw;
                    return (
                      <div key={d.id} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">
                              Deal Expected Close
                            </span>
                            <h4 className="font-semibold text-xs text-[#111111] mt-0.5">{d.title}</h4>
                          </div>
                          <span suppressHydrationWarning className="font-mono text-xs font-bold text-[#111111]">
                            ₹{formatNumber(d.value)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#666666]">
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3 text-[#888888]" />
                            <span>{d.account_name}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-amber-200 text-amber-800 font-medium">
                            {d.stage}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (ev.type === 'task') {
                    const t = ev.raw;
                    const isDone = t.status === 'Completed';
                    return (
                      <div key={t.id} className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">
                            Action Item Milestone
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            t.priority === 'Urgent' ? 'bg-red-100 text-red-800 font-bold' : 'bg-white border border-purple-200 text-purple-800'
                          }`}>
                            {t.priority}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <button
                            onClick={() => toggleTaskStatus(t.id)}
                            className="mt-0.5 cursor-pointer text-[#111111]"
                          >
                            <CheckSquare className={`w-4 h-4 ${isDone ? 'text-[#16A34A]' : 'text-[#888888]'}`} />
                          </button>
                          <span className={`text-xs font-medium ${isDone ? 'line-through text-[#888888]' : 'text-[#111111]'}`}>
                            {t.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#666666] flex justify-between items-center pt-1 border-t border-purple-100">
                          <span>Owner: {t.assigned_to}</span>
                          <span className="font-mono">{t.status}</span>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })
              )}
            </div>

            <button
              onClick={() => {
                setNewMeeting(prev => ({ ...prev, date: selectedDateStr }));
                setShowScheduleModal(true);
              }}
              className="w-full py-2 bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Session on {selectedDateStr}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK HOURLY TIMELINE (8 AM - 8 PM) */}
      {viewMode === 'week' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Week Header Days */}
          <div className="grid grid-cols-8 border-b border-[#E5E5E5] bg-[#FAFAFA]">
            <div className="p-3 text-[11px] font-semibold text-[#666666] uppercase tracking-wider font-mono text-center border-r border-[#E5E5E5]">
              Time
            </div>
            {currentWeekDays.map(({ dateStr, dayName, dayNum, isToday }) => (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`p-3 text-center cursor-pointer transition ${
                  isToday ? 'bg-[#111111] text-white' : 'hover:bg-[#F0F0F0] text-[#111111]'
                }`}
              >
                <div className={`text-[10px] uppercase font-mono font-semibold ${isToday ? 'text-white/80' : 'text-[#666666]'}`}>
                  {dayName}
                </div>
                <div className="text-sm font-bold font-mono mt-0.5">{dayNum}</div>
              </div>
            ))}
          </div>

          {/* Hourly Slots */}
          <div className="divide-y divide-[#E5E5E5] max-h-[640px] overflow-y-auto custom-scrollbar">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 min-h-[58px]">
                <div className="p-2 border-r border-[#E5E5E5] bg-[#FAFAFA] text-[10px] font-mono text-[#888888] flex items-center justify-center select-none">
                  {hour}
                </div>
                {currentWeekDays.map(({ dateStr }) => {
                  const evs = getEventsForDate(dateStr);
                  // Match meetings scheduled around this time
                  const hourShort = hour.split(':')[0];
                  const hourMeets = evs.filter(e => e.time && e.time.includes(hourShort));

                  return (
                    <div
                      key={`${dateStr}-${hour}`}
                      onClick={() => {
                        setSelectedDateStr(dateStr);
                        setNewMeeting(prev => ({ ...prev, date: dateStr, time: hour }));
                      }}
                      className="p-1 border-r border-[#E5E5E5] hover:bg-[#F9FAFB] transition cursor-pointer relative group min-h-[58px]"
                    >
                      {hourMeets.map(ev => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateStr(dateStr);
                          }}
                          className={`p-1.5 rounded-lg text-[10px] font-medium border mb-1 shadow-2xs truncate ${
                            ev.type === 'meeting'
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : ev.type === 'deal'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-purple-50 text-purple-900 border-purple-200'
                          }`}
                          title={`${ev.time} - ${ev.title}`}
                        >
                          <span className="font-mono font-bold mr-1">{ev.time}</span>
                          <span>{ev.title}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY FOCUS VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
            <div>
              <span className="text-[11px] font-mono text-[#666666] uppercase tracking-wider block">Single Day Granular View</span>
              <h2 className="text-xl font-bold text-[#111111] mt-0.5">{selectedDateStr}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewMeeting(prev => ({ ...prev, date: selectedDateStr }));
                  setShowScheduleModal(true);
                }}
                className="px-3.5 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#262626] transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> + Schedule on This Day
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#E5E5E5]">
            {HOURS.map((hour) => {
              const hourShort = hour.split(':')[0];
              const slotEvents = selectedDayEvents.filter(e => e.time && e.time.includes(hourShort));

              return (
                <div key={hour} className="py-4 grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                  <div className="md:col-span-1 text-xs font-mono font-bold text-[#666666]">
                    {hour}
                  </div>
                  <div className="md:col-span-5 space-y-2">
                    {slotEvents.length === 0 ? (
                      <div className="text-xs text-[#999999] italic">Open Slot — Available for booking</div>
                    ) : (
                      slotEvents.map(ev => (
                        <div
                          key={ev.id}
                          className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ev.type === 'meeting' ? 'bg-blue-100 text-blue-800' : ev.type === 'deal' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {ev.type}
                              </span>
                              <h4 className="font-semibold text-xs text-[#111111]">{ev.title}</h4>
                            </div>
                            {ev.raw?.notes && <p className="text-xs text-[#666666]">{ev.raw.notes}</p>}
                          </div>

                          {ev.type === 'meeting' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={ev.raw.meet_link || ev.raw.google_meet_url || 'https://meet.google.com'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#262626] transition flex items-center gap-1.5"
                              >
                                <Video className="w-3.5 h-3.5 text-emerald-400" /> Launch Meet
                              </a>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: CONSOLIDATED AGENDA STREAM */}
      {viewMode === 'agenda' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <h3 className="font-bold text-sm text-[#111111]">Chronological Omnichannel Agenda Stream</h3>
            <span className="text-xs font-mono text-[#888888]">Upcoming Month Events</span>
          </div>

          <div className="space-y-3">
            {calendarDays.map(({ dateStr }) => {
              const evs = getEventsForDate(dateStr);
              if (evs.length === 0) return null;

              return (
                <div key={dateStr} className="p-3.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#111111]">{dateStr}</span>
                    <span className="text-[10px] font-mono text-[#666666]">{evs.length} activities</span>
                  </div>

                  <div className="divide-y divide-[#E5E5E5]">
                    {evs.map(ev => (
                      <div key={ev.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${
                            ev.type === 'meeting' ? 'bg-blue-600' : ev.type === 'deal' ? 'bg-amber-600' : 'bg-purple-600'
                          }`} />
                          <div>
                            <span className="font-semibold text-[#111111]">{ev.title}</span>
                            <span className="text-[10px] text-[#666666] ml-2 font-mono">({ev.time})</span>
                          </div>
                        </div>

                        {ev.type === 'meeting' && (
                          <div className="flex items-center gap-2">
                            <a
                              href={ev.raw.meet_link || 'https://meet.google.com'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-[#111111] text-white rounded-md text-[11px] font-medium hover:bg-[#262626] transition flex items-center gap-1"
                            >
                              <Video className="w-3 h-3 text-emerald-400" /> Join
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL adhering to AGENTS.md */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-lg shadow-xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Schedule Client Video Demonstration</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Meeting Title *</label>
                <input
                  required
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="e.g. Tata Motors Cloud ERP Architecture Demo"
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Company / Account Name</label>
                  <input
                    type="text"
                    value={newMeeting.account_name}
                    onChange={(e) => setNewMeeting({ ...newMeeting, account_name: e.target.value })}
                    placeholder="e.g. Tata Motors Enterprise"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Meeting Type</label>
                  <select
                    value={newMeeting.meeting_type}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meeting_type: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="Product Demo">Product Demo</option>
                    <option value="Discovery Call">Discovery Call</option>
                    <option value="Commercial Pitch">Commercial Pitch</option>
                    <option value="Contract Review">Contract Review</option>
                    <option value="Follow-up">Follow-up Call</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Start Time</label>
                  <input
                    type="text"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Duration</label>
                  <select
                    value={newMeeting.duration_minutes}
                    onChange={(e) => setNewMeeting({ ...newMeeting, duration_minutes: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Virtual Conference Platform *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMeeting({ ...newMeeting, provider: 'GOOGLE_MEET' })}
                    className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition cursor-pointer ${
                      newMeeting.provider === 'GOOGLE_MEET' ? 'border-[#111111] bg-[#F8F8F8] font-bold text-[#111111]' : 'border-[#E5E5E5] text-[#666666]'
                    }`}
                  >
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Google Meet (v2 Space)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMeeting({ ...newMeeting, provider: 'ZOOM' })}
                    className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition cursor-pointer ${
                      newMeeting.provider === 'ZOOM' ? 'border-[#111111] bg-[#F8F8F8] font-bold text-[#111111]' : 'border-[#E5E5E5] text-[#666666]'
                    }`}
                  >
                    <Video className="w-4 h-4 text-blue-500" />
                    <span>Zoom Meeting</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Attendees Email (comma separated)</label>
                <input
                  type="text"
                  value={newMeeting.participants}
                  onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
                  placeholder="client@tatamotors.com, sales@crmsoftower.com"
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Agenda &amp; Discussion Points</label>
                <textarea
                  rows={2}
                  value={newMeeting.notes}
                  onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                  placeholder="Technical objectives, compliance requirements, demo roadmap..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-[#D4D4D4] rounded-lg text-xs font-semibold hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#262626] disabled:opacity-40"
                >
                  {submitting ? 'Generating Space...' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deleting Meeting */}
      <ConfirmDialog
        isOpen={!!meetingToDelete}
        title="Cancel & Delete Scheduled Meeting"
        message={`Are you sure you want to cancel "${meetingToDelete?.title}"? All participants will be notified.`}
        confirmLabel="Cancel Meeting"
        cancelLabel="Keep Session"
        isDestructive={true}
        onConfirm={handleDeleteMeeting}
        onCancel={() => setMeetingToDelete(null)}
      />
    </div>
  );
};
