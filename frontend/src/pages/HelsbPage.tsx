import { useCallback } from 'react';
import { fetchHelsbApplications } from '../api/student';
import AsyncPanel from '../components/AsyncPanel';
import PageHeader from '../components/PageHeader';
import type { HelsbApplication } from '../types';

function statusClass(value: string): string {
  const normalized = value.toUpperCase();
  if (normalized.includes('APPROVED') || normalized.includes('CLEARED') || normalized.includes('DISBURSED')) {
    return 'badge success';
  }
  if (normalized.includes('REVIEW') || normalized.includes('PENDING') || normalized.includes('PARTIAL')) {
    return 'badge warning';
  }
  return 'badge danger';
}

export default function HelsbPage() {
  const load = useCallback(() => fetchHelsbApplications(), []);

  return (
    <div className="page">
      <PageHeader
        title="HELSB"
        description="Loan application, payment, and screening status."
      />

      <AsyncPanel<HelsbApplication[]>
        title="HELSB applications"
        load={load}
        render={(rows) => (
          <div className="card-grid">
            {rows.map((row) => (
              <article key={row.id} className="info-card">
                <div className="card-top">
                  <h3>Application #{row.id}</h3>
                  <span className={statusClass(row.applicationStatus)}>
                    {row.applicationStatus}
                  </span>
                </div>
                <dl className="mini-detail-grid">
                  <div>
                    <dt>Payment status</dt>
                    <dd>{row.paymentStatus}</dd>
                  </div>
                  <div>
                    <dt>Screening result</dt>
                    <dd>{row.screeningResult}</dd>
                  </div>
                </dl>
                <p>{row.contractDetails}</p>
              </article>
            ))}
          </div>
        )}
      />
    </div>
  );
}
