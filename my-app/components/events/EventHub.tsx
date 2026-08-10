'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusEvent } from '../../types';
import {
  Calendar,
  Plus,
  Search,
  Bookmark,
  Sparkles,
  Trophy,
  Briefcase,
  Music,
  Code2,
  GraduationCap,
} from 'lucide-react';
import { EventCard } from './EventCard';
import { EventDetailModal } from './EventDetailModal';
import { CreateEventModal } from './CreateEventModal';

export const EventHub: React.FC = () => {
  const { events, searchQuery, currentUser } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Events', icon: Sparkles },
    { id: 'hackathon', label: 'Hackathons & Competitions', icon: Trophy },
    { id: 'workshop', label: 'Tech Workshops', icon: Code2 },
    { id: 'internship', label: 'Internships & Placements', icon: Briefcase },
    { id: 'fest', label: 'Cultural & Fests', icon: Music },
    { id: 'seminar', label: 'Seminars & Talks', icon: GraduationCap },
  ];

  const filteredEvents = events.filter((evt) => {
    const matchesCat = activeCategory === 'all' || evt.category === activeCategory;
    const matchesBookmark = !showBookmarkedOnly || evt.bookmarkedUserIds.includes(currentUser.id);
    const matchesSearch =
      !searchQuery ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.locationName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesBookmark && matchesSearch;
  });

  const bookmarkedCount = events.filter((e) => e.bookmarkedUserIds.includes(currentUser.id)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Events & Opportunities Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
              {events.length} Upcoming
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Centralized college workshops, hackathons, internships, scholarships, and cultural fests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              showBookmarkedOnly
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30'
                : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showBookmarkedOnly ? 'fill-black' : ''}`} />
            <span>Saved Items ({bookmarkedCount})</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            Publish Event
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id && !showBookmarkedOnly;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setShowBookmarkedOnly(false);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                  : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">No Events Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {showBookmarkedOnly
                ? 'You have not saved any events yet. Bookmark workshops or hackathons to track them here.'
                : 'Try adjusting your category selection or search keywords.'}
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} onSelect={(e) => setSelectedEvent(e)} />
          ))
        )}
      </div>

      {/* Modals */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <CreateEventModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
