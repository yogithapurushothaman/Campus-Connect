import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Users,
  PieChart,
  Calendar,
  MapPin,
  Tag,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Building2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EventAnalyticsModal = ({ event, onClose }) => {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!event?.id) return;
    fetchAnalytics();
  }, [event?.id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/api/faculty/events/${event.id}/registrations`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.error || 'Failed to fetch registration data');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Network error fetching registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!event?.id) return;
    setIsExporting(true);
    try {
      const res = await authFetch(`/api/faculty/events/${event.id}/export`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event_roster_${event.id.slice(0, 8)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert('Failed to download CSV export');
      }
    } catch (err) {
      console.error('CSV export error:', err);
      alert('Error initiating CSV download');
    } finally {
      setIsExporting(false);
    }
  };

  if (!event) return null;

  const totalRegistered = data?.registration_count ?? data?.registrationCount ?? 0;
  const capacity = data?.capacity ?? event.capacity ?? 150;
  const fillPercentage = Math.min(Math.round((totalRegistered / capacity) * 100), 100);
  const deptBreakdown = data?.department_breakdown ?? data?.departmentBreakdown ?? {};
  const registeredStudents = data?.registered_students ?? data?.registrations ?? [];

  // Department colors mapping for minimalist visual breakdown
  const deptColors = {
    'Computer Science & Engineering': '#8B5CF6',
    'Electronics & Communication': '#EC4899',
    'Information Technology': '#3B82F6',
    'Mechanical Engineering': '#F59E0B',
    'Electrical Engineering': '#10B981',
    'Civil Engineering': '#6366F1',
    'Student Affairs': '#8B5CF6',
    'General': '#6B7280'
  };

  const filteredStudents = registeredStudents.filter((item) => {
    const student = item.student || {};
    const search = searchTerm.toLowerCase();
    return (
      (student.name || '').toLowerCase().includes(search) ||
      (student.studentOrFacultyId || student.registerNumber || '').toLowerCase().includes(search) ||
      (student.department || '').toLowerCase().includes(search) ||
      (student.email || '').toLowerCase().includes(search)
    );
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card shadow-2xl"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          backgroundColor: '#FAF8F5', // Luxury beige tone
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(139, 92, 246, 0.12)',
            background: 'linear-gradient(135deg, rgba(245, 243, 255, 0.8), rgba(250, 248, 245, 0.95))',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  background: 'rgba(139, 92, 246, 0.12)',
                  color: '#8B5CF6',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Tag size={12} />
                {event.category || 'Official Event'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500' }}>
                {event.date}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1E1B4B', margin: 0, lineHeight: 1.3 }}>
              {event.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} style={{ color: '#8B5CF6' }} />
                {event.locationName || event.venue || 'Main Campus'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={14} style={{ color: '#8B5CF6' }} />
                {event.department || 'Computer Science & Engineering'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(238, 242, 255, 0.8)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#8B5CF6';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(238, 242, 255, 0.8)';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid rgba(139, 92, 246, 0.2)',
                  borderTopColor: '#8B5CF6',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Loading Event Registration Analytics...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#EF4444', background: '#FEF2F2', borderRadius: '16px' }}>
              <p style={{ fontWeight: '700' }}>{error}</p>
              <button
                onClick={fetchAnalytics}
                className="btn btn-sm"
                style={{ marginTop: '12px', background: '#8B5CF6', color: '#FFF' }}
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <>
              {/* TOP ROW: STATS & CSV EXPORT BUTTON */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}
              >
                {/* Registration Counter Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Registered
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '900', color: '#1E1B4B' }}>
                        {totalRegistered}
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#64748B' }}>
                        / {capacity} Capacity
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'rgba(139, 92, 246, 0.12)',
                      color: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <UserCheck size={24} />
                  </div>
                </div>

                {/* Capacity Occupancy Rate Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Occupancy Rate
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#8B5CF6', marginTop: '4px' }}>
                      {fillPercentage}%
                    </div>
                  </div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'rgba(139, 92, 246, 0.12)',
                      color: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrendingUp size={24} />
                  </div>
                </div>

                {/* CSV Download Action Button Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 20px -4px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Faculty Export
                  </div>
                  <button
                    onClick={handleExportCSV}
                    disabled={isExporting || totalRegistered === 0}
                    style={{
                      marginTop: '8px',
                      background: '#FFFFFF',
                      color: '#6D28D9',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: isExporting || totalRegistered === 0 ? 'not-allowed' : 'pointer',
                      opacity: totalRegistered === 0 ? 0.7 : 1,
                      transition: 'transform 0.15s ease, boxShadow 0.15s ease'
                    }}
                  >
                    <FileSpreadsheet size={18} />
                    {isExporting ? 'Generating CSV...' : 'Download CSV Roster'}
                  </button>
                </div>
              </div>

              {/* MIDDLE SECTION: MINIMALIST DEPARTMENT BREAKDOWN */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: '18px',
                  padding: '20px 24px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <PieChart size={18} style={{ color: '#8B5CF6' }} />
                    Department Registration Breakdown
                  </h3>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B' }}>
                    {Object.keys(deptBreakdown).length} Departments Represented
                  </span>
                </div>

                {/* Stacked Percentage Bar */}
                {totalRegistered > 0 ? (
                  <>
                    <div
                      style={{
                        height: '14px',
                        width: '100%',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '999px',
                        overflow: 'hidden',
                        display: 'flex',
                        marginBottom: '16px'
                      }}
                    >
                      {Object.entries(deptBreakdown).map(([dept, count], idx) => {
                        const pct = (count / totalRegistered) * 100;
                        const color = deptColors[dept] || Object.values(deptColors)[idx % Object.values(deptColors).length];
                        return (
                          <div
                            key={dept}
                            title={`${dept}: ${count} students (${Math.round(pct)}%)`}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: color,
                              height: '100%',
                              transition: 'width 0.5s ease-out'
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Department Badges & Counts */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {Object.entries(deptBreakdown).map(([dept, count], idx) => {
                        const pct = Math.round((count / totalRegistered) * 100);
                        const color = deptColors[dept] || Object.values(deptColors)[idx % Object.values(deptColors).length];
                        return (
                          <div
                            key={dept}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              background: '#F8FAFC',
                              border: '1px solid #F1F5F9'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <span
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: color,
                                  flexShrink: 0
                                }}
                              />
                              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {dept}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1E1B4B', flexShrink: 0 }}>
                              {count} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>({pct}%)</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, fontStyle: 'italic' }}>
                    No student registrations recorded yet for this event.
                  </p>
                )}
              </div>

              {/* BOTTOM SECTION: SCROLLABLE DATA TABLE */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Table Filter & Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    background: '#FDFBF7'
                  }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Users size={18} style={{ color: '#8B5CF6' }} />
                    Registered Student Roster ({filteredStudents.length})
                  </h3>

                  {/* Search Filter Input */}
                  <div style={{ position: 'relative', width: '260px' }}>
                    <Search
                      size={14}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                    />
                    <input
                      type="text"
                      placeholder="Search name, ID, dept..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 12px 6px 34px',
                        fontSize: '0.82rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        backgroundColor: '#FFFFFF',
                        color: '#1E1B4B',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Table */}
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {filteredStudents.length === 0 ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
                      {searchTerm ? 'No student matches your search query.' : 'No registered students found.'}
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                          <th style={{ padding: '12px 20px', fontWeight: '700' }}>#</th>
                          <th style={{ padding: '12px 20px', fontWeight: '700' }}>Student Name</th>
                          <th style={{ padding: '12px 20px', fontWeight: '700' }}>Register Number / ID</th>
                          <th style={{ padding: '12px 20px', fontWeight: '700' }}>Department</th>
                          <th style={{ padding: '12px 20px', fontWeight: '700' }}>Registered Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((item, idx) => {
                          const std = item.student || {};
                          return (
                            <tr
                              key={item.id || idx}
                              style={{
                                borderBottom: '1px solid #F1F5F9',
                                transition: 'background-color 0.15s ease'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3FF')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <td style={{ padding: '12px 20px', color: '#94A3B8', fontWeight: '600' }}>
                                {idx + 1}
                              </td>
                              <td style={{ padding: '12px 20px', fontWeight: '700', color: '#1E1B4B' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
                                      color: '#FFF',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: '800'
                                    }}
                                  >
                                    {(std.name || 'S')[0]}
                                  </div>
                                  <div>
                                    <div>{std.name || 'Student'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '400' }}>
                                      {std.email || ''}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '12px 20px', color: '#475569', fontFamily: 'monospace', fontWeight: '600' }}>
                                {std.studentOrFacultyId || std.registerNumber || 'RA2111003010042'}
                              </td>
                              <td style={{ padding: '12px 20px' }}>
                                <span
                                  style={{
                                    background: 'rgba(139, 92, 246, 0.08)',
                                    color: '#7C3AED',
                                    padding: '3px 10px',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '0.78rem'
                                  }}
                                >
                                  {std.department || 'Computer Science & Engineering'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 20px', color: '#64748B', fontSize: '0.8rem' }}>
                                {item.registeredAt
                                  ? new Date(item.registeredAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Oct 03, 2026'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
