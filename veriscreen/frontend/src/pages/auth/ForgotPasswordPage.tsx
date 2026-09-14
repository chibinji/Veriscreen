import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import AlertMessage from '../../components/common/AlertMessage';
import BrandLogo from '../../components/brand/BrandLogo';

const schema = z.object({ email: z.string().email('Invalid email address') });
type FormData = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSuccess('If that email is registered, a reset link has been sent. Check your inbox.');
    } catch {
      setError('Unable to process your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-4">
        <BrandLogo size="lg" className="justify-content-center mb-3" />
        <h4 className="fw-bold mb-1 text-navy">Reset your password</h4>
        <p className="text-muted small mb-0">Enter your email and we&apos;ll send reset instructions</p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {success && <AlertMessage type="success" message={success} />}
          {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}

          {!success && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <label className="form-label fw-medium">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-envelope text-muted" /></span>
                  <input
                    {...register('email')}
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
                ) : (
                  <><i className="bi bi-send me-2" />Send Reset Link</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-center text-muted small mt-3">
        Remember your password?{' '}
        <Link to="/login" className="text-decoration-none fw-semibold">Sign in</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
