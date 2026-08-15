import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth';
import { fetchProfile } from '../api/student';
import { getStoredToken } from '../api/client';
import type { LoginRequest, StudentProfile } from '../types';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: StudentProfile | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setProfile(null);
      return;
    }

    const data = await fetchProfile();
    setProfile(data);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        if (getStoredToken()) {
          await refreshProfile();
        }
      } catch {
        apiLogout();
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, [refreshProfile]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      await apiLogin(credentials);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const logout = useCallback(() => {
    apiLogout();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(profile),
      isLoading,
      profile,
      login,
      logout,
      refreshProfile,
    }),
    [profile, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
