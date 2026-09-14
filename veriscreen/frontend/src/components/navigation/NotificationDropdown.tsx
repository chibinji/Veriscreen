import React from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService } from '../../services/notificationService';
import { formatDateTime, getAccountPath } from '../../utils';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types';

const iconMap: Record<string, string> = {
  INFO: 'bi-info-circle-fill text-info',
  SUCCESS: 'bi-check-circle-fill text-success',
  WARNING: 'bi-exclamation-triangle-fill text-warning',
  ERROR: 'bi-x-circle-fill text-danger',
};

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();
  const { user } = useAuthStore();
  const notificationsPath = user ? getAccountPath(user.role as Role, 'notifications') : '/login';

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      markRead(id);
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      markAllRead();
    } catch { /* silent */ }
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-light position-relative rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: 38, height: 38 }}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        title="Notifications"
      >
        <i className="bi bi-bell fs-5" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div className="dropdown-menu dropdown-menu-end shadow border-0 p-0" style={{ width: 340 }}>
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          <h6 className="mb-0 fw-bold">Notifications</h6>
          {unreadCount > 0 && (
            <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={handleMarkAll}>
              Mark all read
            </button>
          )}
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-bell-slash fs-3" />
              <p className="small mt-2 mb-0">No notifications</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <div
                key={n.id}
                className={`d-flex gap-2 px-3 py-2 border-bottom ${!n.read ? 'bg-primary-subtle' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => !n.read && handleMarkRead(n.id)}
              >
                <i className={`bi ${iconMap[n.type]} mt-1 flex-shrink-0`} />
                <div className="flex-grow-1 min-w-0">
                  <p className="mb-0 small fw-semibold text-truncate">{n.title}</p>
                  <p className="mb-0 small text-muted" style={{ whiteSpace: 'normal' }}>{n.message}</p>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-3 py-2 border-top text-center">
          <Link to={notificationsPath} className="small text-decoration-none">View all notifications</Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
