import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { verificationService } from '../../services/verificationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime, getDocumentLabel } from '../../utils';
import { APP_NAME } from '../../constants';
import BrandLogo from '../../components/brand/BrandLogo';

const statusConfig = {
  VALID: { icon: 'bi-patch-check-fill', color: 'success', title: 'Document Verified', desc: 'This document is authentic and has been verified.' },
  INVALID: { icon: 'bi-patch-exclamation-fill', color: 'danger', title: 'Invalid Document', desc: 'This document could not be verified. It may have been tampered with.' },
  EXPIRED: { icon: 'bi-clock-history', color: 'warning', title: 'Document Expired', desc: 'This document has expired and is no longer valid.' },
};

const VerificationPage: React.FC = () => {
  const { verificationCode } = useParams<{ verificationCode: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify', verificationCode],
    queryFn: () => verificationService.verify(verificationCode!),
    enabled: !!verificationCode,
    retry: false,
  });

  return (
    <div className="min-vh-100 vs-canvas d-flex flex-column">
      <nav className="navbar bg-white border-bottom px-4">
        <a href="/" className="navbar-brand d-flex align-items-center mb-0">
          <BrandLogo size="sm" />
        </a>
        <span className="text-muted small">Document Verification Portal</span>
      </nav>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="container" style={{ maxWidth: 560 }}>
          {isLoading && <LoadingSpinner size="lg" text="Verifying document…" />}

          {isError && (
            <div className="card border-0 shadow text-center py-5">
              <div className="card-body">
                <i className="bi bi-x-circle-fill text-danger fs-1 mb-3" />
                <h4 className="fw-bold text-danger">Verification Failed</h4>
                <p className="text-muted">The verification code <code>{verificationCode}</code> was not found or is invalid.</p>
              </div>
            </div>
          )}

          {data && (() => {
            const cfg = statusConfig[data.status];
            return (
              <div className="card border-0 shadow">
                <div className={`card-header bg-${cfg.color} text-white text-center py-4 border-0`}>
                  <i className={`bi ${cfg.icon} fs-1 d-block mb-2`} />
                  <h4 className="fw-bold mb-0">{cfg.title}</h4>
                  <p className="mb-0 opacity-75 small mt-1">{cfg.desc}</p>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4 text-center">
                    <span className="badge bg-light text-dark border px-3 py-2" style={{ fontSize: '0.8rem' }}>
                      <i className="bi bi-qr-code me-1" />Code: {verificationCode}
                    </span>
                  </div>
                  <div className="row g-3">
                    {[
                      { label: 'Document ID', value: data.documentId || verificationCode, icon: 'bi-qr-code' },
                      { label: 'Document Type', value: getDocumentLabel(data.documentType), icon: 'bi-file-earmark-text' },
                      { label: 'Status', value: data.status, icon: 'bi-shield-check' },
                      { label: 'Issued By', value: data.issuedBy || 'VeriScreen', icon: 'bi-building' },
                      { label: 'Verified At', value: formatDateTime(data.verifiedAt), icon: 'bi-clock' },
                    ].map((item) => (
                      <div key={item.label} className="col-sm-6">
                        <div className="bg-light rounded-2 p-3">
                          <p className="text-muted small mb-1">
                            <i className={`bi ${item.icon} me-1`} />{item.label}
                          </p>
                          <p className="fw-semibold mb-0 small">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-footer bg-white text-muted text-center small border-top py-3">
                  <i className="bi bi-shield-check me-1 text-primary" />
                  Verified by {APP_NAME} &mdash; {formatDateTime(data.verifiedAt)}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
