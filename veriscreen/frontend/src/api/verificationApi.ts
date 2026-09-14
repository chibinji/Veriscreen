import type { VerificationResult, VerificationStatus } from '../types';
import { API_ENDPOINTS } from '../constants';
import apiClient from '../services/apiClient';
import { toDocumentType } from './mappers';

interface BackendVerification {
  valid: boolean;
  documentId: string;
  documentType?: string;
  status: string;
}

function toStatus(status: string | undefined, valid: boolean): VerificationStatus {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'EXPIRED') return 'EXPIRED';
  if (normalized === 'VALID' && valid) return 'VALID';
  return 'INVALID';
}

export const verificationApi = {
  async verify(code: string): Promise<VerificationResult> {
    const { data } = await apiClient.get<BackendVerification>(API_ENDPOINTS.VERIFY_DOCUMENT(code));
    return {
      valid: data.valid,
      status: toStatus(data.status, data.valid),
      documentId: data.documentId,
      documentType: data.documentType ? toDocumentType(data.documentType) : undefined,
      verifiedAt: new Date().toISOString(),
      issuedBy: 'VeriScreen',
    };
  },

  async logVerification(_code: string, _verifierInfo: { name: string; organization: string }): Promise<void> {
    return Promise.resolve();
  },
};
