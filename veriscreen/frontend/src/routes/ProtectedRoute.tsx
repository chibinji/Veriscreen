import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { TOKEN_KEY } from '../constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Role } from '../types';

interface Props {
  children?: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    if (hasToken && !user) {
      useAuthStore.getState().initializeFromStorage();
    }
  }, [hasToken, user]);

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <LoadingSpinner fullPage text="Restoring session…" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/403" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
