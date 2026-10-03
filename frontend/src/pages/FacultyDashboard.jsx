import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MasterAppShell } from '../components/MasterAppShell';
import { FacultyKanbanBoard } from '../components/FacultyKanbanBoard';
import { AdminHeatmap } from '../components/AdminHeatmap';
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
  ShieldAlert,
  MapPin
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');

  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reports, setReports] = useState([]);

  // New Event Form State
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evDate, setEvDate] = useState('Dec 15, 2026 • 10:00 AM');
  const [evCategory, setEvCategory] = useState('Workshop');
  const [evLocation, setEvLocation] = useState('Alan Turing Computer Science Block');

  // New Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

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

  const loadReports = async () => {
    try {
      const res = await authFetch('/api/admin/reports');
      if (res.ok) {
        const d = await res.json();
        setReports(d.reports || []);
      }
    } catch (err) {
      console.error('Faculty load reports error:', err);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      const res = await authFetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        showToast(action === 'dismiss' ? '✅ Report dismissed.' : '🚨 Offending content taken down successfully.');
        loadReports();
        loadData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to perform action.');
      }
    } catch (err) {
      showToast('Error performing moderation action.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'moderation') {
      loadReports();
    }
  }, [activeTab]);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
        }),
      });

      if (res.ok) {
        setNoticeTitle('');
        setNoticeContent('');
        showToast('📢 Official Notice posted successfully!');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to post notice.');
      }
    } catch (err) {
      showToast('Error posting notice.');
    }
  };

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
          venue: evLocation,
          locationName: evLocation,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setEvents((prev) => [d.event, ...prev]);
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
    <MasterAppShell activeNav={activeTab} onNavChange={setActiveTab}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
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
              <button onClick={() => setActiveTab('events')} className="btn btn-secondary btn-sm" style={{ color: 'var(--faculty-accent)', fontWeight: '700' }}>
                <Plus size={16} />
                <span>Publish Official Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-faculty' : 'btn-secondary'}`}
          >
            <ShieldAlert size={16} />
            <span>Campus Care</span>
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`btn btn-sm ${activeTab === 'notices' ? 'btn-faculty' : 'btn-secondary'}`}
          >
            <Send size={16} />
            <span>Post Notice</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`btn btn-sm ${activeTab === 'events' ? 'btn-faculty' : 'btn-secondary'}`}
          >
            <Calendar size={16} />
            <span>Create Event</span>
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`btn btn-sm ${activeTab === 'clubs' ? 'btn-faculty' : 'btn-secondary'}`}
          >
            <Briefcase size={16} />
            <span>Club Advisor Workbench</span>
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`btn btn-sm ${activeTab === 'heatmap' ? 'btn-faculty' : 'btn-secondary'}`}
          >
            <MapPin size={16} />
            <span>Issues Heatmap</span>
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`btn btn-sm ${activeTab === 'moderation' ? 'btn-faculty' : 'btn-secondary'}`}
          >
            <ShieldAlert size={16} />
            <span>Moderation Queue</span>
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

        {/* TAB 2: POST NOTICE */}
        {activeTab === 'notices' && (
          <section style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} style={{ color: 'var(--faculty-accent)' }} />
                <span>Post Official Campus Notice</span>
              </h3>
              <form onSubmit={handleCreateNotice}>
                <div className="form-group">
                  <label className="form-label">Notice Title:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Urgent: Final Exam Registration Deadline"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Content:</label>
                  <textarea
                    className="form-textarea"
                    rows="5"
                    placeholder="Provide details about the announcement..."
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-faculty" style={{ width: '100%', marginTop: '8px' }}>
                  Publish Notice
                </button>
              </form>
            </div>
          </section>
        )}

        {/* TAB 3: CREATE EVENT */}
        {activeTab === 'events' && (
          <section style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--faculty-accent)' }} />
                <span>Create Official Campus Event</span>
              </h3>
              <form onSubmit={handleCreateEvent}>
                <div className="form-group">
                  <label className="form-label">Event Title:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SRM CSE Department: Annual Tech Hackathon"
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
                    placeholder="Provide details about the event..."
                    value={evDesc}
                    onChange={(e) => setEvDesc(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-faculty" style={{ width: '100%', marginTop: '8px' }}>
                  Publish Event
                </button>
              </form>
            </div>
          </section>
        )}

        {/* TAB 4: CLUB ADVISOR WORKBENCH */}
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

        {/* TAB 5: CAMPUS ISSUES HEATMAP */}
        {activeTab === 'heatmap' && (
          <section>
            <AdminHeatmap />
          </section>
        )}

        {/* TAB 6: TRUST & SAFETY MODERATION QUEUE */}
        {activeTab === 'moderation' && (
          <section>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} style={{ color: 'var(--warning-red)' }} />
                <span>Trust & Safety Moderation Queue</span>
              </h3>
              
              {reports.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Moderation queue is empty. Excellent job!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reports.map((report) => (
                    <div key={report.id} style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>
                          Reported {report.contentType === 'team_request' ? 'Team Request' : 'Club Update'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Reporter: <strong>{report.reporterName}</strong> • Reason: <span style={{ color: 'var(--warning-red)', fontWeight: '700' }}>{report.reason}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                          Content ID: <code>{report.contentId}</code>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleReportAction(report.id, 'dismiss')} className="btn btn-secondary btn-sm" style={{ fontWeight: '700' }}>
                          Dismiss
                        </button>
                        <button onClick={() => handleReportAction(report.id, 'takedown')} className="btn btn-danger btn-sm" style={{ fontWeight: '700' }}>
                          Take Down
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Floating Toast */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1E202A', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
            {toastMsg}
          </div>
        )}

        </div>
    </MasterAppShell>
  );
};
