import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { studentApi } from '../api/studentApi';
import { ApiError } from '../api/client';
import type { User } from '../types';
import { clearSession, loadSession, saveSession } from './storage';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSession()
      .then((session) => {
        if (session) {
          setToken(session.token);
          setUser(session.user);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (id: string, password: string) => {
    try {
      const result = await studentApi.login(id.trim(), password);
      await saveSession(result.token, result.user);
      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error('Unable to reach the VeriScreen server. Is the backend running?');
    }
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, ready, login, logout }),
    [user, token, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
