import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket) return socket;
  const token = localStorage.getItem('token');
  socket = io(import.meta.env.VITE_API_WS_URL || (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api',''), {
    auth: { token }
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error', err);
  });

  return socket;
};

export const getSocket = () => socket;

export default initSocket();
