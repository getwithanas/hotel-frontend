import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { connectSocket, disconnectSocket, joinRoom, SOCKET_EVENTS } from '@/sockets/socket-client';
import { useAuthStore } from '@/store/auth-store';
import { playNewOrderSound, playSuccessSound } from '@/lib/notification-sound';

export function useSocket() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!token || !user || connectedRef.current) return;

    const socket = connectSocket(token);
    connectedRef.current = true;

    socket.on('connect', () => {
      joinRoom(user.role.toLowerCase());
    });

    // Order events
    socket.on(SOCKET_EVENTS.ORDER_NEW, (data: { id: number; tableNumber?: number }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });

      // Play sound for kitchen & waiter roles
      if (user.role === 'KITCHEN' || user.role === 'ADMIN') {
        playNewOrderSound();
      }

      const tableInfo = data.tableNumber ? ` — Table ${data.tableNumber}` : '';
      toast.info(`New order #${data.id}${tableInfo}`, { duration: 5000 });
    });

    socket.on(SOCKET_EVENTS.ORDER_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    });

    socket.on(SOCKET_EVENTS.ORDER_ITEM_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      playSuccessSound();
    });

    socket.on(SOCKET_EVENTS.TABLE_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    });

    socket.on(SOCKET_EVENTS.BILL_GENERATED, () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      playSuccessSound();
      toast.success('Bill generated');
    });

    socket.on(SOCKET_EVENTS.DELIVERY_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    });

    return () => {
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [token, user, queryClient]);
}
