'use client';

import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Users, Plus, Search, Mail, Phone, Building2, MapPin, X } from 'lucide-react';

export const ContactsView: React.FC = () => {
  const { contacts, addContact } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'VP of Technology',
    company: '',
    city: 'New Delhi',
    status: 'Active' as const,
  });

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company || c.account_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.company) return;
    addContact(newContact);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Contacts Directory" 
        subtitle="Manage verified customer contacts, executives, and communication channels."
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary cursor-pointer">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>+ Add Contact</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="shadcn-card p-4 flex justify-between items-center">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search contacts by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadcn-input pl-9 w-full"
          />
        </div>
        <span className="text-xs text-[#666666] font-medium">{filtered.length} Contacts listed</span>
      </div>

      {/* Contacts Table */}
      <div className="shadcn-card overflow-hidden">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Designation</th>
              <th>Company</th>
              <th>Contact Details</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(contact => (
              <tr key={contact.id}>
                <td>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                      {contact.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-[#111111]">{contact.name}</span>
                  </div>
                </td>
                <td className="text-xs text-[#444444]">{contact.designation || 'Executive'}</td>
                <td className="text-xs font-medium text-[#111111]">
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                    <span>{contact.company}</span>
                  </div>
                </td>
                <td>
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center space-x-1 text-[#444444]">
                      <Mail className="w-3 h-3 text-[#888888]" />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#666666]">
                      <Phone className="w-3 h-3 text-[#888888]" />
                      <span>{contact.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="text-xs text-[#666666]">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#888888]" />
                    <span>{contact.city || 'Kolkata'}</span>
                  </div>
                </td>
                <td>
                  <span className="shadcn-badge shadcn-badge-success">
                    {contact.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Add New Contact</h3>
              <button onClick={() => setShowModal(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Full Name *</label>
                <input 
                  required
                  type="text" 
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="shadcn-input w-full"
                  placeholder="e.g. Dr. Priya Sharma"
                />
              </div>
              <div>
                <label className="block text-[#444444] font-medium mb-1">Company *</label>
                <input 
                  required
                  type="text" 
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="shadcn-input w-full"
                  placeholder="e.g. Apex Health Systems"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Designation</label>
                  <input 
                    type="text" 
                    value={newContact.designation}
                    onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">City</label>
                  <input 
                    type="text" 
                    value={newContact.city}
                    onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                    className="shadcn-input w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
