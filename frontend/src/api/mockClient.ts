import { TOKEN_KEY, USER_KEY } from '../constants';
import type { MockAccount, PageParams, PaginatedResponse, User } from '../types';
import { toPublicUser } from '../data/users';

export class ApiException extends Error {
  status: number;
  errors?: Record<string, string[]>;
  timestamp: string;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}

/** Simulated network latency so the UI can show loading states. */
export function delay(ms = 450 + Math.floor(Math.random() * 350)): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function fail(status: number, message: string, errors?: Record<string, string[]>): never {
  throw new ApiException(status, message, errors);
}

export function paginate<T>(items: T[], params: PageParams = {}): PaginatedResponse<T> {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const start = page * size;
  const content = items.slice(start, start + size);
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));

  return {
    content,
    totalElements,
    totalPages,
    page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}

export function getSessionUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function requireSession(): User {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = getSessionUser();
  if (!token || !user) {
    fail(401, 'You need to sign in to continue.');
  }
  return user;
}

export function issueToken(account: MockAccount): string {
  return `mock.${account.id}.${Date.now()}`;
}

export { toPublicUser };
