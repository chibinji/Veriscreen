import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../types';

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [studentId, setStudentId] = useState('2021465934');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login({ id: studentId.trim(), password });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed. Check your student ID and password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark large">VS</span>
          <h1>VeriScreen</h1>
          <p>Secure access to your verified academic records</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="studentId">Student ID</label>
          <input
            id="studentId"
            name="studentId"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            placeholder="e.g. 2021465934"
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error ? (
            <div className="error-banner" role="alert">
              {error}
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="login-hint">
          <p>Demo accounts (password: <code>password123</code>)</p>
          <ul>
            <li><strong>2021465934</strong> — Approved HELSB, small fee balance</li>
            <li><strong>2022030346</strong> — Fees paid, HELSB under review</li>
            <li><strong>2020123456</strong> — Outstanding fees, exam blocked</li>
            <li><strong>2019876543</strong> — Multi-year history, partial payments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
