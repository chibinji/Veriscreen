import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSessionQueryKey } from '../../hooks/useSessionQueryKey';
import { documentService } from '../../services/documentService';
import { helsbService } from '../../services/helsbService';
import { formatDateTime, getDocumentLabel, getErrorMessage, getHelsbStatusLabel } from '../../utils';

interface ActivityRow {
  id: string;
  when: string;
  action: string;
  details: string;
}

const StudentActivityPage: React.FC = () => {
  const documentsQuery = useQuery({
    queryKey: useSessionQueryKey('my-documents'),
    queryFn: documentService.getMyDocuments,
  });
  const applicationQuery = useQuery({
    queryKey: useSessionQueryKey('helsb-application'),
    queryFn: helsbService.getMyApplication,
    retry: false,
  });
  const regsQuery = useQuery({
    queryKey: useSessionQueryKey('registrations'),
    queryFn: () => usersApi.getRegistrations(),
  });
  const feesQuery = useQuery({
    queryKey: useSessionQueryKey('fee-records'),
    queryFn: () => usersApi.getFeeRecords(),
  });

  const failed = documentsQuery.error || regsQuery.error || feesQuery.error;
  const loading = documentsQuery.isLoading || regsQuery.isLoading || feesQuery.isLoading;
  const application = applicationQuery.data;

  const rows: ActivityRow[] = [
    ...(documentsQuery.data || []).map((doc) => ({
      id: `doc-${doc.id}`,
      when: doc.generatedAt,
      action: 'QR-sealed PDF',
      details: `${getDocumentLabel(doc.type)} · ${doc.verificationCode}`,
    })),
    ...(regsQuery.data || []).map((row) => ({
      id: `reg-${row.id}`,
      when: row.registeredAt || '',
      action: 'Registration',
      details: `${row.academicYear || 'Year'} semester ${row.semester || '—'} · ${row.confirmationStatus === 'CONFIRMED' ? 'Confirmed' : 'Pending'}`,
    })),
    ...(feesQuery.data || []).map((row) => ({
      id: `fee-${row.id}`,
      when: row.paymentDate || '',
      action: 'Fee payment',
      details: `${row.description}${row.receiptNumber ? ` · receipt ${row.receiptNumber}` : ''}`,
    })),
  ];

  if (application?.submittedAt) {
    rows.push({
      id: `helsb-${application.id}`,
      when: application.submittedAt,
      action: 'HELSB consent',
      details: `Application ${application.applicationNumber || application.id} submitted · ${getHelsbStatusLabel(application.status)}`,
    });
  }

  rows.sort((a, b) => (b.when || '').localeCompare(a.when || ''));

  const sharedDocuments = (application?.submittedDocumentIds || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="studio-stack">
      {failed && <AlertMessage type="danger" message={getErrorMessage(failed)} />}
      {loading ? (
        <LoadingSpinner text="Loading activity…" />
      ) : (
        <>
          <section className="studio-panel">
            <header>
              <h2>Audit log</h2>
              <p>Documents issued, registrations, fee payments, and HELSB submissions on your account</p>
            </header>
            {rows.length === 0 ? (
              <p className="studio-empty">No activity recorded yet.</p>
            ) : (
              <div className="studio-table-wrap">
                <table className="studio-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Action</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.when ? formatDateTime(row.when) : '—'}</td>
                        <td>{row.action}</td>
                        <td>{row.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="studio-panel">
            <header>
              <h2>Consent receipts</h2>
              <p>Proof that you agreed to share verified documents with HELSB</p>
            </header>
            {!application?.submittedAt ? (
              <p className="studio-empty">No consent receipt yet. Submit from HELSB after giving consent.</p>
            ) : (
              <div className="studio-receipt">
                <p>Receipt</p>
                <strong>{application.applicationNumber || `Application ${application.id}`}</strong>
                <span>Submitted {formatDateTime(application.submittedAt)}</span>
                <span>Status: {getHelsbStatusLabel(application.status)}</span>
                <span>
                  You consented to share the selected verified documents with HELSB for loan screening.
                </span>
                {sharedDocuments.length > 0 && (
                  <span>Documents: {sharedDocuments.join(', ')}</span>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentActivityPage;
