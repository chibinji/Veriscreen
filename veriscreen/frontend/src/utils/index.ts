import type { DocumentType, Role } from '../types';
import { DOCUMENT_TYPES, STATUS_BADGES } from '../constants';

export function formatDate(dateString: string | undefined | null, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', options || { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatCurrency(amount: number, currency = 'ZMW'): string {
  return new Intl.NumberFormat('en-ZM', { style: 'currency', currency }).format(amount);
}

export function getDocumentLabel(type: DocumentType): string {
  return DOCUMENT_TYPES[type] || type;
}

export function getStatusBadge(status: string): string {
  return STATUS_BADGES[status] || 'secondary';
}

export function getHelsbStatusLabel(status: string | undefined): string {
  const value = (status || '').toUpperCase();
  if (value === 'APPROVED' || value === 'CONFIRMED' || value === 'CONTRACT_GENERATED') return 'Approved';
  if (value === 'REJECTED' || value === 'NOT_ELIGIBLE' || value === 'FAILED') return 'Rejected';
  if (value === 'PENDING' || value === 'UNDER_REVIEW') return 'Submitted — waiting approval';
  return status ? status.replace(/_/g, ' ') : '—';
}

export function isHelsbWaitingApproval(status: string | undefined): boolean {
  const value = (status || '').toUpperCase();
  return value === 'PENDING' || value === 'UNDER_REVIEW';
}

export function isHelsbApproved(status: string | undefined): boolean {
  const value = (status || '').toUpperCase();
  return value === 'APPROVED' || value === 'CONFIRMED' || value === 'CONTRACT_GENERATED' || value === 'COMPLETED';
}


export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    STUDENT: 'Student',
    HELSB_OFFICER: 'HELSB Officer',
    HELSB_STUDENT: 'HELSB Student',
    ADMIN: 'Administrator',
  };
  return labels[role] || role;
}

export function getRoleDashboard(role: Role): string {
  return `${getRoleBasePath(role)}/dashboard`;
}

export function getRoleBasePath(role: Role): string {
  const paths: Record<Role, string> = {
    STUDENT: '/student',
    HELSB_OFFICER: '/officer',
    HELSB_STUDENT: '/helsb',
    ADMIN: '/admin',
  };
  return paths[role] || '';
}

export function getAccountPath(role: Role, page: 'profile' | 'settings' | 'notifications'): string {
  return `${getRoleBasePath(role)}/${page}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const withResponse = error as { response?: { data?: { message?: string } }; message?: string };
    if (withResponse.response?.data?.message) return withResponse.response.data.message;
    if (typeof withResponse.message === 'string' && withResponse.message) return withResponse.message;
  }
  return 'An unexpected error occurred';
}
