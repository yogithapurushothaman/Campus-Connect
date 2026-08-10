'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Award,
  Calendar,
  Users,
  CheckCircle2,
  Mail,
  BookOpen,
  Sparkles,
  Lock,
  Layers,
  Settings,
  Flame,
} from 'lucide-react';
import { VerificationModal } from './VerificationModal';

export const ProfileView: React.FC = () => {
  const { currentUser, clubs, updateUserProfile, allUsers, switchUser } = useApp();
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  const userClubs = clubs.filter((c) => currentUser.joinedClubIds.includes(c.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Student Identity & Trust Profile
            </h1>
            {currentUser.isVerified && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Student
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Private, verified campus credential with reliability scoring and community badges.
          </p>
        </div>

        {!currentUser.isVerified && (
          <button
            onClick={() => setIsVerifyOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify .edu Email
          </button>
        )}
      </div>

      {/* Main Student Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-gradient-to-br from-[#0e1628] via-[#0c1220] to-[#151c33] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-indigo-500/40 shadow-2xl shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">{currentUser.name}</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  {currentUser.studentId}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">{currentUser.major}</p>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser.year} • {currentUser.email}</p>
            </div>
          </div>

          {/* Reliability Score & Karma Stat Box */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial p-4 rounded-2xl bg-black/40 border border-emerald-500/30 text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Reliability Score
              </span>
              <p className="text-2xl font-extrabold text-emerald-300 mt-0.5">{currentUser.reliabilityScore}%</p>
              <span className="text-[10px] text-slate-400">Attendance Track</span>
            </div>

            <div className="flex-1 md:flex-initial p-4 rounded-2xl bg-black/40 border border-amber-500/30 text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Karma Points
              </span>
              <p className="text-2xl font-extrabold text-amber-300 mt-0.5">{currentUser.karmaPoints}</p>
              <span className="text-[10px] text-slate-400">Campus Trust</span>
            </div>
          </div>
        </div>

        {/* Bio & Interests */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{currentUser.bio}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">Interests:</span>
            {currentUser.interests.map((int, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-3 py-1 rounded-xl bg-slate-800/90 text-indigo-300 border border-indigo-500/20"
              >
                {int}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Earned Badges & Joined Clubs */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Badges */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c1220] space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-base">Earned Campus Badges</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {currentUser.badges.map((b) => (
              <div key={b.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{b.icon}</span>
                  <h4 className="font-bold text-xs text-white">{b.name}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Joined Clubs */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c1220] space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-white text-base">Joined Communities ({userClubs.length})</h3>
          </div>

          {userClubs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">You have not joined any clubs yet.</p>
          ) : (
            <div className="space-y-2.5">
              {userClubs.map((club) => (
                <div
                  key={club.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img src={club.logo} alt={club.name} className="w-8 h-8 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-white">{club.name}</h4>
                      <p className="text-[10px] text-purple-300 font-medium">{club.category.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Member
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Privacy Settings & Persona Test Bar */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c1220] space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          <h3 className="font-extrabold text-white text-base">Privacy & Visibility Preferences</h3>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Show Institutional Email</span>
            <input
              type="checkbox"
              checked={currentUser.privacySettings.showEmail}
              onChange={(e) =>
                updateUserProfile({
                  privacySettings: {
                    ...currentUser.privacySettings,
                    showEmail: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Show Academic Year</span>
            <input
              type="checkbox"
              checked={currentUser.privacySettings.showYear}
              onChange={(e) =>
                updateUserProfile({
                  privacySettings: {
                    ...currentUser.privacySettings,
                    showYear: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Allow Direct Squad Invites</span>
            <input
              type="checkbox"
              checked={currentUser.privacySettings.allowDirectInvites}
              onChange={(e) =>
                updateUserProfile({
                  privacySettings: {
                    ...currentUser.privacySettings,
                    allowDirectInvites: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>
        </div>
      </div>

      <VerificationModal isOpen={isVerifyOpen} onClose={() => setIsVerifyOpen(false)} />
    </div>
  );
};
