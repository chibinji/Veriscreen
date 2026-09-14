import React, { useEffect, useState } from 'react';
import { documentService } from '../../services/documentService';
import type { DocumentType } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import AlertMessage from '../../components/common/AlertMessage';
import { downloadBlob, getDocumentLabel, getErrorMessage } from '../../utils';
import { DOCUMENT_ICONS } from '../../constants';

interface DocumentOption {
  type: DocumentType;
  pathLabel: string;
  description: string;
}

interface PreviewState {
  type: DocumentType;
  documentId: string;
  url: string;
  blob: Blob;
}

const DOCUMENT_OPTIONS: DocumentOption[] = [
  {
    type: 'CONFIRMATION_SLIP',
    pathLabel: 'Confirmation Slip',
    description: 'Official confirmation from your registration records.',
  },
  {
    type: 'RESULTS',
    pathLabel: 'Results',
    description: 'Academic results recorded for your student account.',
  },
  {
    type: 'EXAMINATION_SLIP',
    pathLabel: 'Examination Slip',
    description: 'Examination eligibility and status from your record.',
  },
  {
    type: 'PAYMENT_HISTORY',
    pathLabel: 'Payment History',
    description: 'Fee payments and outstanding balances on file.',
  },
];

const DocumentsPage: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingType, setLoadingType] = useState<DocumentType | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview?.url]);

  const loadPreview = async (type: DocumentType) => {
    setError('');
    setSuccess('');
    setSelectedType(type);
    setLoadingType(type);
    try {
      const generated = await documentService.generateDocument(type);
      const blob = await documentService.fetchOfficialPdf(generated.documentId);
      const url = URL.createObjectURL(blob);
      setPreview((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return { type, documentId: generated.documentId, url, blob };
      });
    } catch (err) {
      setPreview(null);
      setError(getErrorMessage(err) || `Unable to preview ${getDocumentLabel(type)}.`);
    } finally {
      setLoadingType(null);
    }
  };

  const handleDownload = () => {
    if (!preview) return;
    downloadBlob(preview.blob, `${preview.documentId}.pdf`);
    setSuccess(`${getDocumentLabel(preview.type)} downloaded. Document ID: ${preview.documentId}`);
  };

  const selectedOption = DOCUMENT_OPTIONS.find((option) => option.type === selectedType);

  return (
    <div>
      <PageHeader
        title="My Documents"
        subtitle="Preview and download official documents."
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Documents' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onDismiss={() => setSuccess('')} />}

      <div className="row g-3 mb-4">
        {DOCUMENT_OPTIONS.map((option) => {
          const loading = loadingType === option.type;
          const selected = selectedType === option.type;
          return (
            <div className="col-md-6" key={option.type}>
              <button
                type="button"
                className={`card shadow-sm h-100 w-100 text-start ${selected ? 'border-primary' : 'border-0'}`}
                disabled={loadingType !== null}
                onClick={() => loadPreview(option.type)}
              >
                <div className="card-body d-flex align-items-start gap-3">
                  <div className="rounded-3 p-3 bg-primary-subtle">
                    <i className={`bi ${DOCUMENT_ICONS[option.type]} fs-4 text-primary`} />
                  </div>
                  <div>
                    <h6 className="fw-semibold text-navy mb-1">{option.pathLabel}</h6>
                    <p className="text-muted small mb-0">{option.description}</p>
                    {loading && (
                      <p className="small text-primary mb-0 mt-2">
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Loading preview…
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom fw-semibold py-3 text-navy d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-eye me-2 text-gold" />
            Document preview
            {selectedOption ? ` — ${selectedOption.pathLabel}` : ''}
          </span>
          {preview && <code className="small bg-light px-2 py-1 rounded">{preview.documentId}</code>}
        </div>
        <div className="card-body p-0">
          {loadingType ? (
            <div className="text-center py-5 text-muted">
              <span className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
              <p className="small mb-0">Preparing official document preview…</p>
            </div>
          ) : preview ? (
            <iframe
              src={preview.url}
              title={`${getDocumentLabel(preview.type)} preview`}
              style={{ width: '100%', height: '70vh', border: 'none' }}
            />
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-file-earmark-text fs-2" />
              <p className="mt-2 small mb-0">Select a document above to preview it before downloading.</p>
            </div>
          )}
        </div>
        {preview && (
          <div className="card-footer bg-white border-top py-3">
            <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={loadingType !== null}>
              <i className="bi bi-download me-2" />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
