import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { ITEM_STATUS_LABELS, ORDER_STATUS_LABELS } from '@/lib/constants';
import { ChefHat, Clock, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { isMuted, setMuted } from '@/lib/notification-sound';
import type { OrderItemStatus } from '@/types';

export default function KitchenDisplayPage() {
  const queryClient = useQueryClient();
  const [soundMuted, setSoundMuted] = useState(isMuted());

  const toggleMute = () => {
    const newVal = !soundMuted;
    setSoundMuted(newVal);
    setMuted(newVal);
    toast.info(newVal ? 'Sounds muted' : 'Sounds enabled');
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: ordersService.getKitchenOrders,
    refetchInterval: 5000,
  });

  const itemStatusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: OrderItemStatus }) =>
      ordersService.updateItemStatus(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast.success('Item updated');
    },
  });

  const orderStatusMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: number }) =>
      ordersService.updateStatus(orderId, 'READY'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast.success('Order marked as ready');
    },
  });

  if (isLoading) return <LoadingSpinner size="lg" text="Loading kitchen orders..." />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-warning/15">
            <ChefHat className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="page-title">Kitchen Display</h1>
            <p className="page-subtitle">{orders?.length || 0} active orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-9 w-9', soundMuted ? 'text-muted-foreground' : 'text-foreground')}
            onClick={toggleMute}
            title={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {soundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <span className="animate-pulse-dot h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map(order => {
            const minutes = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            const isUrgent = minutes > 15;

            return (
              <div key={order.id} className={cn('kitchen-card', isUrgent && 'kitchen-card-urgent')}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                    <span className="font-bold text-foreground text-lg">#{order.id}</span>
                    {order.table && (
                      <span className="text-sm text-muted-foreground ml-2">Table {order.table.number}</span>
                    )}
                  </div>
                  <StatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status]} dot />
                </div>

                {/* Time */}
                <div className={cn('flex items-center gap-1 px-4 py-2 text-xs', isUrgent ? 'text-destructive bg-destructive/5' : 'text-muted-foreground bg-muted/50')}>
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                </div>

                {/* Items */}
                <div className="p-4 space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <button
                          className={cn(
                            'h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                            item.status === 'READY' || item.status === 'SERVED'
                              ? 'bg-success border-success'
                              : 'border-border hover:border-primary'
                          )}
                          onClick={() => {
                            if (item.status !== 'READY' && item.status !== 'SERVED') {
                              itemStatusMutation.mutate({ itemId: item.id, status: 'READY' });
                            }
                          }}
                        >
                          {(item.status === 'READY' || item.status === 'SERVED') && (
                            <CheckCircle2 className="h-3 w-3 text-success-foreground" />
                          )}
                        </button>
                        <span className={cn(
                          'text-sm font-medium truncate',
                          (item.status === 'READY' || item.status === 'SERVED') ? 'text-muted-foreground line-through' : 'text-foreground'
                        )}>
                          {item.quantity}× {item.menuItem?.name || `Item #${item.menuItemId}`}
                        </span>
                      </div>
                      <StatusBadge status={item.status} className="text-[10px] px-1.5" />
                    </div>
                  ))}
                  {order.items?.some(item => item.note) && (
                    <div className="mt-2 space-y-1">
                      {order.items.filter(i => i.note).map(item => (
                        <p key={item.id} className="text-xs text-warning bg-warning/5 px-2 py-1 rounded">
                          📝 {item.menuItem?.name}: {item.note}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border">
                  <Button
                    className="w-full"
                    variant={order.items?.every(i => i.status === 'READY') ? 'default' : 'outline'}
                    onClick={() => orderStatusMutation.mutate({ orderId: order.id })}
                    disabled={orderStatusMutation.isPending}
                  >
                    Mark All Ready
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={ChefHat} title="No active orders" description="New orders will appear here automatically" />
      )}
    </div>
  );
}
