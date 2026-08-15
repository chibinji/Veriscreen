import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';

/** Empty in dev: requests go to the Vite server, which proxies /api → localhost:8080 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const TOKEN_KEY = 'veriscreen_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const isLoginRequest = config.url?.includes('/auth/login');
  const token = localStorage.getItem(TOKEN_KEY);

  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message: !error.response
        ? 'Cannot reach the backend. Start it with: cd backend && mvnw.cmd spring-boot:run'
        : error.response.data?.message ??
          error.message ??
          'An unexpected error occurred',
    };
    return Promise.reject(apiError);
  },
);

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export { TOKEN_KEY };
