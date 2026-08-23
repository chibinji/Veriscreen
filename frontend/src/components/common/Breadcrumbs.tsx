import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<Props> = ({ items }) => (
  <nav aria-label="breadcrumb">
    <ol className="breadcrumb mb-0">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return isLast ? (
          <li key={idx} className="breadcrumb-item active" aria-current="page">
            {item.label}
          </li>
        ) : (
          <li key={idx} className="breadcrumb-item">
            {item.path ? <Link to={item.path}>{item.label}</Link> : item.label}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumbs;
