import axios from 'axios';

const TOKEN_KEY = 'helsb_officer_token';
export const DOCUMENT_VERIFY_BASE = import.meta.env.VITE_VERIFY_BASE || 'http://localhost:8081/api/verify';

export const api = axios.create({ baseURL: '' });

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('helsb_officer_name');
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url || '');
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      clearToken();
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export function hasToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export interface Application {
  id: number;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  nrc?: string;
  programme?: string;
  faculty?: string;
  universityCode?: string;
  schoolCode?: string;
  schoolName?: string;
  screeningPercent?: number;
  screeningApproved?: boolean;
  status: string;
  pipelineStage?: string | null;
  screeningExplanation?: string | null;
  documentIds: string[];
  notes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface HistoryItem {
  id: number;
  fromStatus?: string;
  toStatus: string;
  changedBy?: string;
  comment?: string;
  changedAt?: string;
}

export interface University {
  code: string;
  name: string;
  abbreviation: string;
  schoolCount: number;
}

export interface School {
  code: string;
  name: string;
  applicationCount: number;
  newApplicationCount: number;
}

export interface ProgrammeCount {
  code: string;
  name: string;
  loanStudentCount: number;
}

export const helsbApi = {
  login: (id: string, password: string) =>
    api.post('/api/v1/auth/login', { id, password }).then((res) => res.data as { accessToken: string; fullName: string; username: string }),
  universities: () => api.get('/api/v1/officer/universities').then((res) => res.data as University[]),
  university: (code: string) =>
    api.get(`/api/v1/officer/universities/${code}`).then((res) => res.data as { university: University; schools: School[] }),
  schoolApplications: (universityCode: string, schoolCode: string) =>
    api.get(`/api/v1/officer/universities/${universityCode}/schools/${schoolCode}/applications`).then(
      (res) => res.data as { university: University; school: School; totalApplications: number; newApplications: Application[] },
    ),
  schoolProgrammes: (universityCode: string, schoolCode: string) =>
    api.get(`/api/v1/officer/universities/${universityCode}/schools/${schoolCode}/programmes`).then(
      (res) => res.data as { university: University; school: School; programmes: ProgrammeCount[] },
    ),
  programmeStudents: (universityCode: string, schoolCode: string, programmeCode: string) =>
    api.get(`/api/v1/officer/universities/${universityCode}/schools/${schoolCode}/programmes/${programmeCode}/students`).then(
      (res) => res.data as Application[],
    ),
  get: (id: string | number, startReview = false) =>
    api.get(`/api/v1/officer/applications/${id}`, { params: { startReview } }).then(
      (res) => res.data as { application: Application; history: HistoryItem[] },
    ),
  approveScreening: (id: number, comment?: string) =>
    api.post(`/api/v1/officer/applications/${id}/approve-screening`, { comment: comment || 'Screening request approved' }).then(
      (res) => res.data as Application,
    ),
  advance: (id: number) =>
    api.post(`/api/v1/officer/applications/${id}/advance`).then((res) => res.data as Application),
  reject: (id: number, comment: string) =>
    api.post(`/api/v1/officer/applications/${id}/reject`, { comment }).then((res) => res.data as Application),
};

export function documentLabel(id: string) {
  const value = id.toUpperCase();
  if (value.includes('RES')) return 'Academic results';
  if (value.includes('REG')) return 'Registration record';
  if (value.includes('EXAM')) return 'Examination record';
  if (value.includes('PAY') || value.includes('FEE')) return 'Fee statement';
  if (value.includes('NRC')) return 'National registration card';
  return id;
}

export function canVerifyDocument(id: string) {
  return id.toUpperCase().startsWith('VS-');
}
