import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/constants';

let socket: Socket | null = null;

export const SOCKET_EVENTS = {
  // Server → Client
  ORDER_NEW: 'order:new',
  ORDER_UPDATED: 'order:updated',
  ORDER_ITEM_UPDATED: 'order:item_updated',
  TABLE_UPDATED: 'table:updated',
  BILL_GENERATED: 'bill:generated',
  DELIVERY_UPDATED: 'delivery:updated',
  // Client → Server
  JOIN_ROOM: 'join:room',
  KITCHEN_ITEM_READY: 'kitchen:item_ready',
  KITCHEN_ORDER_READY: 'kitchen:order_ready',
} as const;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(API_BASE_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(room: string) {
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, room);
  }
}
