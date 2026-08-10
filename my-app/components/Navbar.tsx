'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Search,
  Bell,
  CheckCircle2,
  Award,
  Users2,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Radio,
  Menu,
} from 'lucide-react';
import { NotificationsDrawer } from './NotificationsDrawer';
import Link from 'next/link';

export const Navbar: React.FC<{ onMobileMenuToggle?: () => void }> = ({ onMobileMenuToggle }) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    switchUserRole,
    searchQuery,
    setSearchQuery,
    notifications,
    setActiveTab,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#E6DDCF] shadow-xs px-4 sm:px-6 py-3 text-[#1E202A]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {onMobileMenuToggle && (
              <button
                onClick={onMobileMenuToggle}
                className="p-2 rounded-xl bg-[#F5EFEB] border border-[#E6DDCF] text-[#4A4D5E] md:hidden hover:bg-[#EBE2D4]"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div
              onClick={() => setActiveTab('activities')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-white animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-[#1E202A] group-hover:text-indigo-600 transition-colors">
                    Campus<span className="text-indigo-600">Connect</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300/60">
                    Apex Univ
                  </span>
                </div>
                <p className="text-[10px] text-[#6B6E80] -mt-0.5 hidden sm:block">Digital Campus OS</p>
              </div>
            </div>
          </div>

          {/* Universal Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#8C8F9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search activities, hackathons, clubs, campus venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm placeholder-[#9C9EA9] text-[#1E202A]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C8F9F] hover:text-[#1E202A]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions, Persona Switcher & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reliability & Karma Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5EFEB] border border-[#E6DDCF] text-xs">
              <div className="flex items-center gap-1 text-emerald-700 font-semibold" title="Activity Attendance Reliability Score">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentUser.reliabilityScore}%</span>
              </div>
              <div className="w-px h-3 bg-[#DCD2C3]" />
              <div className="flex items-center gap-1 text-amber-700 font-semibold" title="Campus Karma Points">
                <Award className="w-3.5 h-3.5" />
                <span>{currentUser.karmaPoints} pts</span>
              </div>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#F5EFEB] border border-[#E6DDCF] hover:bg-[#EBE2D4] text-[#4A4D5E] hover:text-[#1E202A] transition-colors"
              title="Campus Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#FFFFFF] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Persona & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-xs hover:border-indigo-400 hover:bg-[#FAF6EE] transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-indigo-500/30"
                />
                <div className="text-left hidden md:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#1E202A] leading-none truncate max-w-[110px]">
                      {currentUser.name}
                    </span>
                    {currentUser.isVerified && (
                      <span title="Verified Campus Student">
                        <CheckCircle2 className="w-3 h-3 text-sky-600 shrink-0" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold capitalize block mt-0.5">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8C8F9F] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Persona Switcher Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#FFFFFF] border border-[#E0D5C3] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#1E202A]">
                  <div className="p-2 border-b border-[#EAE2D5]">
                    <p className="text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider">
                      Switch Role & Persona
                    </p>
                    <p className="text-xs text-[#4A4D5E] mt-0.5">
                      Explore CampusConnect from any student or admin perspective:
                    </p>
                  </div>

                  <div className="py-1.5 space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left transition-colors ${
                          currentUser.id === u.id
                            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                            : 'hover:bg-[#FAF6EE] text-[#2D303E]'
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold truncate">{u.name}</p>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-black/10 rounded font-mono">
                              {u.role.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-80 truncate">{u.major}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#EAE2D5] mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      View Full Profile & Badges
                    </button>

                    <Link
                      href="/login"
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Open RBAC Auth Portal →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
