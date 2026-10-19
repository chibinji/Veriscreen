import type { VerificationResult } from '../types';
import { fail } from './mockClient';
import apiClient from '../services/apiClient';

export const verificationApi = {
  async verify(code: string): Promise<VerificationResult> {
    const { data } = await apiClient.get<{
      valid: boolean;
      documentType?: string | null;
      studentNumber?: string | null;
      studentName?: string | null;
      generatedAt?: string | null;
    }>(`/api/verify/${encodeURIComponent(code)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!data.valid) fail(404, 'Verification code not found.');
    return {
      status: 'VALID',
      documentType: (data.documentType || 'TRANSCRIPT') as VerificationResult['documentType'],
      studentNumber: data.studentNumber || '—',
      studentName: data.studentName || '—',
      generatedAt: data.generatedAt || new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      issuedBy: 'University of Zambia',
    };
  },

  async logVerification(_code: string, _verifierInfo: { name: string; organization: string }): Promise<void> {
    return undefined;
  },
};
