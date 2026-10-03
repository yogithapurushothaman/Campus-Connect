import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, ShieldCheck, UserCheck, Sparkles, Bell, AlertTriangle, Users } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const { user, isFaculty, logout, authFetch } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await authFetch('/api/notifications');
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await authFetch(`/api/notifications/${notifId}/read`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar" style={{ zIndex: 1000 }}>
      <Link to={user ? (isFaculty ? '/faculty-dashboard' : '/student-dashboard') : '/'} className="brand-logo">
        <GraduationCap className="w-7 h-7 text-indigo-600" style={{ color: 'var(--primary-purple)', width: 28, height: 28 }} />
        <span>Campus<span style={{ color: 'var(--primary-purple)' }}>Connect</span><span style={{ color: 'var(--primary-purple)' }}>.</span></span>
        {user && (
          <span className={`brand-badge ${isFaculty ? 'badge-faculty' : 'badge-student'}`}>
            {isFaculty ? 'Faculty Portal' : 'Student Portal'}
          </span>
        )}
      </Link>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Light / Dark Theme Toggle */}
          <ThemeToggle />

          {/* Notification Bell with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setNotifOpen(!notifOpen)} 
              className="btn btn-secondary" 
              style={{ 
                borderRadius: '50%', 
                width: '38px', 
                height: '38px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: 0,
                position: 'relative',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.some(n => !n.isRead) && (
                <span style={{ 
                  position: 'absolute', 
                  top: '2px', 
                  right: '2px', 
                  width: '10px', 
                  height: '10px', 
                  background: 'var(--warning-red)', 
                  borderRadius: '50%',
                  border: '2px solid #ffffff'
                }} />
              )}
            </button>

            {notifOpen && (
              <div style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 9999,
                maxHeight: '400px',
                overflowY: 'auto',
                fontFamily: 'Outfit',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>Notifications</span>
                  {notifications.some(n => !n.isRead) && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                      {notifications.filter(n => !n.isRead).length} new
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      let Icon = Bell;
                      let iconColor = 'var(--text-muted)';
                      let iconBg = '#f1f5f9';
                      
                      if (notif.type === 'complaint') {
                        Icon = AlertTriangle;
                        iconColor = 'var(--warning-red)';
                        iconBg = 'rgba(239, 68, 68, 0.1)';
                      } else if (notif.type === 'team') {
                        Icon = Users;
                        iconColor = 'var(--primary)';
                        iconBg = 'rgba(107, 33, 168, 0.1)';
                      }
                      
                      return (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            if (!notif.isRead) {
                              handleMarkAsRead(notif.id);
                            }
                          }}
                          style={{ 
                            padding: '12px 16px', 
                            borderBottom: '1px solid var(--border-color)',
                            background: notif.isRead ? 'var(--bg-card)' : 'var(--bg-page)',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                            transition: 'background 0.2s'
                          }}
                        >
                          <div style={{ 
                            background: iconBg, 
                            color: iconColor, 
                            padding: '8px', 
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon size={16} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                            <p style={{ 
                              fontSize: '0.825rem', 
                              margin: 0, 
                              color: 'var(--text-main)', 
                              fontWeight: notif.isRead ? '400' : '600',
                              lineHeight: '1.3'
                            }}>
                              {notif.message}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                              {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <Link to="/login/student" className="btn btn-secondary btn-sm">
            Student Login
          </Link>
          <Link to="/login/faculty" className="btn btn-primary btn-sm" style={{ background: 'var(--primary-purple)' }}>
            Faculty Login
          </Link>
        </div>
      )}
    </header>
  );
};
