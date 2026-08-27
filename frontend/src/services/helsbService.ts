import { helsbApi } from '../api';
import type {
  Application, BankDetails,
  PageParams, PaginatedResponse, OfficerDashboardStats,
} from '../types';

export const helsbService = {
  submitApplication: (documentIds: Array<number | string> = []) => helsbApi.submitApplication(documentIds),
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
