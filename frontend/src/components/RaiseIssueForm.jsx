import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  Send,
  CheckCircle2,
  Wifi,
  Building2,
  Utensils,
  HelpCircle,
  Loader2
} from 'lucide-react';

export const RaiseIssueForm = ({ onComplaintSubmitted }) => {
  const { authFetch } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [description, setDescription] = useState('');
  const [buildingName, setBuildingName] = useState('Engineering Block A');
  const [roomOrArea, setRoomOrArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Wi-Fi':
        return <Wifi size={16} />;
      case 'Mess':
        return <Utensils size={16} />;
      case 'Infrastructure':
        return <Building2 size={16} />;
      default:
        return <HelpCircle size={16} />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide both a title and description for the issue.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await authFetch('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          buildingName: buildingName.trim() || 'General Campus Area',
          roomOrArea: roomOrArea.trim() || 'General Area',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint.');
      }

      setSuccessMsg(`Ticket #${data.complaint?.ticketNumber || 'Submitted'} raised successfully!`);
      setTitle('');
      setDescription('');
      setRoomOrArea('');

      if (onComplaintSubmitted) {
        onComplaintSubmitted(data.complaint);
      }

      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div
          style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertCircle size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Raise a Campus Issue
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Submit tickets for rapid triage and maintenance by facilities, network cell, or mess supervisors.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            background: 'var(--success-light)',
            color: 'var(--success)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Issue Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Wi-Fi router disconnection in Lab 304"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category *</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                style={{ paddingLeft: '38px' }}
              >
                <option value="Infrastructure">Infrastructure (Water, Electricity, AC)</option>
                <option value="Wi-Fi">Wi-Fi (Hostel/Lab Internet)</option>
                <option value="Mess">Mess (Food, Hygiene, Dining)</option>
                <option value="Other">Other (General Amenities)</option>
              </select>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getCategoryIcon(category)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Campus Building / Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alan Turing CS Block, Hostel B"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Room or Specific Area</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Room 304 / 2nd Floor Dining"
              value={roomOrArea}
              onChange={(e) => setRoomOrArea(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Detailed Description *</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Describe the issue in detail (when it started, exact location, symptoms)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ minWidth: '160px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
