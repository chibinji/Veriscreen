import { api, API_ENDPOINTS } from './client';
import {
  toAcademicResult,
  toDocument,
  toExamRecord,
  toFeeRecord,
  toHelsb,
  toRegistration,
  toStudentProfile,
  toUser,
  type BackendAcademicResult,
  type BackendDocument,
  type BackendExamination,
  type BackendFee,
  type BackendHelsbApplication,
  type BackendJwtResponse,
  type BackendRegistration,
  type BackendStudentProfile,
} from './mappers';
import type {
  AcademicResult,
  DashboardStats,
  DocumentRecord,
  ExamRecord,
  FeeRecord,
  HelsbApplication,
  RegistrationRecord,
  StudentProfile,
  User,
} from '../types';

export const studentApi = {
  async login(id: string, password: string): Promise<{ token: string; user: User }> {
    const jwt = await api.post<BackendJwtResponse>(API_ENDPOINTS.LOGIN, { id, password });
    const token = jwt.accessToken;
    if (!token) {
      throw new Error('Invalid student ID or password');
    }
    const profile = await api.get<BackendStudentProfile>(API_ENDPOINTS.ME_PROFILE, token);
    return { token, user: toUser(profile) };
  },

  async getProfile(token: string): Promise<StudentProfile> {
    const data = await api.get<BackendStudentProfile>(API_ENDPOINTS.ME_PROFILE, token);
    return toStudentProfile(data);
  },

  async getDocuments(token: string): Promise<DocumentRecord[]> {
    const data = await api.get<BackendDocument[]>(API_ENDPOINTS.ME_DOCUMENTS, token);
    return data.map(toDocument);
  },

  async getRegistrations(token: string): Promise<RegistrationRecord[]> {
    const data = await api.get<BackendRegistration[]>(API_ENDPOINTS.ME_REGISTRATIONS, token);
    return data.map(toRegistration);
  },

  async getFees(token: string): Promise<FeeRecord[]> {
    const data = await api.get<BackendFee[]>(API_ENDPOINTS.ME_FEES, token);
    return data.map(toFeeRecord);
  },

  async getExaminations(token: string): Promise<ExamRecord[]> {
    const data = await api.get<BackendExamination[]>(API_ENDPOINTS.ME_EXAMINATIONS, token);
    return data.map(toExamRecord);
  },

  async getAcademicResults(token: string): Promise<AcademicResult[]> {
    const data = await api.get<BackendAcademicResult[]>(API_ENDPOINTS.ME_ACADEMIC_RESULTS, token);
    return data.map(toAcademicResult);
  },

  async getHelsb(token: string): Promise<HelsbApplication | null> {
    const data = await api.get<BackendHelsbApplication[]>(API_ENDPOINTS.ME_HELSB, token);
    if (!data.length) return null;
    return toHelsb(data[0]);
  },

  async getDashboardStats(token: string): Promise<DashboardStats> {
    const [documents, helsb] = await Promise.all([
      api.get<unknown[]>(API_ENDPOINTS.ME_DOCUMENTS, token),
      api.get<BackendHelsbApplication[]>(API_ENDPOINTS.ME_HELSB, token),
    ]);
    return {
      documentsGenerated: documents.length,
      activeApplications: helsb.filter((app) => {
        const status = (app.applicationStatus || '').toUpperCase();
        return status !== 'REJECTED' && status !== 'NOT_ELIGIBLE' && status !== 'FAILED';
      }).length,
    };
  },
};
