import { Server as SocketIOServer } from 'socket.io';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import PresenceManager from './lib/presence';

let io: SocketIOServer | null = null;
let presenceManager: PresenceManager | null = null;

export const initSocket = (server: Server) => {
  if (io) return io;

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  presenceManager = new PresenceManager(io);

  io.on('connection', (socket) => {
    try {
      const token = (socket.handshake.auth && socket.handshake.auth.token) || socket.handshake.query.token;
      if (!token) {
        socket.emit('auth_error', { message: 'Missing token' });
        socket.disconnect();
        return;
      }

      const decoded = jwt.verify(token as string, process.env.JWT_SECRET || 'default-dev-secret') as { userId: string; email: string; role: string; name?: string };
      const userId = decoded?.userId;
      if (!userId) {
        socket.emit('auth_error', { message: 'Invalid token' });
        socket.disconnect();
        return;
      }

      const roomName = `notifications:${userId}`;

      // Join room for this user
      socket.join(userId);
      socket.join(roomName);

      // Register presence
      presenceManager!.registerUserPresence(userId, roomName, {
        name: decoded.name || 'User',
        status: 'online'
      });

      console.log(`✓ User ${userId} connected (${socket.id})`);

      // Handle token refresh
      socket.on('token:refresh', (data: { token: string }, callback: (token: string | null) => void) => {
        try {
          const newDecoded = jwt.verify(data.token, process.env.JWT_SECRET || 'default-dev-secret') as { userId: string };
          
          // Verify this is the same user
          if (newDecoded.userId === userId) {
            // Generate new token with extended expiry
            const newToken = jwt.sign(
              { userId: newDecoded.userId, email: decoded.email, role: decoded.role },
              process.env.JWT_SECRET || 'default-dev-secret',
              { expiresIn: '7d' }
            );
            callback(newToken);
            console.log(`✓ Token refreshed for user ${userId}`);
          } else {
            callback(null);
            socket.emit('auth_error', { message: 'Token mismatch' });
          }
        } catch (err) {
          console.error('Token refresh error:', err);
          callback(null);
          socket.emit('auth_error', { message: 'Invalid refresh token' });
        }
      });

      // Presence handlers
      socket.on('presence:set_status', (data: { status: 'online' | 'away' | 'offline' }) => {
        presenceManager!.updateUserStatus(userId, roomName, data.status);
      });

      socket.on('presence:typing', (data: { isTyping: boolean }) => {
        presenceManager!.setTypingStatus(userId, roomName, data.isTyping);
      });

      socket.on('presence:get_users', (callback: (users: any[]) => void) => {
        const users = presenceManager!.getRoomUsers(roomName);
        callback(users);
      });

      socket.on('disconnect', () => {
        presenceManager!.cleanupUser(userId);
        console.log(`✓ User ${userId} disconnected`);
      });
    } catch (err) {
      console.error('Socket auth error', err);
      socket.emit('auth_error', { message: 'Authentication failed' });
      socket.disconnect();
    }
  });

  return io;
};

export const getIo = (): SocketIOServer | null => io;
export const getPresenceManager = (): PresenceManager | null => presenceManager;

