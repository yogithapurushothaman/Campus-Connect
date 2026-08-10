'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Club, ClubCategory } from '../../types';
import {
  Layers,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  Shield,
  Code,
  Palette,
  Trophy,
} from 'lucide-react';
import { ClubDetailPage } from './ClubDetailPage';

export const ClubsDirectory: React.FC = () => {
  const { clubs, searchQuery, currentUser } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  const categories = [
    { id: 'all', label: 'All Communities', icon: Layers },
    { id: 'technical', label: 'Technical & Coding', icon: Code },
    { id: 'cultural', label: 'Arts, Media & Drama', icon: Palette },
    { id: 'sports', label: 'Sports & Athletics', icon: Trophy },
  ];

  const filteredClubs = clubs.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  if (selectedClub) {
    return <ClubDetailPage club={selectedClub} onBack={() => setSelectedClub(null)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Clubs & Student Communities
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              {clubs.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover student organizations, attend recruitments, and access exclusive project drives.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all border ${
                isActive
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Clubs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClubs.map((club) => {
          const isMember = club.members.some((m) => m.userId === currentUser.id);

          return (
            <div
              key={club.id}
              onClick={() => setSelectedClub(club)}
              className="glass-card rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-purple-500/50 cursor-pointer group transition-all"
            >
              <div>
                {/* Cover & Logo */}
                <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                  <img
                    src={club.coverImage}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1424] via-transparent to-black/30" />

                  {club.recruitment?.isOpen && (
                    <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-purple-600/90 text-white shadow-md backdrop-blur-xs">
                      Hiring / Inductions
                    </span>
                  )}
                </div>

                <div className="p-5 pt-0 relative -mt-8">
                  <div className="flex items-end justify-between">
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-3 ring-[#0d1424] shadow-xl bg-slate-900"
                    />

                    {isMember && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Joined Member
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors mt-3 line-clamp-1">
                    {club.name}
                  </h3>
                  <p className="text-xs text-purple-300 font-medium italic mt-0.5 line-clamp-1">
                    "{club.tagLine}"
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{club.memberCount} members</span>
                </div>

                <span className="font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                  Explore Club
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
