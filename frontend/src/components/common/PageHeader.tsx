import React from 'react';
import Breadcrumbs, { type BreadcrumbItem } from './Breadcrumbs';

interface Props {
  title: React.ReactNode;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const PageHeader: React.FC<Props> = ({ title, subtitle, breadcrumbs, actions }) => (
  <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
    <div>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <h4 className="mb-0 mt-1 fw-bold text-navy">{title}</h4>
      {subtitle && <p className="text-muted mb-0 small mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="d-flex gap-2 flex-wrap">{actions}</div>}
  </div>
);

export default PageHeader;
