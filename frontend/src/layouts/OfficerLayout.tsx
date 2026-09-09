import React from 'react';
import PrivateLayout from './PrivateLayout';

const officerNav = [
  { label: 'Dashboard', path: '/officer/dashboard', icon: 'bi-speedometer2' },
  { label: 'Applications', path: '/officer/applications', icon: 'bi-clipboard2-list' },
  { label: 'Search Students', path: '/officer/search', icon: 'bi-search' },
  { label: 'Settings', path: '/officer/settings', icon: 'bi-gear' },
  { label: 'Notifications', path: '/officer/notifications', icon: 'bi-bell' },
];

const OfficerLayout: React.FC = () => <PrivateLayout navItems={officerNav} />;
export default OfficerLayout;
