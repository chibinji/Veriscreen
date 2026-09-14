import type { AcademicResult, FeeRecord, StudentProfile } from '../../types';

export function fullName(profile?: StudentProfile | null): string {
  if (!profile) return '—';
  return `${profile.firstName} ${profile.lastName}`.trim().toUpperCase();
}

export function bachelorProgramme(program?: string | null): string {
  const value = (program || '').trim();
  if (!value) return '—';
  if (/^bachelor of\b/i.test(value)) return value.toUpperCase();
  return `BACHELOR OF ${value}`.toUpperCase();
}

export function ordinalYear(year?: number | null): string {
  const value = year && year > 0 ? year : 1;
  if (value === 1) return '1ST YEAR';
  if (value === 2) return '2ND YEAR';
  if (value === 3) return '3RD YEAR';
  return `${value}TH YEAR`;
}

export function titleYear(year?: number | null): string {
  const value = year && year > 0 ? year : 1;
  if (value === 1) return '1st Year';
  if (value === 2) return '2nd Year';
  if (value === 3) return '3rd Year';
  return `${value}th Year`;
}

export function gerSession(academicYear?: string | null, semester?: string | null): string {
  const start = (academicYear || '').split('/')[0] || String(new Date().getFullYear());
  const sem = String(semester || '1').replace(/\D/g, '') || '1';
  return `GER ${start}${sem}`;
}

export function yearOfStudyFor(academicYear: string, profile?: StudentProfile | null): number {
  const current = profile?.yearOfStudy || 1;
  const currentStart = new Date().getFullYear();
  const start = Number.parseInt((academicYear || '').split('/')[0] || String(currentStart), 10);
  if (!Number.isFinite(start)) return current;
  return Math.max(1, current - (currentStart - start));
}

export function money(value: number): string {
  return Number(value || 0).toLocaleString('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function groupResults(results: AcademicResult[], profile?: StudentProfile | null) {
  const groups = new Map<string, AcademicResult[]>();
  for (const row of results) {
    const key = `${row.academicYear || '—'}|${row.semester || '1'}`;
    const list = groups.get(key) || [];
    list.push(row);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([key, courses]) => {
    const [academicYear, semester] = key.split('|');
    const year = yearOfStudyFor(academicYear, profile);
    const unpublished = courses.some((course) => !course.grade || course.grade.includes('*'));
    return {
      key,
      academicYear,
      session: gerSession(academicYear, semester),
      programme: bachelorProgramme(profile?.program),
      yearOfStudy: ordinalYear(year),
      courses,
      comment: unpublished ? '***NOT PUBLISHED***' : 'PROCEED',
    };
  });
}

export function groupFees(fees: FeeRecord[], profile?: StudentProfile | null) {
  const groups = new Map<string, FeeRecord[]>();
  for (const row of fees) {
    const key = row.academicYear || 'current';
    const list = groups.get(key) || [];
    list.push(row);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([academicYear, rows]) => {
    const year = yearOfStudyFor(academicYear === 'current' ? '' : academicYear, profile);
    const amount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const paid = rows.reduce((sum, row) => sum + Number(row.paidAmount || 0), 0);
    return {
      key: academicYear,
      yearOfStudy: titleYear(year),
      session: `${gerSession(academicYear === 'current' ? undefined : academicYear, rows[0]?.semester)} - ${profile?.studentNumber?.slice(-4) || '0000'} / ${String(rows.length * 113).padStart(4, '0')}`,
      rows,
      amount,
      paid,
      balance: amount - paid,
    };
  });
}
