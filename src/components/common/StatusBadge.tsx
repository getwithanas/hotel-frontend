import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { TableStatus, OrderStatus, OrderItemStatus, DeliveryStatus, UserRole } from '@/types';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        free: 'bg-status-free/15 text-status-free',
        occupied: 'bg-status-occupied/15 text-status-occupied',
        reserved: 'bg-status-reserved/15 text-status-reserved',
        pending: 'bg-status-pending/15 text-status-pending',
        preparing: 'bg-status-preparing/15 text-status-preparing',
        ready: 'bg-status-ready/15 text-status-ready',
        served: 'bg-status-served/15 text-status-served',
        billed: 'bg-status-billed/15 text-status-billed',
        cancelled: 'bg-status-cancelled/15 text-status-cancelled',
        delivered: 'bg-status-delivered/15 text-status-delivered',
        admin: 'bg-primary/15 text-primary',
        waiter: 'bg-info/15 text-info',
        kitchen: 'bg-warning/15 text-warning',
        cashier: 'bg-success/15 text-success',
      },
    },
  }
);

const STATUS_VARIANT_MAP: Record<string, keyof typeof badgeVariants extends never ? string : string> = {
  FREE: 'free', OCCUPIED: 'occupied', RESERVED: 'reserved',
  PENDING: 'pending', PREPARING: 'preparing', READY: 'ready',
  SERVED: 'served', BILLED: 'billed', CANCELLED: 'cancelled',
  PICKED_UP: 'preparing', ASSIGNED: 'preparing', OUT_FOR_DELIVERY: 'preparing', DELIVERED: 'delivered',
  ADMIN: 'admin', WAITER: 'waiter', KITCHEN: 'kitchen', CASHIER: 'cashier',
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: TableStatus | OrderStatus | OrderItemStatus | DeliveryStatus | UserRole | string;
  label?: string;
  dot?: boolean;
}

export function StatusBadge({ status, label, dot = false, className, ...props }: StatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] || 'billed';

  return (
    <span className={cn(badgeVariants({ variant: variant as VariantProps<typeof badgeVariants>['variant'] }), className)} {...props}>
      {dot && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
      )}
      {label || status}
    </span>
  );
}
