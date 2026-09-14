import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import AlertMessage from '../../components/common/AlertMessage';
import BrandLogo from '../../components/brand/BrandLogo';
import { APP_NAME } from '../../constants';
import { getErrorMessage } from '../../utils';

const schema = z.object({
  studentNumber: z.string().min(1, 'Student number is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number must be at least 9 digits'),
  nrc: z.string().min(1, 'NRC is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      await authService.register(data);
      navigate('/login', { state: { message: 'Registration successful. Please sign in.' } });
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (
    name: keyof FormData,
    label: string,
    type = 'text',
    placeholder = '',
    icon = 'bi-input-cursor'
  ) => (
    <div className="mb-3">
      <label className="form-label fw-medium small">{label}</label>
      <div className="input-group">
        <span className="input-group-text bg-light"><i className={`bi ${icon} text-muted`} /></span>
        <input
          {...register(name)}
          type={type}
          className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
          placeholder={placeholder}
        />
      </div>
      {errors[name] && <div className="invalid-feedback d-block">{errors[name]?.message}</div>}
    </div>
  );

  return (
    <div>
      <div className="text-center mb-4">
        <BrandLogo size="lg" className="justify-content-center mb-3" />
        <h4 className="fw-bold mb-1 text-navy">Create an Account</h4>
        <p className="text-muted small mb-0">{APP_NAME} — Secure Document Verification</p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="row g-2">
              <div className="col-6">
                {field('firstName', 'First Name', 'text', 'John', 'bi-person')}
              </div>
              <div className="col-6">
                {field('lastName', 'Last Name', 'text', 'Doe', 'bi-person')}
              </div>
            </div>

            {field('studentNumber', 'Student Number', 'text', 'e.g. 21/001234', 'bi-123')}
            {field('nrc', 'NRC Number', 'text', 'e.g. 123456/10/1', 'bi-card-text')}
            {field('email', 'Email Address', 'email', 'you@example.com', 'bi-envelope')}
            {field('phone', 'Phone Number', 'tel', '+260 9XX XXX XXX', 'bi-phone')}
            {field('password', 'Password', 'password', 'Min. 8 characters', 'bi-lock')}
            {field('confirmPassword', 'Confirm Password', 'password', 'Repeat password', 'bi-lock-fill')}

            <button
              type="submit"
              className="btn btn-bubble w-100 mt-2"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Creating account…</>
              ) : (
                <><i className="bi bi-person-plus me-2" />Create Account</>
              )}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center text-muted small mt-3">
        Already have an account?{' '}
        <Link to="/login" className="text-decoration-none fw-semibold">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
