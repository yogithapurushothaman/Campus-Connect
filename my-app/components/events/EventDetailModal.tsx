'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CampusEvent } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Bookmark,
  CheckCircle,
  Share2,
  Navigation,
  Download,
  Sparkles,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EventDetailModal: React.FC<{
  event: CampusEvent | null;
  onClose: () => void;
}> = ({ event, onClose }) => {
  const { currentUser, rsvpEvent, bookmarkEvent, navigateToVenue, showToast } = useApp();

  if (!event) return null;

  const isRSVPed = event.rsvpUserIds.includes(currentUser.id);
  const isBookmarked = event.bookmarkedUserIds.includes(currentUser.id);

  const handleRSVP = () => {
    if (!isRSVPed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    }
    rsvpEvent(event.id);
  };

  const handleDownloadCalendarICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusConnect//EventCalendar//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, ' ')}
LOCATION:${event.locationName}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Calendar Reminder Downloaded 📅', '.ics file saved for Google/Apple Calendar', 'success');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}?event=${event.id}`);
      showToast('Event Link Copied! 🔗', 'Share with friends on WhatsApp or Discord', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-6 bg-[#0c1222]">
        {/* Banner */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-900">
          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222] via-[#0c1222]/40 to-transparent" />

          {/* Close & Share buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
              title="Share Event"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-xl bg-indigo-600/90 text-white shadow-md">
              {event.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2 leading-tight">
              {event.title}
            </h2>
            <p className="text-xs text-indigo-300 font-semibold mt-1">Organized by {event.organizer}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Key Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold">Date</span>
              </div>
              <p className="font-bold text-white text-xs">{event.date}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold">Timing</span>
              </div>
              <p className="font-bold text-white text-xs">{event.time}</p>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Confirmed Attendees</span>
              </div>
              <p className="font-bold text-white text-xs">{event.rsvpCount} Registered</p>
            </div>
          </div>

          {/* Location & Navigation Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 to-slate-900 border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Campus Venue</p>
                <p className="text-sm font-bold text-white">{event.locationName}</p>
              </div>
            </div>

            <button
              onClick={() => {
                navigateToVenue(event.buildingId);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/20 transition-all shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              View Route on Map
            </button>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Event Overview & Perks
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {event.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => bookmarkEvent(event.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isBookmarked
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-black' : ''}`} />
                <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>

              <button
                onClick={handleDownloadCalendarICS}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Add to Google/Apple Calendar"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Add to Calendar</span>
              </button>
            </div>

            <button
              onClick={handleRSVP}
              className={`py-3 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isRSVPed
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {isRSVPed ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  RSVP Confirmed (Click to Cancel)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Confirm Attendance / RSVP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
