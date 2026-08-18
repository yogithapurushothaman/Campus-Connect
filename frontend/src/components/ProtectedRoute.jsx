import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎓</div>
          <div style={{ fontWeight: '700', color: 'var(--primary)' }}>Verifying Institutional Session...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const userRole = user.role?.toUpperCase();
  const isFacultyRole = userRole === 'FACULTY' || userRole === 'STAFF';

  if (requiredRole === 'FACULTY' && !isFacultyRole) {
    return <Navigate to="/student-dashboard" replace />;
  }

  if (requiredRole === 'STUDENT' && isFacultyRole) {
    return <Navigate to="/faculty-dashboard" replace />;
  }

  return children;
};
