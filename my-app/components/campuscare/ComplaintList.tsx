'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintCategory } from '../../types';
import {
  LifeBuoy,
  Plus,
  Search,
  ThumbsUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { ComplaintSubmissionModal } from './ComplaintSubmissionModal';
import { ComplaintDetailModal } from './ComplaintDetailModal';

export const ComplaintList: React.FC = () => {
  const { complaints, searchQuery, upvoteComplaint, currentUser, navigateToVenue } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'resolved' | 'my_tickets'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Issues' },
    { id: 'wifi', label: 'Wi-Fi & Net' },
    { id: 'hostel', label: 'Hostel' },
    { id: 'mess', label: 'Mess & Food' },
    { id: 'academic', label: 'Academic' },
    { id: 'security', label: 'Safety & Light' },
  ];

  const filteredComplaints = complaints.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && c.status !== 'resolved') ||
      (selectedStatus === 'resolved' && c.status === 'resolved') ||
      (selectedStatus === 'my_tickets' && c.authorId === currentUser.id);

    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'in_progress':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'assigned':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Campus Care & Grievances
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              {complaints.filter((c) => c.status !== 'resolved').length} Active Issues
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit issues, track real-time resolution SLAs, and support recurring community requests.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Report Campus Issue
        </button>
      </div>

      {/* Filter and Category Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                  : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
          {(['all', 'active', 'resolved', 'my_tickets'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                selectedStatus === st
                  ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                  : 'bg-transparent text-slate-400 border-white/5 hover:bg-slate-800/50'
              }`}
            >
              {st === 'my_tickets' ? 'My Tickets' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaint Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredComplaints.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">No Issues Match Current Filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Campus facilities in this category are operating smoothly!
            </p>
          </div>
        ) : (
          filteredComplaints.map((c) => {
            const hasUpvoted = c.upvotedByUserIds.includes(currentUser.id);

            return (
              <div
                key={c.id}
                onClick={() => setSelectedComplaint(c)}
                className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-amber-500/40 cursor-pointer group transition-all bg-[#0d1424]"
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        #{c.ticketNumber}
                      </span>
                      {c.isAnonymous && (
                        <span className="text-[10px] flex items-center gap-1 font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/20">
                          <EyeOff className="w-3 h-3" />
                          Anonymous
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        c.status
                      )}`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Location & Room tag */}
                  <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {c.buildingName} • {c.roomOrArea}
                    </span>
                  </div>
                </div>

                {/* Footer Upvote & Actions */}
                <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      upvoteComplaint(c.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      hasUpvoted
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-black' : ''}`} />
                    <span>{c.upvotes} Upvotes</span>
                  </button>

                  <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                    View SLA Progress
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <ComplaintSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
};
