import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { OrderCard } from '@/components/common/OrderCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from '@/lib/constants';
import { toast } from 'sonner';

export default function OrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', statusFilter, typeFilter],
    queryFn: () => ordersService.list({
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      type: typeFilter !== 'ALL' ? typeFilter as any : undefined,
    }),
    refetchInterval: 10000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => ordersService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
      setSelectedOrder(null);
    },
  });

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = ORDER_STATUS_FLOW.indexOf(current);
    return idx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[idx + 1] : null;
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading orders..." />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders?.length || 0} orders</p>
        </div>
        <Button onClick={() => navigate('/orders/new')}>
          <Plus className="h-4 w-4 mr-1" /> New Order
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {ORDER_STATUS_FLOW.map(s => (
              <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="DINE_IN">Dine In</SelectItem>
            <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
            <SelectItem value="DELIVERY">Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Grid */}
      {orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={setSelectedOrder} />
          ))}
        </div>
      ) : (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Adjust filters or create a new order" />
      )}

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order #{selectedOrder?.id}</SheetTitle>
          </SheetHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedOrder.status} label={ORDER_STATUS_LABELS[selectedOrder.status]} dot />
                <span className="text-sm text-muted-foreground">{selectedOrder.type.replace('_', ' ')}</span>
                {selectedOrder.table && <span className="text-sm text-muted-foreground">Table {selectedOrder.table.number}</span>}
              </div>

              {/* Items */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Items</p>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <span className="text-sm font-medium text-foreground">{item.menuItem?.name || `Item #${item.menuItemId}`}</span>
                      <span className="text-xs text-muted-foreground ml-2">×{item.quantity}</span>
                      {item.note && <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">${selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                {getNextStatus(selectedOrder.status) && (
                  <Button
                    className="flex-1"
                    onClick={() => statusMutation.mutate({
                      id: selectedOrder.id,
                      status: getNextStatus(selectedOrder.status)!
                    })}
                    disabled={statusMutation.isPending}
                  >
                    Move to {ORDER_STATUS_LABELS[getNextStatus(selectedOrder.status)!]}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate(`/orders/${selectedOrder.id}`)}
                >
                  Full Details
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
