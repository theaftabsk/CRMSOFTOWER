'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, CheckSquare, Phone, Calendar, Clock, User, 
  Building2, Briefcase, ExternalLink, Trash2, Edit3, CheckCircle2, 
  AlertTriangle, Video, Copy, Check, MessageSquare, Send, 
  RefreshCw, ShieldCheck, Flame, ChevronRight, Layers, Tag,
  FileText, CornerDownRight, ArrowUpRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatNumber } from '@/lib/utils';

interface ActivityRecord {
  id: string;
  activityType: 'TASK' | 'CALL' | 'MEETING';
  title?: string;
  customer_name?: string;
  caller_user?: string;
  assigned_to?: string;
  priority?: 'Urgent' | 'High' | 'Medium' | 'Low';
  due_date?: string;
  date_time?: string;
  duration?: string;
  duration_minutes?: number;
  result?: string;
  status?: string;
  location?: string;
  meet_link?: string;
  google_meet_url?: string;
  provider?: string;
  participants?: string[];
  account_name?: string;
  notes?: string;
  related_type?: string;
  related_name?: string;
  created_at?: string;
}

export default function ActivityExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params?.id as string;

  const [activity, setActivity] = useState<ActivityRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState<Array<{ id: string; author: string; text: string; date: string }>>([
    {
      id: 'note-1',
      author: 'Vikram Sales Manager',
      text: 'Initial outreach aligned with client executive agenda. Prepared custom SaaS presentation highlighting SLA commitments.',
      date: '2026-09-24T14:30:00Z',
    },
    {
      id: 'note-2',
      author: 'Aftab Admin',
      text: 'Verified compliance requirements and attached standard NDA document for legal team verification.',
      date: '2026-09-25T10:15:00Z',
    }
  ]);

  const loadActivity = async () => {
    if (!activityId) return;
    setLoading(true);
    try {
      const data = await api.getActivity(activityId);
      if (data && (data.title || data.customer_name)) {
        setActivity(data);
      } else {
        // High fidelity demo fallback based on activityId prefix or type
        if (activityId.startsWith('cl_') || activityId.toLowerCase().includes('call')) {
          setActivity({
            id: activityId,
            activityType: 'CALL',
            customer_name: 'Dr. Priya Sharma (Apex Health Systems)',
            caller_user: 'Vikram Sales Manager',
            duration: '14 mins',
            result: 'Connected - Follow Up',
            date_time: '2026-09-25 11:30 AM',
            notes: 'Discussed Enterprise EHR cloud migration and HIPAA security compliance requirements. Client expressed positive interest in hybrid cloud setup.',
            account_name: 'Apex Health Systems',
            related_type: 'Deal',
            related_name: 'Apex Cloud Migration',
            status: 'Completed',
          });
        } else if (activityId.startsWith('mtg_') || activityId.toLowerCase().includes('meet')) {
          setActivity({
            id: activityId,
            activityType: 'MEETING',
            title: 'Tata Motors Executive Architecture & Security Review',
            date_time: '2026-09-26 03:00 PM',
            duration_minutes: 45,
            status: 'Scheduled',
            provider: 'GOOGLE_MEET',
            meet_link: 'https://meet.google.com/qwe-asdf-zxc',
            participants: ['executive@tatamotors.com', 'cio@tatamotors.com', 'admin@crmsoftower.com'],
            account_name: 'Tata Motors Enterprise',
            notes: 'Quarterly review to demonstrate end-to-end telemetry analytics and automated order-to-cash workflows.',
            related_type: 'Account',
            related_name: 'Tata Motors Enterprise',
          });
        } else {
          setActivity({
            id: activityId,
            activityType: 'TASK',
            title: 'Send finalized commercial proposal to Dr. Priya Sharma',
            assigned_to: 'Vikram Sales Manager',
            priority: 'Urgent',
            due_date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            related_type: 'Deal',
            related_name: 'Apex Hospital Cloud ERP',
            account_name: 'Apex Health Systems',
            notes: 'Include 3-year multi-site SLA agreement, Tier-4 data hosting certifications, and volume discount schedule.',
          });
        }
      }
    } catch (err) {
      console.warn('Could not load activity, using fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const handleToggleStatus = async () => {
    if (!activity) return;
    setIsUpdatingStatus(true);
    try {
      const newStatus = activity.status === 'Completed' ? 'Pending' : 'Completed';
      if (activity.activityType === 'TASK') {
        await api.updateTask(activity.id, { status: newStatus });
      } else if (activity.activityType === 'MEETING') {
        await api.updateMeetingStatus(activity.id, newStatus);
      }
      setActivity(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (priority: 'Urgent' | 'High' | 'Medium' | 'Low') => {
    if (!activity) return;
    try {
      if (activity.activityType === 'TASK') {
        await api.updateTask(activity.id, { priority });
      }
      setActivity(prev => prev ? { ...prev, priority } : null);
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const handleDelete = async () => {
    if (!activity) return;
    try {
      if (activity.activityType === 'TASK') {
        await api.deleteTask(activity.id);
      } else if (activity.activityType === 'CALL') {
        await api.deleteCall(activity.id);
      } else if (activity.activityType === 'MEETING') {
        await api.deleteMeeting(activity.id);
      }
      router.push('/activities');
    } catch (err) {
      console.error('Failed to delete activity:', err);
      router.push('/activities');
    }
  };

  const handleCopyMeetLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotesList(prev => [
      {
        id: `note-${Date.now()}`,
        author: 'Current User',
        text: newNote.trim(),
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewNote('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#111111]" />
          <span className="text-xs font-mono text-[#666666]">Retrieving Activity Execution Record...</span>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#DC2626] mx-auto" />
          <h2 className="text-base font-semibold text-[#111111]">Activity Record Not Found</h2>
          <p className="text-xs text-[#666666]">The activity with ID {activityId} could not be located or has been archived.</p>
          <Link
            href="/activities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-xs font-medium rounded-lg hover:bg-[#262626] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Activities
          </Link>
        </div>
      </div>
    );
  }

  const isTask = activity.activityType === 'TASK';
  const isCall = activity.activityType === 'CALL';
  const isMeeting = activity.activityType === 'MEETING';
  const meetUrl = activity.meet_link || activity.google_meet_url || 'https://meet.google.com/crm-demo-room';

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#111111] pb-16">
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/activities"
              className="p-1.5 rounded-lg border border-[#E5E5E5] text-[#666666] hover:text-[#111111] hover:border-[#D4D4D4] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-xs">
              <Link href="/activities" className="text-[#666666] hover:text-[#111111] font-medium">
                Activities
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#999999]" />
              <span className="font-mono text-[#111111] font-semibold">{activity.id}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase border border-[#E5E5E5] bg-[#F8F8F8] text-[#666666]">
                {activity.activityType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTask && (
              <button
                onClick={handleToggleStatus}
                disabled={isUpdatingStatus}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activity.status === 'Completed'
                    ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20 hover:bg-[#16A34A]/20'
                    : 'bg-[#111111] text-white hover:bg-[#262626]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {activity.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
              </button>
            )}

            {isMeeting && (
              <a
                href={meetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111111] text-white hover:bg-[#262626] transition-all"
              >
                <Video className="w-3.5 h-3.5" /> Launch Video Call
              </a>
            )}

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-1.5 rounded-lg border border-[#E5E5E5] text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors"
              title="Delete Activity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Hero Execution Header */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${
                  activity.status === 'Completed'
                    ? 'border-[#16A34A]/30 bg-[#16A34A]/10 text-[#16A34A]'
                    : activity.status === 'In Progress'
                    ? 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]'
                    : 'border-[#E5E5E5] bg-[#F8F8F8] text-[#666666]'
                }`}>
                  {activity.status || 'Active'}
                </span>

                {activity.priority && (
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${
                    activity.priority === 'Urgent'
                      ? 'border-[#DC2626]/30 bg-[#DC2626]/10 text-[#DC2626]'
                      : activity.priority === 'High'
                      ? 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]'
                      : 'border-[#E5E5E5] bg-[#F8F8F8] text-[#666666]'
                  }`}>
                    {activity.priority} Priority
                  </span>
                )}

                {isMeeting && (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase border border-[#E5E5E5] bg-[#F8F8F8] text-[#111111]">
                    {activity.provider || 'Google Meet'}
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
                {activity.title || activity.customer_name || 'Activity Item'}
              </h1>

              <p className="text-xs text-[#666666] max-w-3xl leading-relaxed">
                {activity.notes || 'Execution directive recorded in sales activity log.'}
              </p>
            </div>

            {/* Quick Metrics Badge Group */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-right">
              <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-left md:text-right min-w-[160px]">
                <div className="text-[10px] uppercase font-semibold text-[#666666] tracking-wider">Scheduled Timestamp</div>
                <div suppressHydrationWarning className="text-xs font-mono font-medium text-[#111111]">
                  {activity.due_date || activity.date_time || 'Immediate'}
                </div>
              </div>

              <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-left md:text-right min-w-[160px]">
                <div className="text-[10px] uppercase font-semibold text-[#666666] tracking-wider">Assigned Owner</div>
                <div className="text-xs font-medium text-[#111111]">
                  {activity.assigned_to || activity.caller_user || 'Enterprise AE'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Meeting Connection Strip (if Meeting) */}
          {isMeeting && (
            <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F8F8F8] p-3 rounded-lg">
              <div className="flex items-center gap-2.5 text-xs text-[#111111] overflow-hidden max-w-full">
                <Video className="w-4 h-4 text-[#111111] shrink-0" />
                <span className="font-mono text-xs truncate">{meetUrl}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyMeetLink(meetUrl)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#D4D4D4] bg-white text-xs font-medium hover:bg-[#F8F8F8] transition-colors flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy Room Link'}
                </button>
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-medium hover:bg-[#262626] transition-colors flex items-center gap-1.5"
                >
                  Join Session <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Cockpit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Details & Execution Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operational Details Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#666666]" /> Execution Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Activity Class</span>
                  <div className="font-semibold text-[#111111] flex items-center gap-1.5">
                    {isTask && <CheckSquare className="w-3.5 h-3.5" />}
                    {isCall && <Phone className="w-3.5 h-3.5" />}
                    {isMeeting && <Calendar className="w-3.5 h-3.5" />}
                    {activity.activityType} Record
                  </div>
                </div>

                <div className="space-y-1 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Lifecycle State</span>
                  <div className="font-semibold text-[#111111]">{activity.status || 'Active'}</div>
                </div>

                {isTask && (
                  <div className="space-y-1 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Priority Classification</span>
                    <div className="flex items-center gap-2 pt-1">
                      {(['Urgent', 'High', 'Medium', 'Low'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => handlePriorityChange(p)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            activity.priority === p
                              ? 'bg-[#111111] text-white'
                              : 'bg-white border border-[#D4D4D4] text-[#666666] hover:text-[#111111]'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isCall && (
                  <>
                    <div className="space-y-1 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Call Outcome</span>
                      <div className="font-semibold text-[#111111]">{activity.result || 'Connected'}</div>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Call Duration</span>
                      <div className="font-semibold font-mono text-[#111111]">{activity.duration || '12 mins'}</div>
                    </div>
                  </>
                )}

                {isMeeting && (
                  <>
                    <div className="space-y-1 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Allocated Duration</span>
                      <div className="font-semibold font-mono text-[#111111]">{activity.duration_minutes || 30} Minutes</div>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Conference Provider</span>
                      <div className="font-semibold text-[#111111]">{activity.provider || 'Google Meet Enterprise'}</div>
                    </div>
                  </>
                )}

                <div className="space-y-1 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Record Unique Key</span>
                  <div className="font-mono text-[11px] text-[#666666] select-all">{activity.id}</div>
                </div>
              </div>
            </div>

            {/* Execution Log & Collaborative Notes */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#666666]" /> Collaboration & Execution Journal
                </h2>
                <span className="text-xs font-mono text-[#666666]">{notesList.length} Entries</span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record outcome note, customer requirement, or execution checkpoint..."
                  className="w-full text-xs p-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:border-[#111111] transition-colors resize-none placeholder:text-[#999999]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {['Pricing Approved', 'Follow-up Due', 'Objection Resolved'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setNewNote(prev => prev ? `${prev} [${tag}]` : `[${tag}] `)}
                        className="px-2 py-0.5 rounded text-[10px] font-medium border border-[#E5E5E5] bg-[#F8F8F8] text-[#666666] hover:text-[#111111]"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111111] text-white hover:bg-[#262626] disabled:opacity-40 transition-all"
                  >
                    <Send className="w-3 h-3" /> Log Note
                  </button>
                </div>
              </form>

              {/* Notes Timeline */}
              <div className="space-y-3 pt-2">
                {notesList.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#111111] flex items-center gap-1.5">
                        <User className="w-3 h-3 text-[#666666]" /> {n.author}
                      </span>
                      <span suppressHydrationWarning className="font-mono text-[10px] text-[#666666]">
                        {new Date(n.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#404040] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: CRM Context Sidebar */}
          <div className="space-y-6">
            {/* Linked Account Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Associated Account</span>
                <Building2 className="w-3.5 h-3.5 text-[#666666]" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#111111]">
                  {activity.account_name || 'Apex Health Systems'}
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">Enterprise Tier · Healthcare & Life Sciences</p>
              </div>

              <div className="pt-2 border-t border-[#E5E5E5]">
                <Link
                  href="/accounts"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#111111] hover:underline"
                >
                  View Account Cockpit <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Linked Deal Context Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Pipeline Deal</span>
                <Briefcase className="w-3.5 h-3.5 text-[#666666]" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#111111]">
                  {activity.related_name || 'Apex Hospital Cloud ERP'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span suppressHydrationWarning className="font-mono text-xs font-bold text-[#111111]">
                    ₹45,00,000
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold border border-[#E5E5E5] bg-[#F8F8F8] text-[#666666]">
                    Proposal Sent
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E5E5]">
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#111111] hover:underline"
                >
                  View Pipeline Deal <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Operational Shortcuts</span>
              
              <div className="space-y-1.5">
                <Link
                  href="/activities"
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-[#E5E5E5] text-xs font-medium text-[#111111] hover:bg-[#F8F8F8] transition-colors"
                >
                  <span>All Scheduled Activities</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#666666]" />
                </Link>
                <Link
                  href="/calendar"
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-[#E5E5E5] text-xs font-medium text-[#111111] hover:bg-[#F8F8F8] transition-colors"
                >
                  <span>Open Unified Calendar</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#666666]" />
                </Link>
                <Link
                  href="/contacts"
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-[#E5E5E5] text-xs font-medium text-[#111111] hover:bg-[#F8F8F8] transition-colors"
                >
                  <span>Lookup Contact Directory</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#666666]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Activity Record"
        message={`Are you sure you want to permanently delete this ${activity.activityType.toLowerCase()} record? This action cannot be undone.`}
        confirmLabel="Permanently Delete"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
