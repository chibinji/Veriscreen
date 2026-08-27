// ─── Auth Types ─────────────────────────────────────────────────────────────
export type Role = 'STUDENT' | 'HELSB_OFFICER' | 'ADMIN' | 'HELSB_STUDENT';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  studentNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  nrc: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  role: Role;
  user: User;
}

// ─── User Types ──────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  createdAt: string;
  studentNumber?: string;
  active?: boolean;
}

export interface MockAccount extends User {
  password: string;
}

export interface StudentProfile {
  id: number;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nrc: string;
  faculty: string;
  program: string;
  yearOfStudy: number;
  registrationStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
  profilePicture?: string;
  userId: number;
  dateOfBirth?: string;
  enrollmentDate?: string;
  campus?: string;
  gpa?: number;
}

export interface AcademicResult {
  id: number;
  studentNumber: string;
  academicYear: string;
  semester: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoint: number;
}

export interface FeeRecord {
  id: number;
  studentNumber: string;
  academicYear: string;
  semester: string;
  description: string;
  amount: number;
  paidAmount: number;
  paymentDate?: string;
  receiptNumber?: string;
  status: 'PAID' | 'PARTIAL' | 'OUTSTANDING';
}

export interface RegistrationRecord {
  id: number;
  studentNumber: string;
  academicYear: string;
  semester: string;
  confirmationStatus: 'CONFIRMED' | 'PENDING' | 'NOT_REGISTERED';
  registeredAt?: string;
}

export interface ExamRecord {
  id: number;
  studentNumber: string;
  academicYear: string;
  semester: string;
  courseCode: string;
  courseName: string;
  examDate: string;
  venue: string;
  sittingStatus: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'SAT';
}

export interface UserSettings {
  userId: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
}

// ─── Document Types ──────────────────────────────────────────────────────────
export type DocumentType =
  | 'TRANSCRIPT'
  | 'RESULTS'
  | 'EXAM_SLIP'
  | 'EXAMINATION_SLIP'
  | 'FEE_STATEMENT'
  | 'PAYMENT_HISTORY'
  | 'CONFIRMATION_SLIP'
  | 'CONTRACT';

export type DocumentStatus = 'GENERATED' | 'PENDING' | 'EXPIRED' | 'INVALID';

export interface Document {
  id: number;
  type: DocumentType;
  studentNumber: string;
  studentName: string;
  generatedAt: string;
  expiresAt?: string;
  verificationCode: string;
  status: DocumentStatus;
  downloadUrl?: string;
}

// ─── Verification Types ──────────────────────────────────────────────────────
export type VerificationStatus = 'VALID' | 'INVALID' | 'EXPIRED';

export interface VerificationResult {
  valid?: boolean;
  status: VerificationStatus;
  documentId?: string;
  documentType?: DocumentType | string;
  studentNumber?: string;
  studentName?: string;
  generatedAt?: string;
  verifiedAt?: string;
  issuedBy?: string;
}

// ─── Application / HELSB Types ───────────────────────────────────────────────
export type ApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONTRACT_GENERATED';

export interface Application {
  id: number;
  applicationNumber: string;
  studentNumber: string;
  studentName: string;
  program: string;
  faculty: string;
  yearOfStudy: number;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  documents: Document[];
  helsbCredentials?: {
    username: string;
    temporaryPassword: string;
  };
}

export interface BankDetails {
  id?: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  sortCode: string;
  applicationId: number;
}

export interface Payment {
  id: number;
  applicationId: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  transactionRef: string;
  paidAt?: string;
}

export interface ScreeningResult {
  id: number;
  applicationId: number;
  studentNumber: string;
  passed: boolean;
  score?: number;
  remarks: string;
  screenedAt: string;
  screenedBy: string;
}

// ─── Notification Types ──────────────────────────────────────────────────────
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
  link?: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  status?: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────
export interface AuditLog {
  id: number;
  action: string;
  performedBy: string;
  targetEntity: string;
  targetId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export interface StudentDashboardStats {
  documentsGenerated: number;
  activeApplications: number;
  verificationRequests: number;
  unreadNotifications: number;
}

export interface OfficerDashboardStats {
  totalApplications: number;
  pendingReview: number;
  approvedToday: number;
  rejectedToday: number;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalOfficers: number;
  totalDocuments: number;
  totalApplications: number;
  activeToday: number;
}

// ─── API Error ───────────────────────────────────────────────────────────────
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
