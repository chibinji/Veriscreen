import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage, getRoleDashboard, getRoleBasePath } from '../../utils';
import { APP_NAME } from '../../constants';
import AlertMessage from '../../components/common/AlertMessage';
import veriscreenLogo from '../../assets/veriscreen-logo.jpg';
import type { Role } from '../../types';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

function destinationForRole(role: Role, from?: string) {
  const dashboard = getRoleDashboard(role);
  if (!from || from === '/login' || from === '/403' || from === '/401') return dashboard;
  const base = getRoleBasePath(role);
  if (from === base || from.startsWith(`${base}/`)) return from;
  return dashboard;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, isAuthenticated, user } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string }; message?: string })?.from?.pathname;
  const registeredMessage = (location.state as { message?: string } | null)?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (isAuthenticated && user) {
    return <Navigate to={destinationForRole(user.role, from)} replace />;
  }

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(data);
      flushSync(() => {
        setSession(res.user, res.token);
      });
      const destination = destinationForRole(res.role, from);
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-4">
        <div className="d-flex flex-column align-items-center gap-2 mb-3">
          <img
            src={veriscreenLogo}
            alt="VeriScreen"
            width={88}
            height={88}
            style={{ objectFit: 'contain' }}
          />
          <span className="fw-bold text-navy" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em' }}>
            {APP_NAME}
          </span>
        </div>
        <h4 className="fw-bold mb-1 text-navy">Sign in</h4>
        <p className="text-muted small mb-0">Secure academic document verification</p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {registeredMessage && <AlertMessage type="success" message={registeredMessage} />}
          {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label fw-medium">Username or Student Number</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-person text-muted" /></span>
                <input
                  {...register('username')}
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  placeholder="Enter username"
                  autoComplete="username"
                  autoFocus
                />
              </div>
              {errors.username && <div className="invalid-feedback d-block">{errors.username.message}</div>}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-medium mb-0">Password</label>
                <Link to="/forgot-password" className="text-decoration-none small">Forgot password?</Link>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-lock text-muted" /></span>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-2" />Sign in</>
              )}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center text-muted small mt-3">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-decoration-none fw-semibold">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;
