import { io, Socket } from 'socket.io-client';
import { apiClient } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4004';

let socket: Socket | null = null;

export const initializeSocket = (): Socket | null => {
  if (socket?.connected) {
    return socket;
  }

  const token = apiClient.getAccessToken();
  
  if (!token) {
    console.warn('No access token available for Socket.IO connection');
    return null;
  }

  socket = io(API_BASE_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Connected to Socket.IO server');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from Socket.IO server');
  });

  socket.on('connect_error', (error) => {
    // Only log if it's not a transport error (websocket will fallback to polling)
    if (error.message && !error.message.includes('websocket')) {
      console.error('Socket.IO connection error:', error);
    }
    // Silently fallback to polling transport
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  if (!socket || !socket.connected) {
    return initializeSocket();
  }
  return socket;
};

export const reconnectSocket = () => {
  disconnectSocket();
  return initializeSocket();
};

