import React, { useState } from 'react';
import { ShieldCheck, UserPlus, CheckCircle2, AlertCircle, Building2, User, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DelegateClubAccessCard = ({ clubs = [], onAccessGranted }) => {
  const { authFetch } = useAuth();
  const [studentEmail, setStudentEmail] = useState('');
  const [clubName, setClubName] = useState('');
  const [role, setRole] = useState('Event Coordinator');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!studentEmail.trim() || !clubName.trim() || !role.trim()) {
      setErrorMsg('Please fill in all three required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setToastMsg(null);

    try {
      const res = await authFetch('/api/faculty/grant-club-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: studentEmail.trim(),
          clubName: clubName.trim(),
          role: role.trim()
        })
      });

      const data = await res.json();

      if (res.ok) {
        const msg = data.message || `Access granted. ${studentEmail} is now recognized as ${role} of ${clubName}.`;
        setToastMsg(msg);
        if (onAccessGranted) onAccessGranted(data);
        setStudentEmail('');
        setClubName('');
        setRole('Event Coordinator');
        setTimeout(() => setToastMsg(null), 4500);
      } else {
        setErrorMsg(data.error || 'Failed to grant access.');
      }
    } catch (err) {
      setErrorMsg('Network error granting access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="glass-card widget-pop-glow" 
      style={{
        background: '#FAF7F2',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.12)', padding: '10px', borderRadius: '12px', color: '#8B5CF6' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#1E293B' }}>
              Delegate Club Admin Access
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '500' }}>
              Grant elevated club management permissions to student coordinators
            </span>
          </div>
        </div>
        <span style={{ fontSize: '0.725rem', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', fontWeight: '700', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          Faculty Advisor Tool
        </span>
      </div>

      {/* Success Toast */}
      {toastMsg && (
        <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} style={{ color: '#10B981', flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleGrantAccess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          
          {/* Field 1: Student Email */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} style={{ color: '#8B5CF6' }} />
              Student Email:
            </label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="e.g. ananya@campus.edu"
              required
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
            />
          </div>

          {/* Field 2: Club Name */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} style={{ color: '#8B5CF6' }} />
              Club Name:
            </label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="e.g. Logic Play / Robotics Society"
              required
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
            />
          </div>

          {/* Field 3: Club Role */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={14} style={{ color: '#8B5CF6' }} />
              Club Role:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="form-select"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
            >
              <option value="President">President</option>
              <option value="Vice President">Vice President</option>
              <option value="Event Coordinator">Event Coordinator</option>
              <option value="Technical Lead">Technical Lead</option>
              <option value="Core Team Member">Core Team Member</option>
            </select>
          </div>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{
            background: '#8B5CF6',
            color: '#FFFFFF',
            fontWeight: '800',
            borderRadius: '12px',
            padding: '12px 24px',
            boxShadow: '0 6px 18px rgba(139,92,246,0.35)',
            alignSelf: 'flex-end',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldCheck size={18} />
          <span>{loading ? 'Granting Access...' : 'Grant Access'}</span>
        </button>
      </form>
    </div>
  );
};
