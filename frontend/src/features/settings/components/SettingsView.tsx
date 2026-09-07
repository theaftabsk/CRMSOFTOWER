'use client';

import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Settings, Shield, User, Building, Database, Clock, Plus, X } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { organization, users, customFields, auditLogs, addCustomField } = useCRM();
  const [tab, setTab] = useState<'org' | 'users' | 'fields' | 'audit'>('org');
  const [showFieldModal, setShowFieldModal] = useState(false);

  const [newField, setNewField] = useState({
    entity_type: 'Lead' as const,
    field_name: '',
    field_type: 'Text' as const,
    options: ['Option A', 'Option B'],
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings & Audit Trail" 
        subtitle="Manage organization parameters, team members, custom fields, and security audit logs."
      />

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E5E5E5] pb-2">
        <button
          onClick={() => setTab('org')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
            tab === 'org' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#E5E5E5]'
          }`}
        >
          Organization Profile
        </button>
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
            tab === 'users' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#E5E5E5]'
          }`}
        >
          Users & RBAC ({users.length})
        </button>
        <button
          onClick={() => setTab('fields')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
            tab === 'fields' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#E5E5E5]'
          }`}
        >
          Custom Fields ({customFields.length})
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
            tab === 'audit' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#E5E5E5]'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Org Tab */}
      {tab === 'org' && (
        <div className="shadcn-card p-6 max-w-2xl space-y-4">
          <h3 className="font-semibold text-sm text-[#111111] border-b border-[#E5E5E5] pb-2">
            Multi-Tenant Organization Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#666666] block">Tenant Organization ID</span>
              <span className="font-mono font-bold text-[#111111] mt-0.5 block">{organization.id}</span>
            </div>
            <div>
              <span className="text-[#666666] block">Company Name</span>
              <span className="font-semibold text-[#111111] mt-0.5 block">{organization.name}</span>
            </div>
            <div>
              <span className="text-[#666666] block">Currency Symbol</span>
              <span className="font-semibold text-[#111111] mt-0.5 block">{organization.currency} (INR)</span>
            </div>
            <div>
              <span className="text-[#666666] block">Timezone</span>
              <span className="font-semibold text-[#111111] mt-0.5 block">{organization.timezone}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#666666] block">Registered Address</span>
              <span className="text-[#111111] mt-0.5 block">{organization.address}</span>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="shadcn-card overflow-hidden">
          <table className="crm-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-xs text-[#111111]">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-xs text-[#444444]">{u.email}</td>
                  <td>
                    <span className="shadcn-badge shadcn-badge-default font-medium">{u.role}</span>
                  </td>
                  <td className="text-xs text-[#666666]">{u.department}</td>
                  <td>
                    <span className="shadcn-badge shadcn-badge-success">{u.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fields Tab */}
      {tab === 'fields' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowFieldModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>+ Add Custom Field</span>
            </button>
          </div>
          <div className="shadcn-card overflow-hidden">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Entity Type</th>
                  <th>Field Name</th>
                  <th>Data Type</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {customFields.map(f => (
                  <tr key={f.id}>
                    <td>
                      <span className="shadcn-badge shadcn-badge-default">{f.entity_type}</span>
                    </td>
                    <td className="font-semibold text-[#111111]">{f.field_name}</td>
                    <td className="text-xs text-[#666666]">{f.field_type}</td>
                    <td className="text-xs text-[#888888]">{f.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {tab === 'audit' && (
        <div className="shadcn-card overflow-hidden">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Record ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(l => (
                <tr key={l.id}>
                  <td className="font-mono text-xs text-[#888888]">{l.timestamp}</td>
                  <td className="font-semibold text-xs text-[#111111]">{l.user_name}</td>
                  <td>
                    <span className="shadcn-badge shadcn-badge-default font-mono">{l.action}</span>
                  </td>
                  <td className="text-xs text-[#444444]">{l.entity_type}</td>
                  <td className="font-mono text-xs text-[#666666]">{l.entity_id}</td>
                  <td className="text-xs text-[#666666] max-w-xs truncate">{l.new_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-base text-[#111111]">Create Custom Dynamic Field</h3>
              <button onClick={() => setShowFieldModal(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addCustomField(newField); setShowFieldModal(false); }} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">CRM Entity Type</label>
                <select value={newField.entity_type} onChange={(e) => setNewField({ ...newField, entity_type: e.target.value as any })} className="shadcn-input w-full bg-white">
                  <option value="Lead">Lead</option>
                  <option value="Contact">Contact</option>
                  <option value="Account">Account</option>
                  <option value="Deal">Deal</option>
                </select>
              </div>
              <div>
                <label className="block text-[#444444] font-medium mb-1">Field Name *</label>
                <input required type="text" value={newField.field_name} onChange={(e) => setNewField({ ...newField, field_name: e.target.value })} className="shadcn-input w-full" placeholder="e.g. Budget Tier" />
              </div>
              <div>
                <label className="block text-[#444444] font-medium mb-1">Field Type</label>
                <select value={newField.field_type} onChange={(e) => setNewField({ ...newField, field_type: e.target.value as any })} className="shadcn-input w-full bg-white">
                  <option value="Text">Text</option>
                  <option value="Number">Number</option>
                  <option value="Currency">Currency</option>
                  <option value="Dropdown">Dropdown</option>
                  <option value="Date">Date</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowFieldModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Field</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
