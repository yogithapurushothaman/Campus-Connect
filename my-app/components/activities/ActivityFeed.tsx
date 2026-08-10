'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, ActivityCategory } from '../../types';
import {
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { SmartMatchmaker } from './SmartMatchmaker';
import { CreateActivityModal } from './CreateActivityModal';
import { ActivitySquadChat } from './ActivitySquadChat';

export const ActivityFeed: React.FC = () => {
  const {
    activities,
    joinActivity,
    currentUser,
    searchQuery,
    setSearchQuery,
    setActiveSquadChatActivity,
    navigateToVenue,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'my_squads'>('all');

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Squads', icon: '⚡' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'study', label: 'Study Groups', icon: '📚' },
    { id: 'hackathon', label: 'Hackathons', icon: '💻' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
  ];

  const filteredActivities = activities.filter((act) => {
    const matchesCat = selectedCategory === 'all' || act.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      act.locationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'open' && act.status === 'open') ||
      (selectedFilter === 'my_squads' && act.participants.some((p) => p.userId === currentUser.id));

    return matchesCat && matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Activity Discovery & Squads
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              {activities.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Join spontaneous sports, study sessions, and hackathon teams with auto-group chats.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          Create Activity Squad
        </button>
      </div>

      {/* AI Smart Matchmaker Section */}
      <SmartMatchmaker onSelectActivity={(act) => setActiveSquadChatActivity(act)} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 shrink-0">
          {(['all', 'open', 'my_squads'] as const).map((flt) => (
            <button
              key={flt}
              onClick={() => setSelectedFilter(flt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                selectedFilter === flt
                  ? 'bg-slate-800 text-indigo-300 border-indigo-500/40'
                  : 'bg-transparent text-slate-400 border-white/5 hover:bg-slate-800/50'
              }`}
            >
              {flt === 'my_squads' ? 'My Squads' : flt}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Squads Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredActivities.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">No Activities Match Your Filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try changing categories or search terms, or be the first to launch a squad!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Start New Squad
            </button>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const isJoined = act.participants.some((p) => p.userId === currentUser.id);
            const isFull = act.participants.length >= act.maxParticipants;
            const progressPercent = Math.min((act.participants.length / act.maxParticipants) * 100, 100);

            return (
              <div
                key={act.id}
                className="glass-card rounded-3xl p-5 border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
              >
                <div>
                  {/* Top tags & status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {act.category}
                      </span>
                      {act.requiredSkillLevel && act.requiredSkillLevel !== 'all' && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-white/5">
                          {act.requiredSkillLevel}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        act.status === 'open'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {act.status === 'open' ? 'Open Slots' : 'Squad Full'}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3
                    onClick={() => setActiveSquadChatActivity(act)}
                    className="font-bold text-base text-white group-hover:text-indigo-300 cursor-pointer transition-colors line-clamp-1"
                  >
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>

                  {/* Time & Venue */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{act.date} • {act.time}</span>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToVenue(act.buildingId);
                      }}
                      className="flex items-center gap-2 text-sky-300 hover:text-white cursor-pointer group/loc transition-colors"
                      title="View on Map"
                    >
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover/loc:scale-110 transition-transform" />
                      <span className="truncate underline decoration-sky-500/40">{act.locationName}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    {act.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Section: Participants & Action Buttons */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {act.participants.slice(0, 4).map((p) => (
                        <img
                          key={p.userId}
                          src={p.userAvatar}
                          alt={p.userName}
                          title={`${p.userName} (${p.role})`}
                          className="w-6 h-6 rounded-full ring-2 ring-[#0c1220] object-cover"
                        />
                      ))}
                      {act.participants.length > 4 && (
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 ring-2 ring-[#0c1220] flex items-center justify-center">
                          +{act.participants.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-white">{act.participants.length}</span>
                      <span className="text-slate-500">/{act.maxParticipants} members</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3.5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2">
                    {isJoined ? (
                      <button
                        onClick={() => setActiveSquadChatActivity(act)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Open Squad Chat
                      </button>
                    ) : (
                      <button
                        onClick={() => joinActivity(act.id)}
                        disabled={isFull}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isFull
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                            : 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-lg shadow-indigo-600/25'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isFull ? 'Squad Full' : 'Join Squad'}
                      </button>
                    )}

                    <button
                      onClick={() => navigateToVenue(act.buildingId)}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                      title="View Venue Navigation"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <CreateActivityModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <ActivitySquadChat />
    </div>
  );
};
