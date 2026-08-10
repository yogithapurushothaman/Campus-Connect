'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintStatus } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertOctagon,
  Flame,
  Search,
  Filter,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { IssuesHeatmap } from './IssuesHeatmap';

export const AdminComplaintDashboard: React.FC = () => {
  const {
    complaints,
    updateComplaintStatus,
    currentUser,
    broadcastEmergencyAlert,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'heatmap'>('queue');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Status update modal state
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('in_progress');
  const [assignedTo, setAssignedTo] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    updateComplaintStatus(selectedComplaint.id, newStatus, statusNote, assignedTo || undefined);
    setSelectedComplaint(null);
    setStatusNote('');
    setAssignedTo('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Administrative Grievance Triage Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              Officer: {currentUser.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dispatch maintenance vendors, update SLA lifecycles, and monitor building issues heatmap.
          </p>
        </div>

        {/* View Switcher: Queue vs Heatmap */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'queue'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Triage Queue ({complaints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'heatmap'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Campus Heatmap</span>
          </button>
        </div>
      </div>

      {activeTab === 'heatmap' ? (
        <IssuesHeatmap />
      ) : (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Tickets' },
              { id: 'submitted', label: 'Pending Review' },
              { id: 'acknowledged', label: 'Acknowledged' },
              { id: 'assigned', label: 'Assigned' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  filterStatus === st.id
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Complaints Table / Cards */}
          <div className="space-y-3">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1424]"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      #{c.ticketNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                      {c.category}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        c.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {c.priority}
                    </span>
                    <span className="text-xs text-slate-400">• {c.buildingName} ({c.roomOrArea})</span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-semibold text-slate-400 block">Current Status</span>
                    <span
                      className={`text-xs font-bold uppercase ${
                        c.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setNewStatus(c.status);
                      setAssignedTo(c.assignedTo || '');
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
                  >
                    Update Lifecycle
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-indigo-500/30 shadow-2xl bg-[#0c1222]">
            <div className="pb-3 border-b border-white/10">
              <span className="font-mono text-xs font-bold text-amber-400">
                Ticket #{selectedComplaint.ticketNumber}
              </span>
              <h3 className="font-bold text-base text-white mt-1">{selectedComplaint.title}</h3>
            </div>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Transition Status To:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm bg-[#0e1628]"
                >
                  <option value="submitted">Submitted</option>
                  <option value="acknowledged">Acknowledged by Desk</option>
                  <option value="assigned">Assigned to Field Staff</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved & Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Assigned Technician / Lead
                </label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Kumar (Network IT Team)"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Status Transition Note / Work Completed
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain actions taken, parts replaced, or next ETA update..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Confirm Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
