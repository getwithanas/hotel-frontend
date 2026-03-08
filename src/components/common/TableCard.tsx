import { cn } from '@/lib/utils';
import type { RestaurantTable } from '@/types';
import { TABLE_STATUS_LABELS } from '@/lib/constants';
import { StatusBadge } from './StatusBadge';
import { Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import tableFreeImg from '@/assets/table-free.png';
import tableOccupiedImg from '@/assets/table-occupied.png';
import tableReservedImg from '@/assets/table-reserved.png';

const statusImage: Record<string, string> = {
  FREE: tableFreeImg,
  OCCUPIED: tableOccupiedImg,
  RESERVED: tableReservedImg,
};

const glowColor: Record<string, string> = {
  FREE: 'hsl(var(--status-free) / 0.35)',
  OCCUPIED: 'hsl(var(--status-occupied) / 0.35)',
  RESERVED: 'hsl(var(--status-reserved) / 0.35)',
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
    <motion.div
      className={cn(
        'table-card group relative flex flex-col items-center rounded-2xl border-2 p-4 cursor-pointer',
        statusClass
      )}
      onClick={() => onClick?.(table)}
      role="button"
      tabIndex={0}
      whileHover={{
        y: -6,
        boxShadow: `0 12px 28px -6px ${glowColor[table.status]}, 0 4px 12px -4px ${glowColor[table.status]}`,
        transition: { type: 'spring', stiffness: 350, damping: 20 },
      }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Active orders badge */}
      {table.activeOrders && table.activeOrders.length > 0 && (
        <motion.span
          className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-md ring-2 ring-background"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          {table.activeOrders.length}
        </motion.span>
      )}

      {/* Illustration with bounce */}
      <motion.div
        className="relative w-24 h-24 mb-2 flex items-center justify-center"
        whileHover={{
          y: [0, -6, 0],
          transition: { duration: 0.6, ease: 'easeInOut', repeat: Infinity },
        }}
      >
        <img
          src={statusImage[table.status]}
          alt={`Table ${table.number} - ${TABLE_STATUS_LABELS[table.status]}`}
          className="w-full h-full object-contain drop-shadow-md"
        />
      </motion.div>

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
    </motion.div>
  );
}
