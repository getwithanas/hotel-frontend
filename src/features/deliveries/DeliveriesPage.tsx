import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesService } from '@/services/deliveries.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DELIVERY_STATUS_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { Truck, MapPin, Phone, User } from 'lucide-react';
import type { DeliveryStatus } from '@/types';

export default function DeliveriesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('ALL');

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries', filter],
    queryFn: () => deliveriesService.list({ status: filter !== 'ALL' ? filter as DeliveryStatus : undefined }),
    refetchInterval: 10000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: DeliveryStatus }) => deliveriesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      toast.success('Delivery status updated');
    },
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deliveries</h1>
          <p className="page-subtitle">{deliveries?.length || 0} deliveries</p>
        </div>
      </div>

      <div className="filter-bar">
        {['ALL', 'PENDING', 'PICKED_UP', 'DELIVERED', 'CANCELLED'].map(s => (
          <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)}>
            {s === 'ALL' ? 'All' : DELIVERY_STATUS_LABELS[s as DeliveryStatus]}
          </Button>
        ))}
      </div>

      {deliveries && deliveries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveries.map(delivery => (
            <div key={delivery.id} className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">Order #{delivery.orderId}</span>
                </div>
                <StatusBadge status={delivery.status} label={DELIVERY_STATUS_LABELS[delivery.status]} dot />
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{delivery.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{delivery.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                  <span className="text-xs">{delivery.address}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                {delivery.status === 'PENDING' && (
                  <Button size="sm" className="flex-1" onClick={() => statusMutation.mutate({ id: delivery.id, status: 'PICKED_UP' })}>
                    Mark Picked Up
                  </Button>
                )}
                {delivery.status === 'PICKED_UP' && (
                  <Button size="sm" className="flex-1" onClick={() => statusMutation.mutate({ id: delivery.id, status: 'DELIVERED' })}>
                    Mark Delivered
                  </Button>
                )}
                {(delivery.status === 'PENDING' || delivery.status === 'PICKED_UP') && (
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => statusMutation.mutate({ id: delivery.id, status: 'CANCELLED' })}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Truck} title="No deliveries" description="Delivery orders will appear here" />
      )}
    </div>
  );
}
