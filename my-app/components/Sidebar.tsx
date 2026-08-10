'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Calendar,
  Layers,
  MapPin,
  LifeBuoy,
  BarChart3,
  UserCheck,
  Sparkles,
  Shield,
  Zap,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, activities, events, complaints } = useApp();

  const openActivitiesCount = activities.filter((a) => a.status === 'open').length;
  const upcomingEventsCount = events.length;
  const activeComplaintsCount = complaints.filter((c) => c.status !== 'resolved').length;

  const navItems = [
    {
      id: 'activities',
      label: 'Campus Activities',
      subtitle: 'Find & join squads',
      icon: Users,
      badge: `${openActivitiesCount} open`,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'events',
      label: 'Events & Hub',
      subtitle: 'Workshops, hackathons',
      icon: Calendar,
      badge: `${upcomingEventsCount} live`,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
    {
      id: 'clubs',
      label: 'Clubs & Societies',
      subtitle: 'Recruitments & panels',
      icon: Layers,
      badge: '9 active',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'map',
      label: 'Smart Campus Map',
      subtitle: 'Navigation & hotspots',
      icon: MapPin,
      badge: 'Live',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    },
    {
      id: 'complaints',
      label: 'CampusCare',
      subtitle: 'Grievances & heatmap',
      icon: LifeBuoy,
      badge: activeComplaintsCount > 0 ? `${activeComplaintsCount} open` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    {
      id: 'admin',
      label: 'Admin Control Room',
      subtitle: 'Routing, duplicate AI',
      icon: BarChart3,
      badge: 'Admin',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      id: 'profile',
      label: 'Student Passport',
      subtitle: 'Reliability & badges',
      icon: UserCheck,
      badge: currentUser.isVerified ? 'Verified' : 'Unverified',
      badgeColor: currentUser.isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300',
    },
  ];

  return (
    <aside className="w-64 lg:w-72 shrink-0 hidden md:flex flex-col border-r border-[#E6DDCF] bg-[#FAF6EE]/90 p-4 space-y-6 select-none text-[#1E202A]">
      {/* Verification & Trust Badge */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-amber-50 border border-[#E0D5C3] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E202A]">Closed Campus Network</p>
              <p className="text-[10px] text-[#6B6E80] font-mono">@campus.edu verified</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-xs animate-pulse" />
        </div>
      </div>

      {/* Navigation List */}
      <div className="space-y-1.5 flex-1">
        <p className="text-[11px] font-bold text-[#7A7D8E] uppercase tracking-wider px-3 mb-2">
          Campus Modules
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full p-3 rounded-2xl flex items-start gap-3 text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 translate-x-1'
                  : 'hover:bg-[#F3ECE2] text-[#4A4D5E] hover:text-[#1E202A]'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#EFE8DC] text-[#6B6E80] group-hover:text-indigo-600 group-hover:bg-[#E8DFD3]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                        isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-indigo-100' : 'text-[#7A7D8E]'}`}>
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Matchmaking Promo Card */}
      <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] relative overflow-hidden group shadow-xs">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
          <Zap className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
          <span>AI Matchmaker</span>
        </div>
        <p className="text-[11px] text-[#4A4D5E] leading-snug">
          Looking for a study group or sports squad? Let CampusConnect recommend peers based on your schedule.
        </p>
        <button
          onClick={() => setActiveTab('activities')}
          className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          Find Matching Squads
        </button>
      </div>

      {/* RBAC Auth & Dashboards Link */}
      <Link
        href="/login"
        className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-300/70 hover:border-indigo-400 transition-all flex items-center gap-2.5 group/auth shadow-xs"
      >
        <div className="p-2 rounded-xl bg-amber-200/60 text-amber-900 border border-amber-300/80 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#1E202A] group-hover/auth:text-indigo-700 transition-colors">
            RBAC Auth & Dashboards
          </p>
          <p className="text-[10px] text-[#6B6E80] truncate">Staff vs Student Portals →</p>
        </div>
      </Link>
    </aside>
  );
};
