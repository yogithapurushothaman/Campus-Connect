import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertTriangle, ShieldCheck, Mail, ShieldAlert, BookOpen, Clock, MapPin, User, LogOut } from 'lucide-react';

export const StudentProfile = () => {
  const { authFetch, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch('/api/users/me/profile');
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (e) {
        console.error("Failed to load profile data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', fontFamily: 'Outfit' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Loading student profile details...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', fontFamily: 'Outfit' }}>
        <h3 style={{ color: 'var(--warning-red)', fontWeight: 800 }}>Profile not found</h3>
        <p style={{ color: 'var(--text-muted)' }}>We were unable to load your profile details. Please try logging in again.</p>
        <button onClick={logout} className="btn btn-primary" style={{ marginTop: '16px' }}>Log Out</button>
      </div>
    );
  }

  const { user, rsvps, complaints } = profileData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Outfit', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* 1. Header Profile Identity Section */}
      <div className="glass-card" style={{ padding: '30px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
            alt="User Avatar" 
            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
          />
          <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: '#fff', borderRadius: '50%', padding: '6px', display: 'flex' }}>
            <User size={14} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>{user.name}</h2>
            <span className="status-pill status-accepted" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem' }}>
              <ShieldCheck size={14} />
              Verified Student ✅
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '6px 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} />
            {user.email}
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <div><strong>Department:</strong> {user.department || 'N/A'}</div>
            <div><strong>Student ID:</strong> {user.studentOrFacultyId || 'N/A'}</div>
            <div><strong>Karma:</strong> ⚡ {user.karmaPoints || 120} pts</div>
          </div>
        </div>
      </div>

      {/* 2. Grid for RSVPs & Complaints */}
      <div className="grid-2" style={{ gap: '24px' }}>
        
        {/* RSVPs: My Schedule */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            My Schedule (RSVPs)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {rsvps.length > 0 ? (
              rsvps.map((evt) => (
                <div key={evt.id} style={{ padding: '14px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{evt.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {evt.date}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} />
                    {evt.venue || evt.locationName || 'Main Campus'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                <BookOpen size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                No active RSVPs. Register for events to build your schedule!
              </div>
            )}
          </div>
        </div>

        {/* Complaints: My Campus Care */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--warning-red)' }} />
            My Campus Care Tickets
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {complaints.length > 0 ? (
              complaints.map((ticket) => {
                let statusColor = 'var(--primary)';
                let bgStatus = 'rgba(107, 33, 168, 0.1)';
                const st = String(ticket.status).toLowerCase();
                if (st.includes('resolved') || st.includes('complete')) {
                  statusColor = '#10b981';
                  bgStatus = 'rgba(16, 185, 129, 0.1)';
                } else if (st.includes('progress') || st.includes('assigned')) {
                  statusColor = '#d97706';
                  bgStatus = 'rgba(217, 119, 6, 0.1)';
                }

                return (
                  <div key={ticket.id} style={{ padding: '14px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{ticket.title}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        #{ticket.ticketNumber || 'TKT'} • {ticket.category || 'General'}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '3px 8px', borderRadius: '9999px', color: statusColor, background: bgStatus, whiteSpace: 'nowrap' }}>
                      {ticket.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                <ShieldAlert size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                No tickets submitted yet. Campus Care is here to help!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Logout Footer Section */}
      <div className="glass-card" style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Session Actions</span>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log out from this institutional device.</p>
        </div>
        <button 
          onClick={logout} 
          className="btn" 
          style={{ background: 'var(--warning-red)', color: '#fff', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
        >
          <LogOut size={16} />
          <span>Log Out Account</span>
        </button>
      </div>

    </div>
  );
};
