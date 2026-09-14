import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const buttons = [
  {
    label: 'Registration',
    path: '/student/records/registration',
    icon: 'bi-clipboard-check',
    detail: 'Student course registration and confirmation slip',
  },
  {
    label: 'Fee history',
    path: '/student/records/fees',
    icon: 'bi-receipt',
    detail: 'Year of study, session, and payment details',
  },
  {
    label: 'Academic results',
    path: '/student/records/results',
    icon: 'bi-journal-text',
    detail: 'Courses, grades, and proceed comments',
  },
];

const AcademicRecordsPage: React.FC = () => (
  <div>
    <PageHeader
      title="Academic Records"
      subtitle="Open registration, fee history, or academic results."
      breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Academic Records' }]}
    />

    <div className="row g-3">
      {buttons.map((button) => (
        <div className="col-md-4" key={button.path}>
          <Link to={button.path} className="sis-launch-btn">
            <i className={`bi ${button.icon}`} />
            <strong>{button.label}</strong>
            <span>{button.detail}</span>
          </Link>
        </div>
      ))}
    </div>
  </div>
);

export default AcademicRecordsPage;
