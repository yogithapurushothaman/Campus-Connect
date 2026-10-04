import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MasterAppShell } from '../components/MasterAppShell';
import { FacultyKanbanBoard } from '../components/FacultyKanbanBoard';
import { AdminHeatmap } from '../components/AdminHeatmap';
import { FloatingNexus3D } from '../components/FloatingNexus3D';
import { SegmentedToggle } from '../components/SegmentedToggle';
import { EventAnalyticsModal } from '../components/EventAnalyticsModal';
import { CreateEventModal } from '../components/CreateEventModal';
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
  MapPin,
  FileSpreadsheet,
  BarChart2,
  Download,
  UserCheck,
  PieChart,
  Tag
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const [viewToggle, setViewToggle] = useState('overview');

  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedEventForAnalytics, setSelectedEventForAnalytics] = useState(null);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);

  // New Event Form State
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evDate, setEvDate] = useState('Dec 15, 2026 • 10:00 AM');
  const [evCategory, setEvCategory] = useState('Workshop');
  const [evScope, setEvScope] = useState('INTERNAL');
  const [evLocation, setEvLocation] = useState('Alan Turing Computer Science Block');
  const [evCapacity, setEvCapacity] = useState(150);
  const [evExternalLink, setEvExternalLink] = useState('');
  const [evHostInstitution, setEvHostInstitution] = useState('');

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
          scope: evScope,
          venue: evScope === 'EXTERNAL' ? evHostInstitution || 'External Host' : evLocation,
          locationName: evScope === 'EXTERNAL' ? evHostInstitution || 'External Host' : evLocation,
          capacity: evScope === 'EXTERNAL' ? 1000 : Number(evCapacity),
          externalLink: evExternalLink,
          hostInstitution: evHostInstitution,
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

  const handleExportEventCSV = async (eventId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await authFetch(`/api/faculty/events/${eventId}/export`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event_roster_${eventId.slice(0, 8)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        showToast('📄 Registration CSV Roster downloaded!');
      } else {
        showToast('Failed to export CSV roster.');
      }
    } catch (err) {
      showToast('Error downloading CSV export.');
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
        
        {/* TOP AGENCY HERO SECTION (SYNCED WITH STUDENT DASHBOARD) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'center', minHeight: '380px', padding: '20px 0 30px 0' }}>
          {/* Left Column: Headline, Description & Dual Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-purple)', background: 'var(--primary-light)', padding: '6px 16px', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
                SRM INSTITUTE OF SCIENCE & TECHNOLOGY
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: '600' }}>
                • Faculty Command Portal
              </span>
            </div>

            <div>
              <h1 style={{ fontSize: '3.4rem', fontWeight: '900', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.035em', lineHeight: '1.05', textTransform: 'uppercase' }}>
                FACULTY COMMAND CENTER.
              </h1>
              <p style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--text-muted)', margin: '14px 0 0 0', lineHeight: '1.55', maxWidth: '520px' }}>
                Welcome back. Manage student requests, publish official events, and oversee community activity.
              </p>
            </div>

            {/* DUAL PILL TOGGLE + QUICK ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
              <SegmentedToggle
                options={[
                  { id: 'overview', label: 'Overview' },
                  { id: 'feed', label: 'Faculty Feed' }
                ]}
                activeId={viewToggle}
                onChange={(id) => setViewToggle(id)}
              />

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={() => setActiveTab('complaints')} 
                  className="btn btn-secondary btn-sm" 
                  style={{ fontWeight: '700', borderRadius: '9999px', padding: '10px 20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                >
                  🛡️ Student Requests
                </button>
                <button 
                  onClick={() => setCreateEventModalOpen(true)} 
                  className="btn btn-primary btn-sm" 
                  style={{ background: 'var(--primary-purple)', fontWeight: '700', borderRadius: '9999px', padding: '10px 20px', boxShadow: '0 6px 18px rgba(139,92,246,0.35)' }}
                >
                  + Publish Event
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Frameless 3D Nexus Floating Freely in Empty Space */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '360px' }}>
            <FloatingNexus3D height="360px" />
          </div>
        </div>

        {/* KPI METRIC SUMMARY CARDS (HORIZONTAL ROW MATCHING STUDENT PORTAL) */}
        <div className="saas-metrics-grid">
          <div className="saas-metric-card" onClick={() => setActiveTab('complaints')}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Care Tickets
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                {complaints.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                ● Active Triage
              </span>
            </div>
            <div style={{ background: 'rgba(107, 33, 168, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary-purple)' }}>
              <ShieldAlert size={22} />
            </div>
          </div>

          <div className="saas-metric-card" onClick={() => setActiveTab('events')}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Published Events
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                {events.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-purple)', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                Official Fests
              </span>
            </div>
            <div style={{ background: 'rgba(107, 33, 168, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary-purple)' }}>
              <Calendar size={22} />
            </div>
          </div>

          <div className="saas-metric-card" onClick={() => setActiveTab('clubs')}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Clubs Advised
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                {clubs.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                ● Active Societies
              </span>
            </div>
            <div style={{ background: 'rgba(107, 33, 168, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary-purple)' }}>
              <Briefcase size={22} />
            </div>
          </div>

          <div className="saas-metric-card" onClick={() => setActiveTab('moderation')}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Moderation Reports
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                {reports.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                Flagged Queue
              </span>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', color: '#ef4444' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>

        {/* SUB NAVIGATION TAB BAR */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', margin: '12px 0 24px 0' }}>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShieldAlert size={16} />
            <span>Student Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`btn btn-sm ${activeTab === 'notices' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Send size={16} />
            <span>Post Notice</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`btn btn-sm ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Calendar size={16} />
            <span>Create Event</span>
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`btn btn-sm ${activeTab === 'clubs' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Briefcase size={16} />
            <span>Club Advisor Workbench</span>
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`btn btn-sm ${activeTab === 'heatmap' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <MapPin size={16} />
            <span>Issues Heatmap</span>
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`btn btn-sm ${activeTab === 'moderation' ? 'btn-primary' : 'btn-secondary'}`}
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

        {/* TAB 3: MANAGE EVENTS & REGISTRATION TRACKING */}
        {activeTab === 'events' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* MANAGE EVENTS DASHBOARD GRID */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={22} style={{ color: 'var(--primary-purple)' }} />
                    <span>Manage Events & Registration Analytics</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Track live student registrations, view department breakdown analytics, and download official attendance rosters.
                  </p>
                </div>
                <button
                  onClick={() => setCreateEventModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ background: 'var(--primary-purple)', fontWeight: '800', borderRadius: '12px', padding: '10px 20px', boxShadow: '0 6px 18px rgba(139,92,246,0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>+ Create Event</span>
                </button>
              </div>

              {events.length === 0 ? (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No campus events created yet. Use the form below to publish an official event.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {events.map((ev) => {
                    const regCount = ev.registration_count ?? ev.registrationCount ?? ev.rsvpsCount ?? 0;
                    const cap = ev.capacity || 150;
                    const pct = Math.min(Math.round((regCount / cap) * 100), 100);

                    return (
                      <div
                        key={ev.id}
                        className="glass-card shadow-sm"
                        style={{
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '16px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.2s ease, boxShadow 0.2s ease'
                        }}
                      >
                        {/* Event Category & Title */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  background: 'rgba(139, 92, 246, 0.12)',
                                  color: 'var(--primary-purple)',
                                  padding: '4px 10px',
                                  borderRadius: '10px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em'
                                }}
                              >
                                {ev.category || 'Official Event'}
                              </span>
                              {ev.scope === 'EXTERNAL' ? (
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '3px 8px', borderRadius: '9999px' }}>
                                  🌐 External
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', background: 'rgba(100, 116, 139, 0.12)', border: '1px solid var(--border-color)', padding: '3px 8px', borderRadius: '9999px' }}>
                                  🏫 Campus
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: '500' }}>
                              {ev.date}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                            {ev.title}
                          </h4>
                          
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {ev.description}
                          </p>
                        </div>

                        {/* PROMINENT "Total Registered: X / Y (Capacity)" BADGE & PROGRESS BAR */}
                        <div
                          style={{
                            background: 'rgba(139, 92, 246, 0.06)',
                            border: '1px solid rgba(139, 92, 246, 0.18)',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedEventForAnalytics(ev)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <UserCheck size={16} />
                              Total Registered: {regCount} / {cap} (Capacity)
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-subtle)' }}>
                              {pct}%
                            </span>
                          </div>

                          {/* Mini Occupancy Bar */}
                          <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(139, 92, 246, 0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                backgroundColor: 'var(--primary-purple)',
                                borderRadius: '999px',
                                transition: 'width 0.4s ease'
                              }}
                            />
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button
                            onClick={() => setSelectedEventForAnalytics(ev)}
                            className="btn btn-primary btn-sm"
                            style={{
                              flex: 1,
                              background: 'var(--primary-purple)',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              boxShadow: '0 4px 12px rgba(139,92,246,0.25)'
                            }}
                          >
                            <BarChart2 size={15} />
                            <span>View Analytics & Roster</span>
                          </button>

                          <button
                            onClick={(e) => handleExportEventCSV(ev.id, e)}
                            className="btn btn-secondary btn-sm"
                            title="Download CSV Roster"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '10px',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            <FileSpreadsheet size={15} style={{ color: 'var(--primary-purple)' }} />
                            <span>CSV</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CREATE NEW EVENT FORM */}
            <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto', width: '100%', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: 'var(--faculty-accent)' }} />
                <span>Publish New Official Event</span>
              </h3>

              {/* Scope Split Flow Pill Toggle */}
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                <SegmentedToggle
                  options={[
                    { id: 'INTERNAL', label: '🏫 Internal Campus Event' },
                    { id: 'EXTERNAL', label: '🌐 External Opportunity' }
                  ]}
                  activeId={evScope}
                  onChange={(id) => setEvScope(id)}
                />
              </div>

              <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Event Title:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SRM National AI & Cloud Hackathon 2026"
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Category:</label>
                    <select value={evCategory} onChange={(e) => setEvCategory(e.target.value)} className="form-select">
                      <option value="Hackathon">Hackathon</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Cultural Fest">Cultural Fest</option>
                      <option value="Others">Others</option>
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
                </div>

                {/* DYNAMIC FORM FIELDS BASED ON SCOPE */}
                {evScope === 'INTERNAL' ? (
                  /* INTERNAL CAMPUS EVENT FIELDS */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '14px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <div className="form-group">
                      <label className="form-label">Physical Campus Venue:</label>
                      <select
                        value={evLocation}
                        onChange={(e) => setEvLocation(e.target.value)}
                        className="form-select"
                      >
                        <option value="Alan Turing Computer Science Block">Alan Turing Computer Science Block</option>
                        <option value="Main Campus Auditorium">Main Campus Auditorium</option>
                        <option value="Central Library Digital Sandbox">Central Library Digital Sandbox</option>
                        <option value="Major Dhyan Chand Sports Complex Arena">Major Dhyan Chand Sports Complex Arena</option>
                        <option value="Tech Park Seminar Hall 302">Tech Park Seminar Hall 302</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Maximum Capacity:</label>
                      <input
                        type="number"
                        className="form-input"
                        value={evCapacity}
                        onChange={(e) => setEvCapacity(e.target.value)}
                        min="10"
                        max="10000"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  /* EXTERNAL OPPORTUNITY FIELDS */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '14px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <div className="form-group">
                      <label className="form-label">External Registration Link:</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://smartindiahackathon.gov.in"
                        value={evExternalLink}
                        onChange={(e) => setEvExternalLink(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Host Institution / College:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Ministry of Education / IIT Madras"
                        value={evHostInstitution}
                        onChange={(e) => setEvHostInstitution(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Description:</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Provide event details, rules, problem statements..."
                    value={evDesc}
                    onChange={(e) => setEvDesc(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-faculty" style={{ width: '100%', marginTop: '4px', fontWeight: '800' }}>
                  ✨ Publish Official Event Now
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

        {/* Create Event Modal */}
        <CreateEventModal
          isOpen={createEventModalOpen}
          onClose={() => setCreateEventModalOpen(false)}
          onSubmitSuccess={(newEvent) => {
            setEvents((prev) => [newEvent, ...prev]);
            showToast('🎓 Official Event published successfully to all students!');
          }}
        />

        {/* Event Analytics Modal */}
        {selectedEventForAnalytics && (
          <EventAnalyticsModal
            event={selectedEventForAnalytics}
            onClose={() => setSelectedEventForAnalytics(null)}
          />
        )}

        </div>
    </MasterAppShell>
  );
};
