'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Club } from '../../types';
import {
  Megaphone,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  Plus,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const ClubAdminPanel: React.FC<{ club: Club }> = ({ club }) => {
  const { postClubAnnouncement, updateApplicantStatus } = useApp();

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annBadge, setAnnBadge] = useState('Official Update');
  const [showAnnForm, setShowAnnForm] = useState(false);

  const applicants = club.recruitment?.applicants || [];

  const handlePostAnn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    postClubAnnouncement(club.id, annTitle, annContent, annBadge);
    setAnnTitle('');
    setAnnContent('');
    setShowAnnForm(false);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Broadcast Announcement Section */}
      <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 bg-[#0d1527]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Club Broadcasts & Announcements</h3>
              <p className="text-xs text-slate-400">Push updates to all {club.memberCount} club followers</p>
            </div>
          </div>

          <button
            onClick={() => setShowAnnForm(!showAnnForm)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAnnForm ? 'Close Form' : 'New Broadcast'}
          </button>
        </div>

        {showAnnForm && (
          <form onSubmit={handlePostAnn} className="mt-4 pt-4 border-t border-white/10 space-y-3.5">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon Prep Bootcamps Starting this Friday!"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Tag Badge
                </label>
                <input
                  type="text"
                  value={annBadge}
                  onChange={(e) => setAnnBadge(e.target.value)}
                  placeholder="e.g. Priority Alert / Swag"
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Content Details
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write message to club members..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Publish Announcement
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recruitment Review Desk */}
      <div className="glass-card p-5 rounded-3xl border border-white/10 bg-[#0d1527]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Recruitment Applications Desk</h3>
              <p className="text-xs text-slate-400">
                {applicants.length} candidate{applicants.length !== 1 ? 's' : ''} applied
              </p>
            </div>
          </div>
        </div>

        {applicants.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">
            No candidate applications submitted yet for active recruitment drives.
          </p>
        ) : (
          <div className="space-y-3">
            {applicants.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{app.userName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {app.roleApplied}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {app.userMajor} • {app.userYear} • {app.userEmail}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl self-start sm:self-auto border ${
                      app.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : app.status === 'shortlisted'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : app.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-slate-400 text-[11px] uppercase mb-1">Statement of Purpose:</p>
                  {app.whyJoin}
                </div>

                {app.portfolioUrl && (
                  <a
                    href={app.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {app.portfolioUrl}
                  </a>
                )}

                {/* Status Update Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => updateApplicantStatus(club.id, app.id, 'shortlisted')}
                    className="px-3 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/30 text-sky-300 text-xs font-semibold"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => updateApplicantStatus(club.id, app.id, 'accepted')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => updateApplicantStatus(club.id, app.id, 'rejected')}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
