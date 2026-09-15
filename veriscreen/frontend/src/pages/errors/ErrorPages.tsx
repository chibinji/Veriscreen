import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getRoleDashboard } from '../../utils';
import { APP_NAME } from '../../constants';
import BrandLogo from '../../components/brand/BrandLogo';
import type { Role } from '../../types';

interface ErrorPageProps {
  code: number;
  title: string;
  description: string;
  icon: string;
  showHome?: boolean;
  showBack?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code, title, description, icon, showHome = true, showBack = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const homePath = user ? getRoleDashboard(user.role as Role) : '/login';

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true, state: {} });
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column align-items-center justify-content-center p-4">
      <div className="text-center" style={{ maxWidth: 480 }}>
        <div className="mb-4 d-flex justify-content-center">
          <BrandLogo size="md" />
        </div>
        <div className="bg-white rounded-3 shadow-sm p-5 mb-4">
          <i className={`bi ${icon} text-muted`} style={{ fontSize: '4rem' }} />
          <h1 className="display-1 fw-bold text-primary mt-3">{code}</h1>
          <h4 className="fw-bold mb-2">{title}</h4>
          <p className="text-muted">{description}</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
            {showBack && (
              <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2" />Go Back
              </button>
            )}
            {showHome && (
              <Link to={homePath} className="btn btn-primary">
                <i className="bi bi-house me-2" />Dashboard
              </Link>
            )}
            {user && (
              <button className="btn btn-outline-danger" onClick={handleSignOut}>
                <i className="bi bi-box-arrow-right me-2" />Sign out
              </button>
            )}
          </div>
        </div>
        <p className="text-muted small">&copy; {new Date().getFullYear()} {APP_NAME}</p>
      </div>
    </div>
  );
};

export const Page401: React.FC = () => (
  <ErrorPage
    code={401}
    title="Authentication Required"
    description="You need to sign in to access this page. Please log in with your credentials."
    icon="bi-shield-lock"
    showBack={false}
  />
);

export const Page403: React.FC = () => (
  <ErrorPage
    code={403}
    title="Access Forbidden"
    description="You don't have permission to view this page. Contact your administrator if you think this is a mistake."
    icon="bi-ban"
  />
);

export const Page404: React.FC = () => (
  <ErrorPage
    code={404}
    title="Page Not Found"
    description="The page you're looking for doesn't exist or has been moved."
    icon="bi-compass"
  />
);

export const Page500: React.FC = () => (
  <ErrorPage
    code={500}
    title="Server Error"
    description="Something went wrong on our end. Please try again later or contact support."
    icon="bi-exclamation-octagon"
    showBack={false}
  />
);

export default ErrorPage;
