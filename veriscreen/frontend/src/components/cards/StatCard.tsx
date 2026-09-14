import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
  subtitle?: string;
  trend?: { value: number; label: string };
}

const StatCard: React.FC<Props> = ({ title, value, subtitle, trend }) => (
  <div className="vs-stat">
    <p className="vs-stat-label mb-1">{title}</p>
    <p className="vs-stat-value">{value}</p>
    {subtitle && <p className="text-muted small mb-0 mt-1">{subtitle}</p>}
    {trend && (
      <p className="mb-0 small mt-1">
        <span className={`fw-semibold text-${trend.value >= 0 ? 'success' : 'danger'}`}>
          {Math.abs(trend.value)}%
        </span>
        <span className="text-muted ms-1">{trend.label}</span>
      </p>
    )}
  </div>
);

export default StatCard;
