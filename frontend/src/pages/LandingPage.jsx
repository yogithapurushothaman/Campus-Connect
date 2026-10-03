import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const LandingPage = () => {
  return (
    <>
      <Navbar />
      <main className="main-container" style={{ justifyContent: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Main Hero Title */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '20px auto 40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', color: 'var(--primary-purple)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
            <Sparkles size={16} />
            <span>Digital Campus Ecosystem • Dual-Role Authentication</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px', color: 'var(--text-main)' }}>
            Your Campus. Your People. <br />
            <span style={{ color: 'var(--primary-purple)' }}>One Connected Platform.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
            Select your institutional portal below to sign in with your official college credentials.
          </p>
        </div>

        {/* Dual Role Selection Cards */}
        <div className="grid-2" style={{ maxWidth: '960px', width: '100%', margin: '0 auto' }}>
          
          {/* Student Card */}
          <div className="glass-card glass-card-interactive" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--primary-purple)' }}>
            <div>
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <GraduationCap size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>Student Portal</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.6 }}>
                Discover spontaneous activity squads, RSVP to official hackathons & fests, navigate the 2D campus map, and track personal complaint tickets.
              </p>

              <div style={{ background: 'var(--bg-page)', padding: '14px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '800', color: 'var(--primary-purple)', marginBottom: '6px' }}>Demo Student Account:</div>
                <div style={{ color: 'var(--text-main)', marginBottom: '4px' }}>
                  Email: <code style={{ color: 'var(--primary-purple)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>ananya@campus.edu</code>
                </div>
                <div style={{ color: 'var(--text-main)' }}>
                  Password: <code style={{ color: 'var(--primary-purple)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>password123</code>
                </div>
              </div>
            </div>

            <Link to="/login/student" className="btn btn-primary" style={{ width: '100%', padding: '14px', background: 'var(--primary-purple)', fontSize: '1rem', fontWeight: '700' }}>
              <span>Enter Student Login</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Faculty Card */}
          <div className="glass-card glass-card-interactive" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--primary-purple)' }}>
            <div>
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Briefcase size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>Faculty & Staff Portal</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.6 }}>
                Publish official college workshops & events, review and approve club recruitment applicants, broadcast announcements, and triage campus care complaints.
              </p>

              <div style={{ background: 'var(--bg-page)', padding: '14px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '800', color: 'var(--primary-purple)', marginBottom: '6px' }}>Demo Faculty Account:</div>
                <div style={{ color: 'var(--text-main)', marginBottom: '4px' }}>
                  Email: <code style={{ color: 'var(--primary-purple)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>prof.vikram@college.edu</code>
                </div>
                <div style={{ color: 'var(--text-main)' }}>
                  Password: <code style={{ color: 'var(--primary-purple)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>password123</code>
                </div>
              </div>
            </div>

            <Link to="/login/faculty" className="btn btn-primary" style={{ width: '100%', padding: '14px', background: 'var(--primary-purple)', fontSize: '1rem', fontWeight: '700' }}>
              <span>Enter Faculty Login</span>
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>

        {/* Security & Verification Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
          <span>Institutional Verification Enabled • Encrypted Sessions • Role-Protected Routes</span>
        </div>

      </main>
    </>
  );
};
