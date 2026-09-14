import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { studentService } from '../../services/studentService';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import { getErrorMessage, getInitials } from '../../utils';

const schema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().min(9, 'Phone must be at least 9 digits'),
});
type FormData = z.infer<typeof schema>;

const StudentProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['student-profile'],
    queryFn: studentService.getProfile,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) reset({ email: profile.email, phone: profile.phone });
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => studentService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      setEditMode(false);
      setFormError('');
      setSuccessMsg('Profile updated successfully.');
    },
    onError: (err) => setFormError(getErrorMessage(err) || 'Failed to update profile.'),
  });

  if (isLoading) return <LoadingSpinner fullPage text="Loading profile…" />;
  if (isError) {
    return (
      <AlertMessage
        type="danger"
        message={getErrorMessage(error) || 'Unable to load your profile. Please try again.'}
      />
    );
  }
  if (!profile) {
    return (
      <AlertMessage type="warning" message="No profile was found for this account." />
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View and manage your account information"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Profile' }]}
      />

      {successMsg && <AlertMessage type="success" message={successMsg} autoDismiss={4000} onDismiss={() => setSuccessMsg('')} />}
      {formError && <AlertMessage type="danger" message={formError} onDismiss={() => setFormError('')} />}

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm text-center py-4">
            <div className="card-body">
              <div
                className="rounded-circle bg-lapis text-white d-inline-flex align-items-center justify-content-center mb-3 fw-bold"
                style={{ width: 80, height: 80, fontSize: '1.75rem' }}
              >
                {getInitials(fullName)}
              </div>
              <h5 className="fw-bold mb-1 text-lapis">{fullName}</h5>
              <p className="text-muted small mb-2">{profile.studentNumber}</p>
              <StatusBadge status={profile.registrationStatus} />
              <hr />
              <div className="text-start">
                <div className="d-flex justify-content-between small py-1 border-bottom">
                  <span className="text-muted">Faculty</span>
                  <span className="fw-medium text-end" style={{ maxWidth: '55%' }}>{profile.faculty}</span>
                </div>
                <div className="d-flex justify-content-between small py-1 border-bottom">
                  <span className="text-muted">Program</span>
                  <span className="fw-medium text-end" style={{ maxWidth: '55%' }}>{profile.program}</span>
                </div>
                <div className="d-flex justify-content-between small py-1">
                  <span className="text-muted">Year of Study</span>
                  <span className="fw-medium">Year {profile.yearOfStudy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
              <span className="fw-semibold"><i className="bi bi-person me-2 text-primary" />Personal Information</span>
              <button
                className={`btn btn-sm ${editMode ? 'btn-secondary' : 'btn-outline-primary'}`}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? <><i className="bi bi-x me-1" />Cancel</> : <><i className="bi bi-pencil me-1" />Edit</>}
              </button>
            </div>
            <div className="card-body p-4">
              {editMode ? (
                <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Email Address</label>
                    <input {...register('email')} type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Phone Number</label>
                    <input {...register('phone')} type="tel" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} />
                    {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                    {mutation.isPending ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check me-1" />Save Changes</>}
                  </button>
                </form>
              ) : (
                <div className="row g-3">
                  {[
                    { label: 'Student Number', value: profile.studentNumber, icon: 'bi-123' },
                    { label: 'First Name', value: profile.firstName, icon: 'bi-person' },
                    { label: 'Last Name', value: profile.lastName, icon: 'bi-person' },
                    { label: 'NRC Number', value: profile.nrc, icon: 'bi-card-text' },
                    { label: 'Email Address', value: profile.email, icon: 'bi-envelope' },
                    { label: 'Phone Number', value: profile.phone, icon: 'bi-phone' },
                    { label: 'Faculty', value: profile.faculty, icon: 'bi-building' },
                    { label: 'Program', value: profile.program, icon: 'bi-mortarboard' },
                    { label: 'Year of Study', value: `Year ${profile.yearOfStudy}`, icon: 'bi-calendar3' },
                    { label: 'Registration Status', value: <StatusBadge status={profile.registrationStatus} />, icon: 'bi-check-circle' },
                  ].map((item) => (
                    <div key={item.label} className="col-sm-6">
                      <div className="p-3 rounded-2 bg-light">
                        <p className="text-muted small mb-1">
                          <i className={`bi ${item.icon} me-1`} />{item.label}
                        </p>
                        <div className="fw-medium">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
