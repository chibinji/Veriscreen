import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helsbService } from '../../services/helsbService';
import { useSessionQueryKey } from '../../hooks/useSessionQueryKey';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';
import { formatDateTime, getErrorMessage } from '../../utils';

const steps = [
  { step: 1, label: 'Review Information', path: '/helsb/dashboard', icon: 'bi-eye', status: ['PENDING'] },
  { step: 2, label: 'Confirm Details', path: '/helsb/dashboard', icon: 'bi-check-circle', status: ['PENDING'] },
  { step: 3, label: 'Pay Application Fee', path: '/helsb/payment', icon: 'bi-credit-card', status: ['UNDER_REVIEW'] },
  { step: 4, label: 'Provide Bank Details', path: '/helsb/bank-details', icon: 'bi-bank', status: ['UNDER_REVIEW'] },
  { step: 5, label: 'View Screening Result', path: '/helsb/screening', icon: 'bi-bar-chart-line', status: ['APPROVED'] },
  { step: 6, label: 'Download Contract', path: '/helsb/contract', icon: 'bi-file-earmark-ruled', status: ['APPROVED', 'CONTRACT_GENERATED', 'COMPLETED'] },
];

const HelsbStudentDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: application, isLoading, isError } = useQuery({
    queryKey: useSessionQueryKey('my-application'),
    queryFn: helsbService.getMyApplication,
    retry: false,
  });

  const confirmMutation = useMutation({
    mutationFn: () => helsbService.confirmApplication(application!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-application'] });
      setMessage('Information confirmed. You can now pay the application fee.');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="HELSB Application Portal"
        subtitle="Track and complete your Higher Education Loans and Scholarships Board application."
        breadcrumbs={[{ label: 'HELSB Dashboard' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {message && <AlertMessage type="success" message={message} autoDismiss={4000} onDismiss={() => setMessage('')} />}

      {isLoading && <LoadingSpinner text="Loading application…" />}

      {isError && (
        <AlertMessage type="danger" message="Unable to load your HELSB application. Please try again." />
      )}

      {!isLoading && !isError && !application && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon="bi-clipboard2-x"
              title="No application found"
              description="No HELSB application is linked to this account yet. Submit documents from the VeriScreen student portal first."
            />
          </div>
        </div>
      )}

      {application && (
        <div className="row g-3">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom fw-semibold py-3">
                <i className="bi bi-clipboard2-check me-2 text-primary" />Application Status
              </div>
              <div className="card-body">
                <div className="text-center py-3">
                  <StatusBadge status={application.status} />
                  <h6 className="mt-3 mb-1">{application.applicationNumber}</h6>
                  <p className="text-muted small">Submitted {formatDateTime(application.submittedAt)}</p>
                </div>
                <hr />
                {[
                  { label: 'Program', value: application.program },
                  { label: 'Faculty', value: application.faculty },
                  { label: 'Year', value: `Year ${application.yearOfStudy}` },
                ].map((item) => (
                  <div key={item.label} className="d-flex justify-content-between small py-1 border-bottom">
                    <span className="text-muted">{item.label}</span>
                    <span className="fw-medium">{item.value}</span>
                  </div>
                ))}
                {application.status === 'PENDING' && (
                  <button
                    className="btn btn-primary w-100 mt-3"
                    disabled={confirmMutation.isPending}
                    onClick={() => confirmMutation.mutate()}
                  >
                    {confirmMutation.isPending ? 'Confirming…' : 'Confirm my information'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom fw-semibold py-3">
                <i className="bi bi-list-check me-2 text-success" />Application Workflow
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  {steps.map((s, idx) => {
                    const isCompleted = steps.slice(0, idx).some((prev) =>
                      prev.status.includes(application.status)
                    ) || idx === 0;
                    const isCurrent = s.status.includes(application.status);

                    return (
                      <div key={s.step} className={`d-flex align-items-center gap-3 p-3 rounded-2 border ${isCurrent ? 'border-primary bg-primary-subtle' : isCompleted ? 'border-success-subtle bg-success-subtle' : 'border-light bg-light'}`}>
                        <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 ${isCurrent ? 'bg-primary text-white' : isCompleted ? 'bg-success text-white' : 'bg-secondary-subtle text-secondary'}`} style={{ width: 36, height: 36 }}>
                          {isCompleted && !isCurrent ? <i className="bi bi-check" /> : s.step}
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium small">{s.label}</p>
                          {isCurrent && <p className="mb-0 text-primary" style={{ fontSize: '0.75rem' }}>Current step</p>}
                        </div>
                        <i className={`bi ${s.icon} fs-5 ${isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-secondary'}`} />
                        {isCurrent && (
                          <Link to={s.path} className="btn btn-sm btn-primary">Continue</Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelsbStudentDashboard;
