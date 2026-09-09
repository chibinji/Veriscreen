import React from 'react';
import PrivateLayout from './PrivateLayout';

const studentNav = [
  { label: 'Dashboard', path: '/student/dashboard', icon: 'bi-speedometer2' },
  { label: 'My Profile', path: '/student/profile', icon: 'bi-person-circle' },
  { label: 'Documents', path: '/student/documents', icon: 'bi-file-earmark-text' },
  { label: 'Applications', path: '/student/applications', icon: 'bi-send' },
  { label: 'Academic Records', path: '/student/records', icon: 'bi-journal-text' },
  { label: 'Settings', path: '/student/settings', icon: 'bi-gear' },
  { label: 'Notifications', path: '/student/notifications', icon: 'bi-bell' },
];

const StudentLayout: React.FC = () => <PrivateLayout navItems={studentNav} />;
export default StudentLayout;
