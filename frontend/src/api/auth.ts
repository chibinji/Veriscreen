import type { JwtResponse, LoginRequest } from '../types';
import { apiClient, clearStoredToken, setStoredToken } from './client';

export async function login(credentials: LoginRequest): Promise<JwtResponse> {
  const { data } = await apiClient.post<JwtResponse>('/api/v1/auth/login', credentials);
  setStoredToken(data.accessToken);
  return data;
}

export function logout(): void {
  clearStoredToken();
}
