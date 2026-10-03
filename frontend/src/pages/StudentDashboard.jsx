import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MasterAppShell } from '../components/MasterAppShell';
import { RaiseIssueForm } from '../components/RaiseIssueForm';
import { MyComplaintsTracker } from '../components/MyComplaintsTracker';
import { CampusMap } from '../components/CampusMap';
import { StudentProfile } from '../components/StudentProfile';
import { TeamChat } from '../components/TeamChat';
import { ClubDirectory, ClubPage } from '../components/ClubModules';
import {
  Bell,
  Users,
  Calendar,
  MapPin,
  ShieldAlert,
  Sparkles,
  Plus,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Navigation,
  AlertTriangle,
  User,
  Tent,
  Flag
} from 'lucide-react';
import { ReportModal } from '../components/ReportModal';
import { FloatingNexus3D } from '../components/FloatingNexus3D';
import { SegmentedToggle } from '../components/SegmentedToggle';
import confetti from 'canvas-confetti';

export const StudentDashboard = () => {
  const { user, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const [activeView, setActiveView] = useState('hub');
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [rsvpedEvents, setRsvpedEvents] = useState(new Set());

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // Content Reporting States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetType, setReportTargetType] = useState('');
  const [reportTargetId, setReportTargetId] = useState('');

  const handleReportInitiate = (type, id) => {
    setReportTargetType(type);
    setReportTargetId(id);
    setReportModalOpen(true);
  };

  // Team Finder State
  const [teamRequests, setTeamRequests] = useState([]);
  const [teamFinderMode, setTeamFinderMode] = useState('feed');
  const [newTeamReq, setNewTeamReq] = useState({
    title: '',
    category: 'Sports',
    description: '',
    maxMembers: 5
  });
  const [activeChatTeam, setActiveChatTeam] = useState(null);

  // Clubs State
  const [clubs, setClubs] = useState([]);
  const [activeClubId, setActiveClubId] = useState(null);

  // Wayfinding State
  const [startBld, setStartBld] = useState('bld_hostel_b');
  const [destBld, setDestBld] = useState('bld_eng_1');
  const [routeData, setRouteData] = useState(null);

  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const res = await authFetch('/api/complaints/me');
      if (res.ok) {
        const d = await res.json();
        setComplaints(d.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load my complaints:', err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  const loadClubs = async () => {
    try {
      const res = await authFetch('/api/clubs');
      if (res.ok) {
        const d = await res.json();
        setClubs(d.clubs || []);
      }
    } catch (err) {
      console.error('Failed to load clubs:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await authFetch('/api/notifications');
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await authFetch(`/api/notifications/${notifId}/read`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    // Fetch initial data from Python backend
    const loadData = async () => {
      try {
        const [actRes, evRes, cmpRes, ntcRes, teamRes, clubsRes, notifRes] = await Promise.all([
          authFetch('/api/activities'),
          authFetch('/api/events'),
          authFetch('/api/complaints/me'),
          authFetch('/api/notices'),
          authFetch('/api/team-requests'),
          authFetch('/api/clubs'),
          authFetch('/api/notifications'),
        ]);

        if (actRes.ok) {
          const d = await actRes.json();
          setActivities(d.activities || []);
        }
        if (evRes.ok) {
          const d = await evRes.json();
          setEvents(d.events || []);
        }
        if (cmpRes.ok) {
          const d = await cmpRes.json();
          setComplaints(d.complaints || []);
        }
        if (ntcRes.ok) {
          const d = await ntcRes.json();
          setNotices(d.notices || []);
        }
        if (teamRes.ok) {
          const d = await teamRes.json();
          setTeamRequests(d.teamRequests || []);
        }
        if (clubsRes.ok) {
          const d = await clubsRes.json();
          setClubs(d.clubs || []);
        }
        if (notifRes.ok) {
          const d = await notifRes.json();
          setNotifications(d.notifications || []);
        }
      } catch (err) {
        console.error('Data load error:', err);
      }
    };

    loadData();

    // Poll for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRSVP = async (eventTitle, eventId) => {
    try {
      const res = await authFetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
      });
      if (res.ok) {
        setRsvpedEvents((prev) => new Set([...prev, eventId]));
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });
        showToast(`🎉 RSVP Confirmed for "${eventTitle}"!`);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to confirm RSVP.');
      }
    } catch (e) {
      showToast('Error registering RSVP.');
    }
  };

  const handleCreateTeamRequest = async (e) => {
    e.preventDefault();
    if (!newTeamReq.title.trim() || !newTeamReq.description.trim()) {
      showToast('⚠️ Title and description are required.');
      return;
    }
    try {
      const res = await authFetch('/api/team-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeamReq)
      });
      if (res.ok) {
        showToast('🎯 Team matchmaking request posted!');
        setNewTeamReq({ title: '', category: 'Sports', description: '', maxMembers: 5 });
        setTeamFinderMode('feed');
        // Reload requests
        const teamRes = await authFetch('/api/team-requests');
        if (teamRes.ok) {
          const d = await teamRes.json();
          setTeamRequests(d.teamRequests || []);
        }
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create request.');
      }
    } catch (err) {
      showToast('Error creating team request.');
    }
  };

  const handleJoinTeam = async (requestId) => {
    try {
      const res = await authFetch(`/api/team-requests/${requestId}/join`, {
        method: 'POST'
      });
      if (res.ok) {
        const d = await res.json();
        showToast(d.message || '🤝 Join request submitted!');
        // Reload requests
        const teamRes = await authFetch('/api/team-requests');
        if (teamRes.ok) {
          const d = await teamRes.json();
          setTeamRequests(d.teamRequests || []);
        }
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to join team.');
      }
    } catch (err) {
      showToast('Error joining team.');
    }
  };

  const handleToggleClubJoin = async (clubId) => {
    try {
      const res = await authFetch(`/api/clubs/${clubId}/join`, {
        method: 'POST'
      });
      if (res.ok) {
        const d = await res.json();
        showToast(d.message || 'Updated club membership!');
        loadClubs();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update membership.');
      }
    } catch (err) {
      showToast('Error updating club membership.');
    }
  };

  const handleJoinSquad = async (activityId) => {
    try {
      const res = await authFetch(`/api/activities/${activityId}/join`, { method: 'POST' });
      if (res.ok) {
        showToast('🤝 Joined activity squad successfully!');
      }
    } catch (e) {
      showToast('Joined activity squad!');
    }
  };

  const handleComputeRoute = async () => {
    try {
      const res = await authFetch('/api/map/route', {
        method: 'POST',
        body: JSON.stringify({ startBuildingId: startBld, destBuildingId: destBld }),
      });
      if (res.ok) {
        const d = await res.json();
        setRouteData(d.route);
        showToast(`🧭 Route computed: ~${d.route.durationMinutes} mins walk (${d.route.distanceMeters}m)`);
      }
    } catch (e) {
      showToast('Failed to calculate route.');
    }
  };

  const handleComplaintAdded = (newComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    showToast(`🛡️ Ticket #${newComplaint.ticketNumber || 'TKT'} submitted successfully!`);
  };

  if (activeView === 'hub') {
    const latestEvent = events.length > 0 ? events[0] : null;
    const myActiveTeams = teamRequests.filter((req) => {
      const isCreator = req.creatorId === user?.id;
      const isApprovedMember = req.members?.some(
        (m) => m.studentId === user?.id && m.status === 'approved'
      );
      return isCreator || isApprovedMember;
    });

    return (
      <MasterAppShell
        activeNav={activeView}
        onNavChange={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="saas-dashboard-container">
          
          {/* 1. AGENCY HERO SECTION (REFERENCE IMAGE MATCH) */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.25fr 1fr', 
              gap: '36px', 
              alignItems: 'center', 
              padding: '24px 0 36px 0',
              marginBottom: '16px'
            }}
          >
            {/* Left Column: Bold Agency Typography & Dual Pill Switch */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-purple)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'var(--primary-light)', padding: '4px 14px', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
                  SRM Institute of Science & Technology
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  • Main Campus Portal
                </span>
              </div>

              <div>
                <h1 style={{ fontSize: '3.4rem', fontWeight: '900', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.035em', lineHeight: '1.05', textTransform: 'uppercase' }}>
                  YOUR CAMPUS.<br />FULLY UNIFIED.
                </h1>
                <p style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--text-muted)', margin: '14px 0 0 0', lineHeight: '1.55', maxWidth: '520px' }}>
                  Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋. Welcome to the Campus Connect Nexus. A new era of student life and digital connectivity.
                </p>
              </div>

              {/* DUAL PILL TOGGLE + QUICK ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                <SegmentedToggle
                  options={[
                    { id: 'overview', label: 'Overview' },
                    { id: 'feed', label: 'Campus Feed' }
                  ]}
                  activeId={dashboardTab}
                  onChange={(id) => setDashboardTab(id)}
                />

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => { setActiveView('campus_care'); setActiveTab('complaints'); }} 
                    className="btn btn-secondary btn-sm" 
                    style={{ fontWeight: '700', borderRadius: '9999px', padding: '10px 20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    🛡️ Campus Care
                  </button>
                  <button 
                    onClick={() => setActiveView('teams')} 
                    className="btn btn-primary btn-sm" 
                    style={{ background: 'var(--primary-purple)', fontWeight: '700', borderRadius: '9999px', padding: '10px 20px', boxShadow: '0 6px 18px rgba(139,92,246,0.35)' }}
                  >
                    + Find Squad
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Frameless 3D Nexus Floating Freely in Empty Space */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '360px' }}>
              <FloatingNexus3D height="360px" />
            </div>
          </div>

          {/* 2. KPI METRIC SUMMARY CARDS (HORIZONTAL ROW) */}
          <div className="saas-metrics-grid">
            {/* Metric 1: My Active Squads */}
            <div className="saas-metric-card" onClick={() => setActiveView('teams')}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Squads
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                  {myActiveTeams.length}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  ● Hosted or Joined
                </span>
              </div>
              <div style={{ background: 'rgba(107, 33, 168, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary-purple)' }}>
                <Users size={22} />
              </div>
            </div>

            {/* Metric 2: Upcoming Events */}
            <div className="saas-metric-card" onClick={() => setActiveView('events')}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Campus Events
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                  {events.length}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-purple)', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                  Active RSVPs: {rsvpedEvents.size}
                </span>
              </div>
              <div style={{ background: 'rgba(107, 33, 168, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary-purple)' }}>
                <Calendar size={22} />
              </div>
            </div>

            {/* Metric 3: Campus Care Tickets */}
            <div className="saas-metric-card" onClick={() => { setActiveView('campus_care'); setActiveTab('complaints'); }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  My Issues Filed
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                  {complaints.length}
                </div>
                <span style={{ fontSize: '0.75rem', color: complaints.some(c => String(c.status).toLowerCase().includes('pending')) ? '#d97706' : '#10b981', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                  {complaints.some(c => String(c.status).toLowerCase().includes('pending')) ? '● Pending Resolution' : '● All Resolved'}
                </span>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', color: '#ef4444' }}>
                <ShieldAlert size={22} />
              </div>
            </div>

            {/* Metric 4: Clubs & Societies */}
            <div className="saas-metric-card" onClick={() => setActiveView('clubs')}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Clubs
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                  {clubs.length}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                  Tech & Cultural
                </span>
              </div>
              <div style={{ background: 'rgba(107, 33, 168, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary-purple)' }}>
                <Tent size={22} />
              </div>
            </div>
          </div>

          {/* 3. MAIN TWO-COLUMN SPLIT (70% CONTENT LEFT, 30% SIDEBAR RIGHT) */}
          <div className="saas-main-layout">
            
            {/* LEFT MAIN COLUMN (~70%) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {dashboardTab === 'overview' ? (
                <>
                  {/* FEATURED HERO ANNOUNCEMENT BANNER */}
              {latestEvent && (
                <div className="saas-card" style={{ background: 'linear-gradient(135deg, #1f1032 0%, #3b0764 45%, #581c87 100%)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 12px 32px -6px rgba(88, 28, 135, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ padding: '4px 12px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', color: '#e9d5ff', letterSpacing: '0.05em' }}>
                      ⚡ FEATURED CAMPUS FEST
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#c084fc' }} />
                      {latestEvent.venue || 'Auditorium'}
                    </span>
                  </div>

                  <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '8px 0', color: '#ffffff', lineHeight: '1.25' }}>
                      {latestEvent.title}
                    </h2>
                    <p style={{ opacity: '0.88', fontSize: '0.925rem', margin: 0, lineHeight: '1.5' }}>
                      {latestEvent.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#e9d5ff', fontWeight: '600' }}>
                      🔥 Cash Prizes & Awards
                    </span>
                    <button 
                      onClick={() => handleRSVP(latestEvent.title, latestEvent.id)} 
                      className="btn btn-primary btn-sm" 
                      style={{ background: '#ffffff', color: '#581c87', fontWeight: '800', padding: '8px 20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                    >
                      Register Now →
                    </button>
                  </div>
                </div>
              )}

              {/* UPCOMING EVENTS LIST */}
              <div className="saas-card">
                <div className="saas-card-header">
                  <h3 className="saas-card-title">
                    <Calendar size={20} style={{ color: 'var(--primary-purple)' }} />
                    Upcoming Events & Hackathons
                  </h3>
                  <button 
                    onClick={() => setActiveView('events')} 
                    style={{ background: 'none', border: 'none', color: 'var(--primary-purple)', fontWeight: '700', fontSize: '0.825rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    View All ({events.length}) <ArrowRight size={14} />
                  </button>
                </div>

                <div className="saas-list">
                  {events.length > 0 ? (
                    events.slice(0, 4).map((evt) => (
                      <div key={evt.id} className="saas-list-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                          <div style={{ background: 'rgba(107, 33, 168, 0.08)', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-purple)', fontWeight: '800', fontSize: '0.85rem', flexShrink: 0 }}>
                            <Calendar size={18} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: '700', fontSize: '0.925rem', color: 'var(--text-main)' }}>{evt.title}</div>
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span>📍 {evt.venue || evt.locationName || 'Main Campus'}</span>
                              <span>•</span>
                              <span>🏷️ {evt.category}</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRSVP(evt.title, evt.id)} 
                          className="btn btn-secondary btn-sm"
                          style={{ fontWeight: '700', fontSize: '0.75rem', flexShrink: 0 }}
                        >
                          {rsvpedEvents.has(evt.title) ? 'RSVP\'d ✅' : 'RSVP'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                      No upcoming campus events.
                    </div>
                  )}
                </div>
              </div>

              {/* MY ACTIVE SQUADS & TEAM MATCHMAKING FEED */}
              <div className="saas-card">
                <div className="saas-card-header">
                  <h3 className="saas-card-title">
                    <Users size={20} style={{ color: 'var(--primary-purple)' }} />
                    Team Finder & Active Squads
                  </h3>
                  <button 
                    onClick={() => setTeamFinderMode(teamFinderMode === 'feed' ? 'create' : 'feed')} 
                    className="btn btn-primary btn-sm"
                    style={{ background: 'var(--primary-purple)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {teamFinderMode === 'feed' ? <><Plus size={14} /> Post Request</> : 'View Feed'}
                  </button>
                </div>

                {teamFinderMode === 'feed' ? (
                  <div className="saas-list">
                    {teamRequests.length > 0 ? (
                      teamRequests.slice(0, 3).map((req) => {
                        const isCreator = req.creatorId === user?.id;
                        const userMember = req.members?.find(m => m.studentId === user?.id);
                        const approvedMembers = req.members?.filter(m => m.status === 'approved') || [];
                        const approvedCount = approvedMembers.length;
                        const isApproved = isCreator || (userMember && userMember.status === 'approved');
                        
                        let categoryEmoji = '🏀';
                        if (req.category === 'Academics') categoryEmoji = '📚';
                        if (req.category === 'Gaming') categoryEmoji = '🎮';

                        return (
                          <div key={req.id} className="saas-list-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{categoryEmoji}</span>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {req.title}
                                </div>
                                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  By {req.creatorName} • 👥 {approvedCount}/{req.maxMembers} filled • <span style={{ color: 'var(--primary-purple)', fontWeight: '600' }}>{req.category}</span>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              {isApproved ? (
                                <button 
                                  onClick={() => { setActiveChatTeam(req); setActiveView('team_chat'); }} 
                                  className="btn btn-primary btn-sm"
                                  style={{ background: 'var(--primary-purple)', fontSize: '0.75rem' }}
                                >
                                  💬 Open Chat
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleJoinTeam(req.id)} 
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.75rem', fontWeight: '700' }}
                                >
                                  Join Team
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        No team requests posted yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleCreateTeamRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Need Goalkeeper for 5v5" 
                          value={newTeamReq.title}
                          onChange={(e) => setNewTeamReq(prev => ({ ...prev, title: e.target.value }))}
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Category</label>
                        <select 
                          value={newTeamReq.category}
                          onChange={(e) => setNewTeamReq(prev => ({ ...prev, category: e.target.value }))}
                          className="form-select"
                          style={{ padding: '8px 12px' }}
                        >
                          <option value="Sports">Sports</option>
                          <option value="Academics">Academics</option>
                          <option value="Gaming">Gaming</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Description</label>
                      <textarea 
                        placeholder="Describe what you are looking for..." 
                        value={newTeamReq.description}
                        onChange={(e) => setNewTeamReq(prev => ({ ...prev, description: e.target.value }))}
                        className="form-textarea"
                        rows={2}
                        style={{ padding: '8px 12px', resize: 'none' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', margin: 0 }}>Max Members:</label>
                        <input 
                          type="number" 
                          min={2} 
                          max={20}
                          value={newTeamReq.maxMembers}
                          onChange={(e) => setNewTeamReq(prev => ({ ...prev, maxMembers: e.target.value }))}
                          className="form-input"
                          style={{ width: '70px', padding: '4px 8px', textAlign: 'center' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={() => setTeamFinderMode('feed')} className="btn btn-secondary btn-sm">
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-sm" style={{ background: 'var(--primary-purple)' }}>
                          Post Request
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* OFFICIAL NOTICES SECTION */}
              <div className="saas-card">
                <div className="saas-card-header">
                  <h3 className="saas-card-title">
                    <Bell size={20} style={{ color: 'var(--warning-red)' }} />
                    Official Notices & Announcements
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Office of Student Affairs
                  </span>
                </div>

                <div className="saas-list">
                  {notices.length > 0 ? (
                    notices.slice(0, 3).map((notice) => (
                      <div key={notice.id} className="saas-list-row">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--warning-red)', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: '1', marginTop: '2px' }}>•</span>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{notice.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>{notice.content}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                      No official announcements posted today.
                    </div>
                  )}
                </div>
              </div>

                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* CAMPUS FEED LIVE UPDATES */}
                  <div className="saas-card">
                    <div className="saas-card-header">
                      <h3 className="saas-card-title">
                        <Bell size={20} style={{ color: 'var(--primary-purple)' }} />
                        Live Campus Activity Feed
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '9999px' }}>
                        ● Real-time Updates
                      </span>
                    </div>

                    <div className="saas-list">
                      {activities && activities.length > 0 ? (
                        activities.map((act) => (
                          <div key={act.id} className="saas-list-row" style={{ alignItems: 'flex-start', padding: '16px' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-purple)', fontWeight: '800', flexShrink: 0 }}>
                              <Sparkles size={20} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                                  {act.user || act.authorName || 'Campus Community Member'}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {act.timestamp || act.timeAgo || 'Just now'}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 8px 0', lineHeight: '1.45' }}>
                                {act.description || act.content || act.message || 'Updated campus activity.'}
                              </p>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-purple)', background: 'var(--primary-light)', padding: '2px 10px', borderRadius: '6px' }}>
                                  #{act.category || 'CampusNotice'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <p style={{ fontSize: '0.9rem', margin: 0 }}>No recent activity in the live feed.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR PANEL (~30%) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* MINI CAMPUS MAP CARD */}
              <div className="saas-card" style={{ backgroundImage: 'radial-gradient(var(--border-color) 1.5px, transparent 1.5px)', backgroundColor: 'var(--bg-card)', backgroundSize: '20px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(107, 33, 168, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary-purple)' }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Campus Map</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wayfinding & Locations</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: '1.45' }}>
                  Locate hostels, food courts, library zones, and academic blocks in real time.
                </p>

                <button 
                  onClick={() => setActiveView('map')} 
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', marginTop: '6px' }}
                >
                  <span>Interactive Map</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* QUICK ACCESS LINKS */}
              <div className="saas-card">
                <h3 className="saas-card-title" style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  ⚡ Quick Access
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => { setActiveView('clubs'); setActiveClubId(null); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Tent size={18} style={{ color: 'var(--primary-purple)' }} />
                      <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-main)' }}>Clubs & Societies</span>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  <button 
                    onClick={() => setActiveView('profile')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <User size={18} style={{ color: 'var(--primary-purple)' }} />
                      <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-main)' }}>My Profile & RSVPs</span>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>

              {/* RECENT NOTIFICATIONS PANEL */}
              <div className="saas-card">
                <div className="saas-card-header" style={{ paddingBottom: '10px' }}>
                  <h3 className="saas-card-title" style={{ fontSize: '1rem' }}>
                    <Bell size={18} style={{ color: 'var(--primary-purple)' }} />
                    Notifications
                  </h3>
                  {notifications.some(n => !n.isRead) && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-purple)', fontWeight: '700', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '9999px' }}>
                      {notifications.filter(n => !n.isRead).length} new
                    </span>
                  )}
                </div>

                <div className="saas-list">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 3).map((notif) => (
                      <div key={notif.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: notif.isRead ? 'var(--text-subtle)' : 'var(--primary-purple)', marginTop: '6px', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-main)', fontWeight: notif.isRead ? '400' : '600', lineHeight: '1.35' }}>
                            {notif.message}
                          </p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px', display: 'block' }}>
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.825rem' }}>
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Floating Toast */}
          {toastMsg && (
            <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1E202A', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
              {toastMsg}
            </div>
          )}
        </div>
      </MasterAppShell>
    );
  }

  if (activeView === 'map') {
    return (
      <MasterAppShell activeNav={activeView} onNavChange={setActiveView} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => setActiveView('hub')} 
            className="btn btn-secondary btn-sm" 
            style={{ alignSelf: 'flex-start', fontWeight: '700' }}
          >
            ← Back to Hub
          </button>
          <CampusMap />
        </div>
      </MasterAppShell>
    );
  }

  if (activeView === 'profile') {
    return (
      <MasterAppShell activeNav={activeView} onNavChange={setActiveView} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => setActiveView('hub')} 
            className="btn btn-secondary btn-sm" 
            style={{ alignSelf: 'flex-start', fontWeight: '700' }}
          >
            ← Back to Hub
          </button>
          <StudentProfile />
        </div>
      </MasterAppShell>
    );
  }

  if (activeView === 'team_chat') {
    return (
      <MasterAppShell activeNav={activeView} onNavChange={setActiveView} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => { setActiveView('hub'); setActiveChatTeam(null); }} 
            className="btn btn-secondary btn-sm" 
            style={{ alignSelf: 'flex-start', fontWeight: '700' }}
          >
            ← Back to Hub
          </button>
          <TeamChat 
            teamRequest={activeChatTeam} 
            currentUser={user} 
            authFetch={authFetch} 
            onBack={() => { setActiveView('hub'); setActiveChatTeam(null); }} 
          />
        </div>
      </MasterAppShell>
    );
  }

  if (activeView === 'teams') {
    return (
      <MasterAppShell activeNav={activeView} onNavChange={setActiveView} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setActiveView('hub')} className="btn btn-secondary btn-sm" style={{ fontWeight: '700' }}>
              ← Back to Hub
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Team Finder & Matchmaking</h2>
          </div>
          <div className="bento-card" style={{ padding: '28px' }}>
            {teamFinderMode === 'feed' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={22} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Team Finder Feed</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Match with teammates for hackathons, sports & study</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setTeamFinderMode('create')} 
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                  >
                    <Plus size={15} />
                    <span>+ New Request</span>
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {teamRequests.length > 0 ? (
                    teamRequests.map((req) => {
                      const isCreator = req.creatorId === user?.id;
                      const userMember = req.members?.find(m => m.studentId === user?.id);
                      const approvedMembers = req.members?.filter(m => m.status === 'approved') || [];
                      const approvedCount = approvedMembers.length;
                      const isApproved = isCreator || (userMember && userMember.status === 'approved');

                      return (
                        <div key={req.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{req.title}</span>
                              <span style={{ fontSize: '0.725rem', padding: '2px 10px', borderRadius: '9999px', background: '#e2e8f0', color: '#475569', fontWeight: '700' }}>{req.category}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>{req.description}</p>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: '600' }}>
                              By {req.creatorName} • 👥 {approvedCount} / {req.maxMembers} filled
                            </div>
                          </div>
                          <div>
                            {isApproved ? (
                              <button onClick={() => { setActiveChatTeam(req); setActiveView('team_chat'); }} className="btn btn-primary btn-sm">
                                💬 Open Chat
                              </button>
                            ) : (
                              <button onClick={() => handleJoinTeam(req.id)} className="btn btn-primary btn-sm">
                                Join Team
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No active team finder requests. Be the first to post one!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateTeamRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Create Team Request</h3>
                  <button type="button" onClick={() => setTeamFinderMode('feed')} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Title</label>
                    <input type="text" placeholder="e.g. Need Goalkeeper for 5v5" value={newTeamReq.title} onChange={(e) => setNewTeamReq(prev => ({ ...prev, title: e.target.value }))} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Category</label>
                    <select value={newTeamReq.category} onChange={(e) => setNewTeamReq(prev => ({ ...prev, category: e.target.value }))} className="form-select">
                      <option value="Sports">Sports</option>
                      <option value="Academics">Academics</option>
                      <option value="Gaming">Gaming</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea placeholder="Describe team details..." value={newTeamReq.description} onChange={(e) => setNewTeamReq(prev => ({ ...prev, description: e.target.value }))} className="form-textarea" rows={3} required />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
                  Post Request
                </button>
              </form>
            )}
          </div>
        </div>
      </MasterAppShell>
    );
  }

  if (activeView === 'campus_care') {
    return (
      <MasterAppShell activeNav={activeView} onNavChange={setActiveView} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setActiveView('hub')} className="btn btn-secondary btn-sm" style={{ fontWeight: '700' }}>
              ← Back to Hub
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Campus Care & Support</h2>
          </div>
          <div className="grid-2">
            <RaiseIssueForm onComplaintAdded={handleComplaintAdded} />
            <MyComplaintsTracker complaints={complaints} loading={complaintsLoading} onReportInitiate={handleReportInitiate} />
          </div>
        </div>
      </MasterAppShell>
    );
  }

  if (activeView === 'events') {
    return (
      <MasterAppShell activeNav={activeView} onNavChange={setActiveView} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setActiveView('hub')} className="btn btn-secondary btn-sm" style={{ fontWeight: '700' }}>
              ← Back to Hub
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Campus Events & Hackathons</h2>
          </div>
          <div className="grid-3">
            {events.map((ev) => (
              <div key={ev.id} className="bento-card" style={{ padding: '24px', gap: '14px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--srm-blue)', background: 'var(--srm-blue-light)', padding: '4px 10px', borderRadius: '9999px', alignSelf: 'flex-start' }}>
                  {ev.category?.toUpperCase() || 'EVENT'}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{ev.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{ev.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>📍 {ev.venue || 'Main Campus'}</span>
                  <button onClick={() => handleRSVP(ev.title, ev.id)} className="btn btn-primary btn-sm">
                    {rsvpedEvents.has(ev.id) ? '✅ Confirmed' : 'Register'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MasterAppShell>
    );
  }

  if (activeView === 'clubs') {
    const selectedClub = clubs.find(c => c.id === activeClubId);
    return (
      <MasterAppShell activeNav={activeView} onNavChange={setActiveView} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        {activeClubId && selectedClub ? (
          <ClubPage 
            club={selectedClub} 
            currentUser={user} 
            onToggleJoin={handleToggleClubJoin} 
            onReportInitiate={handleReportInitiate}
            onBack={() => setActiveClubId(null)} 
          />
        ) : (
          <ClubDirectory 
            clubs={clubs} 
            onSelectClub={(id) => setActiveClubId(id)} 
            onBack={() => setActiveView('hub')} 
          />
        )}
      </MasterAppShell>
    );
  }

  return (
    <MasterAppShell activeNav={activeView} onNavChange={setActiveView} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Student Welcome Banner */}
        <div className="portal-hero hero-student">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700', marginBottom: '10px' }}>
                <Sparkles size={14} />
                <span>STUDENT PORTAL • CONNECTED TO PYTHON BACKEND</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '4px' }}>
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                {user?.department} • ID: {user?.studentOrFacultyId || 'STU-2024-CS-042'} • ⚡ Karma: {user?.karmaPoints || 185} pts • Reliability: {user?.reliabilityScore || 96}%
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('complaints')}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--primary)', fontWeight: '700' }}
              >
                <Plus size={16} />
                <span>Raise Campus Issue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShieldAlert size={16} />
            <span>Campus Care</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`btn btn-sm ${activeTab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users size={16} />
            <span>Activity Squads</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`btn btn-sm ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Calendar size={16} />
            <span>Events & Fests</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`btn btn-sm ${activeTab === 'map' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <MapPin size={16} />
            <span>Campus Map & Routing</span>
          </button>
        </div>

        {/* TAB 1: CAMPUS CARE (COMPLAINTS) */}
        {activeTab === 'complaints' && (
          <section>
            {/* 1. Raise an Issue Form */}
            <RaiseIssueForm onComplaintSubmitted={handleComplaintAdded} />

            {/* 2. My Complaints Tracker Component */}
            <MyComplaintsTracker
              complaints={complaints}
              loading={complaintsLoading}
              onRefresh={loadComplaints}
            />
          </section>
        )}

        {/* TAB 2: ACTIVITIES */}
        {activeTab === 'activities' && (
          <section>
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid var(--primary)', background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.7) 0%, #FFFFFF 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    🤖 AI Smart Matchmaker
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Evening Football 5v5 Friendly Match</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Matches your active sports profile and interest in Football</p>
                </div>
                <span className="status-pill status-accepted">96% Compatibility</span>
              </div>
            </div>

            <div className="grid-3">
              {activities.map((act) => (
                <div key={act.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="status-pill status-submitted">{act.category}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                        👥 {act.participants?.length || 1} / {act.maxParticipants || 6}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>{act.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>{act.description}</p>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                      <div>📍 {act.locationName}</div>
                      <div>⏰ {act.date} • {act.time}</div>
                    </div>
                  </div>

                  <button onClick={() => handleJoinSquad(act.id)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    Join Squad
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: EVENTS */}
        {activeTab === 'events' && (
          <section>
            <div className="grid-3">
              {events.map((ev) => (
                <div key={ev.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <img src={ev.bannerImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80"} alt="Banner" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span className="status-pill status-acknowledged">{ev.category}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.department}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '6px' }}>{ev.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>{ev.description}</p>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                        <div>📅 {ev.date}</div>
                        <div>📍 {ev.locationName}</div>
                        <div>👨‍🏫 By {ev.author?.name || 'Faculty'}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRSVP(ev.title, ev.id)}
                      className={`btn btn-sm ${rsvpedEvents.has(ev.id) ? 'btn-success' : 'btn-primary'}`}
                      style={{ width: '100%' }}
                    >
                      {rsvpedEvents.has(ev.id) ? '✅ RSVP Confirmed' : '🎉 RSVP Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: MAP & ROUTING */}
        {activeTab === 'map' && (
          <section className="grid-2">
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>🚶 Campus Wayfinding Calculator</h3>
              
              <div className="form-group">
                <label className="form-label">Start Point:</label>
                <select value={startBld} onChange={(e) => setStartBld(e.target.value)} className="form-select">
                  <option value="bld_hostel_b">Aryabhata Boys Residence Hall (HST-B1)</option>
                  <option value="bld_hostel_g">Kalpana Chawla Girls Residence Hall (HST-G1)</option>
                  <option value="bld_food_1">Student Center & Food Court (FC-01)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destination:</label>
                <select value={destBld} onChange={(e) => setDestBld(e.target.value)} className="form-select">
                  <option value="bld_eng_1">Alan Turing Computer Science Block (CS-01)</option>
                  <option value="bld_lib_1">Central Library (LIB-01)</option>
                  <option value="bld_sports_1">Major Dhyan Chand Sports Complex (SPT-01)</option>
                </select>
              </div>

              <button onClick={handleComputeRoute} className="btn btn-primary" style={{ width: '100%' }}>
                <Navigation size={16} />
                <span>Calculate Walking Route</span>
              </button>

              {routeData && (
                <div style={{ marginTop: '20px', background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', marginBottom: '10px' }}>
                    <span>🚶 Distance: {routeData.distanceMeters}m</span>
                    <span>⏱️ ETA: ~{routeData.durationMinutes} mins</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {routeData.steps.map((s, idx) => (
                      <div key={idx}><strong>{idx + 1}.</strong> {s}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗺️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>2D Interactive Campus Layout</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Integrated pedestrian promenade waypoints covering Alan Turing CS Block, Central Library, Sports Arena, and Residence Halls.
              </p>
            </div>
          </section>
        )}

        {/* Floating Toast */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1E202A', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
            {toastMsg}
          </div>
        )}

        {/* Report Content Modal */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          contentType={reportTargetType}
          contentId={reportTargetId}
          onSuccess={() => showToast('🚨 Content reported successfully. Faculty will review it.')}
        />
      </div>
    </MasterAppShell>
  );
};
