import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('campusconnect_token') || null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('campusconnect_user', JSON.stringify(data.user));
          } else {
            // Token expired
            logout();
          }
        } catch (err) {
          console.error('Session verify failed:', err);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, [token]);

  const login = async (email, password, roleHint = null) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email.trim(),
        password,
        role: roleHint,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed. Please check your credentials.');
    }

    if (data.token) {
      setToken(data.token);
      localStorage.setItem('campusconnect_token', data.token);
    }
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('campusconnect_user', JSON.stringify(data.user));
    }

    return data;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('campusconnect_token');
    localStorage.removeItem('campusconnect_user');
  };

  const authFetch = (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isFaculty: user?.role === 'FACULTY' || user?.role === 'STAFF',
    isStudent: user?.role === 'STUDENT',
    login,
    logout,
    authFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
