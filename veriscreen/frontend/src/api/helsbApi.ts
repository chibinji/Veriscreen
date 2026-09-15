import type {
  Application,
  BankDetails,
  OfficerDashboardStats,
  PageParams,
  PaginatedResponse,
  Payment,
  ScreeningResult,
} from '../types';
import { downloadBlob } from '../utils';
import { addAudit, getDb, nextId, saveDb } from '../data/store';
import { delay, fail, getSessionUser, paginate, requireSession } from './mockClient';
import { documentBlob, makeVerificationCode } from './documentTemplates';
import { API_ENDPOINTS } from '../constants';
import apiClient from '../services/apiClient';
import { toApplication, type BackendHelsbApplication } from './mappers';

function requireOfficer() {
  const session = requireSession();
  if (session.role !== 'HELSB_OFFICER' && session.role !== 'ADMIN') {
    fail(403, 'Only HELSB officers can perform this action.');
  }
  return session;
}

function studentNumberForSession() {
  const session = requireSession();
  if (!session.studentNumber) fail(403, 'This account is not linked to a student record.');
  return { session, studentNumber: session.studentNumber };
}

function attachDocuments(application: Application): Application {
  const docs = getDb().documents.filter(
    (doc) => doc.studentNumber === application.studentNumber && doc.type !== 'CONTRACT'
  );
  return { ...application, documents: docs };
}

