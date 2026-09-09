import React from 'react';
import { getStatusBadge } from '../../utils';

interface Props {
  status: string;
  label?: string;
}

const StatusBadge: React.FC<Props> = ({ status, label }) => (
  <span className={`badge bg-${getStatusBadge(status)}-subtle text-${getStatusBadge(status)} border border-${getStatusBadge(status)}-subtle`}>
    {label || status.replace(/_/g, ' ')}
  </span>
);

export default StatusBadge;
