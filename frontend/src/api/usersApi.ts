import type {
  AcademicResult,
  ExamRecord,
  FeeRecord,
  PageParams,
  PaginatedResponse,
  RegistrationRecord,
  StudentDashboardStats,
  StudentProfile,
  User,
  UserSettings,
} from '../types';
import { addAudit, getDb, saveDb } from '../data/store';
import { delay, fail, getSessionUser, paginate, requireSession, toPublicUser } from './mockClient';
import { API_ENDPOINTS } from '../constants';
import apiClient from '../services/apiClient';
import {
  toAcademicResult,
  toExamRecord,
  toFeeRecord,
  toRegistration,
  toStudentProfile,
  toUser,
  type BackendAcademicResult,
  type BackendExamination,
  type BackendFee,
  type BackendHelsbApplication,
  type BackendRegistration,
  type BackendStudentProfile,
} from './mappers';

export const usersApi = {
  async getUsers(params: PageParams = {}): Promise<PaginatedResponse<User>> {
    await delay();
    requireSession();
    const search = (params.search || '').toLowerCase();
    const items = getDb()
      .accounts.filter((account) => account.active !== false)
      .map(toPublicUser)
      .filter((user) => {
        if (!search) return true;
        return (
          user.username.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(search)
        );
      });
    return paginate(items, params);
  },

  async getUserById(id: number): Promise<User> {
    await delay();
    requireSession();
    const account = getDb().accounts.find((item) => item.id === id);
    if (!account) fail(404, 'User not found.');
    return toPublicUser(account);
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<BackendStudentProfile>(API_ENDPOINTS.ME_PROFILE);
    return toUser(data);
  },

  async getStudentProfile(): Promise<StudentProfile> {
    const { data } = await apiClient.get<BackendStudentProfile>(API_ENDPOINTS.ME_PROFILE);
    return toStudentProfile(data);
  },

  async updateProfile(_data: Partial<StudentProfile>): Promise<StudentProfile> {
    fail(404, 'Updating contact details is not available. The server does not provide a profile update endpoint.');
  },

  async getDashboardStats(): Promise<StudentDashboardStats> {
    const [documents, helsb] = await Promise.all([
      apiClient.get<unknown[]>(API_ENDPOINTS.ME_DOCUMENTS),
      apiClient.get<BackendHelsbApplication[]>(API_ENDPOINTS.ME_HELSB),
    ]);
    return {
      documentsGenerated: documents.data.length,
      activeApplications: helsb.data.filter((app) => {
        const status = (app.applicationStatus || '').toUpperCase();
        return status !== 'REJECTED' && status !== 'NOT_ELIGIBLE' && status !== 'FAILED';
      }).length,
      verificationRequests: 0,
      unreadNotifications: 0,
    };
  },

  async getStudentByNumber(studentNumber: string): Promise<StudentProfile> {
    await delay();
    requireSession();
    const profile = getDb().profiles.find((item) => item.studentNumber === studentNumber);
    if (!profile) fail(404, 'Student not found.');
    return { ...profile };
  },

  async getAcademicResults(studentNumber?: string): Promise<AcademicResult[]> {
    const number = studentNumber || getSessionUser()?.studentNumber || '';
    const { data } = await apiClient.get<BackendAcademicResult[]>(API_ENDPOINTS.ME_ACADEMIC_RESULTS);
    return data.map((item) => toAcademicResult(item, number));
  },

  async getFeeRecords(studentNumber?: string): Promise<FeeRecord[]> {
    const number = studentNumber || getSessionUser()?.studentNumber || '';
    const { data } = await apiClient.get<BackendFee[]>(API_ENDPOINTS.ME_FEES);
    return data.map((item) => toFeeRecord(item, number));
  },

  async getRegistrations(studentNumber?: string): Promise<RegistrationRecord[]> {
    const number = studentNumber || getSessionUser()?.studentNumber || '';
    const { data } = await apiClient.get<BackendRegistration[]>(API_ENDPOINTS.ME_REGISTRATIONS);
    return data.map((item) => toRegistration(item, number));
  },

  async getExamRecords(studentNumber?: string): Promise<ExamRecord[]> {
    const number = studentNumber || getSessionUser()?.studentNumber || '';
    const { data } = await apiClient.get<BackendExamination[]>(API_ENDPOINTS.ME_EXAMINATIONS);
    return data.map((item) => toExamRecord(item, number));
  },

  async getSettings(): Promise<UserSettings> {
    await delay(300);
    const session = requireSession();
    const settings = getDb().settings.find((item) => item.userId === session.id);
    if (!settings) {
      const created = {
        userId: session.id,
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
      };
      getDb().settings.push(created);
      saveDb();
      return created;
    }
    return { ...settings };
  },

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    await delay();
    const session = requireSession();
    let settings = getDb().settings.find((item) => item.userId === session.id);
    if (!settings) {
      settings = {
        userId: session.id,
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
      };
      getDb().settings.push(settings);
    }
    Object.assign(settings, data, { userId: session.id });
    saveDb();
    return { ...settings };
  },

  async uploadProfilePicture(file: File): Promise<{ url: string }> {
    await delay(800);
    requireSession();
    void file;
    return { url: '/veriscreen.svg' };
  },
};
