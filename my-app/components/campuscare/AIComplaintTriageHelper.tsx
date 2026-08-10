'use client';

import React from 'react';
import { Complaint } from '../../types';
import { predictComplaintAttributes, findSimilarComplaints } from '../../lib/aiHelpers';
import { Sparkles, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AIComplaintTriageHelper: React.FC<{
  title: string;
  description: string;
  buildingId: string;
  buildingName: string;
  existingComplaints: Complaint[];
  onApplyCategory?: (cat: any, prio: any) => void;
}> = ({ title, description, buildingId, buildingName, existingComplaints, onApplyCategory }) => {
  if (!title.trim() && !description.trim()) return null;

  const prediction = predictComplaintAttributes(title, description, buildingName);
  const duplicates = findSimilarComplaints(title, description, buildingId, existingComplaints);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>AI Triage & Duplicate Detector</span>
        </div>
        <span className="text-[10px] font-mono text-indigo-300">
          Confidence: {Math.round(prediction.confidence * 100)}%
        </span>
      </div>

      {/* Suggested Attributes */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400">Auto-detected:</span>
        <span className="px-2 py-0.5 rounded-md bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 font-semibold uppercase text-[10px]">
          Category: {prediction.predictedCategory}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-amber-600/30 text-amber-200 border border-amber-500/30 font-semibold uppercase text-[10px]">
          Priority: {prediction.predictedPriority}
        </span>
        <span className="text-slate-400 hidden sm:inline">• Routes to: {prediction.suggestedTeam}</span>
      </div>

      {/* Similar Duplicate Warning if any */}
      {duplicates.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Similar Issue Detected ({duplicates[0].similarity}% match)</span>
          </div>
          <p className="text-[11px] opacity-90 leading-snug">{duplicates[0].reason}</p>
          <p className="text-[10px] text-amber-400/80">
            💡 Consider upvoting ticket #{duplicates[0].complaint.ticketNumber} instead of filing a duplicate.
          </p>
        </div>
      )}
    </div>
  );
};
