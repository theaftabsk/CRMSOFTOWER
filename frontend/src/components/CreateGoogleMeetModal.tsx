'use client';

import React, { useState } from 'react';
import { 
  Video, Calendar, Clock, Mail, X, Check, Copy, 
  ExternalLink, Sparkles, AlertCircle, CheckCircle2 
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
  const [topic, setTopic] = useState('CRM Enterprise Architecture Review');
  const [guestEmail, setGuestEmail] = useState('');
  const [duration, setDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state once created
  const [createdSpace, setCreatedSpace] = useState<{
    spaceName: string;
    meetUrl: string;
    meetingId?: string;
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
      const now = new Date();
      const startTime = new Date(now.getTime() + 15 * 60000).toISOString();
      const endTime = new Date(now.getTime() + (duration + 15) * 60000).toISOString();

      const res = await api.post('/integrations/google-meet/create', {
        title: topic,
        startTime,
        endTime,
        durationMinutes: duration,
        attendeeEmail: guestEmail.trim() || undefined,
        accessType: 'OPEN',
      });

      const data = res?.data || res;
      if (data?.google_meet_url || data?.meet_link) {
        const spaceResult = {
          spaceName: data.google_space_name || 'spaces/active',
          meetUrl: data.google_meet_url || data.meet_link,
          meetingId: data.meeting_id || data.id,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E5E5E5]">
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
                Create Google Meet Space
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Official Google Meet REST API v2 Real-time Space Provisioning
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

        {/* Created Success Screen */}
        {createdSpace ? (
          <div className="space-y-4 pt-1 animate-fadeIn">
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                <span className="text-xs font-bold text-[#111111]">
                  Space Provisioned Successfully!
                </span>
                <span className="text-[10px] font-mono font-medium text-[#16A34A] bg-white px-2 py-0.5 rounded border border-[#BBF7D0]">
                  {createdSpace.spaceName}
                </span>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-lg p-2.5 flex items-center justify-between">
                <a
                  href={createdSpace.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-bold text-blue-600 hover:underline truncate mr-2"
                >
                  {createdSpace.meetUrl}
                </a>
                <button
                  onClick={handleCopyLink}
                  type="button"
                  className="px-2.5 py-1 text-xs font-medium text-[#111111] bg-white border border-[#D4D4D4] rounded hover:bg-[#F8F8F8] transition flex items-center space-x-1 cursor-pointer flex-shrink-0"
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
                <span>Join Now</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Meeting Topic / Title
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="e.g. CRM Architecture Consultation"
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none placeholder-[#999999]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Guest / Client Email (Optional)
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="e.g. client@enterprise.com"
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#D4D4D4] rounded-lg focus:border-[#111111] focus:outline-none placeholder-[#999999]"
              />
              <p className="text-[11px] text-[#737373] mt-1">
                An invitation with Google Meet space credentials will be linked to this contact.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                      duration === mins
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-[#404040] border-[#D4D4D4] hover:bg-[#F8F8F8]'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-end space-x-2">
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
                className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#262626] rounded-lg transition disabled:opacity-50 flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Creating Space...' : 'Create Real Google Meet'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
