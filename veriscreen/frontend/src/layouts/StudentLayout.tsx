import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSessionQueryKey } from '../hooks/useSessionQueryKey';
import { notificationService } from '../services/notificationService';
import { studentService } from '../services/studentService';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { getInitials } from '../utils';

const NAV = [
  { label: 'Dashboard', path: '/student/dashboard', icon: 'bi-house' },
  { label: 'Documents', path: '/student/documents', icon: 'bi-file-earmark-text' },
  { label: 'Records', path: '/student/records', icon: 'bi-journal-text' },
  { label: 'Results', path: '/student/records/results', icon: 'bi-bar-chart' },
  { label: 'HELSB', path: '/student/applications', icon: 'bi-wallet2' },
  { label: 'Activity', path: '/student/activity', icon: 'bi-clock-history' },
];

const BOTTOM_NAV = [
  { label: 'Help', path: '/student/help', icon: 'bi-question-circle' },
  { label: 'Settings', path: '/student/settings', icon: 'bi-gear' },
];

function navActive(path: string, pathname: string) {
  if (path === '/student/dashboard') return pathname === path;
  if (path === '/student/records/results') return pathname.startsWith('/student/records/results');
  if (path === '/student/records') {
    return (
      pathname === '/student/records' ||
      (pathname.startsWith('/student/records/') && !pathname.startsWith('/student/records/results'))
    );
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

const StudentLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { setNotifications, unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const profileQuery = useQuery({
    queryKey: useSessionQueryKey('student-profile'),
    queryFn: studentService.getProfile,
  });

  useEffect(() => {
    notificationService.getAll().then(setNotifications).catch(() => undefined);
  }, [setNotifications]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!user) {
    return (
      <div className="studio studio--loading">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : `${user.firstName} ${user.lastName}`.trim();

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="studio">
      {open && <button className="studio-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <header className="studio-top">
        <button type="button" className="studio-menu" onClick={() => setOpen(true)} aria-label="Open menu">
          <i className="bi bi-list" />
        </button>
        <NavLink to="/student/notifications" className="studio-bell" aria-label="Notifications">
          <i className="bi bi-bell" />
          {unreadCount > 0 && <em>{unreadCount}</em>}
        </NavLink>
        <NavLink to="/student/profile" className="studio-avatar" aria-label="Open profile">
          {getInitials(fullName || 'Student')}
        </NavLink>
      </header>

      <aside className={`studio-sidebar ${open ? 'is-open' : ''}`}>
        <nav className="studio-nav" aria-label="Student">
          {NAV.map((item) => {
            const active = navActive(item.path, location.pathname);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`studio-nav__link ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <i className={`bi ${item.icon}`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <nav className="studio-nav studio-nav--end" aria-label="Account">
          {BOTTOM_NAV.map((item) => {
            const active = navActive(item.path, location.pathname);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`studio-nav__link ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <i className={`bi ${item.icon}`} />
                {item.label}
              </NavLink>
            );
          })}
          <button type="button" className="studio-nav__link studio-nav__button" onClick={() => setConfirmSignOut(true)}>
            <i className="bi bi-box-arrow-right" />
            Sign out
          </button>
        </nav>
      </aside>

      {confirmSignOut && (
        <div className="studio-confirm" role="presentation" onClick={() => setConfirmSignOut(false)}>
          <div
            className="studio-confirm__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-out-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="sign-out-title">Sign out?</h2>
            <p>Are you sure you want to sign out of VeriScreen?</p>
            <div className="studio-confirm__actions">
              <button type="button" className="studio-confirm__stay" onClick={() => setConfirmSignOut(false)}>
                Stay signed in
              </button>
              <button type="button" className="studio-confirm__leave" onClick={signOut}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="studio-stage">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;
