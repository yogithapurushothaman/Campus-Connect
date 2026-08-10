'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CampusEvent } from '../../types';
import {
  Calendar,
  MapPin,
  Bookmark,
  CheckCircle,
  Users,
  ExternalLink,
  Navigation,
  Sparkles,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EventCard: React.FC<{
  event: CampusEvent;
  onSelect: (evt: CampusEvent) => void;
}> = ({ event, onSelect }) => {
  const { currentUser, rsvpEvent, bookmarkEvent, navigateToVenue } = useApp();

  const isRSVPed = event.rsvpUserIds.includes(currentUser.id);
  const isBookmarked = event.bookmarkedUserIds.includes(currentUser.id);

  const handleRSVPClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRSVPed) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#38bdf8', '#a855f7'],
        });
      } catch (err) {
        // Fallback gracefully
      }
    }
    rsvpEvent(event.id);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    bookmarkEvent(event.id);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'hackathon':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'workshop':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'fest':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'internship':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    }
  };

  return (
    <div
      onClick={() => onSelect(event)}
      className="glass-card rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-indigo-500/50 cursor-pointer group transition-all"
    >
      <div>
        {/* Banner Image & Badges */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1424] via-transparent to-black/40" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl border backdrop-blur-md ${getCategoryBadge(
                event.category
              )}`}
            >
              {event.category}
            </span>

            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                isBookmarked
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Save Event'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-black' : ''}`} />
            </button>
          </div>

          {/* Date pill overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{event.date}</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
          <p className="text-[11px] font-bold text-indigo-400 tracking-wide uppercase">
            {event.organizer}
          </p>

          <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors mt-1 line-clamp-1">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Venue & Map Pin */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigateToVenue(event.buildingId);
              }}
              className="flex items-center gap-1.5 text-sky-300 hover:text-white transition-colors truncate max-w-[80%]"
              title="Locate Venue on Campus Map"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate underline decoration-sky-500/40">{event.locationName}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400 shrink-0 text-[11px]">
              <Users className="w-3.5 h-3.5" />
              <span>{event.rsvpCount} RSVPs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-5 pt-0 flex items-center gap-2">
        <button
          onClick={handleRSVPClick}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isRSVPed
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
          }`}
        >
          {isRSVPed ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Going • Added to Reminders
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              RSVP Now
            </>
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateToVenue(event.buildingId);
          }}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
          title="Direct Campus Map Navigation"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
