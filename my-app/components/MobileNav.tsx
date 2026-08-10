'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Calendar, Layers, MapPin, LifeBuoy, BarChart3, UserCheck, X } from 'lucide-react';

export const MobileNav: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab } = useApp();

  if (!isOpen) return null;

  const navItems = [
    { id: 'activities', label: 'Activities & Squads', icon: Users },
    { id: 'events', label: 'Events & Opps Hub', icon: Calendar },
    { id: 'clubs', label: 'Clubs & Communities', icon: Layers },
    { id: 'map', label: 'Campus Map & Directions', icon: MapPin },
    { id: 'campuscare', label: 'Campus Care Complaints', icon: LifeBuoy },
    { id: 'admin', label: 'Admin Triage & Heatmap', icon: BarChart3 },
    { id: 'profile', label: 'Student Profile & Badges', icon: UserCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
      <div className="w-72 h-full bg-[#0a0f1d] border-r border-white/10 p-5 flex flex-col justify-between animate-in slide-in-from-left duration-250">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <span className="font-extrabold text-white text-base">CampusConnect</span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">CampusConnect v1.0 • Apex Univ</p>
      </div>
    </div>
  );
};
