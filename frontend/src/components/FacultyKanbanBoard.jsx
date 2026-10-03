import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wifi,
  Utensils,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  User,
  Calendar,
  Layers,
  Loader2
} from 'lucide-react';

export const FacultyKanbanBoard = ({ complaints = [], onStatusUpdate, onRefresh }) => {
  const { authFetch } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Wi-Fi':
        return <Wifi size={13} />;
      case 'Mess':
        return <Utensils size={13} />;
      case 'Infrastructure':
        return <Building2 size={13} />;
      default:
        return <HelpCircle size={13} />;
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleMoveStatus = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      const res = await authFetch(`/api/complaints/${complaintId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update ticket status.');
      }

      if (onStatusUpdate) {
        onStatusUpdate(data.complaint);
      }
    } catch (err) {
      alert(`Error updating ticket status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Group complaints by status
  const filteredComplaints = complaints.filter((cmp) => {
    if (filterCategory === 'All') return true;
    return cmp.category === filterCategory;
  });

  const submittedTickets = filteredComplaints.filter((c) => {
    const s = (c.status || '').toLowerCase();
    return s === 'submitted' || s === 'open' || s === 'new';
  });

  const inProgressTickets = filteredComplaints.filter((c) => {
    const s = (c.status || '').toLowerCase();
    return s === 'in progress' || s === 'in_progress' || s === 'assigned' || s === 'acknowledged';
  });

  const resolvedTickets = filteredComplaints.filter((c) => {
    const s = (c.status || '').toLowerCase();
    return s === 'resolved' || s === 'completed' || s === 'closed';
  });

  const renderCard = (cmp) => {
    const isUpdating = updatingId === cmp.id;
    const currentStatus = (cmp.status || '').toLowerCase();

    return (
      <div
        key={cmp.id}
        style={{
          padding: '16px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          position: 'relative',
          opacity: isUpdating ? 0.6 : 1,
          transition: 'all 0.15s ease',
        }}
      >
        {isUpdating && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-card)',
              opacity: 0.8,
              borderRadius: 'var(--radius-md)',
              zIndex: 5,
            }}
          >
            <Loader2 size={22} className="animate-spin" color="var(--primary-purple)" />
          </div>
        )}

        {/* Card Header: Ticket Number & Category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--primary-purple)' }}>
            #{cmp.ticketNumber || cmp.ticket_number || 'TICKET'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: '700',
              background: 'var(--bg-page)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            {getCategoryIcon(cmp.category)}
            <span>{cmp.category}</span>
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h4 style={{ fontSize: '0.925rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', lineHeight: '1.3' }}>
            {cmp.title}
          </h4>
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0,
            }}
          >
            {cmp.description}
          </p>
        </div>

        {/* Metadata: Student, Location, Time */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)', fontWeight: '600' }}>
            <User size={12} color="var(--primary-purple)" />
            <span>{cmp.authorName || cmp.author_name || 'Student'}</span>
          </div>
          {cmp.buildingName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <Building2 size={12} />
              <span>{cmp.buildingName} {cmp.roomOrArea ? `(${cmp.roomOrArea})` : ''}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-subtle)' }}>
            <Calendar size={12} />
            <span>{formatDate(cmp.createdAt || cmp.created_at)}</span>
          </div>
        </div>

        {/* Action Controls to Move Between Columns */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
          {currentStatus === 'submitted' && (
            <>
              <button
                onClick={() => handleMoveStatus(cmp.id, 'In Progress')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.75rem', padding: '6px 8px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.3)', fontWeight: '700' }}
                title="Move ticket to In Progress"
              >
                <span>In Progress</span>
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => handleMoveStatus(cmp.id, 'Resolved')}
                className="btn btn-success btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 8px', fontWeight: '700' }}
                title="Mark ticket as Resolved immediately"
              >
                <CheckCircle2 size={12} />
                <span>Resolve</span>
              </button>
            </>
          )}

          {(currentStatus === 'in progress' || currentStatus === 'in_progress' || currentStatus === 'assigned' || currentStatus === 'acknowledged') && (
            <>
              <button
                onClick={() => handleMoveStatus(cmp.id, 'Submitted')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 8px' }}
                title="Revert to Submitted column"
              >
                <RotateCcw size={12} />
                <span>Submitted</span>
              </button>
              <button
                onClick={() => handleMoveStatus(cmp.id, 'Resolved')}
                className="btn btn-success btn-sm"
                style={{ flex: 1, fontSize: '0.75rem', padding: '6px 8px', fontWeight: '700' }}
                title="Mark ticket as Resolved"
              >
                <CheckCircle2 size={12} />
                <span>Mark Resolved</span>
              </button>
            </>
          )}

          {(currentStatus === 'resolved' || currentStatus === 'completed' || currentStatus === 'closed') && (
            <button
              onClick={() => handleMoveStatus(cmp.id, 'In Progress')}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.75rem', padding: '6px 8px' }}
              title="Re-open ticket to In Progress"
            >
              <RotateCcw size={12} />
              <span>Re-open for Investigation</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Board Header & Category Filter */}
      <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'var(--primary-light)',
              color: 'var(--primary-purple)',
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
              Campus Care Triage Board
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Review, assign, and update resolution states for student campus complaints.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}
            >
              <option value="All">All Categories</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Mess">Mess</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {onRefresh && (
            <button onClick={onRefresh} className="btn btn-secondary btn-sm">
              Refresh Board
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* COLUMN 1: SUBMITTED */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            minHeight: '400px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-subtle)' }}></div>
              <h4 style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)', margin: 0 }}>
                Submitted
              </h4>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                background: 'var(--primary-light)',
                color: 'var(--primary-purple)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
              }}
            >
              {submittedTickets.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {submittedTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                No pending submitted tickets.
              </div>
            ) : (
              submittedTickets.map(renderCard)
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.05)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            minHeight: '400px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
              <h4 style={{ fontWeight: '800', fontSize: '0.95rem', color: '#F59E0B', margin: 0 }}>
                In Progress
              </h4>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#F59E0B',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              {inProgressTickets.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {inProgressTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                No active tickets in progress.
              </div>
            ) : (
              inProgressTickets.map(renderCard)
            )}
          </div>
        </div>

        {/* COLUMN 3: RESOLVED */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            minHeight: '400px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
              <h4 style={{ fontWeight: '800', fontSize: '0.95rem', color: '#10B981', margin: 0 }}>
                Resolved
              </h4>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10B981',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {resolvedTickets.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {resolvedTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                No resolved tickets yet.
              </div>
            ) : (
              resolvedTickets.map(renderCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
