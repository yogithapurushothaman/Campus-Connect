'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Club } from '../../types';
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Megaphone,
  Briefcase,
  Heart,
  ShieldCheck,
  Sparkles,
  Settings,
  Mail,
  UserPlus,
} from 'lucide-react';
import { ClubApplicationModal } from './ClubApplicationModal';
import { ClubAdminPanel } from './ClubAdminPanel';

export const ClubDetailPage: React.FC<{
  club: Club;
  onBack: () => void;
}> = ({ club, onBack }) => {
  const { currentUser, joinClub, leaveClub, showToast } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'recruitment' | 'members' | 'admin'>('feed');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState(club.announcements);

  const isMember = club.members.some((m) => m.userId === currentUser.id);
  const isLead = club.leadEmail === currentUser.email || currentUser.role !== 'student';

  const handleLikeAnnouncement = (annId: string) => {
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id === annId) {
          const alreadyLiked = ann.likedByUserIds.includes(currentUser.id);
          const updatedLikes = alreadyLiked
            ? ann.likedByUserIds.filter((id) => id !== currentUser.id)
            : [...ann.likedByUserIds, currentUser.id];
          return {
            ...ann,
            likes: updatedLikes.length,
            likedByUserIds: updatedLikes,
          };
        }
        return ann;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Clubs
      </button>

      {/* Club Banner & Header */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 bg-[#0c1220]">
        <div className="relative h-52 w-full overflow-hidden bg-slate-900">
          <img src={club.coverImage} alt={club.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220] via-transparent to-black/30" />
        </div>

        <div className="p-6 pt-0 relative -mt-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={club.logo}
              alt={club.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#0c1220] shadow-2xl bg-slate-900 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {club.category}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{club.memberCount} Members</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">{club.name}</h1>
              <p className="text-xs text-indigo-300 font-medium italic mt-0.5">{club.tagLine}</p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {club.recruitment?.isOpen && (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Apply for Open Inductions
              </button>
            )}

            {isMember ? (
              <button
                onClick={() => leaveClub(club.id)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-950/80 hover:bg-rose-950/80 border border-emerald-500/40 hover:border-rose-500/40 text-emerald-300 hover:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors group/btn"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 group-hover/btn:hidden" />
                <span className="group-hover/btn:hidden">Member (Joined)</span>
                <span className="hidden group-hover/btn:inline">Leave Club</span>
              </button>
            ) : (
              <button
                onClick={() => joinClub(club.id)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Join Club Community
              </button>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-6 border-t border-white/10 flex gap-2 overflow-x-auto bg-[#0a0f1b]">
          {[
            { id: 'feed', label: 'Announcements Feed', icon: Megaphone },
            { id: 'recruitment', label: 'Recruitment & Roles', icon: Briefcase },
            { id: 'members', label: 'Club Leadership', icon: Users },
            ...(isLead ? [{ id: 'admin', label: 'Lead Admin Desk', icon: Settings }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      {activeSubTab === 'feed' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-3xl border border-white/10 bg-[#0c1220]">
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-1">
              About {club.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{club.description}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-white px-1">Recent Club Announcements</h3>
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No announcements posted yet.</p>
            ) : (
              announcements.map((ann) => {
                const isLiked = ann.likedByUserIds.includes(currentUser.id);
                return (
                  <div
                    key={ann.id}
                    className="glass-card p-5 rounded-3xl border border-white/10 space-y-3 bg-[#0d1424]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={ann.clubLogo} alt={ann.clubName} className="w-7 h-7 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-xs text-white">{ann.clubName}</h4>
                          <span className="text-[10px] text-slate-400">{ann.date}</span>
                        </div>
                      </div>
                      {ann.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {ann.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-white">{ann.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => handleLikeAnnouncement(ann.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          isLiked
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                            : 'hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                        <span>{ann.likes} Likes</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'recruitment' && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 bg-[#0c1220]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">Induction & Open Positions</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    club.recruitment?.isOpen
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {club.recruitment?.isOpen ? 'APPLICATIONS OPEN' : 'CLOSED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{club.recruitment?.title}</p>
            </div>

            {club.recruitment?.isOpen && (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 shrink-0"
              >
                Apply Now
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Open Roles & Requirements:
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {club.recruitment?.roles.map((role, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{role}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Open for all verified undergraduate/postgraduate students.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'members' && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 bg-[#0c1220]">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Executive Core Team</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRESIDENT / CLUB LEAD
                </span>
                <h4 className="font-bold text-sm text-white mt-1.5">{club.leadName}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-indigo-400" />
                  {club.leadEmail}
                </p>
              </div>
            </div>

            {club.members.slice(0, 3).map((m) => (
              <div key={m.userId} className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10">
                    {m.role.toUpperCase()}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1.5">{m.userName}</h4>
                  <p className="text-xs text-slate-400">Active since {m.joinedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'admin' && isLead && <ClubAdminPanel club={club} />}

      {/* Application Modal */}
      <ClubApplicationModal
        club={club}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};
