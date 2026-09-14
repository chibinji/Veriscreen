/**
 * HTTP client for the Spring Boot REST API.
 * Components call src/api/*; those functions use this client for real endpoints.
 */
import axios, { AxiosError } from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants';
import { ApiException } from '../api/mockClient';

const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const isLogin = (config.url || '').includes('/auth/login');
  if (isLogin) {
    return config;
  }
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; status?: number }>) => {
    const url = error.config?.url || '';
    const isLogin = url.includes('/auth/login');
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(toApiException(error));
  }
);

export function toApiException(error: unknown): ApiException {
  if (error instanceof ApiException) return error;
  const axiosError = error as AxiosError<{ message?: string; status?: number }>;
  const status = axiosError.response?.status ?? 0;
  const message =
    axiosError.response?.data?.message ||
    axiosError.message ||
    'An unexpected error occurred';
  return new ApiException(status, message);
}

export default apiClient;
