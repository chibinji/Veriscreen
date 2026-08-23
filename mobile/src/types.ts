export type DocumentType =
  | 'TRANSCRIPT'
  | 'EXAM_SLIP'
  | 'FEE_STATEMENT'
  | 'CONFIRMATION_SLIP'
  | 'CONTRACT';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
}

export interface StudentProfile {
  studentNumber: string;
  firstName: string;
  lastName: string;
  program: string;
  yearOfStudy: number;
  enrollmentYear?: number;
  registrationStatus: string;
}

export interface DocumentRecord {
  id: number;
  type: DocumentType;
  typeLabel: string;
  summary: string;
  generatedAt: string;
  url?: string;
}

export interface RegistrationRecord {
  id: number;
  academicYear: string;
  semester: string;
  confirmationStatus: string;
  registeredAt?: string;
}

export interface FeeRecord {
  id: number;
  description: string;
  amount: number;
  paidAmount: number;
  receiptNumber?: string;
  status: string;
  paymentDate?: string;
}

export interface ExamRecord {
  id: number;
  academicYear: string;
  status: string;
  sittingStatus: string;
}

export interface AcademicResult {
  id: number;
  courseCode: string;
  grade: string;
  credits: number;
}

export interface HelsbApplication {
  id: number;
  applicationNumber: string;
  status: string;
  paymentStatus?: string;
  screeningResult?: string;
  notes?: string;
}

export interface DashboardStats {
  documentsGenerated: number;
  activeApplications: number;
}
