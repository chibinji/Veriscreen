import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import BrandLogo from '../components/brand/BrandLogo';

const PublicLayout: React.FC = () => (
<<<<<<< HEAD:veriscreen/frontend/src/layouts/PublicLayout.tsx
  <div className="min-vh-100 vs-canvas auth-shell d-flex flex-column">
=======
  <div className="min-vh-100 bg-light d-flex flex-column">
    {/* Simple top bar */}
    <nav className="navbar bg-white border-bottom px-4">
      <Link to="/" className="navbar-brand d-flex align-items-center mb-0">
        <BrandLogo size="sm" />
      </Link>
    </nav>

>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:frontend/src/layouts/PublicLayout.tsx
    <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
      <div className="container auth-shell__form" style={{ maxWidth: 520 }}>
        <Outlet />
      </div>
    </div>

    <footer className="text-center py-3 text-muted small">
      &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
    </footer>
  </div>
);

export default PublicLayout;
