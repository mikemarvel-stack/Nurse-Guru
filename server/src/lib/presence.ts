import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';

export interface PresenceUser {
  userId: string;
  name?: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  typing?: boolean;
}

export interface PresenceRoom {
  name: string;
  users: Map<string, PresenceUser>;
  createdAt: string;
}

class PresenceManager {
  private presenceRooms: Map<string, PresenceRoom> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Register user as online in a room
   */
  registerUserPresence(userId: string, roomName: string, userInfo?: Partial<PresenceUser>) {
    if (!this.presenceRooms.has(roomName)) {
      this.presenceRooms.set(roomName, {
        name: roomName,
        users: new Map(),
        createdAt: new Date().toISOString()
      });
    }

    const room = this.presenceRooms.get(roomName)!;
    const user: PresenceUser = {
      userId,
      status: 'online',
      lastSeen: new Date().toISOString(),
      ...userInfo
    };

    room.users.set(userId, user);

    // Track which rooms this user is in
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(roomName);

    // Broadcast user joined
    this.io.to(roomName).emit('presence:user_joined', {
      userId,
      user,
      totalUsers: room.users.size
    });

    return user;
  }

  /**
   * Unregister user from a room
   */
  unregisterUserPresence(userId: string, roomName: string) {
    const room = this.presenceRooms.get(roomName);
    if (!room) return;

    room.users.delete(userId);

    // Broadcast user left
    this.io.to(roomName).emit('presence:user_left', {
      userId,
      totalUsers: room.users.size
    });

    // Cleanup empty rooms
    if (room.users.size === 0) {
      this.presenceRooms.delete(roomName);
    }

    // Cleanup user room tracking
    const userRoom = this.userRooms.get(userId);
    if (userRoom) {
      userRoom.delete(roomName);
      if (userRoom.size === 0) {
        this.userRooms.delete(userId);
      }
    }
  }

  /**
   * Update user status
   */
  updateUserStatus(userId: string, roomName: string, status: 'online' | 'away' | 'offline') {
    const room = this.presenceRooms.get(roomName);
    const user = room?.users.get(userId);
    if (!user) return;

    user.status = status;
    user.lastSeen = new Date().toISOString();

    this.io.to(roomName).emit('presence:user_status_changed', {
      userId,
      status,
      lastSeen: user.lastSeen
    });
  }

  /**
   * Set typing status
   */
  setTypingStatus(userId: string, roomName: string, isTyping: boolean) {
    const room = this.presenceRooms.get(roomName);
    const user = room?.users.get(userId);
    if (!user) return;

    user.typing = isTyping;

    this.io.to(roomName).emit('presence:typing', {
      userId,
      isTyping
    });
  }

  /**
   * Get room users
   */
  getRoomUsers(roomName: string): PresenceUser[] {
    const room = this.presenceRooms.get(roomName);
    return room ? Array.from(room.users.values()) : [];
  }

  /**
   * Get user's rooms
   */
  getUserRooms(userId: string): string[] {
    const rooms = this.userRooms.get(userId);
    return rooms ? Array.from(rooms) : [];
  }

  /**
   * Cleanup all user presence
   */
  cleanupUser(userId: string) {
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.forEach(roomName => {
        this.unregisterUserPresence(userId, roomName);
      });
    }
    this.userRooms.delete(userId);
  }
}

export default PresenceManager;
