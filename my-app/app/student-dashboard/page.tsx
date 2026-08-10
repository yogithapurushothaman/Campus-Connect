'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Calendar,
  MapPin,
  Search,
  LogOut,
  CheckCircle2,
  Sparkles,
  Compass,
  Bookmark,
  Briefcase,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface StudentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  locationName?: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<StudentUser | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [rsvpedEventIds, setRsvpedEventIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const unauthorizedError = searchParams.get('error') === 'unauthorized_staff_only';

  const categories = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'Workshop', label: 'Workshops' },
    { id: 'Hackathon', label: 'Hackathons' },
    { id: 'Placement Drive', label: 'Placements & Internships' },
    { id: 'Cultural Fest', label: 'Cultural & Fests' },
    { id: 'Seminar', label: 'Seminars' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const eventsRes = await fetch('/api/events');
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRSVP = (eventId: string) => {
    const isAlready = rsvpedEventIds.includes(eventId);
    if (!isAlready) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#4f46e5', '#d97706', '#059669'],
        });
      } catch (e) {}
      setRsvpedEventIds((prev) => [...prev, eventId]);
    } else {
      setRsvpedEventIds((prev) => prev.filter((id) => id !== eventId));
    }
  };

  const handleBookmark = (eventId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const filteredEvents = events.filter((evt) => {
    const matchesCat =
      selectedCategory === 'all' ||
      evt.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.locationName && evt.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.author?.name && evt.author.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center text-[#6B6E80]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Student Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#1E202A] selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#E6DDCF] shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#1E202A]">
                  Campus<span className="text-indigo-600">Connect</span>
                </span>
                <span className="text-[10px] text-[#6B6E80] block -mt-0.5">Student Event Hub</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* If user is staff, allow switching back to staff dashboard */}
            {user?.role === 'STAFF' && (
              <Link
                href="/staff-dashboard"
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-semibold text-amber-800 flex items-center gap-1.5 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                <span>Staff Portal</span>
              </Link>
            )}

            {/* Student Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-[#1E202A] truncate max-w-[130px]">{user?.name}</p>
                <span className="text-[9px] font-mono font-bold text-indigo-700 uppercase">
                  {user?.role} ROLE
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#F5EFEB] hover:bg-rose-50 border border-[#E6DDCF] hover:border-rose-300 text-[#6B6E80] hover:text-rose-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Unauthorized Notice if student tried to access staff routes */}
        {unauthorizedError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm animate-in slide-in-from-top duration-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-rose-900">Access Denied: Staff Authorization Required</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                The page you attempted to access (/staff-dashboard) is restricted strictly to faculty staff members. Students have read-only access to published event feeds.
              </p>
            </div>
          </div>
        )}

        {/* Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E0D5C3] bg-gradient-to-r from-indigo-50 via-white to-amber-50/50 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-300">
                  Student Live Feed
                </span>
                <span className="text-xs text-[#6B6E80] font-mono">• Read-Only Verified Stream</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E202A] mt-1.5 tracking-tight">
                Campus Events & Opportunities
              </h1>
              <p className="text-xs sm:text-sm text-[#4A4D5E] mt-1 max-w-xl leading-relaxed">
                Discover all official workshops, hackathons, placement talks, and cultural fests published directly by college faculty and department heads.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] text-center shrink-0 shadow-xs">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Live Opportunities
              </span>
              <p className="text-3xl font-extrabold text-[#1E202A] mt-0.5">{events.length}</p>
              <span className="text-[10px] text-[#6B6E80]">Available to RSVP</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                    : 'bg-[#FFFFFF] text-[#4A4D5E] border-[#E6DDCF] hover:bg-[#F3ECE2]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#8C8F9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event title, venue, or staff author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-[#1E202A]"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="glass-card p-16 rounded-3xl border border-[#E6DDCF] text-center space-y-3 bg-[#FFFFFF]">
              <div className="w-14 h-14 rounded-2xl bg-[#F5EFEB] border border-[#E6DDCF] flex items-center justify-center text-[#8C8F9F] mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-[#1E202A] text-base">No Events Available</h3>
              <p className="text-xs text-[#6B6E80] max-w-sm mx-auto">
                No events match your current filter. Faculty staff posts will appear here once published.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((evt) => {
                const isRSVPed = rsvpedEventIds.includes(evt.id);
                const isBookmarked = bookmarkedIds.includes(evt.id);

                return (
                  <div
                    key={evt.id}
                    className="glass-card rounded-3xl p-6 border border-[#E6DDCF] bg-[#FFFFFF] hover:border-indigo-400 transition-all flex flex-col justify-between group space-y-4 shadow-xs"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {evt.category}
                        </span>

                        <button
                          onClick={() => handleBookmark(evt.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isBookmarked
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-[#F5EFEB] text-[#6B6E80] border-[#E6DDCF] hover:text-[#1E202A]'
                          }`}
                          title="Bookmark"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Title & Desc */}
                      <h3 className="font-extrabold text-base sm:text-lg text-[#1E202A] group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-[#4A4D5E] mt-2 line-clamp-3 leading-relaxed whitespace-pre-line">
                        {evt.description}
                      </p>

                      {/* Schedule & Venue */}
                      <div className="mt-4 space-y-1.5 text-xs text-[#6B6E80]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="font-medium text-[#1E202A]">{evt.date}</span>
                        </div>

                        {evt.locationName && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{evt.locationName}</span>
                          </div>
                        )}

                        {evt.author && (
                          <div className="flex items-center gap-2 pt-1">
                            <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-[11px] text-[#4A4D5E] truncate">
                              Posted by {evt.author.name} (Faculty)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom RSVP Action */}
                    <div className="pt-4 border-t border-[#EAE2D5]">
                      <button
                        onClick={() => handleRSVP(evt.id)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          isRSVPed
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20'
                        }`}
                      >
                        {isRSVPed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>RSVP Confirmed • Attending</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>RSVP to Event</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center text-[#6B6E80] text-xs">Loading Student Portal...</div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
