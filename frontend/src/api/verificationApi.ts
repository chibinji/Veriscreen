import type { VerificationResult } from '../types';
import { addAudit, getDb } from '../data/store';
import { delay, fail } from './mockClient';

export const verificationApi = {
  async verify(code: string): Promise<VerificationResult> {
    await delay(600);
    const doc = getDb().documents.find((item) => item.verificationCode === code);
    if (!doc) fail(404, 'Verification code not found.');

    let status: VerificationResult['status'] = 'VALID';
    if (doc.status === 'INVALID') status = 'INVALID';
    if (doc.status === 'EXPIRED' || (doc.expiresAt && new Date(doc.expiresAt).getTime() < Date.now())) {
      status = 'EXPIRED';
    }

    addAudit({
      action: 'VERIFY_DOCUMENT',
      performedBy: 'public',
      targetEntity: 'Document',
      targetId: String(doc.id),
      details: `Public verification of ${code} → ${status}`,
    });

    return {
      status,
      documentType: doc.type,
      studentNumber: doc.studentNumber,
      studentName: doc.studentName,
      generatedAt: doc.generatedAt,
      verifiedAt: new Date().toISOString(),
      issuedBy: doc.type === 'CONTRACT' ? 'Higher Education Loans and Scholarships Board' : 'University of Zambia',
    };
  },

  async logVerification(code: string, verifierInfo: { name: string; organization: string }): Promise<void> {
    await delay(200);
    addAudit({
      action: 'VERIFY_DOCUMENT',
      performedBy: verifierInfo.name || 'public',
      targetEntity: 'Document',
      targetId: code,
      details: `Logged verification for ${verifierInfo.organization || 'unknown organisation'}`,
    });
  },
};
