import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { helsbService } from '../../services/helsbService';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const schema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits'),
  accountName: z.string().min(2, 'Account name is required'),
  branch: z.string().min(2, 'Branch is required'),
  sortCode: z.string().min(3, 'Sort code is required'),
});

type FormData = z.infer<typeof schema>;

const BANKS = ['Zanaco', 'Standard Chartered', 'First National Bank', 'Stanbic', 'Atlas Mara', 'Access Bank', 'Bank of China'];

const HelsbBankDetails: React.FC = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: application, isLoading: appLoading, isError: appError } = useQuery({
    queryKey: ['my-application'],
    queryFn: helsbService.getMyApplication,
    retry: false,
  });

  const { data: existing, isLoading: bankLoading, isError: bankError } = useQuery({
    queryKey: ['bank-details', application?.id],
    queryFn: () => helsbService.getMyBankDetails(application!.id),
    enabled: !!application,
    retry: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      helsbService.submitBankDetails({ ...data, applicationId: application!.id }),
    onSuccess: () => {
      setSuccess('Bank details saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['bank-details'] });
    },
    onError: () => setError('Failed to save bank details. Please try again.'),
  });

  if (appLoading || (!!application && bankLoading)) return <LoadingSpinner fullPage />;

  if (appError || bankError) {
    return <AlertMessage type="danger" message="Unable to load bank details." />;
  }

  if (!application) {
    return (
      <div>
        <PageHeader
          title="Bank Details"
          subtitle="Provide your bank account details for loan disbursement."
          breadcrumbs={[{ label: 'HELSB', path: '/helsb/dashboard' }, { label: 'Bank Details' }]}
        />
        <AlertMessage type="warning" message="No HELSB application is linked to this account yet." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Bank Details"
        subtitle="Provide your bank account details for loan disbursement."
        breadcrumbs={[{ label: 'HELSB', path: '/helsb/dashboard' }, { label: 'Bank Details' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} />}

      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom fw-semibold py-3">
              <i className="bi bi-bank me-2 text-primary" />{existing ? 'Saved Bank Details' : 'Enter Bank Details'}
            </div>
            <div className="card-body p-4">
              {existing ? (
                <div className="row g-3">
                  {[
                    { label: 'Bank Name', value: existing.bankName, icon: 'bi-building' },
                    { label: 'Account Number', value: existing.accountNumber, icon: 'bi-123' },
                    { label: 'Account Name', value: existing.accountName, icon: 'bi-person' },
                    { label: 'Branch', value: existing.branch, icon: 'bi-geo-alt' },
                    { label: 'Sort Code', value: existing.sortCode, icon: 'bi-hash' },
                  ].map((item) => (
                    <div key={item.label} className="col-sm-6">
                      <div className="bg-light rounded-2 p-3">
                        <p className="text-muted small mb-1"><i className={`bi ${item.icon} me-1`} />{item.label}</p>
                        <p className="fw-semibold mb-0">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Bank Name</label>
                    <select {...register('bankName')} className={`form-select ${errors.bankName ? 'is-invalid' : ''}`}>
                      <option value="">Select your bank</option>
                      {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.bankName && <div className="invalid-feedback">{errors.bankName.message}</div>}
                  </div>

                  {[
                    { name: 'accountNumber' as const, label: 'Account Number', placeholder: '1234567890' },
                    { name: 'accountName' as const, label: 'Account Name', placeholder: 'As per bank records' },
                    { name: 'branch' as const, label: 'Branch', placeholder: 'e.g. Lusaka Main' },
                    { name: 'sortCode' as const, label: 'Sort Code', placeholder: 'e.g. 060045' },
                  ].map((f) => (
                    <div key={f.name} className="mb-3">
                      <label className="form-label fw-medium">{f.label}</label>
                      <input
                        {...register(f.name)}
                        type="text"
                        className={`form-control ${errors[f.name] ? 'is-invalid' : ''}`}
                        placeholder={f.placeholder}
                      />
                      {errors[f.name] && <div className="invalid-feedback">{errors[f.name]?.message}</div>}
                    </div>
                  ))}

                  <button type="submit" className="btn btn-primary w-100 py-2" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                    ) : (
                      <><i className="bi bi-check me-2" />Save Bank Details</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelsbBankDetails;
