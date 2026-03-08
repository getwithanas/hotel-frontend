import { cn } from '@/lib/utils';
import type { RestaurantTable } from '@/types';
import { TABLE_STATUS_LABELS } from '@/lib/constants';
import { StatusBadge } from './StatusBadge';
import { Users } from 'lucide-react';

interface TableCardProps {
  table: RestaurantTable;
  onClick?: (table: RestaurantTable) => void;
}

export function TableCard({ table, onClick }: TableCardProps) {
  const statusClass = {
    FREE: 'table-card-free',
    OCCUPIED: 'table-card-occupied',
    RESERVED: 'table-card-reserved',
  }[table.status];

  return (
    <div
      className={cn('table-card', statusClass)}
      onClick={() => onClick?.(table)}
      role="button"
      tabIndex={0}
    >
      <span className="text-lg font-bold text-foreground mb-1">T{table.number}</span>
      <StatusBadge status={table.status} label={TABLE_STATUS_LABELS[table.status]} />
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>{table.capacity}</span>
      </div>
      {table.location && (
        <span className="text-[10px] text-muted-foreground mt-1">{table.location}</span>
      )}
      {table.activeOrders && table.activeOrders.length > 0 && (
        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {table.activeOrders.length}
        </span>
      )}
    </div>
  );
}