export const helsbApi = {
<<<<<<< HEAD:veriscreen/frontend/src/api/helsbApi.ts
  async submitApplication(
    documentIds: Array<number | string> = [],
    mobileMoney?: { phone: string; provider: string },
  ): Promise<Application> {
    requireSession();
    const officialIds = documentIds
      .map((id) => String(id).trim())
      .filter((id) => id.startsWith('VS-') || id.length > 0);
    const { data } = await apiClient.post<BackendHelsbApplication>(API_ENDPOINTS.SUBMIT_HELSB, {
      documentIds: officialIds,
      mobileMoneyPhone: mobileMoney?.phone,
      mobileMoneyProvider: mobileMoney?.provider,
    });
    const session = getSessionUser();
    const studentNumber = session?.studentNumber || session?.username || '';
    const studentName = session ? `${session.firstName} ${session.lastName}`.trim() : '';
    return toApplication(data, studentNumber, studentName);
=======
  async submitApplication(_documentIds: number[]): Promise<Application> {
    fail(404, 'Submitting a HELSB application is not available. The server does not provide a submit endpoint.');
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:frontend/src/api/helsbApi.ts
  },

  async getMyApplication(): Promise<Application | null> {
    const session = getSessionUser();
    const studentNumber = session?.studentNumber || session?.username || '';
    const studentName = session ? `${session.firstName} ${session.lastName}`.trim() : '';
    const { data } = await apiClient.get<BackendHelsbApplication[]>(API_ENDPOINTS.ME_HELSB);
    if (!data.length) return null;
<<<<<<< HEAD:veriscreen/frontend/src/api/helsbApi.ts
    const ranked = [...data].sort((a, b) => {
      const score = (status?: string | null) => {
        const value = (status || '').toUpperCase();
        if (value === 'PENDING' || value === 'UNDER_REVIEW') return 4;
        if (value === 'APPROVED' || value === 'CONFIRMED' || value === 'CONTRACT_GENERATED') return 3;
        if (value === 'COMPLETED') return 2;
        return 1;
      };
      return score(b.applicationStatus) - score(a.applicationStatus) || (b.id ?? 0) - (a.id ?? 0);
    });
    const latest = ranked[0];
    return toApplication(latest, studentNumber, studentName);
=======
    return toApplication(data[0], studentNumber, studentName);
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:frontend/src/api/helsbApi.ts
  },

  async confirmApplication(applicationId: number): Promise<Application> {
    await delay();
    const { session, studentNumber } = studentNumberForSession();
    const application = getDb().applications.find((app) => app.id === applicationId);
    if (!application || application.studentNumber !== studentNumber) {
      fail(404, 'Application not found.');
    }
    if (application.status === 'PENDING') {
      application.status = 'UNDER_REVIEW';
      saveDb();
    }
    addAudit({
      action: 'CONFIRM_APPLICATION',
      performedBy: session.username,
      targetEntity: 'Application',
      targetId: String(applicationId),
      details: 'Student confirmed pre-filled HELSB information',
    });
    return attachDocuments(application);
  },

  async submitBankDetails(data: Omit<BankDetails, 'id'>): Promise<BankDetails> {
    await delay();
    const { session } = studentNumberForSession();
    const existing = getDb().bankDetails.find((item) => item.applicationId === data.applicationId);
    if (existing) fail(409, 'Bank details have already been saved for this application.');

    const record: BankDetails = { ...data, id: nextId('bank') };
    getDb().bankDetails.push(record);
    addAudit({
      action: 'SAVE_BANK_DETAILS',
      performedBy: session.username,
      targetEntity: 'BankDetails',
      targetId: String(record.id),
      details: `Saved ${data.bankName} account for application ${data.applicationId}`,
    });
    saveDb();
    return { ...record };
  },

  async getMyBankDetails(applicationId: number): Promise<BankDetails | null> {
    await delay();
    requireSession();
    const record = getDb().bankDetails.find((item) => item.applicationId === applicationId);
    if (!record) return null;
    return { ...record };
  },

  async makePayment(applicationId: number, amount: number): Promise<Payment> {
    await delay(900);
    const { session } = studentNumberForSession();
    if (amount <= 0) fail(400, 'Invalid payment amount.');
    const existing = getDb().payments.find((item) => item.applicationId === applicationId && item.status === 'COMPLETED');
    if (existing) fail(409, 'This application fee has already been paid.');

    const payment: Payment = {
      id: nextId('payment'),
      applicationId,
      amount,
      currency: 'ZMW',
      status: 'COMPLETED',
      transactionRef: `HELSB-PAY-${applicationId}-${Math.floor(Math.random() * 90000 + 10000)}`,
      paidAt: new Date().toISOString(),
    };
    getDb().payments.push(payment);
    const application = getDb().applications.find((app) => app.id === applicationId);
    if (application && application.status === 'PENDING') application.status = 'UNDER_REVIEW';
    getDb().notifications.unshift({
      id: nextId('notification'),
      userId: session.id,
      title: 'Payment received',
      message: `Application fee of ZMW ${amount} was processed. Ref ${payment.transactionRef}.`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/helsb/payment',
    });
    addAudit({
      action: 'PAYMENT',
      performedBy: session.username,
      targetEntity: 'Payment',
      targetId: String(payment.id),
      details: `Simulated payment ${payment.transactionRef}`,
    });
    saveDb();
    return { ...payment };
  },

  async getMyPayment(applicationId: number): Promise<Payment | null> {
    await delay();
    requireSession();
    const payment = getDb().payments.find((item) => item.applicationId === applicationId);
    if (!payment) return null;
    return { ...payment };
  },

  async getScreeningResult(applicationId: number): Promise<ScreeningResult | null> {
    await delay();
    requireSession();
    const result = getDb().screeningResults.find((item) => item.applicationId === applicationId);
    if (!result) return null;
    return { ...result };
  },

  async downloadContract(applicationId: number): Promise<void> {
    requireSession();
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.DOWNLOAD_HELSB_CONTRACT(applicationId), {
      responseType: 'blob',
    });
    downloadBlob(data, `HELSB-loan-contract-${applicationId}.pdf`);
    await apiClient.post(API_ENDPOINTS.EMAIL_HELSB_CONTRACT(applicationId));
  },

  async getOfficerStats(): Promise<OfficerDashboardStats> {
    await delay();
    requireOfficer();
    const apps = getDb().applications;
    const today = new Date().toISOString().slice(0, 10);
    return {
      totalApplications: apps.length,
      pendingReview: apps.filter((app) => app.status === 'PENDING' || app.status === 'UNDER_REVIEW').length,
      approvedToday: apps.filter((app) => app.status === 'APPROVED' && app.reviewedAt?.startsWith(today)).length,
      rejectedToday: apps.filter((app) => app.status === 'REJECTED' && app.reviewedAt?.startsWith(today)).length,
    };
  },

  async getAllApplications(params: PageParams = {}): Promise<PaginatedResponse<Application>> {
    await delay();
    requireOfficer();
    const search = (params.search || '').toLowerCase();
    let items = getDb().applications.map(attachDocuments);
    if (params.status) items = items.filter((app) => app.status === params.status);
    if (search) {
      items = items.filter(
        (app) =>
          app.studentName.toLowerCase().includes(search) ||
          app.studentNumber.toLowerCase().includes(search) ||
          app.applicationNumber.toLowerCase().includes(search)
      );
    }
    if (params.sort) {
      const key = params.sort as keyof Application;
      const dir = params.direction === 'asc' ? 1 : -1;
      items = [...items].sort((a, b) => {
        const av = String(a[key] ?? '');
        const bv = String(b[key] ?? '');
        return av.localeCompare(bv) * dir;
      });
    } else {
      items = [...items].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    }
    return paginate(items, params);
  },

  async getApplicationById(id: number): Promise<Application> {
    await delay();
    requireOfficer();
    const application = getDb().applications.find((app) => app.id === id);
    if (!application) fail(404, 'Application not found.');
    return attachDocuments(application);
  },

  async approveApplication(id: number, notes: string): Promise<Application> {
    await delay();
    const session = requireOfficer();
    const application = getDb().applications.find((app) => app.id === id);
    if (!application) fail(404, 'Application not found.');
    application.status = 'APPROVED';
    application.reviewedAt = new Date().toISOString();
    application.reviewedBy = `${session.firstName} ${session.lastName}`;
    application.notes = notes || 'Approved after review of verified academic records.';

    const existing = getDb().screeningResults.find((item) => item.applicationId === id);
    if (!existing) {
      getDb().screeningResults.push({
        id: nextId('screening'),
        applicationId: id,
        studentNumber: application.studentNumber,
        passed: true,
        score: 86,
        remarks: application.notes,
        screenedAt: application.reviewedAt,
        screenedBy: 'Automated Screening Engine',
      });
    }

    addAudit({
      action: 'APPROVE_APPLICATION',
      performedBy: session.username,
      targetEntity: 'Application',
      targetId: String(id),
      details: `Approved ${application.applicationNumber}`,
    });
    saveDb();
    return attachDocuments(application);
  },

  async rejectApplication(id: number, notes: string): Promise<Application> {
    await delay();
    const session = requireOfficer();
    const application = getDb().applications.find((app) => app.id === id);
    if (!application) fail(404, 'Application not found.');
    application.status = 'REJECTED';
    application.reviewedAt = new Date().toISOString();
    application.reviewedBy = `${session.firstName} ${session.lastName}`;
    application.notes = notes || 'Application did not meet eligibility criteria.';
    addAudit({
      action: 'REJECT_APPLICATION',
      performedBy: session.username,
      targetEntity: 'Application',
      targetId: String(id),
      details: `Rejected ${application.applicationNumber}`,
    });
    saveDb();
    return attachDocuments(application);
  },

  async generateContract(id: number): Promise<void> {
    await delay(800);
    const session = requireOfficer();
    const application = getDb().applications.find((app) => app.id === id);
    if (!application) fail(404, 'Application not found.');
    if (application.status !== 'APPROVED' && application.status !== 'CONTRACT_GENERATED') {
      fail(400, 'Only approved applications can receive a contract.');
    }

    application.status = 'CONTRACT_GENERATED';
    application.reviewedAt = application.reviewedAt || new Date().toISOString();
    const contract = {
      id: nextId('document'),
      type: 'CONTRACT' as const,
      studentNumber: application.studentNumber,
      studentName: application.studentName,
      generatedAt: new Date().toISOString(),
      verificationCode: makeVerificationCode('CONTRACT'),
      status: 'GENERATED' as const,
    };
    getDb().documents.unshift(contract);
    addAudit({
      action: 'GENERATE_CONTRACT',
      performedBy: session.username,
      targetEntity: 'Application',
      targetId: String(id),
      details: `Generated contract ${contract.verificationCode}`,
    });
    saveDb();
    downloadBlob(documentBlob(contract), `Contract_${application.applicationNumber}.html`);
  },

  async searchStudents(query: string): Promise<Application[]> {
    await delay();
    requireOfficer();
    const q = query.toLowerCase();
    const profiles = getDb().profiles.filter(
      (profile) =>
        profile.studentNumber.includes(query) ||
        profile.nrc.toLowerCase().includes(q) ||
        `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(q)
    );
    const fromApps = getDb().applications.filter(
      (app) =>
        app.studentName.toLowerCase().includes(q) ||
        app.studentNumber.includes(query) ||
        app.applicationNumber.toLowerCase().includes(q)
    );
    const merged = [...fromApps];
    profiles.forEach((profile) => {
      if (!merged.some((app) => app.studentNumber === profile.studentNumber)) {
        const extra = getDb().applications.find((app) => app.studentNumber === profile.studentNumber);
        if (extra) merged.push(extra);
      }
    });
    return merged.map(attachDocuments);
  },
};
