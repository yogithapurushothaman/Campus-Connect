'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CampusBuilding } from '../../types';
import { computeCampusWalkingRoute } from '../../lib/aiHelpers';
import { Navigation, Footprints, Clock, MapPin, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export const WalkingRouteNavigator: React.FC<{
  start: CampusBuilding;
  dest: CampusBuilding;
  onClose: () => void;
}> = ({ start, dest, onClose }) => {
  const { buildings, setMapRoute } = useApp();
  const route = computeCampusWalkingRoute(start, dest);

  return (
    <div className="glass-panel w-full lg:w-96 rounded-3xl border border-sky-500/30 overflow-hidden shadow-2xl bg-[#0c1220] flex flex-col max-h-[85vh] animate-in slide-in-from-right duration-250">
      {/* Route Header */}
      <div className="p-4 bg-gradient-to-r from-sky-950/80 to-indigo-950/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm">Walking Route Active</h3>
            <p className="text-[11px] text-sky-300 font-medium">Turn-by-turn Campus Path</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin & Destination Selector Bar */}
      <div className="p-4 bg-[#090d16] border-b border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Starting Point</span>
            <select
              value={start.id}
              onChange={(e) => {
                const newStart = buildings.find((b) => b.id === e.target.value);
                if (newStart) setMapRoute({ start: newStart, dest });
              }}
              className="glass-input w-full px-2 py-1 rounded-lg text-xs bg-[#0e1628]"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Destination</span>
            <select
              value={dest.id}
              onChange={(e) => {
                const newDest = buildings.find((b) => b.id === e.target.value);
                if (newDest) setMapRoute({ start, dest: newDest });
              }}
              className="glass-input w-full px-2 py-1 rounded-lg text-xs bg-[#0e1628]"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ETA & Distance Summary */}
      <div className="p-4 bg-slate-900/60 border-b border-white/5 grid grid-cols-2 gap-3 text-center">
        <div className="p-2.5 rounded-2xl bg-[#0e1526] border border-white/5">
          <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. Walk Time</span>
          </div>
          <p className="text-lg font-extrabold text-white mt-0.5">~{route.durationMinutes} mins</p>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#0e1526] border border-white/5">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <Footprints className="w-3.5 h-3.5" />
            <span>Total Distance</span>
          </div>
          <p className="text-lg font-extrabold text-white mt-0.5">{route.distanceMeters} meters</p>
        </div>
      </div>

      {/* Step by Step Walking Directions */}
      <div className="p-4 overflow-y-auto space-y-3 flex-1">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Turn-by-Turn Waypoints:
        </h4>

        <div className="space-y-2">
          {route.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-900/90 border border-white/5 flex items-start gap-2.5 text-xs text-slate-300"
            >
              <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/30 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#090d16] border-t border-white/10 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Pedestrian speed ~75 m/min</span>
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
        >
          Clear Navigation
        </button>
      </div>
    </div>
  );
};
