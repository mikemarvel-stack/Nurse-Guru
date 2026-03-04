import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let tokenRefreshTimer: NodeJS.Timeout | null = null;

export const initSocket = () => {
  if (socket?.connected) return socket;
  
  const token = localStorage.getItem('token');
  if (!token) return null;

  socket = io(import.meta.env.VITE_API_WS_URL || (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api',''), {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000, // Start with 1 second
    reconnectionDelayMax: 5000, // Max 5 seconds
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✓ Socket connected');
    scheduleTokenRefresh();
  });

  socket.on('connect_error', (err) => {
    console.error('Socket error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.warn('Socket disconnected:', reason);
    if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);
  });

  // Handle auth error specifically
  socket.on('auth_error', () => {
    console.warn('Socket auth expired, clearing token');
    localStorage.removeItem('token');
    socket?.disconnect();
  });

  return socket;
};

// Schedule token refresh before expiry (refresh at 80% of token lifetime)
const scheduleTokenRefresh = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = JSON.parse(atob(token.split('.')[1]));
    const expiresIn = decoded.exp * 1000 - Date.now();
    const refreshAt = Math.max(expiresIn * 0.8, 5000); // Refresh at 80% or minimum 5 seconds

    if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);
    
    tokenRefreshTimer = setTimeout(() => {
      if (socket?.connected) {
        socket.emit('token:refresh', { token }, (newToken: string) => {
          if (newToken) {
            localStorage.setItem('token', newToken);
            socket!.auth = { token: newToken };
            scheduleTokenRefresh(); // Schedule next refresh
          }
        });
      }
    }, refreshAt);
  } catch (err) {
    console.error('Token refresh scheduling failed:', err);
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);
  if (socket?.connected) socket.disconnect();
  socket = null;
};

export default initSocket();

