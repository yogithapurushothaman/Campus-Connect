'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Clock,
  ShieldAlert,
  Building,
  BarChart,
  Navigation,
} from 'lucide-react';

export const IssuesHeatmap: React.FC = () => {
  const { buildings, complaints, navigateToVenue } = useApp();
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Group complaints by building
  const buildingIssueCounts: Record<string, { total: number; active: number; complaints: typeof complaints }> = {};

  buildings.forEach((b) => {
    const matching = complaints.filter((c) => c.buildingId === b.id);
    buildingIssueCounts[b.id] = {
      total: matching.length,
      active: matching.filter((c) => c.status !== 'resolved').length,
      complaints: matching,
    };
  });

  const totalActiveIssues = complaints.filter((c) => c.status !== 'resolved').length;
  const resolvedIssues = complaints.filter((c) => c.status === 'resolved').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 rounded-2xl border border-rose-500/20 bg-rose-950/20">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
            <Flame className="w-4 h-4" />
            <span>Active Campus Issues</span>
          </div>
          <p className="text-2xl font-extrabold text-white mt-1">{totalActiveIssues}</p>
          <span className="text-[10px] text-rose-300/80">Across {buildings.length} facilities</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Resolved Tickets</span>
          </div>
          <p className="text-2xl font-extrabold text-white mt-1">{resolvedIssues}</p>
          <span className="text-[10px] text-emerald-300/80">92% Student Satisfaction</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/20">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
            <Clock className="w-4 h-4" />
            <span>Avg Resolution Time</span>
          </div>
          <p className="text-2xl font-extrabold text-white mt-1">18.5 hrs</p>
          <span className="text-[10px] text-indigo-300/80">Well within 24h SLA goal</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <TrendingDown className="w-4 h-4" />
            <span>Recurring Hotspot</span>
          </div>
          <p className="text-xl font-extrabold text-white mt-1 truncate">Raman Hostel</p>
          <span className="text-[10px] text-amber-300/80">Plumbing & RO Filters</span>
        </div>
      </div>

      {/* Visual Campus Heatmap Canvas */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0c1222] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
              Campus Grievance Density Heatmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click on any hotspot cluster to inspect open complaints and dispatch maintenance teams.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span>High (3+ Issues)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Moderate (1-2)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Clear (0)</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((b) => {
            const data = buildingIssueCounts[b.id] || { total: 0, active: 0, complaints: [] };
            const isHot = data.active >= 2;
            const isMedium = data.active === 1;

            return (
              <div
                key={b.id}
                onClick={() => setSelectedHotspot(selectedHotspot === b.id ? null : b.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isHot
                    ? 'bg-rose-950/30 border-rose-500/50 hover:border-rose-400 shadow-lg shadow-rose-500/10'
                    : isMedium
                    ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-900/60 border-white/5 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        isHot
                          ? 'bg-rose-500 shadow-md shadow-rose-500/80 animate-ping'
                          : isMedium
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white truncate max-w-[160px]">{b.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{b.code}</span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                      isHot
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isMedium
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {data.active} Active Issue{data.active !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Sub list if opened */}
                {selectedHotspot === b.id && data.complaints.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in duration-150">
                    {data.complaints.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-xs text-slate-300 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-amber-400">#{c.ticketNumber}</span>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-slate-800 rounded">
                            {c.status}
                          </span>
                        </div>
                        <p className="font-semibold text-white line-clamp-1">{c.title}</p>
                      </div>
                    ))}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToVenue(b.id);
                      }}
                      className="w-full py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      View Facility on Map
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
