import type {
  AcademicResult,
  Application,
  ApplicationStatus,
  Document,
  DocumentType,
  ExamRecord,
  FeeRecord,
  RegistrationRecord,
  StudentProfile,
  User,
} from '../types';

export interface BackendStudentProfile {
  id: string;
  name: string;
  nrc?: string | null;
  program: string;
  faculty?: string | null;
  enrollmentYear: number;
  registrationStatus?: string | null;
  yearOfStudy?: number | null;
  email?: string | null;
  phone?: string | null;
  nextOfKinName?: string | null;
  nextOfKinRelationship?: string | null;
  nextOfKinPhone?: string | null;
  nextOfKinNrc?: string | null;
  nextOfKinAddress?: string | null;
}

export interface BackendDocument {
  type: string;
  url?: string | null;
  summary?: string | null;
  generatedDate?: string | null;
  documentId?: string | null;
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
  description?: string | null;
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
  courseName?: string | null;
  grade: string;
  credits: number;
  academicYear?: string | null;
}

export interface BackendHelsbApplication {
  id: number;
  applicationStatus: string;
  paymentStatus?: string | null;
  screeningResult?: string | null;
  contractDetails?: string | null;
  applicationNumber?: string | null;
  notes?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  loanPercent?: number | null;
  hasLoan?: boolean | null;
  mobileMoneyPhone?: string | null;
  mobileMoneyProvider?: string | null;
  submittedDocumentIds?: string | null;
  contractAvailable?: boolean | null;
  studentName?: string | null;
  studentId?: string | null;
  nrc?: string | null;
  programme?: string | null;
  faculty?: string | null;
  email?: string | null;
  phone?: string | null;
  pipelineStage?: string | null;
  screeningExplanation?: string | null;
}

export interface BackendJwtResponse {
  accessToken: string;
}

