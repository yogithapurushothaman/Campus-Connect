'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintStatus } from '../../types';
import {
  X,
  LifeBuoy,
  Clock,
  MapPin,
  ThumbsUp,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Building,
} from 'lucide-react';

export const ComplaintDetailModal: React.FC<{
  complaint: Complaint | null;
  onClose: () => void;
}> = ({ complaint, onClose }) => {
  const { currentUser, upvoteComplaint, navigateToVenue } = useApp();

  if (!complaint) return null;

  const hasUpvoted = complaint.upvotedByUserIds.includes(currentUser.id);

  const statusSteps: { id: ComplaintStatus; label: string }[] = [
    { id: 'submitted', label: 'Submitted' },
    { id: 'acknowledged', label: 'Acknowledged' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.id === complaint.status);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold';
      case 'medium':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-6 bg-[#0c1222]">
        {/* Header */}
        <div className="p-6 bg-[#0f172a] border-b border-white/10 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400">
                #{complaint.ticketNumber}
              </span>
              <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-lg border ${getPriorityStyle(complaint.priority)}`}>
                {complaint.priority} Priority
              </span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5 font-semibold">
                {complaint.category}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1.5 leading-snug">
              {complaint.title}
            </h2>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* 5-Stage Lifecycle Progress Bar */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Grievance Resolution Lifecycle
            </h4>

            <div className="relative flex items-center justify-between">
              {/* Connecting Background Line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-500 to-emerald-500 z-0 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />

              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-black ring-4 ring-amber-500/20 scale-110 shadow-lg shadow-amber-500/30'
                          : isPassed
                          ? 'bg-emerald-500 text-black'
                          : 'bg-slate-900 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isPassed && idx < currentStepIndex ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-1.5 whitespace-nowrap text-center ${
                        isCurrent ? 'text-amber-400' : isPassed ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Meta Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Tagged Facility</span>
              <p className="font-bold text-white mt-0.5">{complaint.buildingName}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">{complaint.roomOrArea}</p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Assigned Resolution Team</span>
              <p className="font-bold text-indigo-300 mt-0.5">{complaint.assignedTeam || 'Facilities Helpdesk'}</p>
              {complaint.assignedTo && (
                <p className="text-slate-400 text-[11px] mt-0.5">Technician: {complaint.assignedTo}</p>
              )}
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Issue Report Description
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#090d16] p-4 rounded-2xl border border-white/5 whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Photo Evidence if present */}
          {complaint.photoUrl && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Attached Photo Evidence
              </h4>
              <div className="rounded-2xl overflow-hidden border border-white/10 max-h-52 bg-black">
                <img src={complaint.photoUrl} alt="Complaint Evidence" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Status Timeline History */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Lifecycle Event Log
            </h4>
            <div className="space-y-2">
              {complaint.timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.label}</span>
                      {item.updatedBy && (
                        <span className="text-[10px] text-indigo-400">• By {item.updatedBy}</span>
                      )}
                    </div>
                    {item.note && <p className="text-slate-400 mt-1 leading-snug">{item.note}</p>}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => upvoteComplaint(complaint.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                hasUpvoted
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-black' : ''}`} />
              <span>{hasUpvoted ? 'Upvoted' : 'Upvote Priority'} ({complaint.upvotes})</span>
            </button>

            <button
              onClick={() => {
                navigateToVenue(complaint.buildingId);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Locate on Campus Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
