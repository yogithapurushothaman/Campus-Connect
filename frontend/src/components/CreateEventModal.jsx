import React, { useState } from 'react';
import { X, Calendar, MapPin, ExternalLink, Building2, Users, Sparkles } from 'lucide-react';
import { SegmentedToggle } from './SegmentedToggle';

export const CreateEventModal = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [scope, setScope] = useState('INTERNAL'); // 'INTERNAL' | 'EXTERNAL'
  
  // Shared fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('Nov 20, 2026 • 10:00 AM');
  const [category, setCategory] = useState('Hackathon');
  
  // Internal fields
  const [venue, setVenue] = useState('Alan Turing Computer Science Block');
  const [capacity, setCapacity] = useState(150);
  
  // External fields
  const [externalLink, setExternalLink] = useState('');
  const [hostInstitution, setHostInstitution] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      description,
      date,
      category,
      scope,
      ...(scope === 'INTERNAL'
        ? { venue, locationName: venue, capacity: Number(capacity) }
        : { externalLink, hostInstitution, venue: hostInstitution || 'External Host', locationName: hostInstitution || 'External Host' })
    };

    try {
      const res = await fetch('/api/faculty/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        onSubmitSuccess(data.event);
        onClose();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to publish event');
      }
    } catch (e) {
      setError('Network error publishing event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: '#FAF7F2',
        borderRadius: '20px',
        padding: '28px',
        maxWidth: '620px',
        width: '100%',
        border: '1px solid var(--border-color)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} style={{ color: '#8B5CF6' }} />
              Publish Official Campus Event
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
              Faculty post • Verified immediately & bypasses community reporting queue
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. Split Flow Scope Toggle */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <SegmentedToggle
            options={[
              { id: 'INTERNAL', label: '🏫 Internal Campus Event' },
              { id: 'EXTERNAL', label: '🌐 External Opportunity' }
            ]}
            activeId={scope}
            onChange={(id) => setScope(id)}
          />
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Shared Title */}
          <div>
            <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Event Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input"
              placeholder="e.g. SRM National AI & Cloud Hackathon 2026"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
            />
          </div>

          {/* Shared Category & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Cultural Fest">Cultural Fest</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Date & Time:</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="form-input"
                placeholder="e.g. Nov 20, 2026 • 10:00 AM"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
              />
            </div>
          </div>

          {/* Shared Description */}
          <div>
            <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="form-textarea"
              placeholder="Provide event details, eligibility, problem statements..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
            />
          </div>

          {/* DYNAMIC FORM FIELDS BASED ON SCOPE */}
          {scope === 'INTERNAL' ? (
            /* INTERNAL CAMPUS EVENT FIELDS */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '14px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: '#8B5CF6' }} />
                  Physical Campus Venue:
                </label>
                <select
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="form-select"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                >
                  <option value="Alan Turing Computer Science Block">Alan Turing Computer Science Block</option>
                  <option value="Main Campus Auditorium">Main Campus Auditorium</option>
                  <option value="Central Library Digital Sandbox">Central Library Digital Sandbox</option>
                  <option value="Major Dhyan Chand Sports Complex Arena">Major Dhyan Chand Sports Complex Arena</option>
                  <option value="Tech Park Seminar Hall 302">Tech Park Seminar Hall 302</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} style={{ color: '#8B5CF6' }} />
                  Maximum Capacity:
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  min={10}
                  max={10000}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                />
              </div>
            </div>
          ) : (
            /* EXTERNAL OPPORTUNITY FIELDS */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '14px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ExternalLink size={14} style={{ color: '#8B5CF6' }} />
                  External Registration Link:
                </label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  required
                  className="form-input"
                  placeholder="https://smartindiahackathon.gov.in"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} style={{ color: '#8B5CF6' }} />
                  Host Institution / College:
                </label>
                <input
                  type="text"
                  value={hostInstitution}
                  onChange={(e) => setHostInstitution(e.target.value)}
                  required
                  className="form-input"
                  placeholder="e.g. Ministry of Education / IIT Madras"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontWeight: '700', borderRadius: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ background: '#8B5CF6', color: '#FFFFFF', fontWeight: '800', borderRadius: '12px', padding: '10px 24px', boxShadow: '0 6px 18px rgba(139,92,246,0.35)' }}
            >
              {loading ? 'Publishing...' : '✨ Publish Event Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
