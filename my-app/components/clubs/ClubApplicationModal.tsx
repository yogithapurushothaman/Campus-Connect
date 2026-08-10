'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Club } from '../../types';
import { X, Send, Briefcase, Sparkles, User, Link as LinkIcon } from 'lucide-react';

export const ClubApplicationModal: React.FC<{
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ club, isOpen, onClose }) => {
  const { applyToClub, currentUser } = useApp();

  const [roleApplied, setRoleApplied] = useState(club?.recruitment?.roles[0] || 'Core Member');
  const [whyJoin, setWhyJoin] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  if (!isOpen || !club || !club.recruitment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whyJoin.trim()) return;

    applyToClub(club.id, roleApplied, whyJoin.trim(), portfolioUrl.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-indigo-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-200 bg-[#0c1222]">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={club.logo} alt={club.name} className="w-10 h-10 rounded-2xl object-cover ring-1 ring-white/10" />
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">Apply to {club.name}</h3>
              <p className="text-xs text-indigo-300 font-semibold">{club.recruitment.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Role to Apply For
            </label>
            <select
              value={roleApplied}
              onChange={(e) => setRoleApplied(e.target.value)}
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#0e1628]"
            >
              {club.recruitment.roles.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Why do you want to join this club? & Relevant Experience
            </label>
            <textarea
              required
              rows={4}
              value={whyJoin}
              onChange={(e) => setWhyJoin(e.target.value)}
              placeholder="Highlight your previous projects, motivation, skills, or what you hope to build together..."
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Portfolio / GitHub / Behance / LinkedIn URL (Optional)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/yourhandle or https://behance.net/..."
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
            <span>
              Submitting as <strong>{currentUser.name}</strong> ({currentUser.studentId})
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
