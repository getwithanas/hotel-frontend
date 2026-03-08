import { AlertTriangle } from 'lucide-react';
import type { MenuItem } from '@/types';

interface LowStockBannerProps {
  lowStockItems: MenuItem[];
  outOfStockItems: MenuItem[];
  threshold: number;
}

export function LowStockBanner({ lowStockItems, outOfStockItems, threshold }: LowStockBannerProps) {
  if (lowStockItems.length === 0 && outOfStockItems.length === 0) return null;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
      <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
      <div className="text-sm">
        {outOfStockItems.length > 0 && (
          <p className="text-destructive font-medium">
            {outOfStockItems.length} item{outOfStockItems.length > 1 ? 's' : ''} out of stock
          </p>
        )}
        {lowStockItems.length > 0 && (
          <p className="text-warning-foreground">
            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low (≤{threshold}):{' '}
            <span className="font-medium">{lowStockItems.map(i => `${i.name} (${i.stock})`).join(', ')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
