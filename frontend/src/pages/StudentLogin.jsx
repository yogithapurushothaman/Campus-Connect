import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowLeft, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const StudentLogin = () => {
  const [email, setEmail] = useState('ananya@campus.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password, 'STUDENT');
      navigate('/student-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail('ananya@campus.edu');
    setPassword('password123');
  };

  return (
    <>
      <Navbar />
      <main className="main-container" style={{ justifyContent: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: '460px', width: '100%', margin: '0 auto' }}>
          
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '16px', fontWeight: '600' }}>
            <ArrowLeft size={16} />
            <span>Back to Portal Selection</span>
          </Link>

          <div className="glass-card" style={{ padding: '32px', borderTop: '4px solid var(--student-accent)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-md)', background: 'var(--student-light)', color: 'var(--student-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <GraduationCap size={28} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>Student Login</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in with your official student email address</p>
            </div>

            {/* Quick Demo Fill Chip */}
            <div style={{ background: '#F8FAFC', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Demo: <strong>ananya@campus.edu</strong>
              </div>
              <button type="button" onClick={fillDemo} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                Fill Demo
              </button>
            </div>

            {error && (
              <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Student Email (@*.edu / @campus.edu):</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. ananya@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password:</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', background: 'var(--student-accent)', marginTop: '8px', fontSize: '0.95rem' }}
                disabled={submitting}
              >
                {submitting ? 'Authenticating...' : 'Sign In as Student'}
                {!submitting && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Are you a faculty advisor? <Link to="/login/faculty" style={{ color: 'var(--faculty-accent)', fontWeight: '700', textDecoration: 'none' }}>Faculty Login</Link>
            </div>

          </div>
        </div>
      </main>
    </>
  );
};
