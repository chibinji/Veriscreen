import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  subtitle?: string;
  trend?: { value: number; label: string };
}

const StatCard: React.FC<Props> = ({ title, value, icon, color = 'primary', subtitle, trend }) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-body">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <p className="text-muted small mb-1 text-uppercase fw-semibold ls-1">{title}</p>
          <h3 className="mb-0 fw-bold text-navy">{value}</h3>
        </div>
        <div className={`rounded-3 p-3 bg-${color}-subtle`}>
          <i className={`bi ${icon} fs-4 text-${color}`} />
        </div>
      </div>
      {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
      {trend && (
        <p className="mb-0 small">
          <span className={`fw-semibold text-${trend.value >= 0 ? 'success' : 'danger'}`}>
            <i className={`bi bi-arrow-${trend.value >= 0 ? 'up' : 'down'}-short`} />
            {Math.abs(trend.value)}%
          </span>
          <span className="text-muted ms-1">{trend.label}</span>
        </p>
      )}
    </div>
  </div>
);

export default StatCard;
