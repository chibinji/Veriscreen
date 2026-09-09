import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getAccountPath, getInitials, getRoleLabel } from '../../utils';
import type { Role } from '../../types';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true, state: {} });
  };

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="dropdown">
      <button
        className="btn btn-light d-flex align-items-center gap-2 px-2 py-1 rounded-pill"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span
          className="rounded-circle text-white d-flex align-items-center justify-content-center fw-semibold bg-lapis"
          style={{ width: 30, height: 30, fontSize: '0.75rem' }}
        >
          {getInitials(fullName)}
        </span>
        <span className="d-none d-md-block small fw-semibold text-truncate text-lapis" style={{ maxWidth: 140 }}>
          {fullName}
        </span>
        <i className="bi bi-chevron-down small text-muted" />
      </button>

      <ul className="dropdown-menu dropdown-menu-end shadow border-0">
        <li>
          <div className="px-3 py-2 border-bottom">
            <p className="mb-0 fw-semibold small text-lapis">{fullName}</p>
            <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</p>
            <span className="badge bg-primary-subtle text-primary mt-1" style={{ fontSize: '0.65rem' }}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        </li>
        <li><Link className="dropdown-item" to={getAccountPath(user.role as Role, 'profile')}><i className="bi bi-person me-2" />Profile</Link></li>
        <li><Link className="dropdown-item" to={getAccountPath(user.role as Role, 'settings')}><i className="bi bi-gear me-2" />Settings</Link></li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="dropdown-item text-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2" />Sign out
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserMenu;
