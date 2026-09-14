import { verificationApi } from '../api';
import type { VerificationResult } from '../types';

export const verificationService = {
  verify: (code: string): Promise<VerificationResult> => verificationApi.verify(code),
  logVerification: (code: string, verifierInfo: { name: string; organization: string }) =>
    verificationApi.logVerification(code, verifierInfo),
};
