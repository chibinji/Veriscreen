import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/profile', label: 'Profile' },
  { to: '/documents', label: 'Documents' },
  { to: '/registrations', label: 'Registrations' },
  { to: '/fees', label: 'Fees' },
  { to: '/examinations', label: 'Examinations' },
  { to: '/academic-results', label: 'Results' },
  { to: '/helsb', label: 'HELSB' },
];

export default function Layout() {
  const { profile, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">VS</span>
          <div>
            <strong>VeriScreen</strong>
            <p>Student Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="student-chip">
            <span>{profile?.name}</span>
            <small>{profile?.id}</small>
          </div>
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
