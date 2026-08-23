import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { Role } from '../../types';
import { APP_NAME } from '../../constants';
import BrandLogo from '../brand/BrandLogo';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
  children?: NavItem[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  role: Role;
}

const Sidebar: React.FC<Props> = ({ open, onClose, navItems, role }) => {
  const location = useLocation();

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1029 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar bg-white border-end d-flex flex-column`}
        style={{
          width: 260,
          minHeight: '100vh',
          position: 'fixed',
          top: 0,
          left: open ? 0 : -260,
          zIndex: 1030,
          transition: 'left 0.25s ease',
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom" style={{ height: 64 }}>
          <BrandLogo size="sm" />
          <button
            className="btn btn-sm btn-light rounded-circle ms-auto d-lg-none"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-grow-1 px-3 py-3">
          {filteredItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.children?.some((c) => location.pathname.startsWith(c.path)) ?? false);

            return (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive: ia }) =>
                    `nav-link d-flex align-items-center gap-2 rounded-2 mb-1 px-3 py-2 fw-medium ${
                      ia || isActive
                        ? 'bg-primary text-white'
                        : 'text-navy'
                    }`
                  }
                  style={{ fontSize: '0.875rem' }}
                  onClick={() => window.innerWidth < 992 && onClose()}
                >
                  <i className={`bi ${item.icon} fs-5`} />
                  {item.label}
                </NavLink>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-top">
          <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>
            &copy; {new Date().getFullYear()} {APP_NAME} &mdash; v1.0.0
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
