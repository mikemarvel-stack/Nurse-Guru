import { Server as IOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: IOServer | null = null;

export const initSocket = (server: any) => {
  if (io) return io;

  io = new IOServer(server, {
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

      const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as any;
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

export const getIo = () => io;
