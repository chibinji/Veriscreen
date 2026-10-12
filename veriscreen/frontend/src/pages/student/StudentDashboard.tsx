import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSessionQueryKey } from '../../hooks/useSessionQueryKey';
import { documentService } from '../../services/documentService';
import { helsbService } from '../../services/helsbService';
import { studentService } from '../../services/studentService';
import { useAuthStore } from '../../store/authStore';
import { formatDateTime, getDocumentLabel, getErrorMessage } from '../../utils';
import type { Document, DocumentType } from '../../types';

function activityLabel(type: DocumentType): string {
  if (type === 'FEE_STATEMENT') return 'Fee statement downloaded';
  return 'Document verified';
}

const StudentDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const profileQuery = useQuery({
    queryKey: useSessionQueryKey('student-profile'),
    queryFn: studentService.getProfile,
  });
  const documentsQuery = useQuery({
    queryKey: useSessionQueryKey('my-documents'),
    queryFn: documentService.getMyDocuments,
  });
  const helsbQuery = useQuery({
    queryKey: useSessionQueryKey('helsb-application'),
    queryFn: helsbService.getMyApplication,
    retry: false,
  });

  const profile = profileQuery.data;
  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const application = helsbQuery.data;
  const started = Boolean(application);
  const documents = [...(documentsQuery.data || [])].sort((a, b) =>
    (b.generatedAt || '').localeCompare(a.generatedAt || ''),
  );
  const recentDocuments = documents.slice(0, 3);

  const activity = [
    ...documents.map((doc) => ({
      id: `doc-${doc.id}`,
      when: doc.generatedAt,
      label: `${activityLabel(doc.type)} · ${getDocumentLabel(doc.type)}`,
    })),
    ...(started && application
      ? [{
          id: `helsb-${application.id}`,
          when: application.submittedAt || '',
          label: 'Data shared with HELSB',
        }]
      : []),
  ]
    .sort((a, b) => (b.when || '').localeCompare(a.when || ''))
    .slice(0, 5);

  const download = (doc: Document) => {
    documentService.downloadDocument(doc.id, `${doc.type}_${doc.id}.pdf`);
  };

  return (
    <div className="studio-home">
      <h1 className="studio-welcome">Welcome {fullName || 'there'}!</h1>
      {documentsQuery.isError && (
        <AlertMessage type="danger" message={getErrorMessage(documentsQuery.error)} />
      )}
      {documentsQuery.isLoading ? (
        <LoadingSpinner text="Loading your dashboard…" />
      ) : (
        <>
          <article className="studio-tile studio-tile--ink studio-tile--status">
            <p>HELSB status</p>
            <strong>{started ? 'Submitted, awaiting portal confirmation' : 'Not started'}</strong>
            <span>
              {started
                ? 'The result is confirmed in the HELSB portal.'
                : 'You have not sent an application yet.'}
            </span>
            {!started && (
              <Link to="/student/applications" className="studio-apply">
                Apply to HELSB
              </Link>
            )}
          </article>

          <section className="studio-panel">
            <header className="studio-panel__bar">
              <div>
                <h2>Recent documents</h2>
                <p>The last documents you generated</p>
              </div>
              <Link to="/student/documents">View all</Link>
            </header>
            {recentDocuments.length === 0 ? (
              <p className="studio-empty">No documents generated yet.</p>
            ) : (
              <ul className="studio-rows">
                {recentDocuments.map((doc) => (
                  <li key={doc.id}>
                    <strong>{getDocumentLabel(doc.type)}</strong>
                    <span>{formatDateTime(doc.generatedAt)}</span>
                    <code>{doc.verificationCode}</code>
                    <button type="button" className="studio-redownload" onClick={() => download(doc)}>
                      Re-download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="studio-panel">
            <header>
              <h2>Recent activity</h2>
              <p>Your latest actions</p>
            </header>
            {activity.length === 0 ? (
              <p className="studio-empty">No activity yet.</p>
            ) : (
              <ul className="studio-activity">
                {activity.map((item) => (
                  <li key={item.id}>
                    <strong>{item.label}</strong>
                    <span>{item.when ? formatDateTime(item.when) : '—'}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
