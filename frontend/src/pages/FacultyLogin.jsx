import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, ArrowLeft, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const FacultyLogin = () => {
  const [email, setEmail] = useState('prof.vikram@college.edu');
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
      await login(email, password, 'FACULTY');
      navigate('/faculty-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your faculty credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail('prof.vikram@college.edu');
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

          <div className="glass-card" style={{ padding: '32px', borderTop: '4px solid var(--faculty-accent)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-md)', background: 'var(--faculty-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <img src="/coval_logo.png" alt="COVAL Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>Faculty & Staff Login</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Authorized access for college professors, HODs, & advisors</p>
            </div>

            {/* Quick Demo Fill Chip */}
            <div style={{ background: '#F8FAFC', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Demo: <strong>prof.vikram@college.edu</strong>
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
                <label className="form-label">Faculty Email (@college.edu / @*.edu):</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. prof.vikram@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                className="btn btn-faculty"
                style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '0.95rem' }}
                disabled={submitting}
              >
                {submitting ? 'Verifying Faculty Credentials...' : 'Sign In as Faculty'}
                {!submitting && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Are you a student? <Link to="/login/student" style={{ color: 'var(--student-accent)', fontWeight: '700', textDecoration: 'none' }}>Student Login</Link>
            </div>

          </div>
        </div>
      </main>
    </>
  );
};
