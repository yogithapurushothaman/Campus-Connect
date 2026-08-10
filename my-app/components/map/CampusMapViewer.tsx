'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusBuilding } from '../../types';
import {
  MapPin,
  Search,
  Navigation,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Building,
  Wifi,
} from 'lucide-react';
import { BuildingDetailCard } from './BuildingDetailCard';
import { WalkingRouteNavigator } from './WalkingRouteNavigator';

export const CampusMapViewer: React.FC = () => {
  const {
    buildings,
    selectedBuilding,
    setSelectedBuilding,
    mapRoute,
    setMapRoute,
    complaints,
    searchQuery,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapSearch, setMapSearch] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Buildings' },
    { id: 'academic', label: 'Academic & Labs' },
    { id: 'hostel', label: 'Hostel Residences' },
    { id: 'sports', label: 'Sports Arena' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'library', label: 'Library' },
  ];

  const filteredBuildings = buildings.filter((b) => {
    const matchesCat = categoryFilter === 'all' || b.category === categoryFilter;
    const query = (mapSearch || searchQuery).toLowerCase();
    const matchesSearch =
      !query ||
      b.name.toLowerCase().includes(query) ||
      b.code.toLowerCase().includes(query) ||
      b.description.toLowerCase().includes(query) ||
      b.rooms.some((r) => r.name.toLowerCase().includes(query));

    return matchesCat && matchesSearch;
  });

  const handleBuildingClick = (bldg: CampusBuilding) => {
    setSelectedBuilding(bldg);
  };

  const handleStartRoute = (dest: CampusBuilding) => {
    const defaultStart = buildings.find((b) => b.id === 'bldg-7') || buildings[0];
    setMapRoute({ start: defaultStart, dest });
  };

  const getCategoryColor = (category: string, isSelected: boolean) => {
    if (isSelected) return 'fill-indigo-600 stroke-indigo-400';
    switch (category) {
      case 'academic':
        return 'fill-indigo-950/90 stroke-indigo-500/50 hover:stroke-indigo-400';
      case 'hostel':
        return 'fill-amber-950/80 stroke-amber-500/50 hover:stroke-amber-400';
      case 'sports':
        return 'fill-emerald-950/80 stroke-emerald-500/50 hover:stroke-emerald-400';
      case 'food':
        return 'fill-orange-950/80 stroke-orange-500/50 hover:stroke-orange-400';
      case 'library':
        return 'fill-sky-950/90 stroke-sky-500/50 hover:stroke-sky-400';
      case 'medical':
        return 'fill-rose-950/80 stroke-rose-500/50 hover:stroke-rose-400';
      default:
        return 'fill-purple-950/80 stroke-purple-500/50 hover:stroke-purple-400';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Interactive Campus Map & Wayfinding
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
              Apex Main Campus (120 Acres)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Navigate classrooms, labs, hostel blocks, and get step-by-step walking routes.
          </p>
        </div>

        {/* Map Search & Route indicator */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Jump to building, lab, hall..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              className="glass-input pl-8 pr-3 py-2 rounded-xl text-xs w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              categoryFilter === cat.id
                ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Map Viewer Container with Overlay Panels */}
      <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-white/10 bg-[#070b14] shadow-2xl flex">
        {/* SVG Interactive Canvas */}
        <div className="flex-1 w-full h-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing">
          {/* Background Campus Grid Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

          {/* Compass Rose */}
          <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-[#0c1220]/80 border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs font-bold text-slate-300 z-10">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>N ↑</span>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="p-2.5 rounded-xl bg-[#0c1220]/80 border border-white/10 text-white hover:bg-slate-800 backdrop-blur-md"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.8))}
              className="p-2.5 rounded-xl bg-[#0c1220]/80 border border-white/10 text-white hover:bg-slate-800 backdrop-blur-md"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2.5 rounded-xl bg-[#0c1220]/80 border border-white/10 text-slate-400 hover:text-white backdrop-blur-md"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Main SVG Vector Canvas */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <defs>
              {/* Glowing Linear Gradients for Routes */}
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Campus Roads & Pathways */}
            <g stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" opacity="0.6">
              {/* Central Boulevard Spine */}
              <line x1="10" y1="50" x2="90" y2="50" />
              {/* North-South Corridors */}
              <line x1="30" y1="10" x2="30" y2="90" />
              <line x1="50" y1="10" x2="50" y2="90" />
              <line x1="75" y1="10" x2="75" y2="90" />
              {/* Diagonal Walkways */}
              <line x1="30" y1="25" x2="52" y2="22" strokeDasharray="1,1" />
              <line x1="42" y1="44" x2="68" y2="45" strokeDasharray="1,1" />
              <line x1="22" y1="55" x2="18" y2="78" strokeDasharray="1,1" />
            </g>

            {/* Central Green Lawn Circle */}
            <circle cx="50" cy="50" r="7" fill="#064e3b" stroke="#059669" strokeWidth="0.5" opacity="0.5" />
            <text x="50" y="50.8" textAnchor="middle" fontSize="1.8" fill="#34d399" fontWeight="bold">
              Central Lawn & Fountain
            </text>

            {/* Active Walking Route Path Layer */}
            {mapRoute && (
              <g filter="url(#glow)">
                <polyline
                  points={`${mapRoute.start.position.x},${mapRoute.start.position.y} ${mapRoute.start.position.x},50 50,50 ${mapRoute.dest.position.x},50 ${mapRoute.dest.position.x},${mapRoute.dest.position.y}`}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="1.2"
                  strokeDasharray="2,1"
                  strokeLinecap="round"
                />
                {/* Pulsing Start & End Marker Pins */}
                <circle cx={mapRoute.start.position.x} cy={mapRoute.start.position.y} r="2" fill="#10b981" />
                <circle cx={mapRoute.dest.position.x} cy={mapRoute.dest.position.y} r="2.2" fill="#f43f5e" className="animate-ping" />
                <circle cx={mapRoute.dest.position.x} cy={mapRoute.dest.position.y} r="1.6" fill="#f43f5e" />
              </g>
            )}

            {/* Render Buildings */}
            {filteredBuildings.map((b) => {
              const isSelected = selectedBuilding?.id === b.id;
              const hasComplaints = complaints.some(
                (c) => c.buildingId === b.id && c.status !== 'resolved'
              );

              return (
                <g
                  key={b.id}
                  onClick={() => handleBuildingClick(b)}
                  className="cursor-pointer transition-all duration-200 group"
                  transform={`translate(${b.position.x - b.size.width / 2}, ${b.position.y - b.size.height / 2})`}
                >
                  {/* Building Base 3D footprint */}
                  <rect
                    x="0"
                    y="0"
                    width={b.size.width}
                    height={b.size.height}
                    rx="2"
                    className={`transition-all duration-200 ${getCategoryColor(b.category, isSelected)}`}
                    strokeWidth={isSelected ? '0.8' : '0.4'}
                  />

                  {/* Building Name label */}
                  <text
                    x={b.size.width / 2}
                    y={b.size.height / 2 - 0.5}
                    textAnchor="middle"
                    fontSize="1.6"
                    fill="#f8fafc"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {b.code}
                  </text>

                  <text
                    x={b.size.width / 2}
                    y={b.size.height / 2 + 1.8}
                    textAnchor="middle"
                    fontSize="1.1"
                    fill="#94a3b8"
                    className="select-none pointer-events-none"
                  >
                    {b.name.length > 18 ? `${b.name.substring(0, 16)}...` : b.name}
                  </text>

                  {/* Active Complaints Warning Pin on Building */}
                  {hasComplaints && (
                    <g transform={`translate(${b.size.width - 2}, 2)`}>
                      <circle cx="0" cy="0" r="1.2" fill="#f59e0b" />
                      <text x="0" y="0.4" textAnchor="middle" fontSize="1" fill="#000" fontWeight="bold">
                        !
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side Panel Overlay: Route Navigator OR Building Detail Card */}
        <div className="absolute top-4 right-4 bottom-4 z-20 pointer-events-auto hidden md:flex">
          {mapRoute ? (
            <WalkingRouteNavigator
              start={mapRoute.start}
              dest={mapRoute.dest}
              onClose={() => setMapRoute(null)}
            />
          ) : selectedBuilding ? (
            <BuildingDetailCard
              building={selectedBuilding}
              onClose={() => setSelectedBuilding(null)}
              onStartRoute={handleStartRoute}
            />
          ) : null}
        </div>
      </div>

      {/* Mobile Drawer fallback when building is selected */}
      <div className="md:hidden">
        {mapRoute ? (
          <WalkingRouteNavigator
            start={mapRoute.start}
            dest={mapRoute.dest}
            onClose={() => setMapRoute(null)}
          />
        ) : selectedBuilding ? (
          <BuildingDetailCard
            building={selectedBuilding}
            onClose={() => setSelectedBuilding(null)}
            onStartRoute={handleStartRoute}
          />
        ) : null}
      </div>
    </div>
  );
};
