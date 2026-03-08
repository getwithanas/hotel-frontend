import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'order_new' | 'order_updated' | 'order_ready' | 'table_updated' | 'bill_generated' | 'delivery_updated';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

let counter = 0;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  addNotification: (n) =>
    set((s) => ({
      notifications: [
        { ...n, id: `notif-${++counter}`, timestamp: new Date(), read: false },
        ...s.notifications,
      ].slice(0, 50),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  clearAll: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
