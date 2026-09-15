import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { notificationService } from '../services/notificationService';
import type { Role } from '../types';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}

interface Props {
  navItems: NavItem[];
}

const PrivateLayout: React.FC<Props> = ({ navItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 992 : true
  );
  const { user } = useAuthStore();
  const { setNotifications } = useNotificationStore();

  useEffect(() => {
    notificationService.getAll().then(setNotifications).catch(() => undefined);
  }, [setNotifications]);

  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        role={user.role as Role}
      />

      <div
        className="flex-grow-1 d-flex flex-column min-vh-100 main-content"
        style={{
          marginLeft: sidebarOpen ? 260 : 0,
          transition: 'margin-left 0.25s ease',
        }}
      >
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        <main className="flex-grow-1 p-3 p-md-4">
          <Outlet />
        </main>

        <footer className="text-center py-3 text-muted" style={{ fontSize: '0.75rem' }}>
          &copy; {new Date().getFullYear()} VeriScreen. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default PrivateLayout;
