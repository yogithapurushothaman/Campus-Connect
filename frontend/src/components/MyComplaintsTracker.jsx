import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wifi,
  Utensils,
  HelpCircle,
  FileText,
  Calendar,
  Layers
} from 'lucide-react';

export const MyComplaintsTracker = ({ complaints = [], loading = false, onRefresh }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Wi-Fi':
        return <Wifi size={14} />;
      case 'Mess':
        return <Utensils size={14} />;
      case 'Infrastructure':
        return <Building2 size={14} />;
      default:
        return <HelpCircle size={14} />;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('progress')) {
      return {
        background: '#FEF3C7', // Amber/Yellow light
        color: '#D97706',      // Amber/Yellow dark
        border: '1px solid #FDE68A',
        label: 'In Progress',
        icon: <Clock size={12} />,
      };
    } else if (s.includes('resolve')) {
      return {
        background: '#ECFDF5', // Green light
        color: '#10B981',      // Green dark
        border: '1px solid #A7F3D0',
        label: 'Resolved',
        icon: <CheckCircle2 size={12} />,
      };
    } else {
      return {
        background: '#F1F5F9', // Gray light
        color: '#64748B',      // Gray text
        border: '1px solid #E2E8F0',
        label: 'Submitted',
        icon: <AlertCircle size={12} />,
      };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'var(--student-light)',
              color: 'var(--student-accent)',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
              My Complaints Tracker
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Track resolution progress and administrative updates for your submitted tickets.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>
            Total Tickets: {complaints.length}
          </span>
          {onRefresh && (
            <button onClick={onRefresh} className="btn btn-secondary btn-sm" disabled={loading}>
              Refresh
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Clock size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p>Loading your complaint tickets...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <FileText size={36} style={{ color: 'var(--text-subtle)', margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
            No tickets found
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            You have not submitted any complaint tickets yet. Use the form above to raise an issue.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {complaints.map((cmp) => {
            const badge = getStatusBadgeStyle(cmp.status);
            return (
              <div
                key={cmp.id}
                style={{
                  background: '#FFFFFF',
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>
                      #{cmp.ticketNumber || cmp.ticket_number || 'TICKET'}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: '#EEF2FF',
                        color: 'var(--primary)',
                      }}
                    >
                      {getCategoryIcon(cmp.category)}
                      <span>{cmp.category}</span>
                    </span>
                    {cmp.buildingName && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} />
                        <span>{cmp.buildingName} {cmp.roomOrArea ? `(${cmp.roomOrArea})` : ''}</span>
                      </span>
                    )}
                  </div>

                  {/* Visual Status Badge: Gray for Submitted, Yellow for In Progress, Green for Resolved */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: badge.background,
                      color: badge.color,
                      border: badge.border,
                    }}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                    {cmp.title}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.45' }}>
                    {cmp.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-subtle)', borderTop: '1px solid #F1F5F9', paddingTop: '8px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    <span>Submitted: {formatDate(cmp.createdAt || cmp.created_at)}</span>
                  </div>
                  <div>
                    {cmp.assignedTeam && <span>⚙️ Assigned: {cmp.assignedTeam}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
