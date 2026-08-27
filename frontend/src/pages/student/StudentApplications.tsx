import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import { helsbService } from '../../services/helsbService';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime, getDocumentLabel, getErrorMessage, getHelsbStatusLabel, isHelsbWaitingApproval } from '../../utils';

const StudentApplications: React.FC = () => {
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [consent, setConsent] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: documentService.getMyDocuments,
  });

  const { data: application, isLoading: appLoading, isError: appError } = useQuery({
    queryKey: ['my-application'],
    queryFn: helsbService.getMyApplication,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (ids: number[]) => helsbService.submitApplication(ids),
    onSuccess: (app) => {
      queryClient.invalidateQueries({ queryKey: ['my-application'] });
      const creds = app.helsbCredentials
        ? ` HELSB portal username: ${app.helsbCredentials.username} (password: ${app.helsbCredentials.temporaryPassword}).`
        : '';
      setSuccess(`Documents submitted to HELSB. Status: ${getHelsbStatusLabel(app.status)}.${creds}`);
      setSelectedDocs([]);
      setConsent(false);
    },
    onError: (err) => setError(getErrorMessage(err) || 'Failed to submit application. Please try again.'),
  });

  const toggleDoc = (id: number) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const validDocs = documents?.filter((d) => d.status === 'GENERATED') ?? [];

  return (
    <div>
      <PageHeader
        title="HELSB Application"
        subtitle="Submit your verified documents to the Higher Education Loans and Scholarships Board."
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Applications' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {appError && <AlertMessage type="danger" message="Unable to load your HELSB application." />}
      {success && <AlertMessage type="success" message={success} autoDismiss={5000} onDismiss={() => setSuccess('')} />}

      {/* Existing application */}
      {appLoading ? (
        <LoadingSpinner />
      ) : application ? (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom fw-semibold py-3">
            <i className="bi bi-clipboard2-check me-2 text-success" />Current Application
          </div>
          <div className="card-body">
            <div className="row g-3">
              {[
                { label: 'Application Number', value: application.applicationNumber },
                { label: 'Status', value: <StatusBadge status={application.status} label={getHelsbStatusLabel(application.status)} /> },
                { label: 'Submitted', value: formatDateTime(application.submittedAt) },
                { label: 'Reviewed', value: formatDateTime(application.reviewedAt) },
              ].map((item) => (
                <div key={item.label} className="col-sm-6 col-md-3">
                  <div className="bg-light rounded-2 p-3">
                    <p className="text-muted small mb-1">{item.label}</p>
                    <div className="fw-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            {isHelsbWaitingApproval(application.status) && (
              <div className="mt-3 alert alert-warning mb-0">
                <i className="bi bi-hourglass-split me-2" />
                Documents have been submitted and are waiting for HELSB verification and approval.
              </div>
            )}
            {application.status === 'APPROVED' && (
              <div className="mt-3 alert alert-success mb-0">
                <i className="bi bi-check-circle me-2" />
                Documents have been verified and this application is approved.
              </div>
            )}
            {application.notes && (
              <div className="mt-3 alert alert-info mb-0">
                <i className="bi bi-info-circle me-2" />
                <strong>Officer notes:</strong> {application.notes}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Submit new application */}
      {!isHelsbWaitingApproval(application?.status) && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom fw-semibold py-3">
            <i className="bi bi-send me-2 text-primary" />Submit New Application
          </div>
          <div className="card-body">
            <p className="text-muted small mb-3">
              Select the verified documents you want to include in your HELSB application.
            </p>
            {docsLoading ? (
              <LoadingSpinner />
            ) : validDocs.length === 0 ? (
              <EmptyState
                icon="bi-file-earmark-x"
                title="No valid documents"
                description="Verified documents from the Documents page are required before submitting."
              />
            ) : (
              <>
                <div className="row g-2 mb-3">
                  {validDocs.map((doc) => (
                    <div key={doc.id} className="col-sm-6 col-md-4">
                      <div
                        className={`border rounded-2 p-3 cursor-pointer ${selectedDocs.includes(doc.id) ? 'border-primary bg-primary-subtle' : ''}`}
                        onClick={() => toggleDoc(doc.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={() => toggleDoc(doc.id)}
                          />
                          <div>
                            <p className="mb-0 small fw-medium">{getDocumentLabel(doc.type)}</p>
                            <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                              {formatDateTime(doc.generatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-check mb-3">
                  <input
                    id="helsb-consent"
                    type="checkbox"
                    className="form-check-input"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="helsb-consent">
                    I consent to sharing the selected verified documents with HELSB for loan screening. A digital consent record will be stored with a timestamp.
                  </label>
                </div>

                <button
                  className="btn btn-primary"
                  disabled={selectedDocs.length === 0 || !consent || submitMutation.isPending}
                  onClick={() => submitMutation.mutate(selectedDocs)}
                >
                  {submitMutation.isPending ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
                  ) : (
                    <><i className="bi bi-send me-2" />Submit {selectedDocs.length > 0 ? `(${selectedDocs.length})` : ''} to HELSB</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
