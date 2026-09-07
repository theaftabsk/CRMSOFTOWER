'use client';

import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { CheckSquare, Phone, Calendar, Plus, CheckCircle2, Clock, X } from 'lucide-react';

export const ActivitiesView: React.FC = () => {
  const { tasks, calls, meetings, addTask, toggleTaskStatus, addCall } = useCRM();
  const [tab, setTab] = useState<'tasks' | 'calls' | 'meetings'>('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    assigned_to: 'Vikram Sales Manager',
    priority: 'Urgent' as const,
    due_date: new Date().toISOString().split('T')[0],
    status: 'Pending' as const,
    related_type: 'Lead' as const,
    related_name: 'DPS Portal',
  });

  const [newCall, setNewCall] = useState({
    customer_name: '',
    caller_user: 'Vikram Sales Manager',
    duration: '10 mins',
    result: 'Connected - Follow Up',
    notes: '',
    date_time: new Date().toLocaleDateString(),
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Activities & Interactions" 
        subtitle="Manage sales tasks, logged phone calls, and client meetings."
        action={
          <div className="flex space-x-2">
            <button onClick={() => setShowTaskModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-1" />
              <span>+ Add Task</span>
            </button>
            <button onClick={() => setShowCallModal(true)} className="btn-secondary">
              <Phone className="w-4 h-4 mr-1" />
              <span>+ Log Call</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E5E5E5] pb-2">
        <button
          onClick={() => setTab('tasks')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
            tab === 'tasks' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#E5E5E5]'
          }`}
        >
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setTab('calls')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
            tab === 'calls' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#E5E5E5]'
          }`}
        >
          Call Logs ({calls.length})
        </button>
        <button
          onClick={() => setTab('meetings')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
            tab === 'meetings' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#E5E5E5]'
          }`}
        >
          Meetings ({meetings.length})
        </button>
      </div>

      {/* Content */}
      {tab === 'tasks' && (
        <div className="shadcn-card overflow-hidden">
          <table className="crm-table">
            <thead>
              <tr>
                <th className="w-10">Done</th>
                <th>Task Title</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Related To</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      className="cursor-pointer"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${task.status === 'Completed' ? 'text-[#16A34A]' : 'text-[#D4D4D4] hover:text-[#111111]'}`} />
                    </button>
                  </td>
                  <td>
                    <span className={`font-semibold text-xs ${task.status === 'Completed' ? 'line-through text-[#888888]' : 'text-[#111111]'}`}>
                      {task.title}
                    </span>
                  </td>
                  <td>
                    <span className={`shadcn-badge ${task.priority === 'Urgent' ? 'shadcn-badge-danger' : 'shadcn-badge-default'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="text-xs text-[#444444]">{task.assigned_to}</td>
                  <td className="text-xs font-mono text-[#666666]">{task.due_date}</td>
                  <td className="text-xs text-[#666666]">{task.related_type}: {task.related_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'calls' && (
        <div className="shadcn-card overflow-hidden">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Customer / Prospect</th>
                <th>Caller User</th>
                <th>Duration</th>
                <th>Outcome / Result</th>
                <th>Notes</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {calls.map(call => (
                <tr key={call.id}>
                  <td className="font-semibold text-[#111111]">{call.customer_name}</td>
                  <td className="text-xs text-[#444444]">{call.caller_user}</td>
                  <td className="text-xs font-mono text-[#666666]">{call.duration}</td>
                  <td>
                    <span className="shadcn-badge shadcn-badge-default">{call.result}</span>
                  </td>
                  <td className="text-xs text-[#666666] max-w-sm truncate">{call.notes}</td>
                  <td className="text-xs text-[#888888]">{call.date_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'meetings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meetings.map(m => (
            <div key={m.id} className="shadcn-card p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm text-[#111111]">{m.title}</h4>
                <span className="shadcn-badge shadcn-badge-success">{m.status}</span>
              </div>
              <div className="text-xs text-[#666666] flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                <span>{m.date_time}</span>
              </div>
              <div className="text-xs text-[#666666]">
                Location: <strong>{m.location}</strong>
              </div>
              <div className="text-[11px] text-[#888888] pt-2 border-t border-[#F0F0F0]">
                Participants: {m.participants.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] w-full max-w-md shadow-xl p-6">
            <h3 className="font-semibold text-base text-[#111111] pb-2 border-b border-[#E5E5E5]">Create New Task</h3>
            <form onSubmit={(e) => { e.preventDefault(); addTask(newTask); setShowTaskModal(false); }} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Task Title *</label>
                <input required type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="shadcn-input w-full" placeholder="e.g. Follow up on proposal" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })} className="shadcn-input w-full bg-white">
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Due Date</label>
                  <input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} className="shadcn-input w-full" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
