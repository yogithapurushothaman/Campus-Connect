'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Plus,
  Calendar,
  MapPin,
  Sparkles,
  LogOut,
  CheckCircle2,
  Users,
  Compass,
  GraduationCap,
  Clock,
  Layers,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface StaffUser {
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
    name: string;
    email: string;
  };
}

export default function StaffDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<StaffUser | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Event Creation Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [locationName, setLocationName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Fetch session & events
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

      const eventsRes = await fetch(`/api/events?authorId=${userData.user.id}`);
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!title || !description || !date) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          date,
          category,
          locationName: locationName || 'Main Campus Auditorium',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event.');
      }

      setFormSuccess(`Event "${title}" published live for all students!`);
      setTitle('');
      setDescription('');
      setDate('');
      setLocationName('');

      // Refresh posted events list
      if (user) {
        const eventsRes = await fetch(`/api/events?authorId=${user.id}`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.events || []);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Error posting event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center text-[#6B6E80]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Staff Credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#1E202A] selection:bg-amber-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#E6DDCF] shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-700 to-indigo-600 flex items-center justify-center shadow-md shadow-amber-600/20">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#1E202A]">
                  Campus<span className="text-amber-700">Connect</span>
                </span>
                <span className="text-[10px] text-[#6B6E80] block -mt-0.5">Faculty & Staff Portal</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Student Feed Preview Link */}
            <Link
              href="/student-dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-[#F5EFEB] hover:bg-[#EBE2D4] border border-[#E6DDCF] text-xs font-semibold text-[#4A4D5E] hover:text-[#1E202A] flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Student Feed View</span>
            </Link>

            {/* Staff Badge & User */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-300">
              <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-[#1E202A] truncate max-w-[130px]">{user?.name}</p>
                <span className="text-[9px] font-mono font-bold text-amber-800 uppercase">STAFF ROLE</span>
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
        {/* Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E0D5C3] bg-gradient-to-r from-amber-50 via-white to-indigo-50/50 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                  Staff Control Center
                </span>
                <span className="text-xs text-[#6B6E80] font-mono">• Full Posting Authority</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E202A] mt-1.5 tracking-tight">
                Welcome, {user?.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#4A4D5E] mt-1 max-w-xl leading-relaxed">
                Create official college events, manage workshop announcements, and distribute opportunities directly to verified students.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] text-center shrink-0 shadow-xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Your Published Events
              </span>
              <p className="text-3xl font-extrabold text-[#1E202A] mt-0.5">{events.length}</p>
              <span className="text-[10px] text-[#6B6E80]">Active Campus Posts</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Create Event Form (Left) & My Events Feed (Right) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Create Event Form */}
          <div className="lg:col-span-5 glass-card p-6 sm:p-7 rounded-3xl border border-[#E6DDCF] bg-[#FFFFFF] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAE2D5]">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-[#1E202A] text-base sm:text-lg">Publish New Campus Event</h2>
                <p className="text-xs text-[#6B6E80]">Broadcasts instantly to all student feeds</p>
              </div>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider mb-1">
                  Event Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FFFFFF] text-[#1E202A]"
                >
                  <option value="Workshop">Technical Workshop / Masterclass</option>
                  <option value="Hackathon">Hackathon / Coding Challenge</option>
                  <option value="Placement Drive">Placement / Internship Drive</option>
                  <option value="Cultural Fest">Cultural Fest / Pro-Nite</option>
                  <option value="Seminar">Guest Seminar / Lecture</option>
                  <option value="Sports">Sports Championship</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gemini AI Agent Engineering Workshop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#1E202A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider mb-1">
                  Schedule Date & Time *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#8C8F9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aug 28, 2026 • 02:00 PM - 05:00 PM"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#1E202A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider mb-1">
                  Campus Venue / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8C8F9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Ada Lovelace Auditorium, Turing CS Hub"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#1E202A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider mb-1">
                  Full Description & Agenda *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide complete breakdown of speakers, prerequisites, eligibility, and swag/certificates..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm resize-none text-[#1E202A]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publish Event Live</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: My Posted Events List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="font-extrabold text-[#1E202A] text-lg">My Managed Events ({events.length})</h2>
                <p className="text-xs text-[#6B6E80]">Events you have posted for campus students</p>
              </div>

              <Link
                href="/student-dashboard"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
              >
                View Student Feed →
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl border border-[#E6DDCF] text-center space-y-3 bg-[#FFFFFF]">
                <div className="w-14 h-14 rounded-2xl bg-[#F5EFEB] border border-[#E6DDCF] flex items-center justify-center text-[#8C8F9F] mx-auto">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-[#1E202A] text-base">No Events Posted Yet</h3>
                <p className="text-xs text-[#6B6E80] max-w-sm mx-auto">
                  Use the creation form to publish your first college masterclass, recruitment drive, or hackathon.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="glass-card p-5 sm:p-6 rounded-3xl border border-[#E6DDCF] bg-[#FFFFFF] hover:border-amber-400 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
                        {evt.category}
                      </span>
                      <span className="text-xs text-[#6B6E80] font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {evt.date}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-[#1E202A]">{evt.title}</h3>
                    <p className="text-xs sm:text-sm text-[#4A4D5E] leading-relaxed whitespace-pre-line">
                      {evt.description}
                    </p>

                    <div className="pt-3 border-t border-[#EAE2D5] flex items-center justify-between text-xs text-[#6B6E80]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        {evt.locationName || 'Main Campus'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Active on Student Feed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
