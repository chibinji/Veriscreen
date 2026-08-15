import { useCallback } from 'react';
import { fetchDocuments } from '../api/student';
import AsyncPanel from '../components/AsyncPanel';
import PageHeader from '../components/PageHeader';
import type { DocumentItem } from '../types';

export default function DocumentsPage() {
  const load = useCallback(() => fetchDocuments(), []);

  return (
    <div className="page">
      <PageHeader
        title="Documents"
        description="Verified document summaries generated from your academic records."
      />

      <AsyncPanel<DocumentItem[]>
        title="Available documents"
        load={load}
        emptyMessage="No documents are available yet."
        render={(documents) => (
          <div className="card-grid">
            {documents.map((document) => (
              <article key={document.type} className="info-card">
                <div className="card-top">
                  <h3>{document.type}</h3>
                  <span className="badge">Verified summary</span>
                </div>
                <p>{document.summary ?? 'Summary not available yet.'}</p>
                <footer>
                  <span>Generated {document.generatedDate}</span>
                </footer>
              </article>
            ))}
          </div>
        )}
      />
    </div>
  );
}
