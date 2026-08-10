'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityCategory } from '../../types';
import { X, Sparkles, MapPin, Calendar, Clock, Users, Tag, ShieldCheck } from 'lucide-react';

export const CreateActivityModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { buildings, createActivity, setActiveSquadChatActivity, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('sports');
  const [minParticipants, setMinParticipants] = useState<number>(4);
  const [maxParticipants, setMaxParticipants] = useState<number>(8);
  const [date, setDate] = useState('Today, 6:00 PM');
  const [time, setTime] = useState('6:00 PM - 7:30 PM');
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || 'bldg-1');
  const [tagsInput, setTagsInput] = useState('CampusSquad, Friendly');
  const [skillLevel, setSkillLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const selectedBuilding = buildings.find((b) => b.id === buildingId) || buildings[0];
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const created = createActivity({
      title,
      description,
      category,
      minParticipants,
      maxParticipants,
      date,
      time,
      locationName: selectedBuilding.name,
      buildingId: selectedBuilding.id,
      coordinates: selectedBuilding.position,
      tags: tags.length > 0 ? tags : [category.toUpperCase(), 'CampusConnect'],
      status: 'open',
      requiredSkillLevel: skillLevel,
    });

    onClose();
    // Open squad chat immediately
    setActiveSquadChatActivity(created);
  };

  const categories: { id: ActivityCategory; label: string; icon: string }[] = [
    { id: 'sports', label: 'Sports & Games', icon: '⚽' },
    { id: 'study', label: 'Study & Exams', icon: '📚' },
    { id: 'hackathon', label: 'Hackathons & Coding', icon: '💻' },
    { id: 'gaming', label: 'E-Sports & Board Games', icon: '🎮' },
    { id: 'workshop', label: 'Skill Workshop', icon: '💡' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-7 border border-indigo-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">Create Activity Squad</h3>
              <p className="text-xs text-slate-400">Launch a group & auto-unlock a dedicated live chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Squad Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    category === cat.id
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900/80 border-white/10 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Activity Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Football 7v7 Under the Floodlights or SIH 2026 AI Team"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description & Objectives
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detail what you plan to do, equipment to bring, target goal, or prerequisites..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>

          {/* Grid: Capacity & Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Participant Capacity (Min / Max)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={minParticipants}
                  onChange={(e) => setMinParticipants(Number(e.target.value))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm text-center"
                  placeholder="Min"
                />
                <span className="text-slate-500 font-bold">to</span>
                <input
                  type="number"
                  min={minParticipants}
                  max={50}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm text-center"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Target Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as any)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm bg-[#0e1628]"
              >
                <option value="all">All Skill Levels Welcome</option>
                <option value="beginner">Beginner Friendly</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced / Competitive</option>
              </select>
            </div>
          </div>

          {/* Grid: Date & Location */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Schedule & Time
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Today, 6:00 PM"
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Campus Venue (Linked to Map)
              </label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm bg-[#0e1628]"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Interest Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Football, Casual, ExamPrep, AI"
              className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
            />
          </div>

          {/* Host Info Note */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Hosting as <strong>{currentUser.name}</strong> ({currentUser.reliabilityScore}% reliability score)
              </span>
            </div>
          </div>

          {/* Footer Actions */}
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Publish Squad & Open Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
