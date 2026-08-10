'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, Users, Calendar, AlertCircle, ShieldAlert, Sparkles, X } from 'lucide-react';

export const NotificationsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, setActiveTab } = useApp();
  const [filter, setFilter] = useState<'all' | 'activity' | 'event' | 'complaint'>('all');

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'activity':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-sky-400" />;
      case 'complaint':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'emergency':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-violet-400" />;
    }
  };

  const handleNotifClick = (id: string, link?: string) => {
    markNotificationAsRead(id);
    if (link) {
      setActiveTab(link);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#0d1322] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Campus Alerts & Updates</h3>
              <p className="text-xs text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-300 text-xs flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-white/5 flex gap-2 overflow-x-auto">
          {(['all', 'activity', 'event', 'complaint'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Alerts' : cat === 'activity' ? 'Activities' : cat === 'event' ? 'Events' : 'Campus Care'}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">No Notifications in this tab</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                You will receive alerts here when people join your squads, event dates approach, or complaints update.
              </p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif.id, notif.link)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? 'bg-slate-900/40 border-white/5 hover:bg-slate-800/50 opacity-75'
                    : 'bg-indigo-950/30 border-indigo-500/30 hover:bg-indigo-950/50 shadow-md shadow-indigo-500/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-white/10 shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                    {notif.link && (
                      <div className="mt-2 text-[11px] font-semibold text-indigo-400 flex items-center gap-1 hover:underline">
                        Open in {notif.link.toUpperCase()} →
                      </div>
                    )}
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 mt-1.5 shadow-sm shadow-indigo-400/80" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
