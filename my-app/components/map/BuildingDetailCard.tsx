'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CampusBuilding } from '../../types';
import {
  X,
  MapPin,
  Wifi,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
  Navigation,
  CheckCircle,
} from 'lucide-react';

export const BuildingDetailCard: React.FC<{
  building: CampusBuilding | null;
  onClose: () => void;
  onStartRoute: (dest: CampusBuilding) => void;
}> = ({ building, onClose, onStartRoute }) => {
  const { complaints } = useApp();

  if (!building) return null;

  const buildingComplaints = complaints.filter(
    (c) => c.buildingId === building.id && c.status !== 'resolved'
  );

  return (
    <div className="glass-panel w-full lg:w-96 rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-[#0c1220] flex flex-col max-h-[85vh] animate-in slide-in-from-right duration-250">
      {/* Photo Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0">
        <img src={building.image} alt={building.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220] via-transparent to-black/40" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="absolute bottom-3 left-4 right-4">
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white shadow-md">
            {building.category} • {building.code}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-white mt-1 leading-snug">
            {building.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto space-y-4 flex-1">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">Open Hours</span>
            </div>
            <p className="font-bold text-white text-[11px] truncate">{building.openHours}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold">Campus Wi-Fi</span>
            </div>
            <p className="font-bold text-emerald-400 text-[11px]">
              {'★'.repeat(building.wifiRating)} ({building.wifiRating}/5)
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">About Facility</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{building.description}</p>
        </div>

        {/* Room Directory */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Directory & Key Labs ({building.floors} Floors)
            </h4>
            <span className="text-[10px] text-indigo-400 font-mono">{building.rooms.length} Units</span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {building.rooms.map((room, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-lg bg-indigo-950 text-indigo-300 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                    F{room.floor}
                  </span>
                  <span className="text-slate-200 truncate">{room.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2">
                  {room.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Complaints Alert if any */}
        {buildingComplaints.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {buildingComplaints.length} Active Issue Ticket{buildingComplaints.length > 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                "{buildingComplaints[0].title}"
              </p>
            </div>
          </div>
        )}

        {/* Amenities */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Amenities</h4>
          <div className="flex items-center gap-1.5 flex-wrap">
            {building.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-slate-300 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-white/5"
              >
                ✓ {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation CTA */}
      <div className="p-4 border-t border-white/10 bg-[#090d16] shrink-0">
        <button
          onClick={() => onStartRoute(building)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
        >
          <Navigation className="w-4 h-4" />
          Get Walking Directions Here
        </button>
      </div>
    </div>
  );
};
