'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalIcon, Clock, Video, User, Building2, Mail, Phone, 
  CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Globe, CalendarDays 
} from 'lucide-react';
import { api } from '@/lib/api';

const SERVICES = [
  {
    id: 'demo',
    title: 'CRM Product Demo & Guided Walkthrough',
    duration: 30,
    type: 'Product Demo',
    description: 'A 30-minute tailored demonstration of the Enterprise CRM platform and workflow automation.',
  },
  {
    id: 'discovery',
    title: 'Technical Discovery & Architecture Call',
    duration: 45,
    type: 'Technical Discovery',
    description: 'Deep-dive into API integrations, database migration, and enterprise security compliance.',
  },
  {
    id: 'pricing',
    title: 'Commercial Proposal & Contract Review',
    duration: 30,
    type: 'Contract Review',
    description: 'Review custom pricing tiers, user seat licenses, and enterprise SLA contracts.',
  },
];

const TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:00 PM',
  '04:30 PM',
  '05:30 PM',
];

export default function PublicBookingPage() {
  const [step, setStep] = useState<'service' | 'datetime' | 'details' | 'confirmed'>('service');
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  
  // Date Picker: next 14 business days
  const today = new Date();
  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]);
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[1]);

  // Guest Details
  const [guest, setGuest] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    title: string;
    date_time: string;
    meet_link: string;
  } | null>(null);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest.name || !guest.email) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: guest.name,
        company: guest.company,
        email: guest.email,
        phone: guest.phone,
        notes: guest.notes,
        meeting_type: selectedService.type,
        duration_minutes: selectedService.duration,
        date: selectedDate,
        time: selectedTime,
        title: `${selectedService.type}: ${guest.company || guest.name}`,
      };

      const res = await api.bookPublicMeeting(payload);
      const meetingData = res?.data?.meeting || res?.meeting;
      const meetLink = res?.data?.meet_link || res?.meet_link || meetingData?.meet_link;

      if (res && (res.success || res?.data?.success)) {
        setBookingResult({
          title: meetingData?.title || payload.title,
          date_time: meetingData?.date_time || `${payload.date} ${payload.time}`,
          meet_link: meetLink || 'https://meet.google.com',
        });
        setStep('confirmed');
      } else {
        alert(res?.data?.message || res?.message || 'Could not confirm booking. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Booking error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadIcs = () => {
    if (!bookingResult) return;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Enterprise CRM//Public Scheduler//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${bookingResult.title}`,
      `DESCRIPTION:Join virtual meeting: ${bookingResult.meet_link}`,
      `LOCATION:Google Meet (${bookingResult.meet_link})`,
      `DTSTART:${selectedDate.replace(/-/g, '')}T100000Z`,
      `DTEND:${selectedDate.replace(/-/g, '')}T104500Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'crm-meeting-invitation.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#111111] font-sans flex flex-col justify-between p-4 sm:p-8">
      {/* Top Brand Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-base">
            C
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-[#111111]">ABC Technologies</h1>
            <p className="text-[11px] text-[#666666]">Enterprise Sales & Consultation Team</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-[#666666] bg-white border border-[#E5E5E5] px-3 py-1 rounded-full">
          <Globe className="w-3.5 h-3.5 text-[#111111]" />
          <span>Asia/Kolkata (IST)</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full my-8">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden grid grid-cols-1 md:grid-cols-3">
          
          {/* Left Summary Sidebar */}
          <div className="p-6 md:p-8 bg-[#FAFAFA] border-b md:border-b-0 md:border-r border-[#E5E5E5] space-y-6">
            <div>
              <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
                Schedule Meeting
              </span>
              <h2 className="text-lg font-bold text-[#111111] mt-1 leading-snug">
                {selectedService.title}
              </h2>
            </div>

            <div className="space-y-3 text-xs text-[#555555]">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-[#111111]" />
                <span>{selectedService.duration} Minutes</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Video className="w-4 h-4 text-[#111111]" />
                <span>Google Meet (Video Conference)</span>
              </div>
              {selectedDate && (
                <div className="flex items-center space-x-2.5">
                  <CalIcon className="w-4 h-4 text-[#111111]" />
                  <span className="font-mono">{selectedDate} at {selectedTime}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#666666] leading-relaxed pt-2 border-t border-[#E5E5E5]">
              {selectedService.description}
            </p>

            <div className="pt-4 flex items-center space-x-2 text-[11px] text-[#888888]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Verified CRM Calendar Integration</span>
            </div>
          </div>

          {/* Right Interactive Area */}
          <div className="col-span-2 p-6 md:p-8">
            
            {/* STEP 1: SERVICE SELECTION */}
            {step === 'service' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-[#111111]">1. Select Consultation Topic</h3>
                  <p className="text-xs text-[#666666] mt-0.5">Choose the agenda that best fits your requirements.</p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {SERVICES.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedService.id === srv.id
                          ? 'border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]'
                          : 'border-[#E5E5E5] bg-white hover:border-[#111111]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-xs text-[#111111]">{srv.title}</h4>
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white border border-[#E5E5E5] text-[#111111]">
                          {srv.duration} mins
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">{srv.description}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep('datetime')}
                    className="btn-primary flex items-center space-x-2 text-xs py-2 px-4 cursor-pointer"
                  >
                    <span>Next: Select Date & Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DATE & TIME SELECTION */}
            {step === 'datetime' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-[#111111]">2. Pick Date & Available Slot</h3>
                    <p className="text-xs text-[#666666] mt-0.5">Select a business day and meeting time.</p>
                  </div>
                  <button 
                    onClick={() => setStep('service')}
                    className="text-xs text-[#666666] hover:text-[#111111] flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Topic</span>
                  </button>
                </div>

                {/* Available Date Carousel */}
                <div className="space-y-2">
                  <span className="text-[11px] font-medium text-[#666666] block uppercase tracking-wider">
                    Available Dates (Next 14 Days)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableDates.slice(0, 8).map((dt) => {
                      const isSelected = selectedDate === dt;
                      const dateObj = new Date(dt);
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNum = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                      return (
                        <button
                          key={dt}
                          type="button"
                          onClick={() => setSelectedDate(dt)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#111111] text-white border-[#111111]'
                              : 'bg-white border-[#E5E5E5] hover:border-[#111111] text-[#111111]'
                          }`}
                        >
                          <span className="block text-[10px] uppercase font-mono opacity-80">{dayName}</span>
                          <span className="block text-xs font-bold mt-0.5">{dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Slots */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-medium text-[#666666] block uppercase tracking-wider">
                    Select Start Time (IST)
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#111111] text-white border-[#111111]'
                              : 'bg-white border-[#E5E5E5] hover:border-[#111111] text-[#111111]'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-[#E5E5E5]">
                  <button
                    onClick={() => setStep('service')}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('details')}
                    className="btn-primary flex items-center space-x-2 text-xs py-2 px-4 cursor-pointer"
                  >
                    <span>Next: Your Information</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: GUEST INFORMATION */}
            {step === 'details' && (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-[#111111]">3. Contact & Business Details</h3>
                    <p className="text-xs text-[#666666] mt-0.5">We will send Google Meet calendar invite to this email.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setStep('datetime')}
                    className="text-xs text-[#666666] hover:text-[#111111] flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Slot</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">Your Full Name *</label>
                    <input
                      required
                      type="text"
                      value={guest.name}
                      onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                      placeholder="e.g. Rajesh Sharma"
                      className="shadcn-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={guest.company}
                      onChange={(e) => setGuest({ ...guest, company: e.target.value })}
                      placeholder="e.g. Apex Health Systems"
                      className="shadcn-input w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">Work Email Address *</label>
                    <input
                      required
                      type="email"
                      value={guest.email}
                      onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                      placeholder="rajesh@company.com"
                      className="shadcn-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      value={guest.phone}
                      onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="shadcn-input w-full"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-[#444444] font-medium mb-1">Key Objectives or Questions (Optional)</label>
                  <textarea
                    rows={2}
                    value={guest.notes}
                    onChange={(e) => setGuest({ ...guest, notes: e.target.value })}
                    placeholder="Tell us what you would like to cover during our session..."
                    className="shadcn-input w-full"
                  />
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-[#E5E5E5]">
                  <button
                    type="button"
                    onClick={() => setStep('datetime')}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary text-xs py-2.5 px-5 flex items-center space-x-2 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Confirming Slot...' : 'Confirm Meeting & Generate Invite'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: BOOKING CONFIRMED */}
            {step === 'confirmed' && bookingResult && (
              <div className="text-center py-6 space-y-5">
                <div className="w-14 h-14 bg-emerald-50 text-[#16A34A] rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#111111]">Meeting Confirmed!</h3>
                  <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
                    Your session with the ABC Technologies Enterprise Sales Team is locked in. A calendar invitation has been generated.
                  </p>
                </div>

                <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-4 max-w-sm mx-auto text-left text-xs space-y-2.5">
                  <div className="font-semibold text-[#111111] pb-1 border-b border-[#E5E5E5]">
                    {bookingResult.title}
                  </div>
                  <div className="flex items-center space-x-2 text-[#555555]">
                    <CalIcon className="w-3.5 h-3.5 text-[#111111]" />
                    <span className="font-mono">{bookingResult.date_time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#555555]">
                    <Video className="w-3.5 h-3.5 text-[#111111]" />
                    <a 
                      href={bookingResult.meet_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-mono text-emerald-700 underline truncate"
                    >
                      {bookingResult.meet_link}
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={downloadIcs}
                    className="btn-primary text-xs py-2 px-4 flex items-center space-x-2 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>Add to Google / Apple / Outlook</span>
                  </button>
                  <button
                    onClick={() => {
                      setStep('service');
                      setGuest({ name: '', company: '', email: '', phone: '', notes: '' });
                      setBookingResult(null);
                    }}
                    className="btn-secondary text-xs py-2 px-4 w-full sm:w-auto"
                  >
                    Book Another Slot
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-[11px] text-[#888888] pt-6 border-t border-[#E5E5E5]">
        Powered by Enterprise SaaS CRM Scheduling Engine • End-to-End Secure Multi-Tenant Architecture
      </footer>
    </div>
  );
}
