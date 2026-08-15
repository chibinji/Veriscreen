import type {
  AcademicResult,
  DocumentItem,
  Examination,
  Fee,
  HelsbApplication,
  Registration,
  StudentProfile,
} from '../types';
import { apiClient } from './client';

export async function fetchProfile(): Promise<StudentProfile> {
  const { data } = await apiClient.get<StudentProfile>('/api/v1/students/me/profile');
  return data;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const { data } = await apiClient.get<DocumentItem[]>('/api/v1/students/me/documents');
  return data;
}

export async function fetchRegistrations(): Promise<Registration[]> {
  const { data } = await apiClient.get<Registration[]>('/api/v1/students/me/registrations');
  return data;
}

export async function fetchFees(): Promise<Fee[]> {
  const { data } = await apiClient.get<Fee[]>('/api/v1/students/me/fees');
  return data;
}

export async function fetchExaminations(): Promise<Examination[]> {
  const { data } = await apiClient.get<Examination[]>('/api/v1/students/me/examinations');
  return data;
}

export async function fetchAcademicResults(): Promise<AcademicResult[]> {
  const { data } = await apiClient.get<AcademicResult[]>('/api/v1/students/me/academic-results');
  return data;
}

export async function fetchHelsbApplications(): Promise<HelsbApplication[]> {
  const { data } = await apiClient.get<HelsbApplication[]>('/api/v1/students/me/helsb');
  return data;
}
