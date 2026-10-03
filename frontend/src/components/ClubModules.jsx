import React from 'react';
import { ArrowLeft, Flag } from 'lucide-react';

export const ClubDirectory = ({ clubs, onSelectClub, onBack }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header with back to hub */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            onClick={onBack} 
            className="btn btn-secondary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '12px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Hub</span>
          </button>
          <h1 className="bento-header-title" style={{ fontSize: '2.2rem', margin: 0 }}>Clubs & Communities</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Discover and join student-run clubs, interest groups, and technical societies.
          </p>
        </div>
      </div>

      {/* Grid of available clubs */}
      {clubs.length > 0 ? (
        <div className="grid-3">
          {clubs.map((club) => {
            // Count approved members
            const memberCount = club.members?.length || club.memberCount || 0;
            return (
              <div 
                key={club.id} 
                className="glass-card glass-card-interactive" 
                onClick={() => onSelectClub(club.id)}
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 10px', 
                        borderRadius: '9999px', 
                        background: 'rgba(107, 33, 168, 0.1)', 
                        color: 'var(--primary)', 
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}
                    >
                      {club.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      👥 {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
                    {club.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {club.description}
                  </p>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>View Details</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No campus clubs registered yet.
        </div>
      )}
    </div>
  );
};

export const ClubPage = ({ club, currentUser, onToggleJoin, onReportInitiate, onBack }) => {
  const isMember = club.members?.some(m => m.studentId === currentUser.id);
  const memberCount = club.members?.length || club.memberCount || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Back button */}
      <div>
        <button 
          onClick={onBack} 
          className="btn btn-secondary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>
      </div>

      {/* Main Club Card Detail */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflow: 'hidden' }}>
        {/* Cover Accent Banner */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'linear-gradient(90deg, var(--primary) 0%, #4f46e5 100%)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span 
              style={{ 
                display: 'inline-block', 
                fontSize: '0.75rem', 
                padding: '4px 10px', 
                borderRadius: '9999px', 
                background: 'rgba(107, 33, 168, 0.1)', 
                color: 'var(--primary)', 
                fontWeight: '700',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              {club.category}
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', lineHeight: '1.2' }}>
              {club.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', marginTop: '6px' }}>
              {club.tagLine || "Active Campus Organization"}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
              👥 {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
            </span>
            <button 
              onClick={() => onToggleJoin(club.id)} 
              className={`btn ${isMember ? 'btn-success' : 'btn-primary'}`}
              style={{ padding: '10px 24px', fontWeight: '700' }}
            >
              {isMember ? 'Joined ✅' : 'Join Club'}
            </button>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

        {/* Description Section */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>About the Club</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            {club.description}
          </p>
        </div>

        {/* Club Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {club.leadName && (
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Club Leader
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{club.leadName}</div>
              {club.leadEmail && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{club.leadEmail}</div>}
            </div>
          )}

          {club.facultyAdvisor && (
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
                 Faculty Advisor
               </div>
               <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{club.facultyAdvisor.name}</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{club.facultyAdvisor.email}</div>
            </div>
          )}
        </div>

        {/* Announcements / Updates Section */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
            📢 Club Announcements & Updates
          </h3>
          {club.announcements && club.announcements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {club.announcements.map((ann) => (
                <div key={ann.id} className="glass-card" style={{ padding: '16px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(107, 33, 168, 0.1)', color: '#6b21a8', fontWeight: '700' }}>
                        {ann.badge || 'Update'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-main)' }}>{ann.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>{ann.content}</p>
                  </div>
                  
                  {/* Flag Icon */}
                  <button
                    onClick={() => onReportInitiate('club_update', ann.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px',
                      borderRadius: '50%',
                      transition: 'background 0.2s'
                    }}
                    title="Report announcement"
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <Flag size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
              No announcements posted by this club yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
