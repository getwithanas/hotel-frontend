import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, ITEM_STATUS_LABELS } from '@/lib/constants';
import { ArrowLeft, Clock, UtensilsCrossed, Truck, MapPin, User, Phone, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getById(Number(id)),
    enabled: !!id,
    refetchInterval: 10000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      ordersService.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const itemStatusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: string }) =>
      ordersService.updateItemStatus(itemId, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Item status updated');
    },
    onError: () => toast.error('Failed to update item status'),
  });

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = ORDER_STATUS_FLOW.indexOf(current);
    return idx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[idx + 1] : null;
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading order..." />;
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);
  const TypeIcon = order.type === 'DELIVERY' ? Truck : UtensilsCrossed;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Order #{order.id}</h1>
            <StatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status]} dot />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(order.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
        {nextStatus && (
          <Button
            onClick={() => statusMutation.mutate({ orderId: order.id, status: nextStatus })}
            disabled={statusMutation.isPending}
          >
            Move to {ORDER_STATUS_LABELS[nextStatus]}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Order Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                <TypeIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground capitalize">
                  {order.type.replace('_', ' ').toLowerCase()}
                </p>
                <p className="text-xs text-muted-foreground">Order Type</p>
              </div>
            </div>

            {order.table && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Table {order.table.number}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.table.location || 'Main area'} · Seats {order.table.capacity}
                  </p>
                </div>
              </div>
            )}

            {order.waiter && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{order.waiter.name}</p>
                  <p className="text-xs text-muted-foreground">Waiter</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(order.updatedAt), 'h:mm a')}
                </p>
                <p className="text-xs text-muted-foreground">Last Updated</p>
              </div>
            </div>

            {/* Delivery Info */}
            {order.delivery && (
              <>
                <Separator />
                <p className="text-sm font-semibold text-foreground">Delivery Details</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{order.delivery.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{order.delivery.phone}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-foreground">{order.delivery.address}</span>
                  </div>
                </div>
              </>
            )}

            {/* Status Timeline */}
            <Separator />
            <p className="text-sm font-semibold text-foreground">Status Flow</p>
            <div className="space-y-2">
              {ORDER_STATUS_FLOW.map((s, i) => {
                const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
                const isCompleted = i <= currentIdx;
                const isCurrent = s === order.status;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isCurrent
                          ? 'bg-primary ring-2 ring-primary/30'
                          : isCompleted
                          ? 'bg-primary/60'
                          : 'bg-muted-foreground/20'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isCurrent
                          ? 'font-semibold text-foreground'
                          : isCompleted
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Items ({order.items?.length || 0})</span>
              {order.status !== 'BILLED' && order.status !== 'CANCELLED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/orders/new?addTo=${order.id}`)}
                >
                  Add Items
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">
                        {item.menuItem?.name || `Item #${item.menuItemId}`}
                      </span>
                      {item.menuItem?.isVeg !== undefined && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            item.menuItem.isVeg
                              ? 'border-green-500/50 text-green-600'
                              : 'border-red-500/50 text-red-600'
                          }`}
                        >
                          {item.menuItem.isVeg ? 'Veg' : 'Non-Veg'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                      <span className="text-xs text-muted-foreground">
                        @ ${item.price.toFixed(2)}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-muted-foreground mt-1 italic">Note: {item.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <StatusBadge status={item.status} label={ITEM_STATUS_LABELS[item.status]} />
                    <span className="font-semibold text-sm text-foreground whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <Separator className="my-4" />
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">
                ${order.totalAmount?.toFixed(2)}
              </span>
            </div>

            {/* Bill Info */}
            {order.bill && (
              <div className="mt-4 p-4 rounded-lg border border-border space-y-2">
                <p className="text-sm font-semibold text-foreground">Bill Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-right text-foreground">${order.bill.subtotal.toFixed(2)}</span>
                  <span className="text-muted-foreground">Tax ({order.bill.taxRate}%)</span>
                  <span className="text-right text-foreground">${order.bill.taxAmount.toFixed(2)}</span>
                  {order.bill.discount > 0 && (
                    <>
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-right text-foreground">-${order.bill.discount.toFixed(2)}</span>
                    </>
                  )}
                  <Separator className="col-span-2" />
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-right font-bold text-foreground">${order.bill.total.toFixed(2)}</span>
                  <span className="text-muted-foreground">Payment</span>
                  <span className="text-right text-foreground capitalize">{order.bill.paymentMethod.toLowerCase()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
