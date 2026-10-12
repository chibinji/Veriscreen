import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import type { DocumentType } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';
import { formatDateTime, getDocumentLabel } from '../../utils';
import { DOCUMENT_ICONS } from '../../constants';
import { useSessionQueryKey } from '../../hooks/useSessionQueryKey';

const DocumentsPage: React.FC = () => {
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: documents, isLoading, isError } = useQuery({
    queryKey: useSessionQueryKey('my-documents'),
    queryFn: documentService.getMyDocuments,
  });

  const handleDownload = (id: number, type: DocumentType) => {
    documentService.downloadDocument(id, `${type}_${id}.pdf`);
  };

  const handlePreview = async (id: number) => {
    try {
      const url = await documentService.previewDocument(id);
      setPreviewUrl(url);
    } catch {
      setError('Unable to preview document.');
    }
  };

  return (
    <div>
      <PageHeader
        title="My Documents"
        subtitle="Verified academic PDFs, each sealed with a QR verification code."
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Documents' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {isError && !error && <AlertMessage type="danger" message="Unable to load documents." />}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom fw-semibold py-3 text-navy">
          <i className="bi bi-file-earmark-check me-2 text-gold" />Verified, QR-sealed PDFs
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading documents…" />
          ) : !documents || documents.length === 0 ? (
            <EmptyState
              icon="bi-file-earmark-check"
              title="No verified documents"
              description="Verified academic documents will appear here once they are available."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Document Type</th>
                    <th>QR code</th>
                    <th>Verified</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${DOCUMENT_ICONS[doc.type]} text-indigo`} />
                          <span className="fw-medium small text-navy">{getDocumentLabel(doc.type)}</span>
                        </div>
                      </td>
                      <td>
                        <code className="small bg-light px-2 py-1 rounded">{doc.verificationCode}</code>
                      </td>
                      <td><span className="small text-muted">{formatDateTime(doc.generatedAt)}</span></td>
                      <td><span className="small text-muted">{formatDateTime(doc.expiresAt)}</span></td>
                      <td>
                        <StatusBadge
                          status={doc.status}
                          label={doc.status === 'GENERATED' ? 'Verified' : undefined}
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Preview"
                            onClick={() => handlePreview(doc.id)}
                          >
                            <i className="bi bi-eye me-1" />Preview
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            title="Download"
                            onClick={() => handleDownload(doc.id, doc.type)}
                          >
                            <i className="bi bi-download me-1" />Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!isLoading && documents && documents.length > 0 && (
          <div className="card-footer bg-white border-top py-3 d-flex justify-content-end">
            <Link to="/student/applications" className="btn btn-primary">
              <i className="bi bi-send me-2" />Submit to HELSB
            </Link>
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setPreviewUrl(null)}>
          <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-semibold text-navy">Document Preview</h6>
                <button type="button" className="btn-close" onClick={() => setPreviewUrl(null)} />
              </div>
              <div className="modal-body p-0">
                <iframe src={previewUrl} style={{ width: '100%', height: '70vh', border: 'none' }} title="Document Preview" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
