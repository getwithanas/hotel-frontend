import { cn } from '@/lib/utils';
import type { RestaurantTable } from '@/types';
import { TABLE_STATUS_LABELS } from '@/lib/constants';
import { StatusBadge } from './StatusBadge';
import { Users, MapPin } from 'lucide-react';
import tableFreeImg from '@/assets/table-free.png';
import tableOccupiedImg from '@/assets/table-occupied.png';
import tableReservedImg from '@/assets/table-reserved.png';

const statusImage: Record<string, string> = {
  FREE: tableFreeImg,
  OCCUPIED: tableOccupiedImg,
  RESERVED: tableReservedImg,
};

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
      className={cn(
        'table-card group relative flex flex-col items-center rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        statusClass
      )}
      onClick={() => onClick?.(table)}
      role="button"
      tabIndex={0}
    >
      {/* Active orders badge */}
      {table.activeOrders && table.activeOrders.length > 0 && (
        <span className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-md ring-2 ring-background">
          {table.activeOrders.length}
        </span>
      )}

      {/* Illustration */}
      <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
        <img
          src={statusImage[table.status]}
          alt={`Table ${table.number} - ${TABLE_STATUS_LABELS[table.status]}`}
          className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Table number */}
      <span className="text-base font-bold text-foreground tracking-tight">
        Table {table.number}
      </span>

      {/* Status */}
      <div className="mt-1.5">
        <StatusBadge status={table.status} label={TABLE_STATUS_LABELS[table.status]} />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{table.capacity}</span>
        </div>
        {table.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[60px]">{table.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
