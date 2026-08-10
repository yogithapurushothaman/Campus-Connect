'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Send,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle,
  Navigation,
  Sparkles,
  Share2,
  Calendar,
  LogOut,
} from 'lucide-react';

export const ActivitySquadChat: React.FC = () => {
  const {
    activeSquadChatActivity,
    setActiveSquadChatActivity,
    chatMessages,
    sendMessage,
    currentUser,
    leaveActivity,
    navigateToVenue,
  } = useApp();

  const [input, setInput] = useState('');
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const act = activeSquadChatActivity;
  const messages = act ? chatMessages[act.chatId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!act) return null;

  const isMember = act.participants.some((p) => p.userId === currentUser.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(act.chatId, input.trim(), 'text');
    setInput('');
  };

  const handleShareLocation = () => {
    sendMessage(
      act.chatId,
      `📍 Shared location: Meeting right at ${act.locationName} entrance gate!`,
      'location',
      { locationName: act.locationName, coordinates: act.coordinates }
    );
  };

  const handleConfirmArrival = () => {
    sendMessage(
      act.chatId,
      `✅ ${currentUser.name} has arrived at the venue! Ready to start.`,
      'rsvp',
      { rsvpStatus: 'going' }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl h-[88vh] rounded-3xl border border-indigo-500/30 shadow-2xl flex flex-col overflow-hidden bg-[#0c1222]">
        {/* Chat Header */}
        <div className="p-4 sm:px-6 bg-[#0f172a] border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/30">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-sm sm:text-base truncate">{act.title}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline">
                  {act.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  {act.date}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  {act.locationName}
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigateToVenue(act.buildingId)}
              className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Navigate to Venue on Map"
            >
              <Navigation className="w-4 h-4" />
              <span className="hidden md:inline">Map Route</span>
            </button>

            <button
              onClick={() => setShowParticipantsList(!showParticipantsList)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showParticipantsList
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{act.participants.length}/{act.maxParticipants}</span>
            </button>

            <button
              onClick={() => setActiveSquadChatActivity(null)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body with toggleable participants sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#090d16]/70">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                  <Sparkles className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
                  <p className="text-sm font-semibold text-slate-300">Squad Group Chat Activated!</p>
                  <p className="text-xs max-w-sm mt-1">
                    Say hi to fellow squadmates, share meetup spots, or coordinate plans before starting.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isSystem = msg.type === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/20 text-[11px] font-medium text-indigo-300 text-center shadow-xs">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-xl object-cover shrink-0 mt-1 ring-1 ring-white/10"
                      />
                      <div className={`max-w-[78%] sm:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-bold text-slate-300">{msg.senderName}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                        </div>

                        <div
                          className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                            isMe
                              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-xs'
                              : 'bg-slate-800/90 border border-white/10 text-slate-200 rounded-tl-xs'
                          } ${msg.type === 'location' ? 'border-sky-500/50 bg-sky-950/40 text-sky-100' : ''} ${
                            msg.type === 'rsvp' ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-100' : ''
                          }`}
                        >
                          <p>{msg.content}</p>
                          {msg.type === 'location' && (
                            <button
                              onClick={() => navigateToVenue(act.buildingId)}
                              className="mt-2 text-xs font-bold text-sky-300 underline flex items-center gap-1 hover:text-white"
                            >
                              <Navigation className="w-3 h-3" />
                              View on Campus Map
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Pills Bar */}
            <div className="px-4 py-2 bg-[#0c1220] border-t border-white/5 flex items-center gap-2 overflow-x-auto">
              <button
                onClick={handleShareLocation}
                className="px-3 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/30 text-sky-300 text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
              >
                <MapPin className="w-3 h-3" />
                Share Venue Pin
              </button>
              <button
                onClick={handleConfirmArrival}
                className="px-3 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                I Have Arrived
              </button>
              {isMember && act.creatorId !== currentUser.id && (
                <button
                  onClick={() => {
                    leaveActivity(act.id);
                    setActiveSquadChatActivity(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1 shrink-0 ml-auto transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Leave Squad
                </button>
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="p-3 sm:p-4 bg-[#0f172a] border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder={isMember ? 'Type a message to your squad...' : 'Join squad to chat'}
                disabled={!isMember}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="glass-input flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isMember || !input.trim()}
                className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Participants Side Panel */}
          {showParticipantsList && (
            <div className="w-72 border-l border-white/10 bg-[#0d1322] p-4 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Squad Members ({act.participants.length}/{act.maxParticipants})
                </h4>
                <button
                  onClick={() => setShowParticipantsList(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 flex-1">
                {act.participants.map((p) => (
                  <div
                    key={p.userId}
                    className="p-2.5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={p.userAvatar} alt={p.userName} className="w-8 h-8 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{p.userName}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{p.role}</p>
                      </div>
                    </div>
                    {p.role === 'host' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        HOST
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300">
                ⭐ <strong>Reliability Guard:</strong> Squad attendance is recorded on student profiles to maintain trust & prevent no-shows.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
