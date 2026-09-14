import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import { helsbService } from '../../services/helsbService';
import { studentService } from '../../services/studentService';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import AlertMessage from '../../components/common/AlertMessage';
import { formatDateTime, getDocumentLabel, getErrorMessage, getHelsbStatusLabel, isHelsbApproved, isHelsbWaitingApproval } from '../../utils';
import type { DocumentType } from '../../types';

const HELSB_DOC_TYPES: DocumentType[] = [
  'CONFIRMATION_SLIP',
  'RESULTS',
  'EXAMINATION_SLIP',
  'PAYMENT_HISTORY',
];

const NETWORKS = ['MTN', 'Airtel', 'Zamtel'];

const StudentApplications: React.FC = () => {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showMomo, setShowMomo] = useState(false);
  const [momoPhone, setMomoPhone] = useState('');
  const [momoNetwork, setMomoNetwork] = useState('MTN');
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: studentService.getProfile,
  });

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: documentService.getMyDocuments,
  });

  const { data: application, isLoading: appLoading, isError: appError } = useQuery({
    queryKey: ['my-application'],
    queryFn: helsbService.getMyApplication,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return isHelsbWaitingApproval(status) ? 10000 : false;
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [application?.status, queryClient]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const ids: string[] = [];
      for (const key of selectedDocs) {
        if (key.startsWith('VS-')) {
          ids.push(key);
          continue;
        }
        const generated = await documentService.generateDocument(key as DocumentType);
        ids.push(generated.documentId);
      }
      return helsbService.submitApplication(ids, { phone: momoPhone.trim(), provider: momoNetwork });
    },
    onSuccess: (app) => {
      queryClient.invalidateQueries({ queryKey: ['my-application'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      setSuccess(`Submitted to HELSB. Status: ${getHelsbStatusLabel(app.status)}.`);
      setSelectedDocs([]);
      setConsent(false);
      setShowMomo(false);
    },
    onError: (err) => setError(getErrorMessage(err) || 'Failed to submit application. Please try again.'),
  });

  const contractMutation = useMutation({
    mutationFn: async () => {
      if (!application) throw new Error('No application');
      await helsbService.downloadContract(application.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setSuccess('Contract downloaded.');
    },
    onError: (err) => setError(getErrorMessage(err) || 'Could not download the contract.'),
  });

  const toggleDoc = (key: string) => {
    setSelectedDocs((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const waiting = isHelsbWaitingApproval(application?.status);
  const approved = isHelsbApproved(application?.status);
  const loanPercent = application?.loanPercent ?? (approved ? 50 : undefined);
  const hasLoan = Boolean(application?.hasLoan) || approved;

  const documentOptions = HELSB_DOC_TYPES.map((type) => {
    const match = documents?.find((doc) => doc.type === type && doc.officialId);
    return {
      type,
      key: match?.officialId || type,
      label: getDocumentLabel(type),
      ready: Boolean(match?.officialId),
      officialId: match?.officialId,
    };
  });

  const openMomo = () => {
    setError('');
    if (selectedDocs.length === 0 || !consent) return;
    setShowMomo(true);
  };

  return (
    <div>
      <PageHeader
        title="HELSB"
        subtitle="Higher Education Loans and Scholarship Board ù loan status, screening and submission."
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'HELSB' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {appError && <AlertMessage type="danger" message="Unable to load your HELSB application." />}
      {success && <AlertMessage type="success" message={success} autoDismiss={6000} onDismiss={() => setSuccess('')} />}

      {appLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted small mb-1">Loan status</p>
                  {hasLoan ? (
                    <>
                      <div className="fs-4 fw-bold text-navy">{loanPercent}%</div>
                      <p className="mb-0">This student has a HELSB student loan at {loanPercent}%.</p>
                    </>
                  ) : waiting && loanPercent ? (
                    <>
                      <div className="fs-4 fw-bold text-navy">{loanPercent}%</div>
                      <p className="mb-0">Loan award under screening at {loanPercent}%.</p>
                    </>
                  ) : (
                    <>
                      <div className="fs-5 fw-bold text-navy">No active loan</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted small mb-1">Screening status</p>
                  {waiting && (
                    <div className="alert alert-warning mb-0 py-2">
                      <i className="bi bi-hourglass-split me-2" />
                      Awaiting approval
                    </div>
                  )}
                  {approved && (
                    <div className="alert alert-success mb-0 py-2">
                      <i className="bi bi-check-circle me-2" />
                      Approved
                    </div>
                  )}
                  {!waiting && !approved && (
                    <StatusBadge status={application?.status || 'PENDING'} label={application ? getHelsbStatusLabel(application.status) : 'Not submitted'} />
                  )}
                  <p className="small text-muted mt-2 mb-0">
                    Screening result: {application?.screeningResult || 'ù'}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted small mb-1">HELSB loan number</p>
                  <div className="fw-bold">{application?.applicationNumber || 'ù'}</div>
                  <p className="small mb-0 mt-2">
                    Submitted: {application?.submittedAt ? 'Yes' : 'No'} ù Approved: {approved ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom fw-semibold py-3">Student details</div>
            <div className="card-body">
              <div className="row g-3">
                {[
                  ['Name', profile ? `${profile.firstName} ${profile.lastName}` : application?.studentName],
                  ['Student ID', profile?.studentNumber || application?.studentNumber],
                  ['NRC', profile?.nrc || application?.nrc],
                  ['Programme', profile?.program || application?.program],
                  ['School', profile?.faculty || application?.faculty],
                  ['Email', profile?.email || application?.email],
                  ['Phone', profile?.phone || application?.phone],
                  ['Next of kin', profile?.nextOfKinName],
                  ['Next of kin phone', profile?.nextOfKinPhone],
                ].map(([label, value]) => (
                  <div className="col-sm-6 col-lg-4" key={label}>
                    <p className="text-muted small mb-1">{label}</p>
                    <div className="fw-medium">{value || 'ù'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {approved && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="d-flex align-items-center gap-3">
                  <img src="/helsb-logo.png" alt="HELSB" style={{ width: 64, height: 64, objectFit: 'contain' }} />
                  <div>
                  <h5 className="mb-0">Download contract</h5>
                  </div>
                </div>
                <button className="btn btn-primary" disabled={contractMutation.isPending} onClick={() => contractMutation.mutate()}>
                  {contractMutation.isPending ? 'Preparingù' : 'Download contract'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!waiting && !approved && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom fw-semibold py-3">
            Documents and submit to HELSB
          </div>
          <div className="card-body">
            {docsLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="row g-2 mb-3">
                  {documentOptions.map((doc) => (
                    <div key={doc.type} className="col-sm-6 col-md-3">
                      <label
                        className={`border rounded-2 p-3 d-block h-100 ${selectedDocs.includes(doc.key) ? 'border-primary bg-primary-subtle' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-start gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-1"
                            checked={selectedDocs.includes(doc.key)}
                            onChange={() => toggleDoc(doc.key)}
                          />
                          <div>
                            <p className="mb-0 small fw-medium">{doc.label}</p>
                            {doc.ready && (
                              <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                                {doc.officialId}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
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
                    I consent to sharing the selected verified documents with HELSB for loan screening.
                  </label>
                </div>

                <button
                  className="btn btn-primary"
                  disabled={selectedDocs.length === 0 || !consent || submitMutation.isPending}
                  onClick={openMomo}
                >
                  Submit to HELSB
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showMomo && (
        <div className="doc-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(20,53,42,0.45)', zIndex: 40, display: 'grid', placeItems: 'center', padding: 20 }} onClick={() => setShowMomo(false)}>
          <div className="card shadow" style={{ width: 'min(440px, 100%)' }} onClick={(event) => event.stopPropagation()}>
            <div className="card-body p-4">
              <h5 className="fw-bold">Mobile money</h5>
              <label className="form-label fw-semibold">Phone number</label>
              <input
                className="form-control mb-3"
                value={momoPhone}
                onChange={(e) => setMomoPhone(e.target.value)}
                placeholder="09XXXXXXXX"
              />
              <label className="form-label fw-semibold">Network provider</label>
              <select className="form-select mb-4" value={momoNetwork} onChange={(e) => setMomoNetwork(e.target.value)}>
                {NETWORKS.map((network) => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowMomo(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  disabled={!momoPhone.trim() || submitMutation.isPending}
                  onClick={() => submitMutation.mutate()}
                >
                  {submitMutation.isPending ? 'Submittingù' : 'Confirm and submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
