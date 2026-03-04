import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotificationStore } from '@/store';
import { useAuthStore } from '@/store';

export function NotificationCenter() {
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead, markAllRead, unreadCount } = useNotificationStore();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount() > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
              {unreadCount()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-1">
        <div className="flex items-center justify-between px-3 py-2">
          <h4 className="text-sm font-semibold">Notifications</h4>
          <Button variant="ghost" size="sm" onClick={() => markAllRead()}>Mark all read</Button>
        </div>
        <div className="max-h-64 overflow-auto">
          {notifications.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No notifications</div>
          )}
          {notifications.map(n => (
            <DropdownMenuItem key={n.id} onClick={() => markAsRead(n.id)} className={`flex flex-col items-start gap-1 py-2 px-3 ${n.read ? 'opacity-70' : 'bg-gray-50'}`}>
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-gray-600">{n.message}</div>
              <div className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationCenter;
