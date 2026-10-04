import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, X, Loader2, Flag } from 'lucide-react';

export const ReportModal = ({ isOpen, onClose, contentType, contentId, onSuccess }) => {
  const { authFetch } = useAuth();
  const [reason, setReason] = useState('Spam');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await authFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      fontFamily: 'Outfit'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Flag size={20} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Report Content
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Help us keep COVAL safe. Let us know what is wrong with this {contentType === 'team_request' ? 'Team Request' : 'Club Update'}.
        </p>

        {errorMsg && (
          <div style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Reason for Report</label>
            <select
              className="form-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="Spam">Spam / Duplicate Content</option>
              <option value="Harassment">Harassment / Bullying</option>
              <option value="Irrelevant">Irrelevant / Inappropriate Content</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isSubmitting}
              style={{ minWidth: '120px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
