'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Mail, Phone, Building2, MapPin, 
  ShieldCheck, Award, MessageSquare, Plus, Trash2, Edit3, 
  Calendar, Clock, User, Briefcase, Activity, CheckCircle2, 
  FileText, ExternalLink, RefreshCw, X, ChevronRight, AlertCircle 
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Contact, ContactActivity } from '@/types/crm';
import { formatNumber } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
  </svg>
);

export default function ContactDetailsCockpit() {
  const params = useParams();
  const router = useRouter();
  const contactId = params?.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'timeline' | 'org' | 'notes'>('overview');

  // Activity Logger Modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<'CALL' | 'EMAIL' | 'MEETING' | 'WHATSAPP' | 'NOTE'>('CALL');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [savingActivity, setSavingActivity] = useState(false);

  // Edit Contact Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Confirm Dialog states
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [showDeleteContactDialog, setShowDeleteContactDialog] = useState(false);

  const loadContact = async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const data = await api.getContact(contactId);
      setContact(data);
      if (data) {
        setEditFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company || '',
          designation: data.designation || '',
          department: data.department || 'EXECUTIVE',
          buying_role: data.buying_role || 'DECISION_MAKER',
          city: data.city || '',
          status: data.status || 'Active',
          linkedin_url: data.linkedin_url || '',
          preferred_contact_method: data.preferred_contact_method || 'EMAIL',
          notes: data.notes || '',
        });
      }
    } catch (e) {
      console.error('Error loading contact cockpit:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContact();
  }, [contactId]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;
    setSavingActivity(true);
    try {
      await api.addContactActivity(contactId, {
        type: activityType,
        title: activityTitle,
        description: activityDesc,
        created_by: 'Sales Executive',
      });
      setShowActivityModal(false);
      setActivityTitle('');
      setActivityDesc('');
      loadContact();
    } catch (e) {
      console.error('Log activity error:', e);
    } finally {
      setSavingActivity(false);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivityToDelete(activityId);
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await api.updateContact(contactId, editFormData);
      setShowEditModal(false);
      loadContact();
    } catch (e) {
      console.error('Update contact error:', e);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteContact = () => {
    setShowDeleteContactDialog(true);
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-[#666666] flex items-center justify-center space-x-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
        <span>Loading Contact 360° Cockpit...</span>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-16 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
        <h2 className="text-sm font-bold text-[#111111]">Contact Not Found</h2>
        <Link href="/contacts" className="text-xs text-[#111111] underline">Back to Contacts Directory</Link>
      </div>
    );
  }

  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'DECISION_MAKER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#111111] text-white">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Decision Maker
          </span>
        );
      case 'ECONOMIC_BUYER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#F4F4F5] text-[#111111] border border-[#D4D4D4]">
            <Award className="w-3 h-3 mr-1 text-[#F59E0B]" />
            Economic Buyer
          </span>
        );
      case 'CHAMPION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
            Champion
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAFAFA] text-[#71717A] border border-[#E5E5E5]">
            {role || 'Stakeholder'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-4">
          <Link
            href="/contacts"
            className="p-2 rounded-lg border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#666666] transition inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-base flex-shrink-0">
            {initials}
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-bold text-[#111111]">{contact.name}</h1>
              {getRoleBadge(contact.buying_role)}
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F4F4F5] text-[#71717A] rounded border border-[#E5E5E5]">
                {contact.status}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-[#666666] mt-1">
              <span>{contact.designation || 'Executive'}</span>
              <span>&bull;</span>
              <div className="flex items-center space-x-1 font-semibold text-[#111111]">
                <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                {contact.account_id ? (
                  <Link href={`/accounts/${contact.account_id}`} className="hover:underline">
                    {contact.account?.name || contact.company}
                  </Link>
                ) : (
                  <span>{contact.company}</span>
                )}
              </div>
              <span>&bull;</span>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#888888]" />
                <span>{contact.city || 'India'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Dock */}
        <div className="flex items-center space-x-2">
          <a
            href={`mailto:${contact.email}`}
            className="px-3 py-1.5 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </a>

          <a
            href={`tel:${contact.phone}`}
            className="px-3 py-1.5 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>

          <button
            onClick={() => setShowActivityModal(true)}
            className="px-3.5 py-1.5 bg-[#111111] hover:bg-[#262626] text-white rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Touchpoint</span>
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="p-1.5 rounded-lg border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] transition cursor-pointer"
            title="Edit Contact"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDeleteContact}
            className="p-1.5 rounded-lg border border-[#D4D4D4] hover:bg-[#FEE2E2] text-[#DC2626] transition cursor-pointer"
            title="Delete Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-1 border-b border-[#E5E5E5] bg-white px-3 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview & Profile', icon: User },
          { key: 'deals', label: `Deals & Pipeline (${contact.deals?.length || 0})`, icon: Briefcase },
          { key: 'timeline', label: `Touchpoint Timeline (${contact.activities?.length || 0})`, icon: Activity },
          { key: 'org', label: `Org Map & Colleagues (${contact.account?.contacts?.length || 0})`, icon: Building2 },
          { key: 'notes', label: 'Internal Notes', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-[#111111] text-[#111111] bg-[#FAFAFA]' 
                  : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & PROFILE                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Contact Metadata (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">
                Stakeholder Information
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#888888] block text-[11px] mb-0.5">Corporate Email</span>
                  <a href={`mailto:${contact.email}`} className="font-mono font-medium text-[#111111] hover:underline flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-[#888888]" />
                    <span>{contact.email}</span>
                  </a>
                </div>

                <div>
                  <span className="text-[#888888] block text-[11px] mb-0.5">Direct Phone</span>
                  <a href={`tel:${contact.phone}`} className="font-mono font-medium text-[#111111] hover:underline flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-[#888888]" />
                    <span>{contact.phone}</span>
                  </a>
                </div>

                <div>
                  <span className="text-[#888888] block text-[11px] mb-0.5">Department</span>
                  <span className="font-semibold text-[#111111]">{contact.department || 'EXECUTIVE'}</span>
                </div>

                <div>
                  <span className="text-[#888888] block text-[11px] mb-0.5">Preferred Channel</span>
                  <span className="font-medium text-[#111111]">{contact.preferred_contact_method || 'EMAIL'}</span>
                </div>

                <div>
                  <span className="text-[#888888] block text-[11px] mb-0.5">Lifecycle Stage</span>
                  <span className="font-semibold text-[#111111]">{contact.lifecycle_stage || 'CUSTOMER'}</span>
                </div>

                <div>
                  <span className="text-[#888888] block text-[11px] mb-0.5">LinkedIn Profile</span>
                  {contact.linkedin_url ? (
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#0A66C2] hover:underline flex items-center space-x-1"
                    >
                      <LinkedinIcon className="w-3 h-3" />
                      <span>View Profile</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[#888888]">Not Provided</span>
                  )}
                </div>
              </div>
            </div>

            {/* Strategic Notes Card */}
            <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Relationship Strategy &amp; Notes
              </h3>
              <p className="text-xs text-[#404040] leading-relaxed">
                {contact.notes || 'No internal stakeholder notes recorded yet. Click Edit to add context about key drivers, budget cycles, and authority.'}
              </p>
            </div>
          </div>

          {/* Right Column: Parent Account & Org Context (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {contact.account ? (
              <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                  <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                    Parent Account
                  </h3>
                  <Link
                    href={`/accounts/${contact.account.id}`}
                    className="text-xs font-semibold text-[#111111] hover:underline flex items-center space-x-1"
                  >
                    <span>View Account 360°</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[#888888] block text-[11px]">Organization Name</span>
                    <span className="font-bold text-sm text-[#111111]">{contact.account.name}</span>
                  </div>

                  <div>
                    <span className="text-[#888888] block text-[11px]">Industry</span>
                    <span className="font-medium text-[#111111]">{contact.account.industry || 'Technology'}</span>
                  </div>

                  <div>
                    <span className="text-[#888888] block text-[11px]">Annual Revenue</span>
                    <span suppressHydrationWarning className="font-mono font-bold text-[#111111]">
                      ₹{formatNumber(contact.account.annual_revenue || 0)}
                    </span>
                  </div>

                  {contact.account.website && (
                    <div>
                      <span className="text-[#888888] block text-[11px]">Corporate Website</span>
                      <a
                        href={contact.account.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#111111] hover:underline font-mono flex items-center space-x-1"
                      >
                        <span>{contact.account.website}</span>
                        <ExternalLink className="w-3 h-3 text-[#888888]" />
                      </a>
                    </div>
                  )}

                  {contact.account.billing_address && (
                    <div>
                      <span className="text-[#888888] block text-[11px]">Registered Address</span>
                      <span className="text-[#404040]">{contact.account.billing_address}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white border border-[#E5E5E5] rounded-xl text-center space-y-3">
                <Building2 className="w-8 h-8 text-[#999999] mx-auto" />
                <h4 className="text-xs font-bold text-[#111111]">No Parent Account Linked</h4>
                <p className="text-[11px] text-[#666666]">
                  This contact is currently unassigned to a verified corporate Account record.
                </p>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-primary text-xs cursor-pointer"
                >
                  Link to Account
                </button>
              </div>
            )}

            {/* Quick Touchpoint Stats */}
            <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[#F8F8F8] rounded-lg">
                <span className="text-[10px] text-[#888888] uppercase font-semibold block">Total Touchpoints</span>
                <span className="text-xl font-bold font-mono text-[#111111] mt-1 block">
                  {contact.activities?.length || 0}
                </span>
              </div>
              <div className="p-3 bg-[#F8F8F8] rounded-lg">
                <span className="text-[10px] text-[#888888] uppercase font-semibold block">Deals Associated</span>
                <span className="text-xl font-bold font-mono text-[#111111] mt-1 block">
                  {contact.deals?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEALS & PIPELINE REVENUE                                           */}
      {/* ========================================================================= */}
      {activeTab === 'deals' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Associated Deals &amp; Opportunities
            </h3>
            <Link
              href="/deals"
              className="px-3 py-1.5 bg-[#111111] hover:bg-[#262626] text-white rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Deal</span>
            </Link>
          </div>

          {!contact.deals || contact.deals.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#666666] space-y-2">
              <Briefcase className="w-8 h-8 text-[#999999] mx-auto" />
              <p className="font-semibold text-[#111111]">No active deals associated with this contact.</p>
              <p className="text-[11px]">When creating a deal in the sales pipeline, associate this stakeholder to track influence.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  <th className="py-3 px-4">Deal Title</th>
                  <th className="py-3 px-4">Sales Stage</th>
                  <th className="py-3 px-4">Expected Value</th>
                  <th className="py-3 px-4">Closing Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {contact.deals.map((deal: any) => (
                  <tr key={deal.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3.5 px-4 font-bold text-[#111111]">
                      <Link href={`/deals/${deal.id}`} className="hover:underline">
                        {deal.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F4F5] text-[#111111] border border-[#E5E5E5]">
                        {deal.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#111111]">
                      <span suppressHydrationWarning>₹{formatNumber(deal.value || 0)}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#666666]">
                      {deal.closing_date || 'Q3 2026'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="text-xs font-semibold text-[#111111] hover:underline"
                      >
                        Inspect Deal &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TOUCHPOINT TIMELINE                                                */}
      {/* ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Communication History &amp; Engagement Logs
            </h3>
            <button
              onClick={() => setShowActivityModal(true)}
              className="px-3.5 py-1.5 bg-[#111111] hover:bg-[#262626] text-white rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log New Touchpoint</span>
            </button>
          </div>

          {!contact.activities || contact.activities.length === 0 ? (
            <div className="p-12 bg-white border border-[#E5E5E5] rounded-xl text-center text-xs text-[#666666] space-y-2">
              <Activity className="w-8 h-8 text-[#999999] mx-auto" />
              <p className="font-semibold text-[#111111]">No activity logs recorded yet.</p>
              <p className="text-[11px]">Log your discovery calls, emails, or WhatsApp discussions to keep the team updated.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contact.activities.map((act: ContactActivity) => {
                return (
                  <div
                    key={act.id}
                    className="p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-[#F4F4F5] border border-[#E5E5E5] text-[#111111] flex-shrink-0 mt-0.5">
                        {act.type === 'CALL' && <Phone className="w-3.5 h-3.5" />}
                        {act.type === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                        {act.type === 'MEETING' && <Calendar className="w-3.5 h-3.5" />}
                        {act.type === 'WHATSAPP' && <MessageSquare className="w-3.5 h-3.5 text-[#16A34A]" />}
                        {act.type === 'NOTE' && <FileText className="w-3.5 h-3.5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[#111111]">{act.title}</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-[#FAFAFA] border border-[#E5E5E5] text-[#666666]">
                            {act.type}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-[#404040] leading-relaxed">{act.description}</p>
                        )}
                        <div className="flex items-center space-x-2 text-[10px] text-[#888888] pt-1">
                          <span>Logged by {act.created_by}</span>
                          <span>&bull;</span>
                          <span suppressHydrationWarning>
                            {new Date(act.created_at).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="p-1 text-[#888888] hover:text-[#DC2626] transition cursor-pointer"
                      title="Delete activity log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ORG MAP & COLLEAGUES                                               */}
      {/* ========================================================================= */}
      {activeTab === 'org' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Corporate Stakeholders &amp; Org Mapping
              </h3>
              <p className="text-[11px] text-[#666666]">
                Other verified contacts associated with {contact.account?.name || contact.company}
              </p>
            </div>

            <Link
              href="/contacts"
              className="px-3 py-1.5 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1"
            >
              <span>View All Contacts</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {!contact.account?.contacts || contact.account.contacts.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#666666] space-y-2">
              <Building2 className="w-8 h-8 text-[#999999] mx-auto" />
              <p className="font-semibold text-[#111111]">No other colleagues linked under this account.</p>
              <p className="text-[11px]">Add more contacts to this account to build the complete buying center.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:gap-4 p-4">
              {contact.account.contacts.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <Link href={`/contacts/${c.id}`} className="font-bold text-xs text-[#111111] hover:underline">
                        {c.name}
                      </Link>
                      <span className="text-[11px] text-[#666666] block">{c.designation || 'Executive'}</span>
                      <span className="text-[10px] font-mono text-[#888888]">{c.email}</span>
                    </div>
                  </div>

                  <div>
                    {getRoleBadge(c.buying_role)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: INTERNAL NOTES                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'notes' && (
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
            Stakeholder Dossier &amp; Briefing Notes
          </h3>
          <p className="text-xs text-[#666666]">
            Internal background notes, meeting minutes, and negotiation preferences.
          </p>
          <div className="p-4 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5] text-xs leading-relaxed text-[#111111] whitespace-pre-wrap">
            {contact.notes || 'No notes currently recorded.'}
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-primary text-xs cursor-pointer"
          >
            Edit Dossier Notes
          </button>
        </div>
      )}

      {/* LOG TOUCHPOINT MODAL */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Log Stakeholder Touchpoint</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-1 rounded-md text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Touchpoint Type</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { key: 'CALL', label: 'Call', icon: Phone },
                    { key: 'EMAIL', label: 'Email', icon: Mail },
                    { key: 'MEETING', label: 'Meet', icon: Calendar },
                    { key: 'WHATSAPP', label: 'WA', icon: MessageSquare },
                    { key: 'NOTE', label: 'Note', icon: FileText },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActivityType(t.key as any)}
                        className={`p-2 rounded-lg border text-center text-xs font-semibold transition cursor-pointer ${
                          activityType === t.key
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-[#F9FAFB] text-[#666666] border-[#E5E5E5] hover:bg-[#F4F4F5]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 mx-auto mb-1" />
                        <span className="text-[10px] block">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Subject / Title *</label>
                <input
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Discovery Call with CTO"
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Details &amp; Action Items</label>
                <textarea
                  rows={3}
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="Discussed requirements, follow-up scheduled for Friday..."
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingActivity}
                  className="px-5 py-2 bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  {savingActivity ? 'Saving...' : 'Save Touchpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CONTACT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Edit Contact Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-md text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateContact} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Full Name *</label>
                  <input
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Direct Phone</label>
                  <input
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Company</label>
                  <input
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Job Title</label>
                  <input
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Department</label>
                  <select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="shadcn-input w-full text-xs bg-white"
                  >
                    <option value="EXECUTIVE">Executive / CXO</option>
                    <option value="ENGINEERING">Engineering &amp; IT</option>
                    <option value="SALES">Sales</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="FINANCE">Finance</option>
                    <option value="PROCUREMENT">Procurement &amp; Legal</option>
                    <option value="OPERATIONS">Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Buying Role</label>
                  <select
                    value={editFormData.buying_role}
                    onChange={(e) => setEditFormData({ ...editFormData, buying_role: e.target.value })}
                    className="shadcn-input w-full text-xs bg-white"
                  >
                    <option value="DECISION_MAKER">Decision Maker (C-Level/VP)</option>
                    <option value="ECONOMIC_BUYER">Economic Buyer (Budget Holder)</option>
                    <option value="CHAMPION">Internal Champion</option>
                    <option value="INFLUENCER">Influencer</option>
                    <option value="EVALUATOR">Technical Evaluator</option>
                    <option value="GATEKEEPER">Gatekeeper</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">City</label>
                  <input
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="shadcn-input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">LinkedIn URL</label>
                <input
                  value={editFormData.linkedin_url}
                  onChange={(e) => setEditFormData({ ...editFormData, linkedin_url: e.target.value })}
                  className="shadcn-input w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Relationship Notes</label>
                <textarea
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation for Activity Deletion */}
      <ConfirmDialog
        isOpen={!!activityToDelete}
        title="Delete Activity Log"
        message="Are you sure you want to permanently delete this touchpoint log? This action cannot be reversed."
        confirmLabel="Delete Activity"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (activityToDelete) {
            await api.deleteContactActivity(contactId, activityToDelete);
            setActivityToDelete(null);
            loadContact();
          }
        }}
        onCancel={() => setActivityToDelete(null)}
      />

      {/* Confirmation for Contact Deletion */}
      <ConfirmDialog
        isOpen={showDeleteContactDialog}
        title="Delete Contact Record"
        message={`Are you sure you want to permanently delete "${contact?.name}"? All timeline logs and relationship associations will be removed.`}
        confirmLabel="Delete Contact"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          setShowDeleteContactDialog(false);
          await api.deleteContact(contactId);
          router.push('/contacts');
        }}
        onCancel={() => setShowDeleteContactDialog(false)}
      />
    </div>
  );
}
