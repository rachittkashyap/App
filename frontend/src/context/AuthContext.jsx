import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginRequest,
  logoutRequest,
  refreshRequest,
  meRequest,
} from '../services/auth';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((token) => {
    setAccessToken(token);
    setAuthToken(token);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await loginRequest({ email, password });
      applyToken(data.data.accessToken);
      setUser(data.data.user);
      return data.data.user;
    },
    [applyToken]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // ignore - we clear local state regardless
    }
    applyToken(null);
    setUser(null);
  }, [applyToken]);

  const silentRefresh = useCallback(async () => {
    try {
      const { data } = await refreshRequest();
      applyToken(data.data.accessToken);
      setUser(data.data.user);
      return data.data.accessToken;
    } catch {
      applyToken(null);
      setUser(null);
      return null;
    }
  }, [applyToken]);

  // On first load, try to silently restore a session using the refresh cookie
  useEffect(() => {
    setUnauthorizedHandler(silentRefresh);

    (async () => {
      const token = await silentRefresh();
      if (token) {
        try {
          const { data } = await meRequest();
          setUser(data.data.user);
        } catch {
          // token turned out invalid - stay logged out
        }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
