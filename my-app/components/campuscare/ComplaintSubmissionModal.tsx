'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintCategory, ComplaintPriority } from '../../types';
import {
  X,
  LifeBuoy,
  Camera,
  MapPin,
  Shield,
  EyeOff,
  Sparkles,
  AlertCircle,
  Building,
} from 'lucide-react';
import { AIComplaintTriageHelper } from './AIComplaintTriageHelper';

export const ComplaintSubmissionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { buildings, submitComplaint, complaints, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('wifi');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || 'bldg-1');
  const [roomOrArea, setRoomOrArea] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  if (!isOpen) return null;

  const selectedBuilding = buildings.find((b) => b.id === buildingId) || buildings[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    submitComplaint({
      title,
      description,
      category,
      priority,
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      roomOrArea: roomOrArea || `${selectedBuilding.name} Common Facility`,
      isAnonymous,
      authorId: isAnonymous ? undefined : currentUser.id,
      authorName: isAnonymous ? undefined : currentUser.name,
      authorAvatar: isAnonymous ? undefined : currentUser.avatar,
      photoUrl: photoUrl || undefined,
      estimatedResolution: 'Within 24-48 Hours (SLA)',
    });

    onClose();
  };

  const categories: { id: ComplaintCategory; label: string; icon: string }[] = [
    { id: 'wifi', label: 'Wi-Fi & Network', icon: '📶' },
    { id: 'hostel', label: 'Hostel Maintenance', icon: '🛏️' },
    { id: 'mess', label: 'Mess & Food Hygiene', icon: '🍽️' },
    { id: 'academic', label: 'Academic & Classrooms', icon: '📚' },
    { id: 'infrastructure', label: 'Campus Infra', icon: '⚡' },
    { id: 'security', label: 'Safety & Lighting', icon: '🛡️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-7 border border-amber-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8 bg-[#0c1222]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">Report Campus Issue</h3>
              <p className="text-xs text-slate-400">
                Transparent SLA lifecycle tracking with campus administration
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Issue Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    category === cat.id
                      ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30'
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
              Issue Headline / Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wi-Fi Access Point Offline in CS Hub 3rd Floor Labs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Detailed Description & Observation
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the exact malfunction, how many students are impacted, error codes if visible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>

          {/* AI Helper Widget */}
          <AIComplaintTriageHelper
            title={title}
            description={description}
            buildingId={selectedBuilding.id}
            buildingName={selectedBuilding.name}
            existingComplaints={complaints}
          />

          {/* Location & Room */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Affected Campus Building
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Exact Floor / Room / Area Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Block A, 3rd Floor Water Purifier Bay"
                value={roomOrArea}
                onChange={(e) => setRoomOrArea(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Photo attachment simulation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Attach Photo Evidence (Simulated / URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://images.unsplash.com/... or click preset below"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="glass-input flex-1 px-3.5 py-2 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setPhotoUrl(
                    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80'
                  )
                }
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-white/10 shrink-0"
              >
                Sample Photo
              </button>
            </div>
          </div>

          {/* Anonymity Toggle */}
          <div className="p-4 rounded-2xl bg-[#090d16] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                <EyeOff className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Controlled Anonymous Submission</p>
                <p className="text-[11px] text-slate-400">
                  Hides your name & student ID on public feeds to protect whistleblowers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                isAnonymous ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isAnonymous ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all"
            >
              <LifeBuoy className="w-4 h-4" />
              Submit Ticket & Track SLA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
