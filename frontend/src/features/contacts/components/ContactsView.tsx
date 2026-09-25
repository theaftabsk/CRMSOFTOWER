'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, Plus, Search, Mail, Phone, Building2, MapPin, 
  ExternalLink, ShieldCheck, Download, Trash2, 
  Edit3, RefreshCw, MessageSquare, Check, X, UserCheck, 
  Briefcase, Filter, ChevronRight, Activity, Award, MoreHorizontal
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { api } from '../../../lib/api';
import { Contact, ContactBuyingRole, ContactDepartment } from '@/types/crm';
import { formatNumber } from '@/lib/utils';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
  </svg>
);

export const ContactsView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Liquid Glass Dropdown & Delete State
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    department: 'EXECUTIVE',
    buying_role: 'DECISION_MAKER',
    city: 'Mumbai',
    status: 'Active',
    linkedin_url: '',
    preferred_contact_method: 'EMAIL',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactList, statsData] = await Promise.all([
        api.getContacts(),
        api.getContactStats(),
      ]);
      setContacts(Array.isArray(contactList) ? contactList : []);
      setStats(statsData);
    } catch (e) {
      console.error('Error loading contacts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleClickOutside = () => setOpenActionDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = 
        !s ||
        c.name.toLowerCase().includes(s) ||
        (c.company || '').toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.designation || '').toLowerCase().includes(s) ||
        (c.city || '').toLowerCase().includes(s);

      const matchesRole = roleFilter === 'ALL' || c.buying_role === roleFilter;
      const matchesDept = deptFilter === 'ALL' || c.department === deptFilter;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });
  }, [contacts, searchTerm, roleFilter, deptFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      designation: '',
      department: 'EXECUTIVE',
      buying_role: 'DECISION_MAKER',
      city: 'Mumbai',
      status: 'Active',
      linkedin_url: '',
      preferred_contact_method: 'EMAIL',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company || '',
      designation: contact.designation || '',
      department: contact.department || 'EXECUTIVE',
      buying_role: contact.buying_role || 'DECISION_MAKER',
      city: contact.city || '',
      status: contact.status || 'Active',
      linkedin_url: contact.linkedin_url || '',
      preferred_contact_method: contact.preferred_contact_method || 'EMAIL',
      notes: contact.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) return;
    setSubmitting(true);
    try {
      if (editingContact) {
        await api.updateContact(editingContact.id, formData);
      } else {
        await api.createContact(formData);
      }
      setShowModal(false);
      loadData();
    } catch (e) {
      console.error('Save contact error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setContactToDelete({ id, name });
  };

  const exportCSV = () => {
    if (contacts.length === 0) return;
    const headers = ['Name', 'Title', 'Company', 'Email', 'Phone', 'Role', 'Department', 'City', 'Status'];
    const rows = filteredContacts.map((c) => [
      `"${c.name}"`,
      `"${c.designation || ''}"`,
      `"${c.company || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.buying_role || ''}"`,
      `"${c.department || ''}"`,
      `"${c.city || ''}"`,
      `"${c.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crm_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'DECISION_MAKER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#111111] text-white">
            <ShieldCheck className="w-2.5 h-2.5 mr-1" />
            Decision Maker
          </span>
        );
      case 'ECONOMIC_BUYER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F4F5] text-[#111111] border border-[#D4D4D4]">
            <Award className="w-2.5 h-2.5 mr-1 text-[#F59E0B]" />
            Economic Buyer
          </span>
        );
      case 'CHAMPION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
            Champion
          </span>
        );
      case 'INFLUENCER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#F4F4F5] text-[#666666] border border-[#E5E5E5]">
            Influencer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAFAFA] text-[#71717A] border border-[#E5E5E5]">
            {role || 'Stakeholder'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-[#111111]">Contacts Directory</h1>
            <span className="px-2 py-0.5 text-xs font-mono text-[#666666] bg-[#F4F4F5] rounded border border-[#E5E5E5]">
              {contacts.length} Total
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            Verified enterprise stakeholders, C-levels, decision makers, and key customer relationships.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#111111] hover:bg-[#262626] text-white rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* KPI Intelligence Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="liquid-glass-card p-4">
          <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider block">
            Total Contacts
          </span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            {stats?.totalContacts || contacts.length}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Verified human profiles</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block">
            Key Decision Makers
          </span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            {stats?.decisionMakers ?? contacts.filter(c => c.buying_role === 'DECISION_MAKER' || c.buying_role === 'ECONOMIC_BUYER').length}
          </span>
          <span className="text-[10px] text-[#16A34A] font-medium mt-0.5 block">CXO &amp; Procurement leads</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider block">
            Linked to Accounts
          </span>
          <span className="text-2xl font-bold font-mono text-[#111111] mt-1 block">
            {stats?.accountsLinked ?? contacts.filter(c => c.account_id).length}
          </span>
          <span className="text-[10px] text-[#888888] mt-0.5 block">Corporate org mapping</span>
        </div>

        <div className="liquid-glass-card p-4">
          <span className="text-[11px] font-semibold text-[#16A34A] uppercase tracking-wider block">
            Active Status
          </span>
          <span className="text-2xl font-bold font-mono text-[#16A34A] mt-1 block">
            {stats?.activeContacts ?? contacts.filter(c => c.status === 'Active').length}
          </span>
          <span className="text-[10px] text-[#666666] mt-0.5 block">Deliverable communication</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="liquid-glass p-4 rounded-2xl space-y-3 border border-white/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, company, email, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] transition shadow-2xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="shadcn-input text-xs bg-white py-1.5"
            >
              <option value="ALL">All Departments</option>
              <option value="EXECUTIVE">Executive / CXO</option>
              <option value="ENGINEERING">Engineering &amp; Tech</option>
              <option value="SALES">Sales</option>
              <option value="MARKETING">Marketing</option>
              <option value="FINANCE">Finance</option>
              <option value="PROCUREMENT">Procurement</option>
              <option value="OPERATIONS">Operations</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shadcn-input text-xs bg-white py-1.5"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Do Not Contact">Do Not Contact</option>
            </select>
          </div>
        </div>

        {/* Buying Role Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-1">
          <span className="text-[11px] font-semibold text-[#888888] mr-1">Role:</span>
          {[
            { key: 'ALL', label: 'All Roles' },
            { key: 'DECISION_MAKER', label: 'Decision Makers' },
            { key: 'ECONOMIC_BUYER', label: 'Economic Buyers' },
            { key: 'CHAMPION', label: 'Champions' },
            { key: 'INFLUENCER', label: 'Influencers' },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setRoleFilter(r.key)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition whitespace-nowrap cursor-pointer ${
                roleFilter === r.key
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-[#F9FAFB] text-[#666666] border-[#E5E5E5] hover:bg-[#F4F4F5] hover:text-[#111111]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Data Grid */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#666666] flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
            <span>Loading Contacts Directory...</span>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#666666] space-y-2">
            <Users className="w-8 h-8 text-[#999999] mx-auto" />
            <p className="font-semibold text-[#111111]">No contacts found matching your criteria.</p>
            <p className="text-[11px]">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Organization &amp; Title</th>
                  <th className="py-3 px-4">Buying Role</th>
                  <th className="py-3 px-4">Channels</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Deals / Touchpoints</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {filteredContacts.map((contact) => {
                  const initials = contact.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={contact.id} className="hover:bg-[#FAFAFA] transition group">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={`/contacts/${contact.id}`}
                              className="font-bold text-[#111111] hover:underline flex items-center space-x-1"
                            >
                              <span>{contact.name}</span>
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-[#888888]" />
                            </Link>
                            <span className="text-[11px] text-[#666666] block font-mono">
                              {contact.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Company & Designation */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-[#111111] flex items-center space-x-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                            {contact.account_id ? (
                              <Link
                                href={`/accounts/${contact.account_id}`}
                                className="hover:underline font-medium"
                              >
                                {contact.account?.name || contact.company}
                              </Link>
                            ) : (
                              <span>{contact.company}</span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#666666] block">
                            {contact.designation || 'Executive'} &bull; <span className="font-mono text-[10px] uppercase text-[#888888]">{contact.department || 'EXECUTIVE'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Buying Role */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(contact.buying_role)}
                      </td>

                      {/* Communication Channels */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <a
                            href={`mailto:${contact.email}`}
                            title={`Email ${contact.email}`}
                            className="p-1.5 rounded-md border border-[#E5E5E5] hover:bg-white text-[#666666] hover:text-[#111111] transition"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${contact.phone}`}
                            title={`Call ${contact.phone}`}
                            className="p-1.5 rounded-md border border-[#E5E5E5] hover:bg-white text-[#666666] hover:text-[#111111] transition"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          {contact.phone && (
                            <a
                              href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1.5 rounded-md border border-[#E5E5E5] hover:bg-white text-[#16A34A] transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {contact.linkedin_url && (
                            <a
                              href={contact.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View LinkedIn Profile"
                              className="p-1.5 rounded-md border border-[#E5E5E5] hover:bg-white text-[#0A66C2] transition"
                            >
                              <LinkedinIcon className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-[#666666]">
                        <div className="flex items-center space-x-1 text-xs">
                          <MapPin className="w-3 h-3 text-[#999999]" />
                          <span>{contact.city || 'India'}</span>
                        </div>
                      </td>

                      {/* Deals & Activities summary */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F4F4F5] text-[#111111] border border-[#E5E5E5]" title="Associated Deals">
                            {contact._count?.deals || contact.deals?.length || 0} Deals
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F4F4F5] text-[#666666] border border-[#E5E5E5]" title="Touchpoint logs">
                            {contact._count?.activities || contact.activities?.length || 0} Logs
                          </span>
                        </div>
                      </td>

                      {/* 360° Cockpit & 3-Dot Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="px-2.5 py-1 bg-gradient-to-b from-[#1c1c1e] to-[#000000] hover:from-[#000000] hover:to-[#111111] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 btn-liquid shadow-xs"
                            title="Open 360° Cockpit"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Cockpit</span>
                          </Link>

                          {/* 3-Dot More Actions Menu */}
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              title="More Options"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionDropdownId(openActionDropdownId === contact.id ? null : contact.id);
                              }}
                              className={`p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-black/[0.06] btn-liquid transition inline-flex items-center cursor-pointer ${
                                openActionDropdownId === contact.id ? 'bg-black/[0.08] text-[#111111]' : ''
                              }`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Floating Liquid Glass Dropdown Menu */}
                            {openActionDropdownId === contact.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1 w-52 liquid-glass-dropdown p-1.5 z-40 liquid-animate-in border border-white/80 shadow-2xl text-left"
                              >
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                                  Contact Actions
                                </div>

                                <Link
                                  href={`/contacts/${contact.id}`}
                                  onClick={() => setOpenActionDropdownId(null)}
                                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">360° Cockpit</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleOpenEdit(contact);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition text-left cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">Edit Details</span>
                                </button>

                                {contact.phone && (
                                  <a
                                    href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpenActionDropdownId(null)}
                                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#16A34A] hover:bg-emerald-50/70 btn-liquid transition"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-[#16A34A]" />
                                    <span className="font-medium">WhatsApp Message</span>
                                  </a>
                                )}

                                <a
                                  href={`mailto:${contact.email}`}
                                  onClick={() => setOpenActionDropdownId(null)}
                                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#222222] hover:bg-black/[0.05] btn-liquid transition"
                                >
                                  <Mail className="w-3.5 h-3.5 text-[#555555]" />
                                  <span className="font-medium">Send Email</span>
                                </a>

                                <div className="border-t border-black/[0.06] my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleDelete(contact.id, contact.name);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#DC2626] hover:bg-red-50/80 btn-liquid transition text-left cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                  <span className="font-semibold">Delete Contact</span>
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

      {/* CREATE / EDIT CONTACT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">
                {editingContact ? 'Edit Contact Record' : 'Add Verified Contact'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Full Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="shadcn-input w-full text-xs"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Work Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vikram@company.com"
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Direct Phone *</label>
                  <input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98201 12345"
                    className="shadcn-input w-full text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Company / Org *</label>
                  <input
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Tata Consultancy Enterprise"
                    className="shadcn-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Job Title / Designation</label>
                  <input
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Chief Technology Officer (CTO)"
                    className="shadcn-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                  <label className="text-xs font-semibold text-[#111111] block mb-1">Buying Power / Role</label>
                  <select
                    value={formData.buying_role}
                    onChange={(e) => setFormData({ ...formData, buying_role: e.target.value })}
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
                  <label className="text-xs font-semibold text-[#111111] block mb-1">City / Location</label>
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai, Bengaluru, New Delhi"
                    className="shadcn-input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">LinkedIn Profile URL</label>
                <input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="shadcn-input w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">Relationship Notes &amp; Scope</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key stakeholder context, decision timeline, or personal preferences..."
                  className="shadcn-input w-full text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-[#D4D4D4] hover:bg-[#F8F8F8] text-[#111111] text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingContact ? 'Update Contact' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liquid Glass Confirmation Dialog for Contact Deletion */}
      <ConfirmDialog
        isOpen={!!contactToDelete}
        title="Delete Contact Record"
        message={`Are you sure you want to permanently delete "${contactToDelete?.name}"? All timeline logs and relationship associations will be unlinked.`}
        confirmLabel="Delete Contact"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (contactToDelete) {
            await api.deleteContact(contactToDelete.id);
            setContactToDelete(null);
            loadData();
          }
        }}
        onCancel={() => setContactToDelete(null)}
      />
    </div>
  );
};