export function splitName(fullName: string | undefined | null): { firstName: string; lastName: string } {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: 'Student', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

function numericId(value: string | number | undefined): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function yearOfStudy(enrollmentYear?: number): number {
  if (!enrollmentYear) return 1;
  const computed = new Date().getFullYear() - enrollmentYear + 1;
  return Math.max(1, Math.min(computed, 8));
}

export function toUser(profile: BackendStudentProfile): User {
  const { firstName, lastName } = splitName(profile.name);
  return {
    id: numericId(profile.id),
    username: profile.id,
    email: profile.email || '',
    role: 'STUDENT',
    firstName,
    lastName,
    createdAt: new Date().toISOString(),
    studentNumber: profile.id,
    active: true,
  };
}

export function toStudentProfile(dto: BackendStudentProfile): StudentProfile {
  const { firstName, lastName } = splitName(dto.name);
  const userId = numericId(dto.id);
  return {
    id: userId,
    studentNumber: dto.id,
    firstName,
    lastName,
    email: dto.email || '',
    phone: dto.phone || '',
    nrc: dto.nrc || '',
    faculty: dto.faculty || '',
    program: dto.program || '',
    yearOfStudy: dto.yearOfStudy || yearOfStudy(dto.enrollmentYear),
    registrationStatus: dto.registrationStatus || 'ACTIVE',
    userId,
    enrollmentDate: dto.enrollmentYear ? `${dto.enrollmentYear}-01-01` : undefined,
    nextOfKinName: dto.nextOfKinName || undefined,
    nextOfKinRelationship: dto.nextOfKinRelationship || undefined,
    nextOfKinPhone: dto.nextOfKinPhone || undefined,
    nextOfKinNrc: dto.nextOfKinNrc || undefined,
    nextOfKinAddress: dto.nextOfKinAddress || undefined,
  };
}

export function toDocumentType(type: string | undefined | null): DocumentType {
  const normalized = (type || '').toUpperCase().replace(/\s+/g, '_');
  if (normalized.includes('CONFIRMATION')) return 'CONFIRMATION_SLIP';
  if (normalized.includes('EXAM')) return 'EXAM_SLIP';
  if (normalized.includes('FEE')) return 'FEE_STATEMENT';
  if (normalized.includes('CONTRACT')) return 'CONTRACT';
  return 'TRANSCRIPT';
}

export function toDocument(
  dto: BackendDocument,
  index: number,
  studentNumber: string,
  studentName: string
): Document {
  return {
    id: index + 1,
    type: toDocumentType(dto.type),
    studentNumber,
    studentName,
    generatedAt: dto.generatedDate || new Date().toISOString(),
    verificationCode: dto.summary || '—',
    status: 'GENERATED',
    downloadUrl: dto.url || undefined,
    officialId: dto.documentId || undefined,
  };
}

export function toRegistration(dto: BackendRegistration, studentNumber: string): RegistrationRecord {
  return {
    id: dto.id,
    studentNumber,
    academicYear: dto.academicYear,
    semester: String(dto.semester ?? ''),
    confirmationStatus: dto.confirmed ? 'CONFIRMED' : 'PENDING',
    registeredAt: dto.registrationDate || undefined,
  };
}

export function toFeeRecord(dto: BackendFee, studentNumber: string): FeeRecord {
  const paid = Number(dto.amount ?? 0);
  const outstanding = Number(dto.outstandingBalance ?? 0);
  const billed = paid + outstanding;
  let status: FeeRecord['status'] = 'PAID';
  if (outstanding > 0) status = paid > 0 ? 'PARTIAL' : 'OUTSTANDING';
  return {
    id: dto.id,
    studentNumber,
    academicYear: dto.paymentDate ? String(dto.paymentDate).slice(0, 4) : '',
    semester: '',
    description: dto.description || 'Fee payment',
    amount: billed || paid,
    paidAmount: paid,
    paymentDate: dto.paymentDate || undefined,
    receiptNumber: dto.receiptNo || undefined,
    status,
  };
}

export function toExamRecord(dto: BackendExamination, studentNumber: string): ExamRecord {
  const sittingStatus: ExamRecord['sittingStatus'] =
    dto.status === 'COMPLETED' || dto.status === 'SAT'
      ? 'SAT'
      : dto.eligible
        ? 'ELIGIBLE'
        : 'NOT_ELIGIBLE';
  return {
    id: dto.id,
    studentNumber,
    academicYear: dto.academicYear,
    semester: '',
    courseCode: dto.academicYear || '—',
    courseName: dto.status || (dto.eligible ? 'Eligible' : 'Not eligible'),
    examDate: '',
    venue: '',
    sittingStatus,
  };
}

export function toAcademicResult(dto: BackendAcademicResult, studentNumber: string): AcademicResult {
  return {
    id: dto.id,
    studentNumber,
    academicYear: dto.academicYear || '',
    semester: '',
    courseCode: dto.courseCode,
    courseName: dto.courseName || '',
    credits: dto.credits ?? 0,
    grade: dto.grade,
    gradePoint: 0,
  };
}

function toApplicationStatus(status: string | undefined | null): ApplicationStatus {
  const value = (status || '').toUpperCase();
  if (value === 'APPROVED' || value === 'CONFIRMED' || value === 'UNDER_REVIEW' || value === 'PENDING' || value === 'CONTRACT_GENERATED' || value === 'COMPLETED') {
    if (value === 'CONFIRMED' || value === 'COMPLETED') return 'APPROVED';
    return value;
  }
  if (value === 'REJECTED' || value === 'NOT_ELIGIBLE' || value === 'FAILED') return 'REJECTED';
  return 'PENDING';
}

export function toApplication(
  dto: BackendHelsbApplication,
  studentNumber: string,
  studentName: string
): Application {
  const notes = dto.notes || [dto.screeningResult, dto.contractDetails, dto.paymentStatus]
    .filter(Boolean)
    .join(' — ');
  return {
    id: dto.id,
    applicationNumber: dto.applicationNumber || `HELSB-${dto.id}`,
    studentNumber: dto.studentId || studentNumber,
    studentName: dto.studentName || studentName,
    program: dto.programme || '',
    faculty: dto.faculty || '',
    yearOfStudy: 0,
    status: toApplicationStatus(dto.applicationStatus),
    submittedAt: dto.submittedAt || '',
    reviewedAt: dto.reviewedAt || undefined,
    notes: notes || undefined,
    documents: [],
    loanPercent: dto.loanPercent ?? undefined,
    hasLoan: Boolean(dto.hasLoan),
    screeningResult: dto.screeningResult || undefined,
    paymentStatus: dto.paymentStatus || undefined,
    mobileMoneyPhone: dto.mobileMoneyPhone || undefined,
    mobileMoneyProvider: dto.mobileMoneyProvider || undefined,
    submittedDocumentIds: dto.submittedDocumentIds || undefined,
    contractAvailable: Boolean(dto.contractAvailable),
    nrc: dto.nrc || undefined,
    email: dto.email || undefined,
    phone: dto.phone || undefined,
    pipelineStage: dto.pipelineStage || undefined,
    screeningExplanation: dto.screeningExplanation || undefined,
  };
}
