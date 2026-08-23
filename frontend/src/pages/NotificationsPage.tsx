import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { useNotificationStore } from '../store/notificationStore';
import type { Notification } from '../types';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import AlertMessage from '../components/common/AlertMessage';
import { formatDateTime } from '../utils';

const iconMap: Record<string, string> = {
  INFO: 'bi-info-circle-fill text-info',
  SUCCESS: 'bi-check-circle-fill text-success',
  WARNING: 'bi-exclamation-triangle-fill text-warning',
  ERROR: 'bi-x-circle-fill text-danger',
};

const NotificationsPage: React.FC = () => {
  const { notifications, setNotifications, markRead, markAllRead, removeNotification } = useNotificationStore();

  const { isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const data = await notificationService.getAll();
      setNotifications(data);
      return data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: (_: void, id: number) => markRead(id),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: markAllRead,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id),
    onSuccess: (_: void, id: number) => removeNotification(id),
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="All your system notifications and alerts."
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          unreadCount > 0 ? (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <i className="bi bi-check-all me-1" />Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
          <span className="fw-semibold">
            <i className="bi bi-bell me-2 text-primary" />All Notifications
          </span>
          {unreadCount > 0 && (
            <span className="badge bg-primary rounded-pill">{unreadCount} unread</span>
          )}
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading notifications…" />
          ) : isError ? (
            <div className="p-4">
              <AlertMessage type="danger" message="Unable to load notifications." />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon="bi-bell-slash"
              title="No notifications"
              description="You're all caught up — no notifications at this time."
            />
          ) : (
            <div>
              {notifications.map((n: Notification, idx: number) => (
                <div
                  key={n.id}
                  className={`d-flex gap-3 p-4 ${idx < notifications.length - 1 ? 'border-bottom' : ''} ${!n.read ? 'bg-primary-subtle' : ''}`}
                  style={{ cursor: !n.read ? 'pointer' : 'default' }}
                  onClick={() => !n.read && markReadMutation.mutate(n.id)}
                >
                  <div className="flex-shrink-0 mt-1">
                    <i className={`bi ${iconMap[n.type]} fs-5`} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <p className="mb-1 fw-semibold small">{n.title}</p>
                      {!n.read && (
                        <span className="badge bg-primary rounded-pill flex-shrink-0" style={{ fontSize: '0.65rem' }}>New</span>
                      )}
                    </div>
                    <p className="mb-1 text-muted small">{n.message}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.72rem' }}>
                      <i className="bi bi-clock me-1" />{formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger align-self-start"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(n.id);
                    }}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
