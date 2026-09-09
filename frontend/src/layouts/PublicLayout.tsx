import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import BrandLogo from '../components/brand/BrandLogo';

const PublicLayout: React.FC = () => (
  <div className="min-vh-100 bg-light d-flex flex-column">
    {/* Simple top bar */}
    <nav className="navbar bg-white border-bottom px-4">
      <Link to="/" className="navbar-brand d-flex align-items-center mb-0">
        <BrandLogo size="sm" />
      </Link>
    </nav>

    <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
      <div className="container" style={{ maxWidth: 520 }}>
        <Outlet />
      </div>
    </div>

    <footer className="text-center py-3 text-muted small border-top bg-white">
      &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
    </footer>
  </div>
);

export default PublicLayout;
