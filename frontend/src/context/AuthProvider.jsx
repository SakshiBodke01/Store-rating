import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext.js';
import { api } from '../services/api.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session profile on app load
  useEffect(() => {
    async function restoreSession() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res?.success && res?.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session restoration failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    }

    restoreSession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res?.success && res?.data) {
      const { user: userData, token: jwtToken } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res?.message || res?.error?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res?.success && res?.data) {
      const { user: newUserData, token: jwtToken } = res.data;
      setToken(jwtToken);
      setUser(newUserData);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(newUserData));
      return newUserData;
    }
    throw new Error(res?.message || res?.error?.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updatePassword = async (passwordData) => {
    const res = await api.patch('/users/me/password', passwordData);
    return res;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
