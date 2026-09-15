import { helsbApi } from '../api';
import type {
  Application, BankDetails,
  PageParams, PaginatedResponse, OfficerDashboardStats,
} from '../types';

export const helsbService = {
<<<<<<< HEAD:veriscreen/frontend/src/services/helsbService.ts
  submitApplication: (
    documentIds: Array<number | string> = [],
    mobileMoney?: { phone: string; provider: string },
  ) => helsbApi.submitApplication(documentIds, mobileMoney),
=======
  submitApplication: (documentIds: number[]) => helsbApi.submitApplication(documentIds),
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:frontend/src/services/helsbService.ts
  getMyApplication: () => helsbApi.getMyApplication(),
  confirmApplication: (applicationId: number) => helsbApi.confirmApplication(applicationId),
  submitBankDetails: (data: Omit<BankDetails, 'id'>) => helsbApi.submitBankDetails(data),
  getMyBankDetails: (applicationId: number) => helsbApi.getMyBankDetails(applicationId),
  makePayment: (applicationId: number, amount: number) => helsbApi.makePayment(applicationId, amount),
  getMyPayment: (applicationId: number) => helsbApi.getMyPayment(applicationId),
  getScreeningResult: (applicationId: number) => helsbApi.getScreeningResult(applicationId),
  downloadContract: (applicationId: number) => helsbApi.downloadContract(applicationId),
  getOfficerStats: (): Promise<OfficerDashboardStats> => helsbApi.getOfficerStats(),
  getAllApplications: (params: PageParams): Promise<PaginatedResponse<Application>> =>
    helsbApi.getAllApplications(params),
  getApplicationById: (id: number) => helsbApi.getApplicationById(id),
  approveApplication: (id: number, notes: string) => helsbApi.approveApplication(id, notes),
  rejectApplication: (id: number, notes: string) => helsbApi.rejectApplication(id, notes),
  generateContract: (id: number) => helsbApi.generateContract(id),
  searchStudents: (query: string) => helsbApi.searchStudents(query),
};
