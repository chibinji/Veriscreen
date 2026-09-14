import type { Notification } from '../types';
import { getDb, saveDb } from '../data/store';
import { delay, fail, requireSession } from './mockClient';
import { API_ENDPOINTS } from '../constants';
import apiClient from '../services/apiClient';

interface BackendNotification {
  id: number;
  title: string;
  message: string;
  type?: string;
  channel?: string;
  read?: boolean;
  link?: string;
  createdAt?: string;
}

function toNotification(item: BackendNotification, userId: number): Notification {
  const type = (item.type || 'INFO').toUpperCase();
  return {
    id: item.id,
    userId,
    title: item.channel && item.channel !== 'IN_APP' ? `${item.title} (${item.channel})` : item.title,
    message: item.message,
    type: type === 'SUCCESS' || type === 'WARNING' || type === 'ERROR' ? type : 'INFO',
    read: Boolean(item.read),
    createdAt: item.createdAt || new Date().toISOString(),
    link: item.link,
  };
}

export const notificationsApi = {
  async getAll(): Promise<Notification[]> {
    const session = requireSession();
    try {
      const { data } = await apiClient.get<BackendNotification[]>(API_ENDPOINTS.ME_NOTIFICATIONS);
      return data.map((item) => toNotification(item, session.id));
    } catch {
      await delay(300);
      return getDb()
        .notifications.filter((item) => item.userId === session.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  },

  async getUnread(): Promise<Notification[]> {
    const all = await this.getAll();
    return all.filter((item) => !item.read);
  },

  async markAsRead(id: number): Promise<void> {
    try {
      await apiClient.post(`${API_ENDPOINTS.ME_NOTIFICATIONS}/${id}/read`);
    } catch {
      await delay(200);
      const session = requireSession();
      const item = getDb().notifications.find((n) => n.id === id && n.userId === session.id);
      if (!item) fail(404, 'Notification not found.');
      item.read = true;
      saveDb();
    }
  },

  async markAllAsRead(): Promise<void> {
    const all = await this.getAll();
    await Promise.all(all.filter((item) => !item.read).map((item) => this.markAsRead(item.id)));
  },

  async deleteNotification(id: number): Promise<void> {
    await delay();
    const session = requireSession();
    const db = getDb();
    const index = db.notifications.findIndex((item) => item.id === id && item.userId === session.id);
    if (index === -1) fail(404, 'Notification not found.');
    db.notifications.splice(index, 1);
    saveDb();
  },
};
