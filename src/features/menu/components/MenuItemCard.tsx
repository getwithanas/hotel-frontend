import { MenuItemImage } from '@/components/common/MenuItemImage';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Leaf, ImageIcon, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, fmt } from '@/lib/utils';
import type { MenuItem } from '@/types';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

interface MenuItemCardProps {
  item: MenuItem;
  lowStockThreshold: number;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export function MenuItemCard({ item, lowStockThreshold, onEdit, onDelete, onToggle }: MenuItemCardProps) {
  return (
    <motion.div
      className="bg-card border border-border rounded-xl overflow-hidden group"
      style={{ boxShadow: 'var(--shadow-sm)' }}
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: '0 8px 20px -8px hsl(var(--primary) / 0.1)' }}
    >
      {/* Image */}
      <div className="h-36 bg-muted/50 flex items-center justify-center overflow-hidden relative">
        {item.image ? (
          <MenuItemImage src={item.image} alt={item.name} className="w-full h-full" />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
        )}
        {item.isVeg && (
          <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-success/90 text-success-foreground font-medium">
            <Leaf className="h-2.5 w-2.5" /> VEG
          </span>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-semibold text-muted-foreground bg-background/80 px-3 py-1 rounded-full">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-foreground text-sm leading-tight">{item.name}</h4>
          <span className="font-bold text-primary text-sm whitespace-nowrap">${fmt(item.price)}</span>
        </div>
        {item.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.category?.name}</span>
          {(item.spiceLevel ?? 0) > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-destructive/10 text-destructive flex items-center gap-0.5">
              {Array.from({ length: item.spiceLevel! }).map((_, i) => (
                <Flame key={i} className="h-2.5 w-2.5" />
              ))}
            </span>
          )}
          {(item.stock ?? 0) === 0 ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-destructive/10 text-destructive animate-pulse">
              Out of Stock
            </span>
          ) : (item.stock ?? 0) <= lowStockThreshold ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-warning/15 text-warning-foreground">
              ⚠ Low: {item.stock}
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-success/10 text-success">
              Stock: {item.stock}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Switch checked={item.available} onCheckedChange={() => onToggle(item.id)} />
            <span className={cn('text-xs', item.available ? 'text-success' : 'text-muted-foreground')}>
              {item.available ? 'Available' : 'Off'}
            </span>
          </div>
          <div className="flex gap-0.5">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(item)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
