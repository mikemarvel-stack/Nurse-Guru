import { Server as IOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;

import { Server as SocketIOServer } from 'socket.io';
import type { Server } from 'http';

export const initSocket = (server: Server) => {
  if (io) return io;

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    try {
      const token = (socket.handshake.auth && socket.handshake.auth.token) || socket.handshake.query.token;
      if (!token) return;

      const decoded = jwt.verify(token as string, process.env.JWT_SECRET || 'default-dev-secret') as { userId: string };
      const userId = decoded?.userId;
      if (!userId) return;

      socket.join(userId);

      socket.on('disconnect', () => {
        // cleanup if needed
      });
    } catch (err) {
      console.error('Socket auth error', err);
    }
  });

  return io;
};

export const getIo = (): SocketIOServer | null => io;
