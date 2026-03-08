import { cn, fmt } from '@/lib/utils';
import type { Order } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { Clock, UtensilsCrossed, Truck, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface OrderCardProps {
  order: Order;
  onClick?: (order: Order) => void;
  compact?: boolean;
  className?: string;
}

export function OrderCard({ order, onClick, compact = false, className }: OrderCardProps) {
  const TypeIcon = order.type === 'DELIVERY' ? Truck : UtensilsCrossed;

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden bg-card border border-border rounded-xl cursor-pointer transition-colors hover:border-primary/30',
        className
      )}
      onClick={() => onClick?.(order)}
      role="button"
      tabIndex={0}
      whileHover={{ y: -2, boxShadow: '0 8px 20px -8px hsl(var(--primary) / 0.1)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Status color bar */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-0.5',
        order.status === 'PENDING' && 'bg-status-pending',
        order.status === 'PREPARING' && 'bg-status-preparing',
        order.status === 'READY' && 'bg-status-ready',
        order.status === 'SERVED' && 'bg-status-served',
        order.status === 'BILLED' && 'bg-status-billed',
        order.status === 'CANCELLED' && 'bg-status-cancelled',
      )} />

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted">
              <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">#{order.id}</span>
              {order.table && (
                <span className="text-xs text-muted-foreground ml-1.5">T{order.table.number}</span>
              )}
            </div>
          </div>
          <StatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status]} dot />
        </div>

        {!compact && (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted">
                <Hash className="h-2.5 w-2.5" />
                {order.items?.length || 0} items
              </span>
              <span className="capitalize">{order.type.replace('_', ' ').toLowerCase()}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
              </div>
              <span className="font-bold text-foreground">
                ${fmt(order.totalAmount)}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
