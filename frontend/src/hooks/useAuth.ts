import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { getRoleDashboard } from '../utils';
import type { LoginRequest } from '../types';

export function useAuth() {
  const store = useAuthStore();

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    store.setSession(res.user, res.token);
    return getRoleDashboard(res.role);
  };

  return {
    ...store,
    login,
    logout: store.logout,
  };
}
