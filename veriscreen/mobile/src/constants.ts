import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const APP_NAME = 'VeriScreen';

export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  ME_PROFILE: '/api/v1/students/me/profile',
  ME_DOCUMENTS: '/api/v1/students/me/documents',
  ME_REGISTRATIONS: '/api/v1/students/me/registrations',
  ME_FEES: '/api/v1/students/me/fees',
  ME_EXAMINATIONS: '/api/v1/students/me/examinations',
  ME_ACADEMIC_RESULTS: '/api/v1/students/me/academic-results',
  ME_HELSB: '/api/v1/students/me/helsb',
} as const;

export const TRACKER_STEPS = [
  { id: 'SUBMITTED', label: 'Submitted' },
  { id: 'PORTAL_CONFIRMED', label: 'Portal confirmed' },
  { id: 'PAYMENT', label: 'Payment' },
  { id: 'SCREENING', label: 'Screening' },
  { id: 'CONTRACT', label: 'Contract' },
  { id: 'DISBURSEMENT', label: 'Disbursement' },
] as const;

export const DEMO_ACCOUNTS = [
  { label: 'Samuel Chibinji Mwanza', id: '2021465934', password: 'password123' },
  { label: 'Nosiku Mukuka', id: '2022030346', password: 'password123' },
  { label: 'Grace Banda', id: '2020123456', password: 'password123' },
  { label: 'Peter Zulu', id: '2019876543', password: 'password123' },
];

export const DOCUMENT_LABELS: Record<string, string> = {
  TRANSCRIPT: 'Academic Transcript',
  EXAM_SLIP: 'Examination Slip',
  FEE_STATEMENT: 'Fee Statement',
  CONFIRMATION_SLIP: 'Confirmation Slip',
  CONTRACT: 'HELSB Contract',
};

/**
 * Native apps cannot use localhost the same way a browser can.
 * Expo Go on a phone uses the Metro host IP so the device can reach the PC.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || Constants.linkingUri || '';
  const hosts = hostUri.match(/\d+\.\d+\.\d+\.\d+/g) || [];
  const lan = hosts.find((address) => /^(10\.|192\.168\.)/.test(address));
  if (lan) return `http://${lan}:8081`;

  if (Platform.OS === 'android') return 'http://10.0.2.2:8081';
  return 'http://localhost:8081';
}
