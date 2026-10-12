import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSessionQueryKey } from '../../hooks/useSessionQueryKey';
import { studentService } from '../../services/studentService';
import { formatDate, getErrorMessage } from '../../utils';
import { money, titleYear } from './recordsFormat';

const AcademicRecordsPage: React.FC = () => {
  const profileQuery = useQuery({
    queryKey: useSessionQueryKey('student-profile'),
    queryFn: studentService.getProfile,
  });
  const regsQuery = useQuery({
    queryKey: useSessionQueryKey('registrations'),
    queryFn: () => usersApi.getRegistrations(),
  });
  const feesQuery = useQuery({
    queryKey: useSessionQueryKey('fee-records'),
    queryFn: () => usersApi.getFeeRecords(),
  });
  const examsQuery = useQuery({
    queryKey: useSessionQueryKey('exam-records'),
    queryFn: () => usersApi.getExamRecords(),
  });

  const failed = profileQuery.error || regsQuery.error || feesQuery.error || examsQuery.error;
  const loading = profileQuery.isLoading || regsQuery.isLoading || feesQuery.isLoading || examsQuery.isLoading;
  const profile = profileQuery.data;

  return (
    <div className="studio-stack">
      {failed && <AlertMessage type="danger" message={getErrorMessage(failed)} />}
      {loading ? (
        <LoadingSpinner text="Loading your records…" />
      ) : (
        <>
          <section className="studio-panel">
            <header>
              <h2>Registration</h2>
              <p>
                {profile?.program || 'Programme'} · {titleYear(profile?.yearOfStudy)} · {profile?.studentNumber || 'Student'}
              </p>
            </header>
            {(regsQuery.data || []).length === 0 ? (
              <p className="studio-empty">No registration records yet.</p>
            ) : (
              <div className="studio-table-wrap">
                <table className="studio-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Semester</th>
                      <th>Status</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(regsQuery.data || []).map((row) => (
                      <tr key={row.id}>
                        <td>{row.academicYear || '—'}</td>
                        <td>{row.semester || '—'}</td>
                        <td>{row.confirmationStatus === 'CONFIRMED' ? 'Confirmed' : 'Pending'}</td>
                        <td>{row.registeredAt ? formatDate(row.registeredAt) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="studio-more">
              <Link to="/student/records/registration">Open the registration slip</Link>
            </p>
          </section>

          <section className="studio-panel">
            <header>
              <h2>Fee payment history</h2>
              <p>Amounts billed, paid, and still outstanding</p>
            </header>
            {(feesQuery.data || []).length === 0 ? (
              <p className="studio-empty">No fee payments yet.</p>
            ) : (
              <div className="studio-table-wrap">
                <table className="studio-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Date</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(feesQuery.data || []).map((row) => {
                      const balance = Math.max(0, Number(row.amount || 0) - Number(row.paidAmount || 0));
                      return (
                        <tr key={row.id}>
                          <td>{row.description}</td>
                          <td>K{money(row.paidAmount)}</td>
                          <td>K{money(balance)}</td>
                          <td>{row.paymentDate ? formatDate(row.paymentDate) : '—'}</td>
                          <td>{row.receiptNumber || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="studio-more">
              <Link to="/student/records/fees">Open the full fee statement</Link>
            </p>
          </section>

          <section className="studio-panel">
            <header>
              <h2>Exam status</h2>
              <p>Whether you are eligible to sit, or have already sat</p>
            </header>
            {(examsQuery.data || []).length === 0 ? (
              <p className="studio-empty">No examination records yet.</p>
            ) : (
              <div className="studio-table-wrap">
                <table className="studio-table">
                  <thead>
                    <tr>
                      <th>Academic year</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(examsQuery.data || []).map((row) => (
                      <tr key={row.id}>
                        <td>{row.academicYear || '—'}</td>
                        <td>
                          {row.sittingStatus === 'SAT'
                            ? 'Sat'
                            : row.sittingStatus === 'ELIGIBLE'
                              ? 'Eligible to sit'
                              : 'Not eligible'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AcademicRecordsPage;
