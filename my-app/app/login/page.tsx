'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Briefcase,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'STUDENT' | 'STAFF'>('STUDENT');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') setMode('signup');
    const urlRole = searchParams.get('role');
    if (urlRole === 'STAFF' || urlRole === 'STUDENT') setRole(urlRole);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload =
        mode === 'signup'
          ? { name: name.trim(), email: email.trim(), password, role }
          : { email: email.trim(), password, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      setSuccess(
        mode === 'signup'
          ? 'Account created! Redirecting to dashboard...'
          : 'Authenticated! Redirecting...'
      );

      setTimeout(() => {
        router.push(data.redirectTo || (role === 'STAFF' ? '/staff-dashboard' : '/student-dashboard'));
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md z-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#1E202A]">
            Campus<span className="text-indigo-600">Connect</span>
          </span>
        </Link>
        <h1 className="text-2xl font-extrabold text-[#1E202A] tracking-tight">
          {mode === 'login' ? 'Sign In to Campus' : 'Create Campus Account'}
        </h1>
        <p className="text-xs text-[#6B6E80]">
          Role-Based Access Control Portal for Students & Faculty Staff
        </p>
      </div>

      {/* Auth Cream Glass Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E6DDCF] shadow-xl bg-[#FFFFFF]/95 backdrop-blur-2xl space-y-5 text-[#1E202A]">
        {/* Mode Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F3ECE2] border border-[#E0D5C3]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-[#6B6E80] hover:text-[#1E202A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-[#6B6E80] hover:text-[#1E202A]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Role Selector Tabs: Student vs Staff */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                role === 'STUDENT'
                  ? 'bg-indigo-50/80 border-indigo-600 text-[#1E202A] shadow-md shadow-indigo-600/10'
                  : 'bg-[#FAF6EE] border-[#E6DDCF] text-[#6B6E80] hover:bg-[#F3ECE2]'
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  role === 'STUDENT' ? 'bg-indigo-600 text-white' : 'bg-[#EFE8DC] text-[#6B6E80]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Student</span>
              <span className="text-[10px] text-[#6B6E80]">View & RSVP Events</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('STAFF')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                role === 'STAFF'
                  ? 'bg-amber-50/80 border-amber-600 text-[#1E202A] shadow-md shadow-amber-600/10'
                  : 'bg-[#FAF6EE] border-[#E6DDCF] text-[#6B6E80] hover:bg-[#F3ECE2]'
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  role === 'STAFF' ? 'bg-amber-600 text-white' : 'bg-[#EFE8DC] text-[#6B6E80]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Faculty / Staff</span>
              <span className="text-[10px] text-[#6B6E80]">Post & Manage Events</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C8F9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={role === 'STAFF' ? 'Dr. Ramesh Sharma' : 'Aarav Patel'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#1E202A]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C8F9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder={role === 'STAFF' ? 'faculty.lead@campus.edu' : 'student@campus.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#1E202A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C8F9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#1E202A]"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-[#6B6E80] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C8F9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#1E202A]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
              role === 'STAFF'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-amber-600/25'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25'
            } disabled:opacity-50`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? `Sign In as ${role}` : `Register as ${role}`}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Demo Credentials */}
        <div className="p-3 rounded-2xl bg-[#F8F4EC] border border-[#E6DDCF] text-[11px] text-[#4A4D5E] space-y-1">
          <p className="font-semibold text-[#1E202A]">💡 Quick Demo Tip:</p>
          <p>You can create a new Staff account or Student account in 5 seconds to test role-based access control!</p>
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link href="/" className="text-xs text-indigo-700 hover:text-indigo-800 font-bold transition-colors">
          ← Return to Campus Main OS
        </Link>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#FAF6EE] text-[#1E202A] relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient warm background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-[#6B6E80] text-xs">Loading authentication portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
