import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import AlertMessage from '../../components/common/AlertMessage';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils';

const AcademicRecordsPage: React.FC = () => {
  const resultsQuery = useQuery({ queryKey: ['academic-results'], queryFn: () => usersApi.getAcademicResults() });
  const feesQuery = useQuery({ queryKey: ['fee-records'], queryFn: () => usersApi.getFeeRecords() });
  const regsQuery = useQuery({ queryKey: ['registrations'], queryFn: () => usersApi.getRegistrations() });
  const examsQuery = useQuery({ queryKey: ['exam-records'], queryFn: () => usersApi.getExamRecords() });

  const loading = resultsQuery.isLoading || feesQuery.isLoading || regsQuery.isLoading || examsQuery.isLoading;
  const error = resultsQuery.error || feesQuery.error || regsQuery.error || examsQuery.error;

  return (
    <div>
      <PageHeader
        title="Academic Records"
        subtitle="Registration, fees, examinations, and results from the university record."
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Academic Records' }]}
      />

      {error && <AlertMessage type="danger" message={getErrorMessage(error)} />}
      {loading && <LoadingSpinner text="Loading academic records…" />}

      {!loading && (
        <div className="row g-3">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-semibold py-3">Registration</div>
              <div className="card-body p-0">
                {!regsQuery.data?.length ? (
                  <EmptyState title="No registration records" icon="bi-clipboard" />
                ) : (
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Year</th>
                          <th>Semester</th>
                          <th>Status</th>
                          <th>Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regsQuery.data.map((row) => (
                          <tr key={row.id}>
                            <td>{row.academicYear}</td>
                            <td>{row.semester}</td>
                            <td><StatusBadge status={row.confirmationStatus} /></td>
                            <td className="small text-muted">{formatDate(row.registeredAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white fw-semibold py-3">Fee history</div>
              <div className="card-body p-0">
                {!feesQuery.data?.length ? (
                  <EmptyState title="No fee records" icon="bi-receipt" />
                ) : (
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Paid</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feesQuery.data.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <div className="small fw-medium">{row.description}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{row.receiptNumber || '—'}</div>
                            </td>
                            <td className="small">{formatCurrency(row.paidAmount)} / {formatCurrency(row.amount)}</td>
                            <td><StatusBadge status={row.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white fw-semibold py-3">Examination entries</div>
              <div className="card-body p-0">
                {!examsQuery.data?.length ? (
                  <EmptyState title="No exam records" icon="bi-pencil-square" />
                ) : (
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Course</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examsQuery.data.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <div className="small fw-medium">{row.courseCode}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{row.venue}</div>
                            </td>
                            <td className="small">{row.examDate}</td>
                            <td><StatusBadge status={row.sittingStatus} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-semibold py-3">Academic results</div>
              <div className="card-body p-0">
                {!resultsQuery.data?.length ? (
                  <EmptyState title="No results yet" icon="bi-journal-x" />
                ) : (
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Code</th>
                          <th>Course</th>
                          <th>Year</th>
                          <th>Credits</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultsQuery.data.map((row) => (
                          <tr key={row.id}>
                            <td><code className="small">{row.courseCode}</code></td>
                            <td className="small">{row.courseName}</td>
                            <td className="small">{row.academicYear} / {row.semester}</td>
                            <td>{row.credits}</td>
                            <td className="fw-semibold">{row.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicRecordsPage;
