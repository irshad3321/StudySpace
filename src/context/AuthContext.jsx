import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE_URL = `${API_ROOT.replace(/\/$/, '')}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('studyspace_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(!localStorage.getItem('studyspace_user'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Helper to build auth headers (supports both Bearer token and cookies)
  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('studyspace_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Check active session via token/cookie on mount
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const token = localStorage.getItem('studyspace_token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/me`, {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.user) {
            setUser(data.user);
            localStorage.setItem('studyspace_user', JSON.stringify(data.user));
          }
        } else if (response.status === 401 || response.status === 403) {
          if (isMounted) {
            setUser(null);
            localStorage.removeItem('studyspace_user');
            localStorage.removeItem('studyspace_token');
          }
        }
      } catch (err) {
        console.warn('Session verification fallback to cached user:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token) {
        localStorage.setItem('studyspace_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('studyspace_user', JSON.stringify(data.user));
      }

      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Register handler
  const register = async (name, email, password, track) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, track })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.token) {
        localStorage.setItem('studyspace_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('studyspace_user', JSON.stringify(data.user));
      }

      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout request error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('studyspace_user');
      localStorage.removeItem('studyspace_token');
    }
  };

  // Reset password handler (Forgot Password)
  const resetPassword = async (email, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      if (data.token) {
        localStorage.setItem('studyspace_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('studyspace_user', JSON.stringify(data.user));
      }

      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // API-backed user profile update handler (persists to MongoDB)
  const updateUserProfile = async (updatedFields) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updatedFields)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem('studyspace_user', JSON.stringify(data.user));
      }

      return { success: true, user: data.user };
    } catch (err) {
      console.error('Update profile API error:', err);
      // Fallback local update
      setUser((prev) => {
        const fallbackUser = prev ? { ...prev, ...updatedFields } : null;
        if (fallbackUser) {
          localStorage.setItem('studyspace_user', JSON.stringify(fallbackUser));
        }
        return fallbackUser;
      });
      return { success: false, message: err.message };
    }
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        updateUserProfile,
        isAuthModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
