import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api';
import { studentService } from '../../services/studentService';
import { documentService } from '../../services/documentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import { getErrorMessage } from '../../utils';
import { fullName, groupFees, money } from './recordsFormat';

const FeeHistoryRecordPage: React.FC = () => {
  const profileQuery = useQuery({ queryKey: ['student-profile'], queryFn: studentService.getProfile });
  const feesQuery = useQuery({ queryKey: ['fee-records'], queryFn: () => usersApi.getFeeRecords() });

  const historyMutation = useMutation({
    mutationFn: () => documentService.generateAndDownload('PAYMENT_HISTORY'),
  });

  const profile = profileQuery.data;
  const groups = groupFees(feesQuery.data || [], profile);

  return (
    <div className="sis-page">
      <Link to="/student/records" className="sis-back">
        <i className="bi bi-arrow-left me-1" />
        Academic Records
      </Link>

      {(profileQuery.isError || feesQuery.isError) && (
        <AlertMessage type="danger" message={getErrorMessage(profileQuery.error || feesQuery.error)} />
      )}
      {historyMutation.isError && (
        <AlertMessage type="danger" message={getErrorMessage(historyMutation.error) || 'Could not download payment history.'} />
      )}

      {profileQuery.isLoading || feesQuery.isLoading ? (
        <LoadingSpinner text="Loading payment details…" />
      ) : (
        <div className="sis-sheet">
          <div className="sis-pay-top">
            <strong>{profile?.studentNumber || '—'}</strong>
            <strong className="text-uppercase">{fullName(profile)}</strong>
            <button
              type="button"
              className="sis-history-btn"
              onClick={() => historyMutation.mutate()}
              disabled={historyMutation.isPending}
            >
              {historyMutation.isPending ? 'Preparing…' : 'Payment History'}
            </button>
          </div>

          <div className="table-responsive">
            <table className="sis-table">
              <thead>
                <tr>
                  <th>Year of Study</th>
                  <th>Session</th>
                  <th>Payment details</th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td>{profile?.yearOfStudy ? `${profile.yearOfStudy}` : '—'}</td>
                    <td>—</td>
                    <td>
                      <p className="sis-alert-red mb-2">No payments received!</p>
                      <table className="sis-nested">
                        <thead>
                          <tr>
                            <th>Fee description</th>
                            <th>Currency</th>
                            <th>Amount</th>
                            <th>Paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={4} className="text-muted small">No fee lines on file.</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <tr key={group.key}>
                      <td>{group.yearOfStudy}</td>
                      <td>{group.session}</td>
                      <td>
                        {group.paid <= 0 && <p className="sis-alert-red mb-2">No payments received!</p>}
                        <table className="sis-nested">
                          <thead>
                            <tr>
                              <th>Fee description</th>
                              <th>Currency</th>
                              <th>Amount</th>
                              <th>Paid</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.rows.map((row) => (
                              <tr key={row.id}>
                                <td>{row.description}</td>
                                <td>ZMW</td>
                                <td className="text-end">{money(row.amount)}</td>
                                <td className="text-end">{money(row.paidAmount)}</td>
                              </tr>
                            ))}
                            <tr className="sis-total">
                              <td>Totals</td>
                              <td />
                              <td className="text-end">{money(group.amount)}</td>
                              <td className="text-end">{money(group.paid)}</td>
                            </tr>
                            <tr className="sis-total">
                              <td>Balance</td>
                              <td />
                              <td />
                              <td className="text-end">{money(group.balance)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeHistoryRecordPage;
