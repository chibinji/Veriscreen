import React from 'react';
import NotificationDropdown from '../navigation/NotificationDropdown';
import UserMenu from '../navigation/UserMenu';

interface Props {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const TopNavbar: React.FC<Props> = ({ onToggleSidebar }) => (
  <nav className="navbar navbar-expand vs-topbar px-3 sticky-top" style={{ height: 64, zIndex: 1020 }}>
    <div className="d-flex align-items-center gap-3 flex-grow-1">
      <button
        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: 38, height: 38 }}
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <i className="bi bi-list fs-5" />
      </button>
    </div>

    <div className="d-flex align-items-center gap-2">
      <NotificationDropdown />
      <UserMenu />
    </div>
  </nav>
);

export default TopNavbar;
