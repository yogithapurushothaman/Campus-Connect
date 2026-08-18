import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { FacultyKanbanBoard } from '../components/FacultyKanbanBoard';
import {
  Briefcase,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Send,
  Users,
  ShieldAlert
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');

  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [complaints, setComplaints] = useState([]);

  // New Event Form State
  const [showEventModal, setShowEventModal] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evDate, setEvDate] = useState('Dec 15, 2026 • 10:00 AM');
  const [evCategory, setEvCategory] = useState('Workshop');
  const [evLocation, setEvLocation] = useState('Alan Turing Computer Science Block');

  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    try {
      const [evRes, clbRes, cmpRes] = await Promise.all([
        authFetch('/api/events'),
        authFetch('/api/clubs'),
        authFetch('/api/complaints'),
      ]);

      if (evRes.ok) {
        const d = await evRes.json();
        setEvents(d.events || []);
      }
      if (clbRes.ok) {
        const d = await clbRes.json();
        setClubs(d.clubs || []);
      }
      if (cmpRes.ok) {
        const d = await cmpRes.json();
        setComplaints(d.complaints || []);
      }
    } catch (err) {
      console.error('Faculty load data error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title: evTitle,
          description: evDesc,
          date: evDate,
          category: evCategory,
          locationName: evLocation,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setEvents((prev) => [d.event, ...prev]);
        setShowEventModal(false);
        setEvTitle('');
        setEvDesc('');
        showToast('🎓 Official Event published successfully to all students!');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to publish event.');
      }
    } catch (e) {
      showToast('Error publishing event.');
    }
  };

  const handleApplicantDecision = async (clubId, applicantId, status) => {
    try {
      const res = await authFetch(`/api/clubs/${clubId}/applicants/${applicantId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`✅ Applicant status updated to "${status}".`);
        loadData();
      }
    } catch (e) {
      showToast('Failed to update applicant status.');
    }
  };

  const handleStatusUpdated = (updatedComplaint) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c))
    );
    showToast(`🛡️ Ticket #${updatedComplaint.ticketNumber} moved to "${updatedComplaint.status}".`);
  };

  return (
    <>
      <Navbar />
      <main className="main-container">
        
        {/* Faculty Command Center Banner */}
        <div className="portal-hero hero-faculty">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700', marginBottom: '10px' }}>
                <ShieldCheck size={14} />
                <span>FACULTY COMMAND CENTER • RBAC AUTHORIZED</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '4px' }}>
                Welcome, {user?.name || 'Faculty Member'}
              </h1>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                {user?.designation} • {user?.department} • ID: {user?.studentOrFacultyId || 'FAC-CS-104'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowEventModal(true)} className="btn btn-secondary btn-sm" style={{ color: 'var(--faculty-accent)', fontWeight: '700' }}>
                <Plus size={16} />
                <span>Publish Official Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-faculty' : 'btn-secondary'}`}
          >
            <ShieldAlert size={16} />
            <span>Campus Care Triage Board</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`btn btn-sm ${activeTab === 'events' ? 'btn-faculty' : 'btn-secondary'}`}
          >
            <Calendar size={16} />
            <span>Official Events ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`btn btn-sm ${activeTab === 'clubs' ? 'btn-faculty' : 'btn-secondary'}`}
          >
            <Briefcase size={16} />
            <span>Club Advisor Workbench</span>
          </button>
        </div>

        {/* TAB 1: CAMPUS CARE KANBAN TRIAGE */}
        {activeTab === 'complaints' && (
          <section>
            <FacultyKanbanBoard
              complaints={complaints}
              onStatusUpdate={handleStatusUpdated}
              onRefresh={loadData}
            />
          </section>
        )}

        {/* TAB 2: EVENTS WORKSPACE */}
        {activeTab === 'events' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Official Campus Events & Hackathons</h3>
              <button onClick={() => setShowEventModal(true)} className="btn btn-faculty btn-sm">
                <Plus size={16} />
                <span>New Event</span>
              </button>
            </div>

            <div className="grid-3">
              {events.map((ev) => (
                <div key={ev.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="status-pill status-acknowledged">{ev.category}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{ev.department}</span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '6px' }}>{ev.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>{ev.description}</p>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📅 {ev.date}</div>
                      <div>📍 {ev.locationName}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Published by: {ev.author?.name || user?.name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: CLUB ADVISOR WORKBENCH */}
        {activeTab === 'clubs' && (
          <section>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>👨‍🏫 Student Club Recruitment Applications</h3>
              
              {clubs.flatMap(c => (c.recruitment?.applicants || []).map(a => ({ ...a, clubName: c.name, clubId: c.id }))).length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No pending student applications.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {clubs.flatMap(c => (c.recruitment?.applicants || []).map(a => ({ ...a, clubName: c.name, clubId: c.id }))).map((app) => (
                    <div key={app.id} style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '1rem' }}>{app.userName} — <span style={{ color: 'var(--faculty-accent)' }}>{app.roleApplied}</span></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Club: <strong>{app.clubName}</strong> • {app.userEmail} • {app.userYear}</div>
                        <div style={{ fontSize: '0.85rem', marginTop: '6px', color: 'var(--text-main)' }}>"{app.whyJoin}"</div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleApplicantDecision(app.clubId, app.id, 'accepted')} className="btn btn-success btn-sm">
                          <CheckCircle2 size={14} />
                          <span>Approve</span>
                        </button>
                        <button onClick={() => handleApplicantDecision(app.clubId, app.id, 'rejected')} className="btn btn-danger btn-sm">
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Publish Event Modal */}
        {showEventModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
            <div className="glass-card" style={{ maxWidth: 500, width: '100%', padding: 24, background: '#fff' }}>
              <h3 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: 16 }}>🎓 Publish Official Campus Event</h3>
              <form onSubmit={handleCreateEvent}>
                <div className="form-group">
                  <label className="form-label">Event Title:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. AI & Cloud Hackathon 2026"
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category:</label>
                  <select value={evCategory} onChange={(e) => setEvCategory(e.target.value)} className="form-select">
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Cultural Fest">Cultural Fest</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Venue / Location:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={evLocation}
                    onChange={(e) => setEvLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description:</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={evDesc}
                    onChange={(e) => setEvDesc(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                  <button type="button" onClick={() => setShowEventModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-faculty btn-sm">Publish Event</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating Toast */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1E202A', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
            {toastMsg}
          </div>
        )}

      </main>
    </>
  );
};
