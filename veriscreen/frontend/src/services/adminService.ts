import { adminApi } from '../api';
import type { User, AuditLog, AdminStats, PageParams, PaginatedResponse, Role } from '../types';

export const adminService = {
  getStats: (): Promise<AdminStats> => adminApi.getStats(),
  getAllUsers: (params: PageParams): Promise<PaginatedResponse<User>> => adminApi.getAllUsers(params),
  getUserById: (id: number) => adminApi.getUserById(id),
  updateUserRole: (id: number, role: Role) => adminApi.updateUserRole(id, role),
  deactivateUser: (id: number) => adminApi.deactivateUser(id),
  activateUser: (id: number) => adminApi.activateUser(id),
  getAuditLogs: (params: PageParams): Promise<PaginatedResponse<AuditLog>> => adminApi.getAuditLogs(params),
};
