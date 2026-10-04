import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, CheckCircle2, AlertCircle, Building2, User, Award, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DelegateClubAccessCard = ({ clubs = [], onAccessGranted }) => {
  const { authFetch } = useAuth();
  const [studentEmail, setStudentEmail] = useState('');
  const [clubName, setClubName] = useState('');
  const [role, setRole] = useState('Event Coordinator');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [delegations, setDelegations] = useState([
    { id: 'del-1', studentName: 'Ananya Sharma', studentEmail: 'ananya@campus.edu', clubName: 'ACM Student Chapter', role: 'President' },
    { id: 'del-2', studentName: 'Rohan Verma', studentEmail: 'rohan@campus.edu', clubName: 'Robotics Society', role: 'Event Coordinator' },
  ]);

  const loadDelegations = async () => {
    try {
      const res = await authFetch('/api/faculty/delegations');
      if (res.ok) {
        const d = await res.json();
        if (d.delegations && d.delegations.length > 0) {
          setDelegations(d.delegations);
        }
      }
    } catch (e) {
      console.log('Failed to fetch live delegations');
    }
  };

  useEffect(() => {
    loadDelegations();
  }, []);

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
        
        // Add to local delegations state for instant UI update
        const newDel = {
          id: `del-${Date.now()}`,
          studentName: data.student?.name || studentEmail.split('@')[0],
          studentEmail: studentEmail.trim(),
          clubName: data.clubName || clubName.trim(),
          role: role.trim()
        };
        setDelegations((prev) => [newDel, ...prev]);

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

  const sampleEmails = ['ananya@campus.edu', 'rohan@campus.edu', 'priya@campus.edu'];
  const sampleClubs = clubs.length > 0 ? clubs.map(c => c.name) : ['ACM Student Chapter', 'Robotics Society', 'Logic Play', 'Linux User Group'];

  return (
    <div 
      className="glass-card widget-pop-glow" 
      style={{
        background: '#FAF7F2',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.12)', padding: '10px', borderRadius: '12px', color: '#8B5CF6' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#1E293B' }}>
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

      {/* Success Toast Notification */}
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
      <form onSubmit={handleGrantAccess} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
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
            {/* Quick Chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '600' }}>Demo:</span>
              {sampleEmails.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setStudentEmail(em)}
                  style={{ background: 'rgba(139, 92, 246, 0.08)', border: 'none', color: '#8B5CF6', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Field 2: Club Name */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} style={{ color: '#8B5CF6' }} />
              Club Name:
            </label>
            <select
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
              className="form-select"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
            >
              <option value="">Select Club...</option>
              {sampleClubs.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
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
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            color: '#FFFFFF',
            fontWeight: '800',
            borderRadius: '12px',
            padding: '12px 24px',
            boxShadow: '0 6px 18px rgba(139,92,246,0.35)',
            alignSelf: 'flex-end',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={18} />
          <span>{loading ? 'Granting Access...' : 'Grant Access'}</span>
        </button>
      </form>

      {/* Active Delegated Coordinators Section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#475569', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={16} style={{ color: '#8B5CF6' }} />
          <span>Active Delegated Club Admin Roster ({delegations.length})</span>
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
          {delegations.map((d) => (
            <div key={d.id} style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: '800', fontSize: '0.875rem', color: '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{d.studentName}</span>
                <span style={{ fontSize: '0.675rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', fontWeight: '800' }}>
                  {d.role}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Club: <strong style={{ color: '#334155' }}>{d.clubName}</strong>
              </div>
              <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>
                {d.studentEmail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
