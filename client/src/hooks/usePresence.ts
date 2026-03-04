import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

export interface RemoteUser {
  userId: string;
  name?: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: string;
  typing?: boolean;
}

export const usePresence = (roomName: string) => {
  const [users, setUsers] = useState<RemoteUser[]>([]);
  const [status, setStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [isTyping, setIsTyping] = useState(false);

  const socket = getSocket();

  useEffect(() => {
    if (!socket?.connected) return;

    // Request current users
    socket.emit('presence:get_users', (remoteUsers: RemoteUser[]) => {
      setUsers(remoteUsers);
    });

    // Listen for presence events
    socket.on('presence:user_joined', (data) => {
      setUsers((prev) => [...prev, data.user]);
    });

    socket.on('presence:user_left', (data) => {
      setUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    socket.on('presence:user_status_changed', (data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId
            ? { ...u, status: data.status, lastSeen: data.lastSeen }
            : u
        )
      );
    });

    socket.on('presence:typing', (data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId ? { ...u, typing: data.isTyping } : u
        )
      );
    });

    return () => {
      socket.off('presence:user_joined');
      socket.off('presence:user_left');
      socket.off('presence:user_status_changed');
      socket.off('presence:typing');
    };
  }, [socket, roomName]);

  const setUserStatus = useCallback(
    (newStatus: 'online' | 'away' | 'offline') => {
      if (!socket?.connected) return;
      setStatus(newStatus);
      socket.emit('presence:set_status', { status: newStatus });
    },
    [socket]
  );

  const setUserTyping = useCallback(
    (typing: boolean) => {
      if (!socket?.connected) return;
      setIsTyping(typing);
      socket.emit('presence:typing', { isTyping: typing });
    },
    [socket]
  );

  return {
    users,
    status,
    isTyping,
    setUserStatus,
    setUserTyping,
    onlineCount: users.filter((u) => u.status === 'online').length,
    typingUsers: users.filter((u) => u.typing)
  };
};

export default usePresence;
