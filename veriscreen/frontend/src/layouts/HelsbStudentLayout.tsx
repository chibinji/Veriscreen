import React from 'react';
import PrivateLayout from './PrivateLayout';

const helsbStudentNav = [
  { label: 'Application', path: '/helsb/dashboard', icon: 'bi-clipboard2-check' },
  { label: 'Payment', path: '/helsb/payment', icon: 'bi-credit-card' },
  { label: 'Bank Details', path: '/helsb/bank-details', icon: 'bi-bank' },
  { label: 'Screening Result', path: '/helsb/screening', icon: 'bi-bar-chart-line' },
  { label: 'Contract', path: '/helsb/contract', icon: 'bi-file-earmark-ruled' },
  { label: 'Settings', path: '/helsb/settings', icon: 'bi-gear' },
  { label: 'Notifications', path: '/helsb/notifications', icon: 'bi-bell' },
];

const HelsbStudentLayout: React.FC = () => <PrivateLayout navItems={helsbStudentNav} />;
export default HelsbStudentLayout;
