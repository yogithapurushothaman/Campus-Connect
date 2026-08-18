import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { user, isFaculty, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to={user ? (isFaculty ? '/faculty-dashboard' : '/student-dashboard') : '/'} className="brand-logo">
        <GraduationCap className="w-7 h-7 text-indigo-600" style={{ color: 'var(--primary)', width: 28, height: 28 }} />
        <span>Campus<span style={{ color: 'var(--primary)' }}>Connect</span></span>
        {user && (
          <span className={`brand-badge ${isFaculty ? 'badge-faculty' : 'badge-student'}`}>
            {isFaculty ? 'Faculty Portal' : 'Student Portal'}
          </span>
        )}
      </Link>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt="Avatar"
              style={{ width: 36, height: 36, borderRadius: '9999px', objectFit: 'cover', border: '2px solid var(--border-color)' }}
            />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.designation || user.department}</div>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login/student" className="btn btn-secondary btn-sm">
            Student Login
          </Link>
          <Link to="/login/faculty" className="btn btn-primary btn-sm">
            Faculty Login
          </Link>
        </div>
      )}
    </header>
  );
};
