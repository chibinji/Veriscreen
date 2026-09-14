import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi, usersApi } from '../api';
import { resetDb } from '../data/store';
import { useAuthStore } from '../store/authStore';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import { getErrorMessage, getRoleDashboard } from '../utils';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../types';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['settings'],
    queryFn: usersApi.getSettings,
  });

  const settingsMutation = useMutation({
    mutationFn: usersApi.updateSettings,
    onSuccess: () => setSuccess('Preferences saved.'),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const passwordMutation = useMutation({
    mutationFn: () => authApi.changePassword(oldPassword, newPassword),
    onSuccess: (res) => {
      setSuccess(res.message);
      setOldPassword('');
      setNewPassword('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleReset = () => {
    resetDb();
    logout();
    navigate('/login');
  };

  if (isLoading) return <LoadingSpinner fullPage text="Loading settings…" />;
  if (isError) return <AlertMessage type="danger" message="Unable to load settings." />;

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage password and notifications."
        breadcrumbs={[{ label: 'Dashboard', path: user ? getRoleDashboard(user.role as Role) : '/' }, { label: 'Settings' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} autoDismiss={4000} onDismiss={() => setSuccess('')} />}

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold py-3">
              <i className="bi bi-bell me-2 text-primary" />Notifications
            </div>
            <div className="card-body">
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings?.emailNotifications ?? true}
                  onChange={(e) => settingsMutation.mutate({ emailNotifications: e.target.checked })}
                  id="emailNotes"
                />
                <label className="form-check-label" htmlFor="emailNotes">Email notifications</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings?.smsNotifications ?? false}
                  onChange={(e) => settingsMutation.mutate({ smsNotifications: e.target.checked })}
                  id="smsNotes"
                />
                <label className="form-check-label" htmlFor="smsNotes">SMS notifications</label>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold py-3">
              <i className="bi bi-key me-2 text-primary" />Change password
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Current password</label>
                <input type="password" className="form-control" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">New password</label>
                <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <button
                className="btn btn-primary"
                disabled={passwordMutation.isPending || !oldPassword || !newPassword}
                onClick={() => passwordMutation.mutate()}
              >
                {passwordMutation.isPending ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold py-3">
              <i className="bi bi-database me-2 text-warning" />Demo data
            </div>
            <div className="card-body">
              <button className="btn btn-outline-danger" onClick={handleReset}>
                <i className="bi bi-arrow-counterclockwise me-2" />Reset demo data and sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
