'use client';

import React, { useState } from 'react';
import { 
  Video, Calendar, Clock, Mail, X, Check, Copy, 
  ExternalLink, Briefcase, FileText, AlertCircle, CheckCircle2, User, Phone
} from 'lucide-react';
import { api } from '@/lib/api';

interface CreateGoogleMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newMeeting: any) => void;
}

export function CreateGoogleMeetModal({
  isOpen,
  onClose,
  onCreated,
}: CreateGoogleMeetModalProps) {
  // Form State
  const [topic, setTopic] = useState('CRM Enterprise Architecture Review');
  const [meetingType, setMeetingType] = useState('Product Demo');
  const [purpose, setPurpose] = useState('Product demonstration, workflow requirement analysis, and pricing review');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Timing State
  const [startDateTime, setStartDateTime] = useState(() => {
    const d = new Date(Date.now() + 15 * 60000);
    // Format YYYY-MM-DDTHH:mm for datetime-local input
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [duration, setDuration] = useState(30);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state once created
  const [createdSpace, setCreatedSpace] = useState<{
    spaceName: string;
    meetUrl: string;
    meetingId?: string;
    title: string;
    client: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setCreatedSpace(null);
    setErrorMessage(null);
    onClose();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const startDate = new Date(startDateTime);
      const startTimeIso = startDate.toISOString();
      const endTimeIso = new Date(startDate.getTime() + duration * 60000).toISOString();

      const res = await api.post('/integrations/google-meet/create', {
        title: topic.trim() || 'Google Meet Conference',
        description: purpose.trim() || undefined,
        meetingType,
        clientName: clientName.trim() || undefined,
        accountName: clientCompany.trim() || clientName.trim() || undefined,
        attendeeName: clientName.trim() || undefined,
        attendeeEmail: clientEmail.trim() || undefined,
        contactPhone: clientPhone.trim() || undefined,
        startTime: startTimeIso,
        endTime: endTimeIso,
        durationMinutes: duration,
        accessType: 'OPEN',
      });

      const data = res?.data || res;
      if (data?.google_meet_url || data?.meet_link) {
        const spaceResult = {
          spaceName: data.google_space_name || 'spaces/active',
          meetUrl: data.google_meet_url || data.meet_link,
          meetingId: data.meeting_id || data.id,
          title: topic,
          client: clientName || clientCompany || clientEmail || 'Guest Client',
        };
        setCreatedSpace(spaceResult);
        if (onCreated) {
          onCreated(data);
        }
      } else {
        setErrorMessage('Google Meet API did not return a valid conference URL.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create Google Meet space.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (createdSpace?.meetUrl) {
      navigator.clipboard.writeText(createdSpace.meetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-lg border border-[#E5E5E5] rounded-2xl shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 animate-scaleUp max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E5E5E5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 shadow-2xs">
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
              <h2 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
                Schedule Google Meet Conference
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Official Google Meet REST API v2 space with full client record sync.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="text-[#999999] hover:text-[#111111] p-1.5 rounded-lg hover:bg-[#F4F4F5] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center space-x-2 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Screen after room provision */}
        {createdSpace ? (
          <div className="space-y-4 pt-1 animate-fadeIn">
            <div className="p-4.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#16A34A] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#111111] block">
                    Google Meet Space Created &amp; Saved to Database!
                  </span>
                  <span className="text-[11px] text-[#15803D]">
                    Linked for {createdSpace.client} • {createdSpace.spaceName}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-lg p-2.5 flex items-center justify-between shadow-2xs">
                <a
                  href={createdSpace.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-bold text-[#111111] hover:text-[#2563EB] hover:underline truncate mr-2"
                >
                  {createdSpace.meetUrl}
                </a>
                <button
                  onClick={handleCopyLink}
                  type="button"
                  className="px-2.5 py-1 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded hover:bg-[#F8F8F8] transition flex items-center space-x-1 cursor-pointer flex-shrink-0 shadow-2xs"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3 text-[#666666]" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-[#666666] hover:text-[#111111] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition cursor-pointer"
              >
                Close
              </button>
              <a
                href={createdSpace.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition flex items-center space-x-1.5 shadow-sm"
              >
                <span>Join Meeting</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
            {/* Section 1: Meeting Topic & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Meeting Topic / Title *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  placeholder="e.g. CRM Architecture Consultation"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none placeholder-[#999999]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Meeting Type
                </label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none"
                >
                  <option value="Product Demo">Product Demo</option>
                  <option value="Client Consultation">Client Consultation</option>
                  <option value="Deal Negotiation">Deal Negotiation</option>
                  <option value="Discovery Call">Discovery Call</option>
                  <option value="Technical Review">Technical Review</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>
            </div>

            {/* Section 2: Purpose / Agenda ("Keno kora hoyeche") */}
            <div>
              <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider mb-1">
                Meeting Purpose / Agenda ("কেন করা হয়েছে")
              </label>
              <textarea
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Explain the agenda, requirements or goal of this meeting session..."
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none placeholder-[#999999] resize-none"
              />
            </div>

            {/* Section 3: Client Details ("কোন ক্লায়েন্ট") */}
            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-2.5">
              <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-[#666666]" />
                <span>Client &amp; Attendee Information ("কোন ক্লায়েন্ট")</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[#666666] mb-0.5">
                    Client / Contact Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#999999] absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#666666] mb-0.5">
                    Client Company / Organization
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-[#999999] absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="e.g. Apex Enterprises"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#666666] mb-0.5">
                    Client Email (Google Calendar Invite)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#999999] absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. client@enterprise.com"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#666666] mb-0.5">
                    Client Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#999999] absolute left-2.5 top-2.5" />
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Schedule Timing & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Start Date &amp; Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Duration
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                        duration === mins
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-white text-[#404040] border-[#D4D4D4] hover:bg-[#F8F8F8]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-[#666666] hover:text-[#111111] bg-white border border-[#D4D4D4] rounded-lg hover:bg-[#F8F8F8] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4.5 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition disabled:opacity-50 flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Creating Meet Space...' : 'Create Google Meet Space'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
