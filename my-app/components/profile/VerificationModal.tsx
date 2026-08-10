'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, Mail, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';

export const VerificationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, verifyStudentEmail } = useApp();
  const [otp, setOtp] = useState('123456');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyStudentEmail(otp);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-7 border border-indigo-500/30 shadow-2xl bg-[#0c1222]">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">College Email Verification</h3>
              <p className="text-xs text-slate-400">Unlock full student privileges & badges</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleVerify} className="mt-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              {currentUser.email}
            </p>
            <p className="text-[11px] text-slate-400">
              A 6-digit one-time passkey was simulated for your institutional email address.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Enter 6-Digit OTP Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-center font-mono text-base font-bold tracking-widest"
              />
            </div>
            <p className="text-[11px] text-indigo-400 mt-1 text-center">
              💡 Demo code pre-filled: <strong>123456</strong>
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify & Activate Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
