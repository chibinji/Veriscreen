import React from 'react';
import PrivateLayout from './PrivateLayout';

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi-speedometer2' },
  { label: 'Users', path: '/admin/users', icon: 'bi-people' },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'bi-journal-text' },
  { label: 'Settings', path: '/admin/settings', icon: 'bi-gear' },
  { label: 'Notifications', path: '/admin/notifications', icon: 'bi-bell' },
];

const AdminLayout: React.FC = () => <PrivateLayout navItems={adminNav} />;
export default AdminLayout;
