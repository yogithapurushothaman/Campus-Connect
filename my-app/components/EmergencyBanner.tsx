'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, AlertOctagon, Info, ChevronRight, X, ShieldAlert, Radio } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const { emergencyAlert, dismissEmergencyAlert, currentUser, broadcastEmergencyAlert } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Modal form state for Admin emergency broadcast
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [broadcastLevel, setBroadcastLevel] = useState<'advisory' | 'warning' | 'critical'>('warning');
  const [broadcastInstructions, setBroadcastInstructions] = useState('');

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastDesc) return;
    const instructionsList = broadcastInstructions
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);
    broadcastEmergencyAlert(
      broadcastTitle,
      broadcastDesc,
      broadcastLevel,
      instructionsList.length > 0 ? instructionsList : ['Follow official college security guidelines.']
    );
    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastDesc('');
    setBroadcastInstructions('');
  };

  const getAlertStyles = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-rose-950/90 border-rose-500 text-rose-100',
          icon: <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />,
          badge: 'bg-rose-500 text-white font-bold',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500 text-amber-100',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          badge: 'bg-amber-500 text-black font-semibold',
        };
      default:
        return {
          bg: 'bg-indigo-950/90 border-indigo-500 text-indigo-100',
          icon: <Info className="w-5 h-5 text-indigo-400" />,
          badge: 'bg-indigo-500 text-white',
        };
    }
  };

  return (
    <>
      {emergencyAlert && emergencyAlert.isActive && (
        <div
          className={`border-b backdrop-blur-md px-4 py-3 shadow-lg transition-all duration-300 ${
            getAlertStyles(emergencyAlert.level).bg
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-black/30 border border-white/10 shrink-0">
                {getAlertStyles(emergencyAlert.level).icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider ${getAlertStyles(emergencyAlert.level).badge}`}>
                    {emergencyAlert.level} Alert
                  </span>
                  <h4 className="font-semibold text-sm sm:text-base">{emergencyAlert.title}</h4>
                  <span className="text-xs opacity-70 hidden sm:inline">• Issued by {emergencyAlert.issuedBy}</span>
                </div>
                <p className="text-xs sm:text-sm opacity-90 mt-0.5 line-clamp-1 md:line-clamp-none">
                  {emergencyAlert.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              {emergencyAlert.instructions.length > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors flex items-center gap-1 font-medium"
                >
                  {expanded ? 'Hide Advisory' : 'View Instructions'}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </button>
              )}

              <button
                onClick={dismissEmergencyAlert}
                title="Dismiss Banner"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {expanded && emergencyAlert.instructions.length > 0 && (
            <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-white/10 text-xs sm:text-sm grid sm:grid-cols-3 gap-2">
              {emergencyAlert.instructions.map((inst, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-xs shrink-0 font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{inst}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Broadcast Trigger Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-rose-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Issue Emergency Campus Broadcast</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Alert Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['advisory', 'warning', 'critical'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setBroadcastLevel(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                        broadcastLevel === lvl
                          ? lvl === 'critical'
                            ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
                            : lvl === 'warning'
                            ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30'
                            : 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/30'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Alert Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Heavy Rainfall & Waterlogging Campus Advisory"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain what is happening and the affected campus zones..."
                  value={broadcastDesc}
                  onChange={(e) => setBroadcastDesc(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Actionable Instructions (1 per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Avoid low-lying walkways near sports ground.&#10;Campus electric shuttles running every 10 mins.&#10;Emergency Control Room: Ext 4444."
                  value={broadcastInstructions}
                  onChange={(e) => setBroadcastInstructions(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm resize-none font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/25 flex items-center gap-1.5 transition-all"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Broadcast Campus-Wide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
