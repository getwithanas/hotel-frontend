import { cn } from '@/lib/utils';
import type { Order } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { Clock, UtensilsCrossed, Truck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onClick?: (order: Order) => void;
  compact?: boolean;
  className?: string;
}

export function OrderCard({ order, onClick, compact = false, className }: OrderCardProps) {
  const typeIcon = order.type === 'DELIVERY' ? Truck : UtensilsCrossed;
  const TypeIcon = typeIcon;

  return (
    <div
      className={cn('glass-card p-4 cursor-pointer hover:shadow-md transition-shadow', className)}
      onClick={() => onClick?.(order)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">#{order.id}</span>
          {order.table && (
            <span className="text-xs text-muted-foreground">• Table {order.table.number}</span>
          )}
        </div>
        <StatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status]} dot />
      </div>

      {!compact && (
        <>
          <div className="text-sm text-muted-foreground mb-2">
            {order.items?.length || 0} items • {order.type.replace('_', ' ')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
            </div>
            <span className="font-semibold text-foreground">
              ${order.totalAmount?.toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
