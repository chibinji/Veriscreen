import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api';
import { resetDb } from '../data/store';
import { useAuthStore } from '../store/authStore';
import AlertMessage from '../components/common/AlertMessage';
import { getErrorMessage } from '../utils';
import { applyTheme, readTheme } from '../theme';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dark, setDark] = useState(() => readTheme() === 'dark');

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['settings'],
    queryFn: usersApi.getSettings,
  });

  const settingsMutation = useMutation({
    mutationFn: usersApi.updateSettings,
    onSuccess: (next) => {
      queryClient.setQueryData(['settings'], next);
      setSuccess('Preferences saved.');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleReset = () => {
    resetDb();
    logout();
    navigate('/login');
  };

  const toggleDark = (enabled: boolean) => {
    setDark(enabled);
    applyTheme(enabled ? 'dark' : 'light');
  };

  return (
    <div className="studio-settings">
      <h1>Settings</h1>
      <p className="studio-settings__lead">Appearance and notifications for this browser.</p>

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} autoDismiss={4000} onDismiss={() => setSuccess('')} />}
      {isError && <AlertMessage type="danger" message="Unable to load notification preferences." />}

      <section className="studio-settings__card">
        <h2>Appearance</h2>
        <label className="studio-switch" htmlFor="darkMode">
          <input
            id="darkMode"
            type="checkbox"
            role="switch"
            checked={dark}
            onChange={(event) => toggleDark(event.target.checked)}
          />
          <span>Dark mode</span>
        </label>
        <p>Turn this on for a darker dashboard, documents, and records.</p>
      </section>

      <section className="studio-settings__card">
        <h2>Notifications</h2>
        {isLoading ? (
          <p>Loading notification preferences…</p>
        ) : (
          <label className="studio-switch" htmlFor="emailNotes">
            <input
              id="emailNotes"
              type="checkbox"
              role="switch"
              checked={settings?.emailNotifications ?? true}
              onChange={(event) => settingsMutation.mutate({ emailNotifications: event.target.checked })}
            />
            <span>Email notifications</span>
          </label>
        )}
      </section>

      <section className="studio-settings__card">
        <h2>Demo data</h2>
        <button type="button" className="studio-settings__danger" onClick={handleReset}>
          Reset demo data and sign out
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
