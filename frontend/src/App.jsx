import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { StudentLogin } from './pages/StudentLogin';
import { FacultyLogin } from './pages/FacultyLogin';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';

const DashboardRedirect = () => {
  const { isFaculty } = useAuth();
  return <Navigate to={isFaculty ? "/faculty-dashboard" : "/student-dashboard"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Login Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/login/faculty" element={<FacultyLogin />} />

          {/* Protected Role-Based Dashboards */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty-dashboard"
            element={
              <ProtectedRoute requiredRole="FACULTY">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
