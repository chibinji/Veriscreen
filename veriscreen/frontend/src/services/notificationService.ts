import { notificationsApi } from '../api';
import type { Notification } from '../types';

export const notificationService = {
  getAll: (): Promise<Notification[]> => notificationsApi.getAll(),
  getUnread: (): Promise<Notification[]> => notificationsApi.getUnread(),
  markAsRead: (id: number) => notificationsApi.markAsRead(id),
  markAllAsRead: () => notificationsApi.markAllAsRead(),
  deleteNotification: (id: number) => notificationsApi.deleteNotification(id),
};
