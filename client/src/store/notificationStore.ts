import { create } from 'zustand';
import { notificationsApi } from '@/services/api';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  fetchNotifications: (params?: Record<string, any>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  fetchNotifications: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await notificationsApi.get(params);
      set({ notifications: data.notifications || data, isLoading: false });
    } catch (error) {
      console.error('Fetch notifications error:', error);
      set({ isLoading: false });
    }
  },
  markAsRead: async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      }));
    } catch (error) {
      console.error('Mark notification read error:', error);
    }
  },
  markAllRead: async () => {
    try {
      await notificationsApi.markAllRead();
      set((state) => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) }));
    } catch (error) {
      console.error('Mark all notifications read error:', error);
    }
  },
  unreadCount: () => {
    return get().notifications.filter(n => !n.read).length;
  }
}));

export default useNotificationStore;
