import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import AlertMessage from '../components/common/AlertMessage';
import { getInitials, getRoleLabel } from '../utils';
import { useAuthStore } from '../store/authStore';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me'],
    queryFn: usersApi.getMe,
  });

  if (isLoading) return <LoadingSpinner fullPage text="Loading profile…" />;
  if (isError) {
    return <AlertMessage type="danger" message={error instanceof Error ? error.message : 'Unable to load profile.'} />;
  }

  const profile = data || user;
  if (!profile) {
    return <EmptyState icon="bi-person-x" title="No profile" description="Sign in to view your profile." />;
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Account details for the signed-in user."
        breadcrumbs={[{ label: 'Profile' }]}
      />
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm text-center py-4">
            <div className="card-body">
              <div
                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3 fw-bold"
                style={{ width: 80, height: 80, fontSize: '1.75rem' }}
              >
                {getInitials(fullName)}
              </div>
              <h5 className="fw-bold mb-1">{fullName}</h5>
              <p className="text-muted small mb-2">{profile.email}</p>
              <span className="badge bg-primary-subtle text-primary">{getRoleLabel(profile.role)}</span>
              <hr />
              <div className="text-start">
                {[
                  { label: 'Username', value: profile.username },
                  { label: 'Student number', value: profile.studentNumber || '—' },
                  { label: 'Account status', value: profile.active === false ? 'Inactive' : 'Active' },
                ].map((item) => (
                  <div key={item.label} className="d-flex justify-content-between small py-2 border-bottom">
                    <span className="text-muted">{item.label}</span>
                    <span className="fw-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
