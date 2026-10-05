import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SpaceConnectBackground } from './SpaceConnectBackground';
import { CursorGlow } from './CursorGlow';
import { ThemeToggle } from './ThemeToggle';
import {
  GraduationCap,
  LayoutGrid,
  ShieldAlert,
  Calendar,
  MapPin,
  Tent,
  Users,
  Search,
  Bell,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  User,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Send
} from 'lucide-react';

export const MasterAppShell = ({
  children,
  activeNav = 'hub',
  onNavChange = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  headerActions = null
}) => {
  const { user, isFaculty, logout, switchRole, authFetch } = useAuth();
  const navigate = useNavigate();

  const handleTogglePortalView = () => {
    if (isFaculty) {
      switchRole('STUDENT');
      navigate('/student-dashboard');
    } else {
      switchRole('FACULTY');
      navigate('/faculty-dashboard');
    }
  };

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
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

  const studentNavItems = [
    { id: 'hub', label: 'Hub', icon: LayoutGrid },
    { id: 'campus_care', label: 'Campus Care', icon: ShieldAlert },
    { id: 'events', label: 'Events & Fests', icon: Calendar },
    { id: 'map', label: 'Campus Map', icon: MapPin },
    { id: 'clubs', label: 'Clubs & Societies', icon: Tent },
    { id: 'teams', label: 'Team Finder', icon: Users },
  ];

  const facultyNavItems = [
    { id: 'complaints', label: 'Student Requests', icon: ShieldCheck },
    { id: 'clubs', label: 'Delegate Club Access', icon: UserCheck },
    { id: 'events', label: 'Manage Events', icon: Calendar },
    { id: 'notices', label: 'Post Notice', icon: Send },
    { id: 'heatmap', label: 'Campus Heatmap', icon: MapPin },
    { id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert },
  ];

  const navItems = isFaculty ? facultyNavItems : studentNavItems;
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="app-shell-root" style={{ position: 'relative' }}>
      <CursorGlow />
      <SpaceConnectBackground />
      {/* TOP GLASSNAVBAR */}
      <header className="app-shell-header">
        <div className="app-shell-brand">
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <Link to="/" className="brand-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/coval_logo.png" alt="COVAL Logo" style={{ height: '36px', borderRadius: '8px', objectFit: 'contain' }} />
            <div className="brand-logo-text">
              <span style={{ fontWeight: '900', letterSpacing: '0.04em', fontSize: '1.35rem', textTransform: 'uppercase' }}>
                CO<span style={{ color: 'var(--primary-purple)' }}>VAL</span><span style={{ color: 'var(--primary-purple)' }}>.</span>
              </span>
              <span className={`brand-role-badge ${isFaculty ? 'badge-faculty' : 'badge-student'}`}>
                {isFaculty ? 'Faculty' : 'Student'}
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER NAVIGATION TABS (ZOKLE REFERENCE STYLE) */}
        <nav className="top-horizontal-nav">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavChange(item.id)}
                className={`top-nav-link ${isActive ? 'active' : ''}`}
              >
                <span>{item.label}</span>
                {isActive && <span className="top-nav-active-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* TOP ACTIONS */}
        <div className="app-shell-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {headerActions}



          {/* LIGHT / DARK THEME TOGGLE */}
          <ThemeToggle />
          
          {/* NOTIFICATION BELL */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="top-action-btn"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadNotifCount > 0 && <span className="notif-unread-dot" />}
            </button>

            {notifOpen && (
              <div className="notif-dropdown-popover">
                <div className="notif-dropdown-header">
                  <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>Notifications</span>
                  {unreadNotifCount > 0 && (
                    <span className="unread-count-pill">{unreadNotifCount} unread</span>
                  )}
                </div>
                <div className="notif-dropdown-list">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      let IconComponent = Bell;
                      let iconColor = 'var(--text-muted)';
                      let iconBg = '#f1f5f9';

                      if (notif.type === 'complaint') {
                        IconComponent = AlertTriangle;
                        iconColor = 'var(--warning-red)';
                        iconBg = 'rgba(239, 68, 68, 0.1)';
                      } else if (notif.type === 'team') {
                        IconComponent = Users;
                        iconColor = 'var(--primary-purple)';
                        iconBg = 'var(--primary-light)';
                      }

                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (!notif.isRead) handleMarkAsRead(notif.id);
                          }}
                          className={`notif-item ${notif.isRead ? 'read' : 'unread'}`}
                        >
                          <div
                            className="notif-icon-badge"
                            style={{ background: iconBg, color: iconColor }}
                          >
                            <IconComponent size={16} />
                          </div>
                          <div className="notif-content">
                            <p className="notif-msg">{notif.message}</p>
                            <span className="notif-time">
                              {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="notif-empty-state">No notifications yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* USER PROFILE AVATAR MENU */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="user-profile-trigger"
              title={user?.name || 'User Profile'}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="user-avatar-img"
                />
              ) : (
                <div className="user-avatar-initial">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {profileOpen && (
              <div className="profile-dropdown-popover">
                <div className="profile-popover-header">
                  <p className="user-fullname">{user?.name}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
                <div className="profile-popover-menu">
                  <button
                    onClick={() => {
                      onNavChange('profile');
                      setProfileOpen(false);
                    }}
                    className="profile-menu-item"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  <button onClick={handleLogout} className="profile-menu-item danger">
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY LAYOUT (FULL-WIDTH MAIN CONTENT) */}
      <div className="app-shell-body">
        {/* MAIN CONTENT AREA */}
        <main className="app-shell-main-content">{children}</main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="app-shell-bottom-nav">
        {navItems.slice(0, 5).map((item) => {
          const IconComponent = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
