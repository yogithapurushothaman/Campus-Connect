'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const getIcon = () => {
          switch (t.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            default:
              return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
          }
        };

        const getBorderColor = () => {
          switch (t.type) {
            case 'success':
              return 'border-emerald-500/40 bg-emerald-950/80';
            case 'error':
              return 'border-rose-500/40 bg-rose-950/80';
            case 'warning':
              return 'border-amber-500/40 bg-amber-950/80';
            default:
              return 'border-indigo-500/40 bg-indigo-950/80';
          }
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${getBorderColor()}`}
          >
            {getIcon()}
            <div className="flex-1 pr-2">
              <h5 className="text-xs font-bold text-white tracking-wide">{t.title}</h5>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
