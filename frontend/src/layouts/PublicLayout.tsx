import React from 'react';
import { Outlet } from 'react-router-dom';
import { APP_NAME } from '../constants';

const PublicLayout: React.FC = () => (
  <div className="min-vh-100 vs-canvas d-flex flex-column">
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
