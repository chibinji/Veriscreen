import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { addAudit, getDb, nextId, saveDb } from '../data/store';
import { DEMO_PASSWORD } from '../data/mockUsers';
import { delay, fail, issueToken, requireSession, toPublicUser } from './mockClient';
import { API_ENDPOINTS, TOKEN_KEY } from '../constants';
import apiClient from '../services/apiClient';
import { toUser, type BackendJwtResponse, type BackendStudentProfile } from './mappers';

function findAccount(usernameOrEmail: string) {
  const value = usernameOrEmail.trim().toLowerCase();
  return getDb().accounts.find(
    (account) =>
      account.username.toLowerCase() === value || account.email.toLowerCase() === value
  );
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const { data: jwt } = await apiClient.post<BackendJwtResponse>(API_ENDPOINTS.LOGIN, {
      id: data.username.trim(),
      password: data.password,
    });

    const token = jwt.accessToken;
    if (!token) {
      fail(401, 'Invalid student ID or password. Please try again.');
    }

    localStorage.setItem(TOKEN_KEY, token);

    try {
      const { data: profile } = await apiClient.get<BackendStudentProfile>(API_ENDPOINTS.ME_PROFILE);
      const user = toUser(profile);
      return {
        token,
        refreshToken: '',
        role: user.role,
        user,
      };
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await delay(700);

    if (data.password !== data.confirmPassword) {
      fail(400, 'Passwords do not match.', { confirmPassword: ['Passwords do not match'] });
    }

    const db = getDb();
    const exists = db.accounts.some(
      (account) =>
        account.username.toLowerCase() === data.studentNumber.toLowerCase() ||
        account.email.toLowerCase() === data.email.toLowerCase()
    );
    if (exists) {
      fail(409, 'An account with this student number or email already exists.');
    }

    const id = nextId('user');
    const account = {
      id,
      username: data.studentNumber,
      email: data.email,
      password: data.password,
      role: 'STUDENT' as const,
      firstName: data.firstName,
      lastName: data.lastName,
      studentNumber: data.studentNumber,
      createdAt: new Date().toISOString(),
      active: true,
    };

    db.accounts.push(account);
    db.profiles.push({
      id,
      studentNumber: data.studentNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      nrc: data.nrc,
      faculty: 'School of Natural and Applied Sciences',
      program: 'Bachelor of Science in Computer Science',
      yearOfStudy: 1,
      registrationStatus: 'ACTIVE',
      userId: id,
      campus: 'Great East Road Campus, Lusaka',
      enrollmentDate: new Date().toISOString().slice(0, 10),
      gpa: 0,
    });
    db.settings.push({
      userId: id,
      emailNotifications: true,
      smsNotifications: true,
      language: 'en',
    });
    db.notifications.unshift({
      id: nextId('notification'),
      userId: id,
      title: 'Welcome to VeriScreen',
      message: 'Your student account was created. You can now generate verified academic documents.',
      type: 'SUCCESS',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/student/dashboard',
    });

    addAudit({
      action: 'REGISTER',
      performedBy: account.username,
      targetEntity: 'User',
      targetId: String(id),
      details: 'New student account registered',
    });
    saveDb();

    const user = toPublicUser(account);
    const token = issueToken(account);
    return { token, refreshToken: `refresh.${token}`, role: account.role, user };
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    await delay();
    const account = findAccount(email);
    if (!account) {
      // Same response whether the email exists or not.
      return { message: 'If that email is registered, a reset link has been sent.' };
    }
    addAudit({
      action: 'FORGOT_PASSWORD',
      performedBy: account.username,
      targetEntity: 'User',
      targetId: String(account.id),
      details: 'Password reset requested (simulated email)',
    });
    return { message: 'If that email is registered, a reset link has been sent.' };
  },

  async resetPassword(_token: string, password: string): Promise<{ message: string }> {
    await delay();
    if (password.length < 8) {
      fail(400, 'Password must be at least 8 characters.');
    }
    return { message: 'Password has been reset. You can now sign in.' };
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    await delay();
    const session = requireSession();
    const account = getDb().accounts.find((item) => item.id === session.id);
    if (!account) fail(404, 'Account not found.');
    if (account.password !== oldPassword) {
      fail(400, 'Current password is incorrect.');
    }
    if (newPassword.length < 8) {
      fail(400, 'New password must be at least 8 characters.');
    }
    account.password = newPassword;
    saveDb();
    addAudit({
      action: 'CHANGE_PASSWORD',
      performedBy: account.username,
      targetEntity: 'User',
      targetId: String(account.id),
      details: 'Password changed',
    });
    return { message: 'Password updated successfully.' };
  },

  async getSession(): Promise<User> {
    const { data: profile } = await apiClient.get<BackendStudentProfile>(API_ENDPOINTS.ME_PROFILE);
    return toUser(profile);
  },

  demoPassword(): string {
    return DEMO_PASSWORD;
  },
};
