import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helsbService } from '../../services/helsbService';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, formatCurrency } from '../../utils';

const APPLICATION_FEE = 250;

const HelsbPayment: React.FC = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: application, isLoading, isError } = useQuery({
    queryKey: ['my-application'],
    queryFn: helsbService.getMyApplication,
    retry: false,
  });

  const { data: payment } = useQuery({
    queryKey: ['my-payment', application?.id],
    queryFn: () => helsbService.getMyPayment(application!.id),
    enabled: !!application,
    retry: false,
  });

  const payMutation = useMutation({
    mutationFn: () => helsbService.makePayment(application!.id, APPLICATION_FEE),
    onSuccess: () => {
      setSuccess('Payment processed successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-payment'] });
      queryClient.invalidateQueries({ queryKey: ['my-application'] });
    },
    onError: () => setError('Payment failed. Please try again.'),
  });

  if (isLoading) return <LoadingSpinner fullPage text="Loading payment details…" />;

  if (isError) {
    return <AlertMessage type="danger" message="Unable to load payment details." />;
  }

  if (!application) {
    return (
      <div>
        <PageHeader
          title="Application Fee Payment"
          subtitle="Pay the HELSB application processing fee."
          breadcrumbs={[{ label: 'HELSB', path: '/helsb/dashboard' }, { label: 'Payment' }]}
        />
        <AlertMessage type="warning" message="No HELSB application is linked to this account yet." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Application Fee Payment"
        subtitle="Pay the HELSB application processing fee."
        breadcrumbs={[{ label: 'HELSB', path: '/helsb/dashboard' }, { label: 'Payment' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} autoDismiss={5000} />}

      <div className="row g-3 justify-content-center">
        <div className="col-lg-6">
          {payment ? (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom fw-semibold py-3">
                <i className="bi bi-receipt me-2 text-success" />Payment Receipt
              </div>
              <div className="card-body text-center py-4">
                <i className="bi bi-check-circle-fill text-success fs-1 mb-3 d-block" />
                <h5 className="fw-bold mb-1">Payment Confirmed</h5>
                <p className="text-muted small mb-4">Your application fee has been received.</p>
                <div className="row g-2 text-start">
                  {[
                    { label: 'Amount', value: formatCurrency(payment.amount) },
                    { label: 'Transaction Ref', value: payment.transactionRef },
                    { label: 'Status', value: <StatusBadge status={payment.status} /> },
                    { label: 'Date', value: formatDateTime(payment.paidAt) },
                  ].map((item) => (
                    <div key={item.label} className="col-6">
                      <div className="bg-light rounded-2 p-2">
                        <p className="text-muted small mb-1">{item.label}</p>
                        <div className="fw-semibold small">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom fw-semibold py-3">
                <i className="bi bi-credit-card me-2 text-primary" />Pay Application Fee
              </div>
              <div className="card-body">
                <div className="alert alert-info small">
                  <i className="bi bi-info-circle me-2" />
                  This is a simulated payment. No real money will be charged.
                </div>

                <div className="text-center py-3">
                  <p className="text-muted small mb-1">Application Fee</p>
                  <h2 className="fw-bold text-primary mb-0">{formatCurrency(APPLICATION_FEE)}</h2>
                  <p className="text-muted small mt-1">One-time HELSB processing fee</p>
                </div>

                <div className="bg-light rounded-2 p-3 mb-4">
                  <div className="d-flex justify-content-between small border-bottom pb-2 mb-2">
                    <span className="text-muted">Application Number</span>
                    <span className="fw-medium">{application?.applicationNumber}</span>
                  </div>
                  <div className="d-flex justify-content-between small border-bottom pb-2 mb-2">
                    <span className="text-muted">Student</span>
                    <span className="fw-medium">{application?.studentName}</span>
                  </div>
                  <div className="d-flex justify-content-between small fw-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(APPLICATION_FEE)}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  onClick={() => payMutation.mutate()}
                  disabled={payMutation.isPending}
                >
                  {payMutation.isPending ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Processing…</>
                  ) : (
                    <><i className="bi bi-shield-lock me-2" />Pay {formatCurrency(APPLICATION_FEE)} Securely</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelsbPayment;
