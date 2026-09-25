'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  CheckSquare, Phone, Calendar, Plus, CheckCircle2, Clock, X, 
  Search, Filter, ExternalLink, MoreHorizontal, Edit3, Trash2, 
  Video, Download, RefreshCw, AlertTriangle, ChevronRight, 
  Activity, Users, MessageSquare, ArrowUpRight, ShieldCheck, 
  Sparkles, Check, Play, UserCheck, Flame, ListFilter
} from 'lucide-react';
import { api } from '../../../lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface TaskItem {
  id: string;
  title: string;
  assigned_to: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  due_date: string;
  status: 'Pending' | 'Completed' | 'In Progress';
  related_type?: string;
  related_name?: string;
  created_at?: string;
}

interface CallItem {
  id: string;
  customer_name: string;
  caller_user: string;
  duration: string;
  result: string;
  notes?: string;
  date_time: string;
  created_at?: string;
}

interface MeetingItem {
  id: string;
  title: string;
  date_time: string;
  status: string;
  location?: string;
  meet_link?: string;
  google_meet_url?: string;
  provider?: string;
  duration_minutes?: number;
  participants?: string[];
  account_name?: string;
  notes?: string;
  created_at?: string;
}

export const ActivitiesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'calls' | 'meetings' | 'timeline'>('tasks');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Data states
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [calls, setCalls] = useState<CallItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Dropdown & Modal States
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  // Deletion Target Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'TASK' | 'CALL' | 'MEETING'; title: string } | null>(null);

  // Forms
  const [taskForm, setTaskForm] = useState({
    title: '',
    assigned_to: 'Vikram Sales Manager',
    priority: 'Urgent' as const,
    due_date: new Date().toISOString().split('T')[0],
    status: 'Pending' as const,
    related_type: 'Deal',
    related_name: 'Enterprise Cloud Expansion',
  });

  const [callForm, setCallForm] = useState({
    customer_name: '',
    caller_user: 'Vikram Sales Manager',
    duration: '10 mins',
    result: 'Connected - Follow Up',
    notes: '',
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    provider: 'GOOGLE_MEET',
    duration_minutes: 30,
    participants: 'lead@enterprise.com',
    account_name: 'Strategic Account',
    notes: 'Solution architecture and live capabilities walkthrough.',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [tList, cList, mList, sSummary] = await Promise.all([
        api.getTasks(),
        api.getCalls(),
        api.getMeetings(),
        api.getActivitiesStats(),
      ]);

      if (Array.isArray(tList) && tList.length > 0) {
        setTasks(tList);
      } else {
        setTasks([
          {
            id: 'tsk_1',
            title: 'Send finalized commercial proposal to Dr. Priya Sharma',
            assigned_to: 'Vikram Sales Manager',
            priority: 'Urgent',
            due_date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            related_type: 'Deal',
            related_name: 'Apex Hospital Cloud ERP',
          },
          {
            id: 'tsk_2',
            title: 'Schedule executive demonstration for Tata Motors EV division',
            assigned_to: 'Aftab Admin',
            priority: 'High',
            due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            status: 'Pending',
            related_type: 'Account',
            related_name: 'Tata Motors Enterprise',
          },
          {
            id: 'tsk_3',
            title: 'Deliver SOC2 security questionnaire and SLA contract',
            assigned_to: 'Priya Technical Lead',
            priority: 'Medium',
            due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            status: 'Completed',
            related_type: 'Lead',
            related_name: 'Swiggy Instamart Portal',
          },
          {
            id: 'tsk_4',
            title: 'Audit API webhook callback payloads with partner engineers',
            assigned_to: 'Vikram Sales Manager',
            priority: 'Low',
            due_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
            status: 'In Progress',
            related_type: 'Integration',
            related_name: 'Zapier & Google Meet',
          },
        ]);
      }

      if (Array.isArray(cList) && cList.length > 0) {
        setCalls(cList);
      } else {
        setCalls([
          {
            id: 'call_1',
            customer_name: 'Rajesh Kumar (Apex Health)',
            caller_user: 'Vikram Sales Manager',
            duration: '14 mins',
            result: 'Connected - Follow Up',
            notes: 'Customer requested finalized invoice breakdown under ₹1.2L. Confirmed demo next Tuesday.',
            date_time: 'Today, 02:30 PM',
          },
          {
            id: 'call_2',
            customer_name: 'Anand Mahindra (Fleet Division)',
            caller_user: 'Aftab Admin',
            duration: '22 mins',
            result: 'Interested - Send Proposal',
            notes: 'Discussed 500 dealer licenses roll-out across Mumbai and Delhi. High buying intent.',
            date_time: 'Yesterday, 11:15 AM',
          },
          {
            id: 'call_3',
            customer_name: 'Karan Mehra (Infosys BPM)',
            caller_user: 'Vikram Sales Manager',
            duration: '8 mins',
            result: 'Left Voicemail',
            notes: 'Left message regarding Q4 procurement timeline. Will retry Thursday morning.',
            date_time: 'Sep 22, 04:00 PM',
          },
        ]);
      }

      if (Array.isArray(mList) && mList.length > 0) {
        setMeetings(mList);
      } else {
        setMeetings([
          {
            id: 'mtg_1',
            title: 'Apex Hospital Cloud ERP Architecture Demo',
            date_time: 'Tomorrow, 11:00 AM',
            status: 'Scheduled',
            location: 'Google Meet',
            meet_link: 'https://meet.google.com/abc-wxyz-qrs',
            provider: 'GOOGLE_MEET',
            duration_minutes: 45,
            participants: ['priya@apexhealth.co.in', 'admin@crmsoftower.com'],
            account_name: 'Apex Health Systems',
            notes: 'Deep-dive walkthrough of automated invoice generation and doctor shift rosters.',
          },
          {
            id: 'mtg_2',
            title: 'Tata Motors Commercial Fleet Telematics Sync',
            date_time: 'Friday, 03:00 PM',
            status: 'Scheduled',
            location: 'Google Meet',
            meet_link: 'https://meet.google.com/tat-evmo-flt',
            provider: 'GOOGLE_MEET',
            duration_minutes: 60,
            participants: ['rajesh.varma@tatamotors.com', 'aftab@crmsoftower.com'],
            account_name: 'Tata Motors Enterprise',
            notes: 'Contract review, SLA compliance, and multi-tenant security verification.',
          },
        ]);
      }

      setStats(sSummary);
    } catch (e) {
      console.error('Error loading activities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const handleClickAway = () => setOpenDropdownId(null);
    window.addEventListener('click', handleClickAway);
    return () => window.removeEventListener('click', handleClickAway);
  }, []);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.assigned_to.toLowerCase().includes(q) ||
        (t.related_name || '').toLowerCase().includes(q);

      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, searchTerm, priorityFilter, statusFilter]);

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    return calls.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        !q ||
        c.customer_name.toLowerCase().includes(q) ||
        c.caller_user.toLowerCase().includes(q) ||
        c.result.toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q)
      );
    });
  }, [calls, searchTerm]);

  // Filtered Meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const q = searchTerm.toLowerCase();
      return (
        !q ||
        m.title.toLowerCase().includes(q) ||
        (m.account_name || '').toLowerCase().includes(q) ||
        (m.notes || '').toLowerCase().includes(q)
      );
    });
  }, [meetings, searchTerm]);

  // Combined Live Timeline Stream
  const combinedTimeline = useMemo(() => {
    const list: any[] = [];
    tasks.forEach((t) => {
      list.push({
        id: `t_${t.id}`,
        originalId: t.id,
        kind: 'TASK',
        title: t.title,
        status: t.status,
        badge: t.priority,
        meta: `Assigned: ${t.assigned_to} &bull; Due: ${t.due_date}`,
        detail: t.related_name ? `Related to ${t.related_type}: ${t.related_name}` : '',
        timestamp: t.due_date,
      });
    });
    calls.forEach((c) => {
      list.push({
        id: `c_${c.id}`,
        originalId: c.id,
        kind: 'CALL',
        title: `Phone Call: ${c.customer_name}`,
        status: c.result,
        badge: c.duration,
        meta: `Logged by ${c.caller_user} &bull; ${c.date_time}`,
        detail: c.notes || 'No call summary provided',
        timestamp: c.date_time,
      });
    });
    meetings.forEach((m) => {
      list.push({
        id: `m_${m.id}`,
        originalId: m.id,
        kind: 'MEETING',
        title: m.title,
        status: m.status,
        badge: m.provider || 'Google Meet',
        meta: `${m.date_time} (${m.duration_minutes || 30} mins) &bull; ${m.account_name || 'Client'}`,
        detail: m.notes || 'Client demonstration and milestone review',
        meetLink: m.meet_link || m.google_meet_url,
        timestamp: m.date_time,
      });
    });
    return list;
  }, [tasks, calls, meetings]);

  // KPI Calculations
  const calculatedStats = useMemo(() => {
    const totalT = tasks.length;
    const completedT = tasks.filter((t) => t.status === 'Completed').length;
    const pendingT = tasks.filter((t) => t.status !== 'Completed').length;
    const urgentT = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed').length;
    const completionRate = totalT > 0 ? Math.round((completedT / totalT) * 100) : 100;
    const totalC = calls.length;
    const totalM = meetings.length;

    return {
      totalTasks: stats?.totalTasks ?? totalT,
      pendingTasks: stats?.pendingTasks ?? pendingT,
      urgentTasks: stats?.urgentTasks ?? urgentT,
      totalCalls: stats?.totalCalls ?? totalC,
      totalMeetings: stats?.totalMeetings ?? totalM,
      completionRate: stats?.completionRate ?? completionRate,
      totalTouchpoints: stats?.totalTouchpoints ?? (totalT + totalC + totalM),
    };
  }, [tasks, calls, meetings, stats]);

  // Toggle Task Status
  const handleToggleTask = async (id: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = t.status === 'Completed' ? 'Pending' : 'Completed';
          return { ...t, status: next };
        }
        return t;
      })
    );
    try {
      await api.toggleTaskStatus(id);
    } catch (e) {
      // Revert if API fails
      loadAll();
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    setSubmitting(true);
    try {
      await api.createTask(taskForm);
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        assigned_to: 'Vikram Sales Manager',
        priority: 'Urgent',
        due_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        related_type: 'Deal',
        related_name: '',
      });
      loadAll();
    } finally {
      setSubmitting(false);
    }
  };

  // Create Call
  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callForm.customer_name) return;
    setSubmitting(true);
    try {
      await api.createCall(callForm);
      setShowCallModal(false);
      setCallForm({
        customer_name: '',
        caller_user: 'Vikram Sales Manager',
        duration: '10 mins',
        result: 'Connected - Follow Up',
        notes: '',
      });
      loadAll();
    } finally {
      setSubmitting(false);
    }
  };

  // Create Meeting
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title) return;
    setSubmitting(true);
    try {
      await api.createMeeting({
        ...meetingForm,
        participants: meetingForm.participants.split(',').map((p) => p.trim()).filter(Boolean),
      });
      setShowMeetingModal(false);
      setMeetingForm({
        title: '',
        date_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        provider: 'GOOGLE_MEET',
        duration_minutes: 30,
        participants: '',
        account_name: '',
        notes: '',
      });
      loadAll();
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action Dispatcher
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'TASK') {
        await api.deleteTask(deleteTarget.id);
      } else if (deleteTarget.type === 'CALL') {
        await api.deleteCall(deleteTarget.id);
      } else if (deleteTarget.type === 'MEETING') {
        await api.deleteMeeting(deleteTarget.id);
      }
      setDeleteTarget(null);
      loadAll();
    } catch (e) {
      console.error('Delete error:', e);
      setDeleteTarget(null);
    }
  };

  // CSV Export
  const exportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = '';

    if (activeTab === 'tasks') {
      headers = ['Task Title', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Related'];
      rows = filteredTasks.map((t) => [
        `"${t.title}"`,
        t.status,
        t.priority,
        `"${t.assigned_to}"`,
        t.due_date,
        `"${t.related_name || ''}"`,
      ]);
      filename = 'crm_tasks.csv';
    } else if (activeTab === 'calls') {
      headers = ['Customer', 'Caller', 'Duration', 'Result', 'Notes', 'Date Time'];
      rows = filteredCalls.map((c) => [
        `"${c.customer_name}"`,
        `"${c.caller_user}"`,
        c.duration,
        `"${c.result}"`,
        `"${c.notes || ''}"`,
        `"${c.date_time}"`,
      ]);
      filename = 'crm_call_logs.csv';
    } else {
      headers = ['Meeting Title', 'Provider', 'Time', 'Duration (Mins)', 'Meet Link', 'Status'];
      rows = filteredMeetings.map((m) => [
        `"${m.title}"`,
        m.provider || 'Google Meet',
        `"${m.date_time}"`,
        m.duration_minutes || 30,
        `"${m.meet_link || ''}"`,
        m.status,
      ]);
      filename = 'crm_meetings.csv';
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
            <Flame className="w-2.5 h-2.5 mr-1" />
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F4F4F5] text-[#111111] border border-[#E5E5E5]">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FAFAFA] text-[#71717A] border border-[#E5E5E5]">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="liquid-glass p-5 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1c1c1e] to-[#000000] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111111] tracking-tight">Activities &amp; Sales Velocity Hub</h1>
              <p className="text-xs text-[#666666] mt-0.5">
                Centralized orchestration of sales follow-ups, logged client calls, scheduled Google Meet spaces, and pipeline velocity.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadAll}
            title="Refresh Activities"
            className="p-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowTaskModal(true)}
            className="btn-liquid px-3.5 py-2 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Task</span>
          </button>

          <button
            onClick={() => setShowCallModal(true)}
            className="px-3 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-[#555555]" />
            <span>+ Call</span>
          </button>

          <button
            onClick={() => setShowMeetingModal(true)}
            className="px-3 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Video className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>+ Meet</span>
          </button>
        </div>
      </div>

      {/* KPI Operations Dashboard Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Pending Tasks</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{calculatedStats.pendingTasks}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Action Items To Do</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#DC2626] font-semibold uppercase tracking-wider block">Urgent Action</span>
          <span className="text-2xl font-bold font-mono text-[#DC2626] mt-1 block">{calculatedStats.urgentTasks}</span>
          <span className="text-[10px] text-[#DC2626] mt-0.5 block font-medium">Critical Due Today</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Calls Logged</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{calculatedStats.totalCalls}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Recorded Connects</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#2563EB] font-semibold uppercase tracking-wider block">Conferences</span>
          <span className="text-2xl font-bold font-mono text-[#2563EB] mt-1 block">{calculatedStats.totalMeetings}</span>
          <span className="text-[10px] text-[#2563EB] mt-0.5 block font-medium">Google Meet / Zoom</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#16A34A] font-semibold uppercase tracking-wider block">Resolution Velocity</span>
          <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">{calculatedStats.completionRate}%</span>
          <span className="text-[10px] text-[#16A34A] mt-0.5 block font-medium">Task Completion Rate</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider block">Total Touchpoints</span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">{calculatedStats.totalTouchpoints}</span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Pipeline Engagements</span>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="liquid-glass p-3.5 rounded-2xl flex flex-col md:flex-row justify-between gap-3 items-center border border-white/80 shadow-xs">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks, prospects, callers, or meeting agendas..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] transition shadow-2xs"
          />
        </div>

        {/* Liquid Segmented Control Switcher */}
        <div className="flex items-center space-x-1.5 p-1 bg-black/[0.04] rounded-xl border border-black/[0.05]">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'tasks' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'calls' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Logs ({calls.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'meetings' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Meetings ({meetings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'timeline' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Timeline</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TASKS DATA GRID */}
      {activeTab === 'tasks' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {loading ? (
            <div className="p-16 text-center text-xs text-[#666666] flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
              <span>Loading Sales Tasks...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-16 text-center text-xs text-[#666666] space-y-2">
              <CheckSquare className="w-8 h-8 text-[#999999] mx-auto" />
              <p className="font-semibold text-[#111111]">No sales tasks found matching your filter criteria.</p>
              <p className="text-[11px]">Click "+ Task" to record a new follow-up milestone.</p>
            </div>
          ) : (
            <div className="w-full">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th className="w-12 text-center">Done</th>
                    <th>Task Milestone &amp; Objective</th>
                    <th>Priority</th>
                    <th>Assigned Owner</th>
                    <th>Target Due</th>
                    <th>Associated Context</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const isDone = task.status === 'Completed';

                    return (
                      <tr key={task.id} className="hover:bg-[#FAFAFA] transition group">
                        {/* Status Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="cursor-pointer transition"
                            title={isDone ? 'Mark as Incomplete' : 'Mark as Completed'}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 transition ${
                                isDone ? 'text-[#16A34A]' : 'text-[#D4D4D4] hover:text-[#111111]'
                              }`}
                            />
                          </button>
                        </td>

                        {/* Title */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/activities/${task.id}`}
                            className={`font-semibold block hover:underline ${
                              isDone ? 'line-through text-[#888888]' : 'text-[#111111]'
                            }`}
                          >
                            {task.title}
                          </Link>
                          <span className="text-[10px] text-[#888888] font-mono">ID: {task.id}</span>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4">
                          {getPriorityBadge(task.priority)}
                        </td>

                        {/* Assignee */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[9px]">
                              {task.assigned_to[0]}
                            </div>
                            <span className="font-medium text-[#111111]">{task.assigned_to}</span>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4 font-mono text-[#666666]">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#999999]" />
                            <span>{task.due_date}</span>
                          </span>
                        </td>

                        {/* Related To */}
                        <td className="py-3.5 px-4">
                          {task.related_name ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F4F4F5] text-[#111111] border border-[#E5E5E5]">
                              {task.related_type}: {task.related_name}
                            </span>
                          ) : (
                            <span className="text-[#999999] text-[11px]">-</span>
                          )}
                        </td>

                        {/* Action Dock */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                          <div className="flex items-center justify-end space-x-1.5">
                            <Link
                              href={`/activities/${task.id}`}
                              className="px-2.5 py-1 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 btn-liquid shadow-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Details</span>
                            </Link>

                            {/* 3-Dot More Actions Menu */}
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                title="More Options"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === task.id ? null : task.id);
                                }}
                                className={`p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-black/[0.06] btn-liquid transition inline-flex items-center cursor-pointer ${
                                  openDropdownId === task.id ? 'bg-black/[0.08] text-[#111111]' : ''
                                }`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {openDropdownId === task.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#E5E5E5] rounded-xl shadow-xl p-1.5 z-50 text-left"
                                >
                                  <div className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                                    Task Operations
                                  </div>

                                  <Link
                                    href={`/activities/${task.id}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#555555]" />
                                    <span className="font-medium">Deep-Dive Cockpit</span>
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleToggleTask(task.id);
                                    }}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition text-left cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                                    <span className="font-medium">
                                      {task.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                                    </span>
                                  </button>

                                  <div className="border-t border-black/[0.06] my-1" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      setDeleteTarget({ id: task.id, type: 'TASK', title: task.title });
                                    }}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#DC2626] hover:bg-red-50/80 btn-liquid transition text-left cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                    <span className="font-semibold">Delete Task</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CALL LOGS */}
      {activeTab === 'calls' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {filteredCalls.length === 0 ? (
            <div className="p-16 text-center text-xs text-[#666666] space-y-2">
              <Phone className="w-8 h-8 text-[#999999] mx-auto" />
              <p className="font-semibold text-[#111111]">No phone call records found.</p>
              <p className="text-[11px]">Click "+ Call" to log an outbound or inbound discussion.</p>
            </div>
          ) : (
            <div className="w-full">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Customer / Prospect</th>
                    <th>Sales Caller</th>
                    <th>Duration</th>
                    <th>Call Outcome</th>
                    <th>Discussion Summary</th>
                    <th>Date &amp; Time</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-[#FAFAFA] transition">
                      <td className="font-semibold text-[#111111]">
                        {call.customer_name}
                      </td>
                      <td className="text-[#444444]">
                        {call.caller_user}
                      </td>
                      <td className="font-mono text-[#666666]">
                        {call.duration}
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F4F5] text-[#111111] border border-[#D4D4D4]">
                          {call.result}
                        </span>
                      </td>
                      <td className="text-[#666666] max-w-sm truncate">
                        {call.notes || 'No call notes recorded.'}
                      </td>
                      <td className="text-[#888888] font-mono text-[11px]">
                        {call.date_time}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: call.id, type: 'CALL', title: `Call with ${call.customer_name}` })}
                          className="p-1.5 rounded-lg text-[#DC2626] hover:bg-red-50 transition cursor-pointer"
                          title="Delete Call Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MEETINGS & VIDEO CONFERENCES */}
      {activeTab === 'meetings' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {filteredMeetings.length === 0 ? (
            <div className="p-16 text-center text-xs text-[#666666] space-y-2">
              <Video className="w-8 h-8 text-[#999999] mx-auto" />
              <p className="font-semibold text-[#111111]">No scheduled video meetings found.</p>
              <p className="text-[11px]">Click "+ Meet" to generate an enterprise Google Meet or Zoom link.</p>
            </div>
          ) : (
            <div className="w-full">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Meeting Title &amp; Agenda</th>
                    <th>Provider</th>
                    <th>Organization</th>
                    <th>Scheduled Time</th>
                    <th>Duration</th>
                    <th className="text-right">Join &amp; Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.map((m) => {
                    const link = m.meet_link || m.google_meet_url;

                    return (
                      <tr key={m.id} className="hover:bg-[#FAFAFA] transition">
                        <td className="py-3.5 px-4 font-semibold text-[#111111]">
                          <div>
                            <span>{m.title}</span>
                            {m.notes && <p className="text-[11px] text-[#666666] font-normal truncate max-w-sm mt-0.5">{m.notes}</p>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                            <Video className="w-2.5 h-2.5 mr-1" />
                            {m.provider || 'Google Meet'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#555555]">
                          {m.account_name || 'Client Prospect'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#666666] text-[11px]">
                          {m.date_time}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#666666]">
                          {m.duration_minutes || 30} mins
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            {link && (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-[#111111] hover:bg-[#262626] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 shadow-2xs"
                              >
                                <Video className="w-3 h-3 text-emerald-400" />
                                <span>Join Meet</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: m.id, type: 'MEETING', title: m.title })}
                              className="p-1.5 rounded-lg text-[#DC2626] hover:bg-red-50 transition cursor-pointer"
                              title="Cancel Meeting"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: LIVE CHRONOLOGICAL TIMELINE STREAM */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs divide-y divide-[#E5E5E5] space-y-4">
          <div className="pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111111]">Live Omnichannel Touchpoint Stream</h3>
            <span className="text-xs text-[#888888] font-mono">{combinedTimeline.length} events logged</span>
          </div>

          {combinedTimeline.map((item) => (
            <div key={item.id} className="pt-3.5 first:pt-0 flex items-start space-x-3.5 text-xs">
              <div className="w-8 h-8 rounded-full bg-[#F4F4F5] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.kind === 'TASK' ? (
                  <CheckSquare className="w-3.5 h-3.5 text-[#111111]" />
                ) : item.kind === 'CALL' ? (
                  <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                ) : (
                  <Video className="w-3.5 h-3.5 text-[#2563EB]" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#111111] text-xs">{item.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#F4F4F5] text-[#444444] border border-[#E5E5E5]">
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#888888] font-mono">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-[#666666] mt-0.5" dangerouslySetInnerHTML={{ __html: item.meta }} />
                {item.detail && <p className="text-[#444444] mt-1 bg-black/[0.02] p-2 rounded-lg text-xs leading-relaxed">{item.detail}</p>}
                {item.meetLink && (
                  <a
                    href={item.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-[#2563EB] hover:underline font-semibold mt-1.5"
                  >
                    <Video className="w-3 h-3" />
                    <span>Launch Google Meet Space</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Create Sales Task Milestone</h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 rounded text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Task Title *</label>
                <input
                  required
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Schedule commercial pricing review"
                  className="shadcn-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="shadcn-input w-full"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="shadcn-input w-full font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Assigned Sales Lead</label>
                <input
                  type="text"
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  className="shadcn-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Related Object</label>
                  <select
                    value={taskForm.related_type}
                    onChange={(e) => setTaskForm({ ...taskForm, related_type: e.target.value })}
                    className="shadcn-input w-full"
                  >
                    <option value="Deal">Deal</option>
                    <option value="Lead">Lead</option>
                    <option value="Account">Account</option>
                    <option value="Contact">Contact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Entity Name</label>
                  <input
                    type="text"
                    value={taskForm.related_name}
                    onChange={(e) => setTaskForm({ ...taskForm, related_name: e.target.value })}
                    placeholder="e.g. Apex Hospital ERP"
                    className="shadcn-input w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-3.5 py-1.5 border border-[#D4D4D4] rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-1.5 bg-[#111111] text-white rounded-lg font-semibold">
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG CALL MODAL */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Log Outbound Call Interaction</h3>
              <button onClick={() => setShowCallModal(false)} className="p-1 rounded text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCall} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Customer / Contact Name *</label>
                <input
                  required
                  type="text"
                  value={callForm.customer_name}
                  onChange={(e) => setCallForm({ ...callForm, customer_name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar (Apex Health)"
                  className="shadcn-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                    placeholder="10 mins"
                    className="shadcn-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Call Outcome</label>
                  <select
                    value={callForm.result}
                    onChange={(e) => setCallForm({ ...callForm, result: e.target.value })}
                    className="shadcn-input w-full"
                  >
                    <option value="Connected - Follow Up">Connected - Follow Up</option>
                    <option value="Interested - Send Proposal">Interested - Send Proposal</option>
                    <option value="Left Voicemail">Left Voicemail</option>
                    <option value="Gatekeeper Rejection">Gatekeeper Rejection</option>
                    <option value="Wrong Number">Wrong Number</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Call Discussion Notes</label>
                <textarea
                  rows={3}
                  value={callForm.notes}
                  onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                  placeholder="Summary of customer requirements, concerns, next follow-up dates..."
                  className="shadcn-input w-full"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowCallModal(false)} className="px-3.5 py-1.5 border border-[#D4D4D4] rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-1.5 bg-[#111111] text-white rounded-lg font-semibold">
                  {submitting ? 'Saving...' : 'Record Call Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Generate Video Conference Space</h3>
              <button onClick={() => setShowMeetingModal(false)} className="p-1 rounded text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Meeting Title *</label>
                <input
                  required
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="e.g. Enterprise Cloud ERP Technical Architecture Demo"
                  className="shadcn-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Provider Platform</label>
                  <select
                    value={meetingForm.provider}
                    onChange={(e) => setMeetingForm({ ...meetingForm, provider: e.target.value })}
                    className="shadcn-input w-full"
                  >
                    <option value="GOOGLE_MEET">Google Meet</option>
                    <option value="ZOOM">Zoom Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#111111] font-semibold mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={meetingForm.duration_minutes}
                    onChange={(e) => setMeetingForm({ ...meetingForm, duration_minutes: Number(e.target.value) })}
                    className="shadcn-input w-full font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Date &amp; Start Time</label>
                <input
                  type="datetime-local"
                  value={meetingForm.date_time}
                  onChange={(e) => setMeetingForm({ ...meetingForm, date_time: e.target.value })}
                  className="shadcn-input w-full font-mono"
                />
              </div>
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Participant Emails (comma-separated)</label>
                <input
                  type="text"
                  value={meetingForm.participants}
                  onChange={(e) => setMeetingForm({ ...meetingForm, participants: e.target.value })}
                  placeholder="cio@client.com, procurement@client.com"
                  className="shadcn-input w-full"
                />
              </div>
              <div>
                <label className="block text-[#111111] font-semibold mb-1">Discussion Agenda</label>
                <textarea
                  rows={2}
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                  className="shadcn-input w-full"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowMeetingModal(false)} className="px-3.5 py-1.5 border border-[#D4D4D4] rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-1.5 bg-[#111111] text-white rounded-lg font-semibold">
                  {submitting ? 'Generating...' : 'Schedule & Generate Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'TASK' ? 'Task' : deleteTarget?.type === 'CALL' ? 'Call Log' : 'Meeting'}`}
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This interaction will be unlinked from historical records.`}
        confirmLabel="Delete Record"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
