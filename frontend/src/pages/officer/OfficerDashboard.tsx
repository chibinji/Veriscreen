import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { helsbService } from '../../services/helsbService';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime, getErrorMessage } from '../../utils';

const OfficerDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErr } = useQuery({
    queryKey: ['officer-stats'],
    queryFn: helsbService.getOfficerStats,
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['applications', { page: 0, size: 5 }],
    queryFn: () => helsbService.getAllApplications({ page: 0, size: 5 }),
  });

  return (
    <div>
      <PageHeader
        title="Officer Dashboard"
        subtitle="Overview of HELSB application activity."
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {statsError && (
        <AlertMessage type="danger" message={getErrorMessage(statsErr) || 'Unable to load statistics.'} />
      )}

      {statsLoading ? (
        <LoadingSpinner text="Loading statistics…" />
      ) : (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Total Applications" value={stats?.totalApplications ?? 0} icon="bi-clipboard2-list" color="primary" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Pending Review" value={stats?.pendingReview ?? 0} icon="bi-hourglass-split" color="warning" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Approved Today" value={stats?.approvedToday ?? 0} icon="bi-check-circle" color="success" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Rejected Today" value={stats?.rejectedToday ?? 0} icon="bi-x-circle" color="danger" />
          </div>
        </div>
      )}

      {/* Recent applications */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom fw-semibold py-3 d-flex align-items-center justify-content-between">
          <span><i className="bi bi-clock-history me-2 text-primary" />Recent Applications</span>
          <Link to="/officer/applications" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        <div className="card-body p-0">
          {recentLoading ? (
            <LoadingSpinner />
          ) : !recent?.content.length ? (
            <EmptyState
              icon="bi-inbox"
              title="No applications yet"
              description="New HELSB applications will appear here."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Application #</th>
                    <th>Student</th>
                    <th>Program</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recent?.content.map((app) => (
                    <tr key={app.id}>
                      <td><code className="small">{app.applicationNumber}</code></td>
                      <td>
                        <div>
                          <p className="mb-0 small fw-medium">{app.studentName}</p>
                          <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{app.studentNumber}</p>
                        </div>
                      </td>
                      <td><span className="small">{app.program}</span></td>
                      <td><span className="small text-muted">{formatDateTime(app.submittedAt)}</span></td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>
                        <Link to={`/officer/applications/${app.id}`} className="btn btn-sm btn-outline-primary">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
