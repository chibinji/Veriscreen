import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { documentService } from '../../services/documentService';
import StatCard from '../../components/cards/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { formatDate, getDocumentLabel, getErrorMessage } from '../../utils';
import AlertMessage from '../../components/common/AlertMessage';

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading, isError, error } = useQuery({
    queryKey: ['student-stats'],
    queryFn: studentService.getDashboardStats,
  });

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: documentService.getMyDocuments,
  });

  const firstName = user?.firstName || 'Student';

  return (
    <div>
      <PageHeader
        title={
          <>
            Welcome back, <span className="text-lapis">{firstName}</span>
          </>
        }
        subtitle="Overview of your verified academic records and applications."
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {isError && (
        <AlertMessage type="danger" message={getErrorMessage(error)} />
      )}

      {statsLoading ? (
        <LoadingSpinner text="Loading dashboard…" />
      ) : (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Documents Verified" value={stats?.documentsGenerated ?? 0} icon="bi-file-earmark-check" color="primary" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Active Applications" value={stats?.activeApplications ?? 0} icon="bi-send" color="success" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Verification Requests" value={stats?.verificationRequests ?? 0} icon="bi-shield-check" color="info" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Notifications" value={stats?.unreadNotifications ?? 0} icon="bi-bell" color="warning" />
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom fw-semibold py-3 d-flex justify-content-between align-items-center">
          <span className="text-navy">
            <i className="bi bi-file-earmark-check me-2 text-gold" />
            Verified Documents
          </span>
          <Link to="/student/documents" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        <div className="card-body p-0">
          {docsLoading ? (
            <LoadingSpinner />
          ) : !documents || documents.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-2" />
              <p className="mt-2 small mb-0">No verified documents yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Document</th>
                    <th>Verified</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.slice(0, 5).map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-file-earmark-text text-indigo" />
                          <span className="small fw-medium text-navy">{getDocumentLabel(doc.type)}</span>
                        </div>
                      </td>
                      <td><span className="small text-muted">{formatDate(doc.generatedAt)}</span></td>
                      <td>
                        <StatusBadge
                          status={doc.status}
                          label={doc.status === 'GENERATED' ? 'Verified' : undefined}
                        />
                      </td>
                      <td>
                        <Link to="/student/documents" className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye me-1" />Preview
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

export default StudentDashboard;
