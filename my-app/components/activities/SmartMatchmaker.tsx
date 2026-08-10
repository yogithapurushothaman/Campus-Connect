'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { getSmartActivityRecommendations } from '../../lib/aiHelpers';
import { Sparkles, Users, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Activity } from '../../types';

export const SmartMatchmaker: React.FC<{ onSelectActivity: (act: Activity) => void }> = ({ onSelectActivity }) => {
  const { currentUser, activities, joinActivity, setActiveSquadChatActivity } = useApp();
  const recommendations = getSmartActivityRecommendations(currentUser, activities);

  if (recommendations.length === 0) return null;

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/30 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">AI Squad Matchmaker</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Personalized for {currentUser.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Recommended based on your interests in {currentUser.interests.slice(0, 3).join(', ')} & schedule
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {recommendations.slice(0, 3).map(({ activity: act, score, matchReasons }) => {
          const filledSlots = act.participants.length;
          const totalSlots = act.maxParticipants;
          const percentFilled = (filledSlots / totalSlots) * 100;

          return (
            <div
              key={act.id}
              className="glass-card p-4 rounded-2xl flex flex-col justify-between border border-white/10 hover:border-indigo-500/50 transition-all bg-[#0e1628]/80"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    {score}% Match
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{act.date}</span>
                </div>

                <h4
                  onClick={() => onSelectActivity(act)}
                  className="font-bold text-sm text-white hover:text-indigo-300 cursor-pointer line-clamp-1 transition-colors"
                >
                  {act.title}
                </h4>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{act.locationName}</span>
                </div>

                <div className="mt-2.5 p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-indigo-200">
                  💡 {matchReasons[0]}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong className="text-white">{filledSlots}</strong>/{totalSlots} slots
                  </span>
                </div>

                <button
                  onClick={() => {
                    joinActivity(act.id);
                    setActiveSquadChatActivity(act);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1 transition-all"
                >
                  Join & Chat
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
