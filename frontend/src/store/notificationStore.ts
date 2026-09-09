import { create } from 'zustand';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  },

  markRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: updated, unreadCount: updated.filter((n) => !n.read).length });
  },

  markAllRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated, unreadCount: 0 });
  },

  addNotification: (notification) => {
    const notifications = [notification, ...get().notifications];
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
  },

  removeNotification: (id) => {
    const notifications = get().notifications.filter((n) => n.id !== id);
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
  },
}));
