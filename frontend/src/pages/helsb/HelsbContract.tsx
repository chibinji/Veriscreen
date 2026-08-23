import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { helsbService } from '../../services/helsbService';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';
import { formatDateTime } from '../../utils';

const HelsbContract: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const { data: application, isLoading } = useQuery({
    queryKey: ['my-application'],
    queryFn: helsbService.getMyApplication,
    retry: false,
  });

  const handleDownload = async () => {
    if (!application) return;
    setDownloading(true);
    setError('');
    try {
      await helsbService.downloadContract(application.id);
    } catch {
      setError('Failed to download contract. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage text="Loading contract…" />;

  return (
    <div>
      <PageHeader
        title="HELSB Contract"
        subtitle="Download your signed Higher Education Loans and Scholarships Board contract."
        breadcrumbs={[{ label: 'HELSB', path: '/helsb/dashboard' }, { label: 'Contract' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}

      <div className="row justify-content-center">
        <div className="col-lg-7">
          {!application || application.status !== 'CONTRACT_GENERATED' ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <EmptyState
                  icon="bi-file-earmark-lock"
                  title="Contract not yet available"
                  description="Your contract will be available here once your application has been approved and processed."
                />
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom fw-semibold py-3">
                <i className="bi bi-file-earmark-ruled me-2 text-primary" />HELSB Loan Contract
              </div>
              <div className="card-body p-4">
                <div className="text-center py-3 mb-4">
                  <div className="bg-success-subtle rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 72, height: 72 }}>
                    <i className="bi bi-file-earmark-check-fill text-success fs-2" />
                  </div>
                  <h5 className="fw-bold mb-1">Contract Ready</h5>
                  <p className="text-muted small">Your HELSB loan contract has been generated and is ready for download.</p>
                </div>

                <div className="row g-2 mb-4">
                  {[
                    { label: 'Application Number', value: application.applicationNumber },
                    { label: 'Student Name', value: application.studentName },
                    { label: 'Program', value: application.program },
                    { label: 'Generated', value: formatDateTime(application.reviewedAt) },
                  ].map((item) => (
                    <div key={item.label} className="col-sm-6">
                      <div className="bg-light rounded-2 p-3">
                        <p className="text-muted small mb-1">{item.label}</p>
                        <p className="fw-semibold mb-0 small">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-warning small mb-4">
                  <i className="bi bi-exclamation-triangle me-2" />
                  Please read the contract carefully before signing. Keep a copy for your records.
                </div>

                <button
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Downloading…</>
                  ) : (
                    <><i className="bi bi-download me-2" />Download Contract (PDF)</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelsbContract;
