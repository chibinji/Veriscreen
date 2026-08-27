export const colors = {
  indigo: '#2c3d8f',
  gold: '#c9a227',
  navy: '#0b1d36',
  lapis: '#1d5aa6',
  ink: '#121826',
  surface: '#f4f6f9',
  white: '#ffffff',
  muted: '#5b6573',
  border: '#e2e6ee',
  success: '#198754',
  warning: '#b58100',
  danger: '#dc3545',
  info: '#0dcaf0',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  card: 20,
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
