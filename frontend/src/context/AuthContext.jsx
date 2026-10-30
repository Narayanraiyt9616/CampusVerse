import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Synchronize authenticated session with backend
  const checkSession = useCallback(async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res && res.success && res.user) {
        setUser(res.user);
        try {
          localStorage.setItem('user', JSON.stringify(res.user));
        } catch (e) {}
      } else {
        setUser(null);
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        } catch (e) {}
      }
    } catch (err) {
      // If 401 or network error and no valid local session, clear
      if (err.status === 401) {
        setUser(null);
        setToken(null);
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Perform authentication for a specific portal
   * @param {string} identifier (username or email)
   * @param {string} password
   * @param {string} portalRole
   */
  const login = useCallback(async (identifier, password, portalRole) => {
    const cleanId = String(identifier || '').trim();
    const res = await authService.login({
      identifier: cleanId,
      username: cleanId,
      email: cleanId,
      password,
      portalRole,
    });

    if (res && res.success && res.user) {
      const userWithFlags = {
        ...res.user,
        mustChangePassword: Boolean(res.mustChangePassword || res.user.mustChangePassword),
      };
      setUser(userWithFlags);
      if (res.token) {
        setToken(res.token);
        try {
          localStorage.setItem('token', res.token);
        } catch (e) {}
      }
      try {
        localStorage.setItem('user', JSON.stringify(userWithFlags));
      } catch (e) {}
      return { user: userWithFlags, mustChangePassword: userWithFlags.mustChangePassword };
    } else {
      throw new Error(res?.error || 'Authentication failed.');
    }
  }, []);

  /**
   * Sign out and clear stored sessions
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } catch (e) {}
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
      checkSession,
    }),
    [user, token, loading, login, logout, checkSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
