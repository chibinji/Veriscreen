import type {
  AcademicResult,
  Application,
  AuditLog,
  BankDetails,
  Document,
  ExamRecord,
  FeeRecord,
  MockAccount,
  Notification,
  Payment,
  RegistrationRecord,
  ScreeningResult,
  StudentProfile,
  UserSettings,
} from '../types';
import { mockUsers } from './mockUsers';
import { studentProfiles, academicResults, feeRecords, registrationRecords, examRecords, defaultSettings } from './students';
import { documents } from './documents';
import { applications, payments, bankDetails, screeningResults } from './applications';
import { notifications } from './notifications';
import { auditLogs } from './auditLogs';

const STORAGE_KEY = 'veriscreen_mock_db_v1';

export interface MockDatabase {
  accounts: MockAccount[];
  profiles: StudentProfile[];
  documents: Document[];
  applications: Application[];
  payments: Payment[];
  bankDetails: BankDetails[];
  screeningResults: ScreeningResult[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  academicResults: AcademicResult[];
  feeRecords: FeeRecord[];
  registrationRecords: RegistrationRecord[];
  examRecords: ExamRecord[];
  settings: UserSettings[];
  nextId: {
    user: number;
    document: number;
    application: number;
    payment: number;
    bank: number;
    screening: number;
    notification: number;
    audit: number;
  };
}

function seed(): MockDatabase {
  return {
    accounts: structuredClone(mockUsers),
    profiles: structuredClone(studentProfiles),
    documents: structuredClone(documents),
    applications: structuredClone(applications),
    payments: structuredClone(payments),
    bankDetails: structuredClone(bankDetails),
    screeningResults: structuredClone(screeningResults),
    notifications: structuredClone(notifications),
    auditLogs: structuredClone(auditLogs),
    academicResults: structuredClone(academicResults),
    feeRecords: structuredClone(feeRecords),
    registrationRecords: structuredClone(registrationRecords),
    examRecords: structuredClone(examRecords),
    settings: structuredClone(defaultSettings),
    nextId: {
      user: 9,
      document: 10,
      application: 6,
      payment: 2,
      bank: 2,
      screening: 3,
      notification: 8,
      audit: 7,
    },
  };
}

function load(): MockDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as MockDatabase;
  } catch {
    return seed();
  }
}

let db: MockDatabase = load();

export function getDb(): MockDatabase {
  return db;
}

export function saveDb(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDb(): void {
  db = seed();
  saveDb();
}

export function nextId(key: keyof MockDatabase['nextId']): number {
  const value = db.nextId[key];
  db.nextId[key] += 1;
  saveDb();
  return value;
}

export function addAudit(entry: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'> & { ipAddress?: string }): void {
  db.auditLogs.unshift({
    id: nextId('audit'),
    timestamp: new Date().toISOString(),
    ipAddress: entry.ipAddress || '127.0.0.1',
    action: entry.action,
    performedBy: entry.performedBy,
    targetEntity: entry.targetEntity,
    targetId: entry.targetId,
    details: entry.details,
  });
  saveDb();
}
