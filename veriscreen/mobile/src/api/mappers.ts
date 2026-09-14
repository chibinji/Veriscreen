import type {
  AcademicResult,
  DocumentRecord,
  DocumentType,
  ExamRecord,
  FeeRecord,
  HelsbApplication,
  RegistrationRecord,
  StudentProfile,
  User,
} from '../types';
import { DOCUMENT_LABELS } from '../constants';

export interface BackendStudentProfile {
  id: string;
  name: string;
  program: string;
  enrollmentYear: number;
}

export interface BackendDocument {
  type: string;
  url?: string | null;
  summary?: string | null;
  generatedDate?: string | null;
}

export interface BackendRegistration {
  id: number;
  academicYear: string;
  semester: number;
  confirmed: boolean;
  registrationDate?: string | null;
}

export interface BackendFee {
  id: number;
  paymentDate?: string | null;
  amount: number;
  receiptNo?: string | null;
  outstandingBalance: number;
}

export interface BackendExamination {
  id: number;
  academicYear: string;
  eligible: boolean;
  status: string;
}

export interface BackendAcademicResult {
  id: number;
  courseCode: string;
  grade: string;
  credits: number;
}

export interface BackendHelsbApplication {
  id: number;
  applicationStatus: string;
  paymentStatus?: string | null;
  screeningResult?: string | null;
  contractDetails?: string | null;
  applicationNumber?: string | null;
  loanPercent?: number | null;
}

export interface BackendJwtResponse {
  accessToken: string;
}

function splitName(fullName: string | undefined | null): { firstName: string; lastName: string } {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: 'Student', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function numericId(value: string | number | undefined): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function yearOfStudy(enrollmentYear?: number): number {
  if (!enrollmentYear) return 1;
  return Math.max(1, Math.min(new Date().getFullYear() - enrollmentYear + 1, 8));
}

function documentType(type: string | undefined | null): DocumentType {
  const normalized = (type || '').toUpperCase().replace(/\s+/g, '_');
  if (normalized.includes('CONFIRMATION')) return 'CONFIRMATION_SLIP';
  if (normalized.includes('EXAM')) return 'EXAM_SLIP';
  if (normalized.includes('FEE')) return 'FEE_STATEMENT';
  if (normalized.includes('CONTRACT')) return 'CONTRACT';
  return 'TRANSCRIPT';
}

export function toUser(profile: BackendStudentProfile): User {
  const { firstName, lastName } = splitName(profile.name);
  return {
    id: numericId(profile.id),
    username: profile.id,
    firstName,
    lastName,
    studentNumber: profile.id,
  };
}

export function toStudentProfile(dto: BackendStudentProfile): StudentProfile {
  const { firstName, lastName } = splitName(dto.name);
  return {
    studentNumber: dto.id,
    firstName,
    lastName,
    program: dto.program || '',
    yearOfStudy: yearOfStudy(dto.enrollmentYear),
    enrollmentYear: dto.enrollmentYear,
    registrationStatus: 'ACTIVE',
  };
}

export function toDocument(dto: BackendDocument, index: number): DocumentRecord {
  const type = documentType(dto.type);
  return {
    id: index + 1,
    type,
    typeLabel: DOCUMENT_LABELS[type] || dto.type || 'Document',
    summary: dto.summary || '—',
    generatedAt: dto.generatedDate || '',
    url: dto.url || undefined,
  };
}

export function toRegistration(dto: BackendRegistration): RegistrationRecord {
  return {
    id: dto.id,
    academicYear: dto.academicYear,
    semester: String(dto.semester ?? ''),
    confirmationStatus: dto.confirmed ? 'CONFIRMED' : 'PENDING',
    registeredAt: dto.registrationDate || undefined,
  };
}

export function toFeeRecord(dto: BackendFee): FeeRecord {
  const paid = Number(dto.amount ?? 0);
  const outstanding = Number(dto.outstandingBalance ?? 0);
  let status = 'PAID';
  if (outstanding > 0) status = paid > 0 ? 'PARTIAL' : 'OUTSTANDING';
  return {
    id: dto.id,
    description: 'Fee payment',
    amount: paid + outstanding || paid,
    paidAmount: paid,
    receiptNumber: dto.receiptNo || undefined,
    status,
    paymentDate: dto.paymentDate || undefined,
  };
}

export function toExamRecord(dto: BackendExamination): ExamRecord {
  const sittingStatus =
    dto.status === 'COMPLETED' || dto.status === 'SAT'
      ? 'SAT'
      : dto.eligible
        ? 'ELIGIBLE'
        : 'NOT_ELIGIBLE';
  return {
    id: dto.id,
    academicYear: dto.academicYear,
    status: dto.status,
    sittingStatus,
  };
}

export function toAcademicResult(dto: BackendAcademicResult): AcademicResult {
  return {
    id: dto.id,
    courseCode: dto.courseCode,
    grade: dto.grade,
    credits: dto.credits ?? 0,
  };
}

export function toHelsb(dto: BackendHelsbApplication): HelsbApplication {
  const status = (dto.applicationStatus || '').toUpperCase();
  const mapped =
    status === 'NOT_ELIGIBLE' || status === 'FAILED' ? 'REJECTED'
      : status === 'CONFIRMED' || status === 'COMPLETED' ? 'APPROVED'
      : status || 'PENDING';
  const notes = [dto.screeningResult, dto.contractDetails, dto.paymentStatus]
    .filter(Boolean)
    .join(' — ');
  return {
    id: dto.id,
    applicationNumber: dto.applicationNumber || `HELSB-${dto.id}`,
    status: mapped,
    paymentStatus: dto.paymentStatus || undefined,
    screeningResult: dto.screeningResult || undefined,
    notes: notes || undefined,
    loanPercent: dto.loanPercent ?? undefined,
  };
}
