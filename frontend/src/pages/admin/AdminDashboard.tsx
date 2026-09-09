import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import { getErrorMessage } from '../../utils';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
  });

  const quickLinks = [
    { label: 'Manage Users', icon: 'bi-people', path: '/admin/users', color: 'primary', desc: 'View, edit and manage user accounts' },
    { label: 'Audit Logs', icon: 'bi-journal-text', path: '/admin/audit-logs', color: 'warning', desc: 'Track all system activity' },
    { label: 'Notifications', icon: 'bi-bell', path: '/admin/notifications', color: 'info', desc: 'View system notifications' },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview and management."
        breadcrumbs={[{ label: 'Admin Dashboard' }]}
      />

      {isError && (
        <AlertMessage type="danger" message={getErrorMessage(error) || 'Unable to load statistics.'} />
      )}

      {isLoading ? (
        <LoadingSpinner text="Loading statistics…" />
      ) : (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-4">
            <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon="bi-people" color="primary" />
          </div>
          <div className="col-sm-6 col-xl-4">
            <StatCard title="Total Students" value={stats?.totalStudents ?? 0} icon="bi-mortarboard" color="success" />
          </div>
          <div className="col-sm-6 col-xl-4">
            <StatCard title="HELSB Officers" value={stats?.totalOfficers ?? 0} icon="bi-person-badge" color="info" />
          </div>
          <div className="col-sm-6 col-xl-4">
            <StatCard title="Total Documents" value={stats?.totalDocuments ?? 0} icon="bi-file-earmark-text" color="warning" />
          </div>
          <div className="col-sm-6 col-xl-4">
            <StatCard title="Applications" value={stats?.totalApplications ?? 0} icon="bi-clipboard2-list" color="secondary" />
          </div>
          <div className="col-sm-6 col-xl-4">
            <StatCard title="Active Today" value={stats?.activeToday ?? 0} icon="bi-activity" color="danger" />
          </div>
        </div>
      )}

      <div className="row g-3">
        {quickLinks.map((link) => (
          <div key={link.path} className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className={`bg-${link.color}-subtle rounded-2 d-inline-flex align-items-center justify-content-center mb-3`} style={{ width: 48, height: 48 }}>
                  <i className={`bi ${link.icon} fs-4 text-${link.color}`} />
                </div>
                <h6 className="fw-bold mb-1">{link.label}</h6>
                <p className="text-muted small mb-3">{link.desc}</p>
                <Link to={link.path} className={`btn btn-${link.color} btn-sm`}>
                  Go to {link.label} <i className="bi bi-arrow-right ms-1" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
