import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('campuscare_user') || 'null');
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('campuscare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        localStorage.setItem('campuscare_user', JSON.stringify(response.data.user));
      } catch {
        localStorage.removeItem('campuscare_user');
        localStorage.removeItem('campuscare_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, [token]);

  const login = (userData, newToken) => {
    localStorage.setItem('campuscare_user', JSON.stringify(userData));
    localStorage.setItem('campuscare_token', newToken);
    setUser(userData);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('campuscare_user');
    localStorage.removeItem('campuscare_token');
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, setUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
