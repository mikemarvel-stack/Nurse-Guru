import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notificationsApi } from '@/services/api';
import { initSocket, getSocket } from '@/lib/socket';

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

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ notifications: state.notifications })
    }
  )
);

// Initialize socket and attach listener to receive live notifications
try {
  initSocket();
  const sock = getSocket();
  if (sock) {
    sock.on('notification', (payload: any) => {
      // normalize payload and prepend
      const note = {
        id: payload.id || `nt-${Date.now()}`,
        userId: payload.userId || '',
        title: payload.title,
        message: payload.message,
        type: payload.type || 'info',
        read: false,
        createdAt: payload.createdAt || new Date().toISOString()
      };
      // push to store
      const state = useNotificationStore.getState();
      useNotificationStore.setState({ notifications: [note, ...state.notifications] });
    });
  }
} catch (err) {
  // socket may not be available during SSR/build
}

export default useNotificationStore;
