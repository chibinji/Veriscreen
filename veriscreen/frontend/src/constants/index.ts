export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'VeriScreen';

export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  ME_PROFILE: '/api/v1/students/me/profile',
  ME_DOCUMENTS: '/api/v1/students/me/documents',
  ME_REGISTRATIONS: '/api/v1/students/me/registrations',
  ME_FEES: '/api/v1/students/me/fees',
  ME_EXAMINATIONS: '/api/v1/students/me/examinations',
  ME_ACADEMIC_RESULTS: '/api/v1/students/me/academic-results',
  ME_HELSB: '/api/v1/students/me/helsb',
<<<<<<< HEAD:veriscreen/frontend/src/constants/index.ts
  SUBMIT_HELSB: '/api/v1/students/me/helsb/submit',
  ME_NOTIFICATIONS: '/api/v1/students/me/notifications',
  DOWNLOAD_HELSB_CONTRACT: (id: number) => `/api/v1/students/me/helsb/${id}/contract`,
  EMAIL_HELSB_CONTRACT: (id: number) => `/api/v1/students/me/helsb/${id}/contract/email`,
=======
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:frontend/src/constants/index.ts
} as const;

export const TOKEN_KEY = 'veriscreen_token';
export const REFRESH_TOKEN_KEY = 'veriscreen_refresh_token';
export const USER_KEY = 'veriscreen_user';

export const ROLES = {
  STUDENT: 'STUDENT',
  HELSB_OFFICER: 'HELSB_OFFICER',
  HELSB_STUDENT: 'HELSB_STUDENT',
  ADMIN: 'ADMIN',
} as const;

export const DOCUMENT_TYPES: Record<string, string> = {
  TRANSCRIPT: 'Academic Transcript',
  EXAM_SLIP: 'Examination Slip',
  FEE_STATEMENT: 'Fee Statement',
  CONFIRMATION_SLIP: 'Confirmation Slip',
  CONTRACT: 'HELSB Contract',
};

export const DOCUMENT_ICONS: Record<string, string> = {
  TRANSCRIPT: 'bi-file-earmark-text',
  EXAM_SLIP: 'bi-file-earmark-check',
  FEE_STATEMENT: 'bi-receipt',
  CONFIRMATION_SLIP: 'bi-file-earmark-person',
  CONTRACT: 'bi-file-earmark-ruled',
};

export const STATUS_BADGES: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  SUSPENDED: 'danger',
  GRADUATED: 'info',
  PENDING: 'warning',
  UNDER_REVIEW: 'primary',
  APPROVED: 'success',
  REJECTED: 'danger',
  CONTRACT_GENERATED: 'info',
  GENERATED: 'success',
  VERIFIED: 'success',
  EXPIRED: 'secondary',
  INVALID: 'danger',
  VALID: 'success',
  COMPLETED: 'success',
  FAILED: 'danger',
  CONFIRMED: 'success',
  NOT_REGISTERED: 'secondary',
  PAID: 'success',
  PARTIAL: 'warning',
  OUTSTANDING: 'danger',
  ELIGIBLE: 'success',
  NOT_ELIGIBLE: 'danger',
  SAT: 'info',
};

export const FACULTIES = [
  'Faculty of Engineering',
  'Faculty of Science',
  'Faculty of Business',
  'Faculty of Law',
  'Faculty of Medicine',
  'Faculty of Education',
  'Faculty of Social Sciences',
  'Faculty of Humanities',
];

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;
