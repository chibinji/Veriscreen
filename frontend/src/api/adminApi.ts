import type { AdminStats, AuditLog, PageParams, PaginatedResponse, Role, User } from '../types';
import { addAudit, getDb, saveDb } from '../data/store';
import { delay, fail, paginate, requireSession, toPublicUser } from './mockClient';

function requireAdmin() {
  const session = requireSession();
  if (session.role !== 'ADMIN') fail(403, 'Administrator access is required.');
  return session;
}

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    await delay();
    requireAdmin();
    const db = getDb();
    return {
      totalUsers: db.accounts.filter((account) => account.active !== false).length,
      totalStudents: db.accounts.filter((account) => account.role === 'STUDENT' && account.active !== false).length,
      totalOfficers: db.accounts.filter((account) => account.role === 'HELSB_OFFICER').length,
      totalDocuments: db.documents.length,
      totalApplications: db.applications.length,
      activeToday: 4,
    };
  },

  async getAllUsers(params: PageParams = {}): Promise<PaginatedResponse<User>> {
    await delay();
    requireAdmin();
    const search = (params.search || '').toLowerCase();
    const items = getDb()
      .accounts.map(toPublicUser)
      .filter((user) => {
        if (!search) return true;
        return (
          user.username.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(search)
        );
      });
    return paginate(items, params);
  },

  async getUserById(id: number): Promise<User> {
    await delay();
    requireAdmin();
    const account = getDb().accounts.find((item) => item.id === id);
    if (!account) fail(404, 'User not found.');
    return toPublicUser(account);
  },

  async updateUserRole(id: number, role: Role): Promise<User> {
    await delay();
    const session = requireAdmin();
    const account = getDb().accounts.find((item) => item.id === id);
    if (!account) fail(404, 'User not found.');
    account.role = role;
    saveDb();
    addAudit({
      action: 'UPDATE_ROLE',
      performedBy: session.username,
      targetEntity: 'User',
      targetId: String(id),
      details: `Changed role to ${role}`,
    });
    return toPublicUser(account);
  },

  async deactivateUser(id: number): Promise<void> {
    await delay();
    const session = requireAdmin();
    if (session.id === id) fail(400, 'You cannot deactivate your own account.');
    const account = getDb().accounts.find((item) => item.id === id);
    if (!account) fail(404, 'User not found.');
    account.active = false;
    addAudit({
      action: 'DEACTIVATE_USER',
      performedBy: session.username,
      targetEntity: 'User',
      targetId: String(id),
      details: `Deactivated ${account.username}`,
    });
    saveDb();
  },

  async activateUser(id: number): Promise<void> {
    await delay();
    const session = requireAdmin();
    const account = getDb().accounts.find((item) => item.id === id);
    if (!account) fail(404, 'User not found.');
    account.active = true;
    addAudit({
      action: 'ACTIVATE_USER',
      performedBy: session.username,
      targetEntity: 'User',
      targetId: String(id),
      details: `Activated ${account.username}`,
    });
    saveDb();
  },

  async getAuditLogs(params: PageParams = {}): Promise<PaginatedResponse<AuditLog>> {
    await delay();
    requireAdmin();
    const search = (params.search || '').toLowerCase();
    let items = [...getDb().auditLogs];
    if (search) {
      items = items.filter(
        (log) =>
          log.action.toLowerCase().includes(search) ||
          log.performedBy.toLowerCase().includes(search) ||
          log.targetEntity.toLowerCase().includes(search) ||
          log.details.toLowerCase().includes(search)
      );
    }
    return paginate(items, params);
  },
};
