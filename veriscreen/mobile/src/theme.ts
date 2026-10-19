export const colors = {
  indigo: '#3e564f',
  gold: '#e3b23c',
  navy: '#2f4741',
  lapis: '#3e564f',
  ink: '#3e564f',
  surface: '#e7f1ee',
  white: '#ffffff',
  muted: '#5d726b',
  border: '#d5e4de',
  success: '#198754',
  warning: '#b58100',
  danger: '#dc3545',
  info: '#2f9e6a',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  control: 999,
};

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: colors.success,
    CONFIRMED: colors.success,
    APPROVED: colors.success,
    GENERATED: colors.success,
    PAID: colors.success,
    ELIGIBLE: colors.success,
    CLEARED: colors.success,
    PENDING: colors.warning,
    UNDER_REVIEW: colors.lapis,
    PARTIAL: colors.warning,
    REJECTED: colors.danger,
    NOT_ELIGIBLE: colors.danger,
    OUTSTANDING: colors.danger,
    FAILED: colors.danger,
    SAT: colors.lapis,
    COMPLETED: colors.success,
    CONTRACT_GENERATED: colors.lapis,
  };
  return map[status] || colors.muted;
}
