'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventCategory } from '../../types';
import { X, Calendar, MapPin, Sparkles, Image, Tag, Building } from 'lucide-react';

export const CreateEventModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { buildings, createEvent, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState(currentUser.major || 'College Student Council');
  const [category, setCategory] = useState<EventCategory>('workshop');
  const [date, setDate] = useState('Aug 26, 2026');
  const [time, setTime] = useState('02:00 PM - 05:00 PM');
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || 'bldg-1');
  const [bannerImage, setBannerImage] = useState(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
  );
  const [tagsInput, setTagsInput] = useState('CampusEvent, Tech, HandsOn');
  const [capacity, setCapacity] = useState<number>(200);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const selectedBuilding = buildings.find((b) => b.id === buildingId) || buildings[0];
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    createEvent({
      title,
      description,
      organizer,
      category,
      date,
      time,
      locationName: selectedBuilding.name,
      buildingId: selectedBuilding.id,
      coordinates: selectedBuilding.position,
      bannerImage,
      tags: tags.length > 0 ? tags : [category.toUpperCase()],
      capacity,
    });

    onClose();
  };

  const sampleBanners = [
    { label: 'Tech / Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80' },
    { label: 'AI Workshop', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
    { label: 'Cultural Fest', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80' },
    { label: 'Internships', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-7 border border-indigo-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">Publish Campus Event</h3>
              <p className="text-xs text-slate-400">Broadcast official workshop, hackathon, or cultural fest</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Event Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm bg-[#0e1628]"
              >
                <option value="workshop">Technical Workshop</option>
                <option value="hackathon">Hackathon / Competition</option>
                <option value="fest">Cultural / Fest</option>
                <option value="internship">Internship & Placement Drive</option>
                <option value="scholarship">Scholarship & Grant</option>
                <option value="recruitment">Club Recruitment Drive</option>
                <option value="seminar">Seminar / Guest Lecture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Organizer Name
              </label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. GDSC Campus, CodeNexus, T&P Cell"
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gemini GenAI Workshop & Hands-on Lab"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description & Highlights
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the agenda, speakers, prizes, prerequisites, or registration deadlines..."
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Date & Schedule
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Aug 28, 2026"
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Timing
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 02:00 PM - 05:00 PM"
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Max Attendee Capacity
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Banner Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Cover Banner Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sampleBanners.map((b, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBannerImage(b.url)}
                  className={`p-1.5 rounded-xl border text-xs text-left overflow-hidden transition-all ${
                    bannerImage === b.url
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={b.url} alt={b.label} className="w-full h-12 object-cover rounded-lg mb-1" />
                  <span className="text-[10px] font-bold text-slate-300 truncate block">{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Publish Event Live
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
