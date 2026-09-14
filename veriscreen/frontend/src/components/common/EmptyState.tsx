import React from 'react';

interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<Props> = ({
  icon = 'bi-inbox',
  title,
  description,
  action,
}) => (
  <div className="text-center py-5">
    <i className={`bi ${icon} fs-1 text-muted`} />
    <h5 className="mt-3 text-muted">{title}</h5>
    {description && <p className="text-muted small mb-3">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);

export default EmptyState;
