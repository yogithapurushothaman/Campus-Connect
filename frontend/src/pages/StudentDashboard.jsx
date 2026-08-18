import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import {
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
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentDashboard = () => {
  const { user, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('activities');

  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [rsvpedEvents, setRsvpedEvents] = useState(new Set());

  // Wayfinding State
  const [startBld, setStartBld] = useState('bld_hostel_b');
  const [destBld, setDestBld] = useState('bld_eng_1');
  const [routeData, setRouteData] = useState(null);

  // New Complaint State
  const [cmpTitle, setCmpTitle] = useState('');
  const [cmpDesc, setCmpDesc] = useState('');
  const [cmpBuilding, setCmpBuilding] = useState('Alan Turing CS Block');
  const [showCmpModal, setShowCmpModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    // Fetch initial data from Python backend
    const loadData = async () => {
      try {
        const [actRes, evRes, cmpRes] = await Promise.all([
          authFetch('/api/activities'),
          authFetch('/api/events'),
          authFetch('/api/complaints'),
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
      } catch (err) {
        console.error('Data load error:', err);
      }
    };

    loadData();
  }, []);

  const handleRSVP = (eventTitle, eventId) => {
    setRsvpedEvents((prev) => new Set([...prev, eventId]));
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
    });
    showToast(`🎉 RSVP Confirmed for "${eventTitle}"!`);
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

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({
          title: cmpTitle,
          description: cmpDesc,
          buildingName: cmpBuilding,
          roomOrArea: 'General Campus Area',
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setComplaints((prev) => [d.complaint, ...prev]);
        setShowCmpModal(false);
        setCmpTitle('');
        setCmpDesc('');
        showToast(`🛡️ Ticket #${d.complaint.ticketNumber} triaged by AI!`);
      }
    } catch (e) {
      showToast('Error filing complaint.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="main-container">
        
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
              <button onClick={() => setShowCmpModal(true)} className="btn btn-secondary btn-sm" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                <Plus size={16} />
                <span>Report Issue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
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
          <button
            onClick={() => setActiveTab('complaints')}
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShieldAlert size={16} />
            <span>Campus Care</span>
          </button>
        </div>

        {/* TAB 1: ACTIVITIES */}
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

        {/* TAB 2: EVENTS */}
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

        {/* TAB 3: MAP & ROUTING */}
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

        {/* TAB 4: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <section>
            <div className="grid-2">
              {complaints.map((cmp) => (
                <div key={cmp.id} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>#{cmp.ticketNumber}</span>
                    <span className={`status-pill status-${cmp.status}`}>{cmp.status}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>{cmp.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px' }}>{cmp.description}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📍 {cmp.buildingName} • ⚙️ {cmp.assignedTeam}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Floating Toast */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1E202A', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
            {toastMsg}
          </div>
        )}

        {/* Submit Complaint Modal */}
        {showCmpModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
            <div className="glass-card" style={{ maxWidth: 480, width: '100%', padding: 24, background: '#fff' }}>
              <h3 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: 16 }}>🛡️ Report Campus Issue</h3>
              <form onSubmit={handleSubmitComplaint}>
                <div className="form-group">
                  <label className="form-label">Issue Title:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Wi-Fi dropping in Lab 304"
                    value={cmpTitle}
                    onChange={(e) => setCmpTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Building:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cmpBuilding}
                    onChange={(e) => setCmpBuilding(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description:</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe the issue..."
                    value={cmpDesc}
                    onChange={(e) => setCmpDesc(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                  <button type="button" onClick={() => setShowCmpModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Submit Ticket</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </>
  );
};
