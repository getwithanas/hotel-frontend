import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { connectSocket, disconnectSocket, joinRoom, SOCKET_EVENTS } from '@/sockets/socket-client';
import { useAuthStore } from '@/store/auth-store';
import { useNotificationStore } from '@/store/notification-store';
import { playNewOrderSound, playSuccessSound } from '@/lib/notification-sound';

export function useSocket() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!token || !user || connectedRef.current) return;

    const socket = connectSocket(token);
    connectedRef.current = true;

    socket.on('connect', () => {
      joinRoom(user.role.toLowerCase());
    });

    socket.on(SOCKET_EVENTS.ORDER_NEW, (data: { id: number; tableNumber?: number }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });

      if (user.role === 'KITCHEN' || user.role === 'ADMIN') {
        playNewOrderSound();
      }

      const tableInfo = data.tableNumber ? ` — Table ${data.tableNumber}` : '';
      toast.info(`New order #${data.id}${tableInfo}`, { duration: 5000 });
      addNotification({
        type: 'order_new',
        title: 'New Order',
        message: `Order #${data.id}${tableInfo} has been placed`,
      });
    });

    socket.on(SOCKET_EVENTS.ORDER_UPDATED, (data?: { id?: number; status?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['order', String(data.id)] });
      }
      const statusLabel = data?.status ? ` to ${data.status}` : '';
      toast.info(data?.id ? `Order #${data.id} updated${statusLabel}` : 'An order was updated', { duration: 4000 });
      addNotification({
        type: 'order_updated',
        title: 'Order Updated',
        message: data?.id ? `Order #${data.id} status changed${statusLabel}` : 'An order was updated',
      });
    });

    socket.on(SOCKET_EVENTS.ORDER_ITEM_UPDATED, (data?: { orderId?: number }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      if (data?.orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', String(data.orderId)] });
      }
      playSuccessSound();
      toast.success(data?.orderId ? `Item ready in order #${data.orderId}` : 'An order item is ready', { duration: 4000 });
      addNotification({
        type: 'order_ready',
        title: 'Item Ready',
        message: data?.orderId ? `An item in order #${data.orderId} is ready` : 'An order item is ready',
      });
    });

    socket.on(SOCKET_EVENTS.TABLE_UPDATED, (data?: { id?: number; status?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      addNotification({
        type: 'table_updated',
        title: 'Table Updated',
        message: data?.id ? `Table #${data.id} status changed` : 'A table was updated',
      });
    });

    socket.on(SOCKET_EVENTS.BILL_GENERATED, (data?: { orderId?: number }) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      playSuccessSound();
      toast.success('Bill generated');
      addNotification({
        type: 'bill_generated',
        title: 'Bill Generated',
        message: data?.orderId ? `Bill for order #${data.orderId} generated` : 'A bill was generated',
      });
    });

    socket.on(SOCKET_EVENTS.DELIVERY_UPDATED, (data?: { orderId?: number; status?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      addNotification({
        type: 'delivery_updated',
        title: 'Delivery Updated',
        message: data?.orderId ? `Delivery for order #${data.orderId} updated` : 'A delivery was updated',
      });
    });

    return () => {
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [token, user, queryClient, addNotification]);
}
