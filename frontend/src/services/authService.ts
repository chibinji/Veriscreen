import { authApi } from '../api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../constants';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await authApi.login(data);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return authApi.register(data);
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return authApi.forgotPassword(email);
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return authApi.resetPassword(token, password);
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    return authApi.changePassword(oldPassword, newPassword);
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser() {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
