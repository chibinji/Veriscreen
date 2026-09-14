import type { MockAccount, User } from '../types';
import { mockUsers } from './mockUsers';

export function toPublicUser(account: MockAccount): User {
  const { password, ...user } = account;
  void password;
  return user;
}

/** Public user records (no passwords). Components must load these through the API. */
export const users: User[] = mockUsers.map(toPublicUser);
