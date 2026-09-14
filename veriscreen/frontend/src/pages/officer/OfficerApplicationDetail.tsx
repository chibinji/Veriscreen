import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helsbService } from '../../services/helsbService';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import AlertMessage from '../../components/common/AlertMessage';
import { formatDateTime, getDocumentLabel } from '../../utils';

const OfficerApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState<'approve' | 'reject' | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [generatingContract, setGeneratingContract] = useState(false);

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => helsbService.getApplicationById(Number(id)),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => helsbService.approveApplication(Number(id), ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowModal(null);
      setActionSuccess('Application approved successfully.');
    },
    onError: () => setActionError('Failed to approve application.'),
  });

  const rejectMutation = useMutation({
    mutationFn: () => helsbService.rejectApplication(Number(id), 'Rejected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowModal(null);
      setActionSuccess('Application rejected.');
    },
    onError: () => setActionError('Failed to reject application.'),
  });

  const handleGenerateContract = async () => {
    setGeneratingContract(true);
    try {
      await helsbService.generateContract(Number(id));
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      setActionSuccess('Contract generated and downloaded.');
    } catch {
      setActionError('Failed to generate contract.');
    } finally {
      setGeneratingContract(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage text="Loading application…" />;
  if (!application) {
    return <AlertMessage type="danger" message="Application not found." />;
  }

  const canApprove = ['PENDING', 'UNDER_REVIEW'].includes(application.status);
  const canReject = ['PENDING', 'UNDER_REVIEW'].includes(application.status);
  const canContract = application.status === 'APPROVED';

  return (
    <div>
      <PageHeader
        title={`Application: ${application.applicationNumber}`}
        subtitle="Review application details and take action."
        breadcrumbs={[
          { label: 'Dashboard', path: '/officer/dashboard' },
          { label: 'Applications', path: '/officer/applications' },
          { label: application.applicationNumber },
        ]}
        actions={
          <div className="d-flex gap-2">
            {canApprove && (
              <button className="btn btn-success" onClick={() => setShowModal('approve')}>
                <i className="bi bi-check-circle me-1" />Approve
              </button>
            )}
            {canReject && (
              <button className="btn btn-danger" onClick={() => setShowModal('reject')}>
                <i className="bi bi-x-circle me-1" />Reject
              </button>
            )}
            {canContract && (
              <button className="btn btn-primary" onClick={handleGenerateContract} disabled={generatingContract}>
                {generatingContract
                  ? <><span className="spinner-border spinner-border-sm me-1" />Generating…</>
                  : <><i className="bi bi-file-earmark-ruled me-1" />Generate Contract</>
                }
              </button>
            )}
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-1" />Back
            </button>
          </div>
        }
      />

      {actionError && <AlertMessage type="danger" message={actionError} onDismiss={() => setActionError('')} />}
      {actionSuccess && <AlertMessage type="success" message={actionSuccess} autoDismiss={4000} onDismiss={() => setActionSuccess('')} />}

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white border-bottom fw-semibold py-3">
              <i className="bi bi-person me-2 text-primary" />Student Information
            </div>
            <div className="card-body p-3">
              {[
                { label: 'Student Number', value: application.studentNumber },
                { label: 'Full Name', value: application.studentName },
                { label: 'Program', value: application.program },
                { label: 'Faculty', value: application.faculty },
                { label: 'Year', value: `Year ${application.yearOfStudy}` },
              ].map((item) => (
                <div key={item.label} className="d-flex justify-content-between small py-2 border-bottom">
                  <span className="text-muted">{item.label}</span>
                  <span className="fw-medium text-end" style={{ maxWidth: '55%' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom fw-semibold py-3">
              <i className="bi bi-info-circle me-2 text-primary" />Application Status
            </div>
            <div className="card-body p-3">
              <div className="text-center mb-3">
                <StatusBadge status={application.status} />
              </div>
              {[
                { label: 'Submitted', value: formatDateTime(application.submittedAt) },
                { label: 'Reviewed', value: formatDateTime(application.reviewedAt) },
                { label: 'Reviewed By', value: application.reviewedBy || '—' },
              ].map((item) => (
                <div key={item.label} className="d-flex justify-content-between small py-2 border-bottom">
                  <span className="text-muted">{item.label}</span>
                  <span className="fw-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom fw-semibold py-3">
              <i className="bi bi-file-earmark-text me-2 text-primary" />Submitted Documents
            </div>
            <div className="card-body p-0">
              {application.documents.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-file-earmark-x fs-2" />
                  <p className="small mt-2">No documents submitted.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Document</th>
                        <th>Verification Code</th>
                        <th>Generated</th>
                        <th>Status</th>
                        <th>Verify</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.documents.map((doc) => (
                        <tr key={doc.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-file-earmark-text text-primary" />
                              <span className="small fw-medium">{getDocumentLabel(doc.type)}</span>
                            </div>
                          </td>
                          <td><code className="small">{doc.verificationCode}</code></td>
                          <td><span className="small text-muted">{formatDateTime(doc.generatedAt)}</span></td>
                          <td><StatusBadge status={doc.status} /></td>
                          <td>
                            <a
                              href={`/verify/${doc.verificationCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-success"
                            >
                              <i className="bi bi-shield-check me-1" />Verify
                            </a>
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
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h6 className="modal-title fw-bold">
                  {showModal === 'approve' ? (
                    <><i className="bi bi-check-circle text-success me-2" />Approve Application</>
                  ) : (
                    <><i className="bi bi-x-circle text-danger me-2" />Reject Application</>
                  )}
                </h6>
                <button className="btn-close" onClick={() => setShowModal(null)} />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  You are about to <strong>{showModal}</strong> application <strong>{application.applicationNumber}</strong> for{' '}
                  <strong>{application.studentName}</strong>.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(null)}>Cancel</button>
                <button
                  className={`btn btn-sm ${showModal === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  onClick={() => showModal === 'approve' ? approveMutation.mutate() : rejectMutation.mutate()}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  {approveMutation.isPending || rejectMutation.isPending
                    ? <><span className="spinner-border spinner-border-sm me-1" />Processing…</>
                    : showModal === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerApplicationDetail;
