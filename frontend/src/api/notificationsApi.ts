import type { Notification } from '../types';
import { getDb, saveDb } from '../data/store';
import { delay, fail, requireSession } from './mockClient';

export const notificationsApi = {
  async getAll(): Promise<Notification[]> {
    await delay(300);
    const session = requireSession();
    return getDb()
      .notifications.filter((item) => item.userId === session.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getUnread(): Promise<Notification[]> {
    const all = await this.getAll();
    return all.filter((item) => !item.read);
  },

  async markAsRead(id: number): Promise<void> {
    await delay(200);
    const session = requireSession();
    const item = getDb().notifications.find((n) => n.id === id && n.userId === session.id);
    if (!item) fail(404, 'Notification not found.');
    item.read = true;
    saveDb();
  },

  async markAllAsRead(): Promise<void> {
    await delay(200);
    const session = requireSession();
    getDb().notifications.forEach((item) => {
      if (item.userId === session.id) item.read = true;
    });
    saveDb();
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
