import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage, getRoleDashboard, getRoleBasePath } from '../../utils';
import AlertMessage from '../../components/common/AlertMessage';
import shieldMark from '../../assets/veriscreen-shield.jpg';
import { APP_NAME } from '../../constants';
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

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

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
    <div className="login-stage">
      <div className="login-card">
        <section className="login-art">
          <div className="login-art__brand">
            <img src={shieldMark} alt="" />
            <div>
              <strong>{APP_NAME}</strong>
              <span>Verified records</span>
            </div>
          </div>

          <div className="login-art__scene" aria-hidden="true">
            <span className="login-art__blob login-art__blob--a" />
            <span className="login-art__blob login-art__blob--b" />
            <span className="login-art__blob login-art__blob--c" />
            <span className="login-art__dot login-art__dot--1" />
            <span className="login-art__dot login-art__dot--2" />
            <span className="login-art__dot login-art__dot--3" />
            <img src={shieldMark} alt="" />
          </div>

          <p className="login-art__legal">© {new Date().getFullYear()} {APP_NAME}</p>
        </section>

        <section className="login-panel">
          <div className="login-panel__body">
            <h1>Sign in</h1>

            {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="login-field">
                <label className="login-field__label" htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  {...register('username')}
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                />
                {errors.username && <div className="invalid-feedback d-block">{errors.username.message}</div>}
              </div>

              <div className="login-field">
                <label className="login-field__label" htmlFor="login-password">Password</label>
                <div className="login-panel__password">
                  <input
                    id="login-password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-panel__eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
              </div>

              <button type="submit" className="login-panel__submit" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          <p className="login-panel__help">
            Have a problem? Contact your university registrar.
          </p>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
