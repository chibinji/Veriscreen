import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage, getRoleDashboard, getRoleBasePath } from '../../utils';
import AlertMessage from '../../components/common/AlertMessage';
import BrandLogo from '../../components/brand/BrandLogo';
<<<<<<< HEAD:veriscreen/frontend/src/pages/auth/LoginPage.tsx
import veriscreenMark from '../../assets/veriscreen-mark.jpg';
=======
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:frontend/src/pages/auth/LoginPage.tsx
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
<<<<<<< HEAD:veriscreen/frontend/src/pages/auth/LoginPage.tsx
    <div className="login-split">
      <section className="login-split__form">
        <div className="login-split__form-inner">
          <BrandLogo size="sm" className="mb-4 login-split__logo" />
          <h1 className="login-split__title">Sign in</h1>
          <p className="login-split__subtitle">Secure academic document verification</p>
=======
    <div>
      <div className="text-center mb-4">
        <BrandLogo size="lg" className="justify-content-center mb-3" />
        <h4 className="fw-bold mb-1 text-navy">Sign in</h4>
        <p className="text-muted small mb-0">Secure academic document verification</p>
      </div>
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:frontend/src/pages/auth/LoginPage.tsx

          {registeredMessage && <AlertMessage type="success" message={registeredMessage} />}
          {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label">Username or Student Number</label>
              <input
                {...register('username')}
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                placeholder="Enter username"
                autoComplete="username"
                autoFocus
              />
              {errors.username && <div className="invalid-feedback d-block">{errors.username.message}</div>}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="login-split__link">Forgot password?</Link>
              </div>
              <div className="login-split__password">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-split__eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
            </div>

            <button type="submit" className="btn btn-bubble w-100" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="login-split__footer">
            Don&apos;t have an account?{' '}
            <Link to="/register">Create now</Link>
          </p>
        </div>
      </section>

      <aside className="login-split__brand" aria-hidden="true">
        <div className="login-split__brand-inner">
          <div className="login-split__mark-card">
            <img src={veriscreenMark} alt="" />
          </div>
          <h2>Secure. Simple. Verified.</h2>
          <p>
            {APP_NAME} helps students access verified academic documents and apply to HELSB with ease.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default LoginPage;
