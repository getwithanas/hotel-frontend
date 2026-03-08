import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  iconClassName?: string;
  accentColor?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v).toLocaleString());
  const prevRef = useRef(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.8,
      ease: 'easeOut',
    });
    prevRef.current = value;
    return controls.stop;
  }, [value, motionVal]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatCard({ title, value, icon: Icon, trend, className, iconClassName, accentColor }: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : null;
  const displayValue = typeof value === 'string' ? value : null;

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden bg-card border border-border rounded-xl p-5 transition-all duration-200',
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 24px -8px hsl(var(--primary) / 0.12)',
        transition: { duration: 0.2 },
      }}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] blur-2xl"
        style={{ background: accentColor || 'hsl(var(--primary))' }}
      />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn(
          'flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 ring-1 ring-primary/5',
          iconClassName
        )}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground relative z-10">
        {numericValue !== null ? <AnimatedNumber value={numericValue} /> : displayValue}
      </p>
      {trend && (
        <div className={cn(
          'flex items-center gap-1 text-xs mt-2 relative z-10',
          trend.value >= 0 ? 'text-success' : 'text-destructive'
        )}>
          <span className={cn(
            'inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold',
            trend.value >= 0 ? 'bg-success/15' : 'bg-destructive/15'
          )}>
            {trend.value >= 0 ? '↑' : '↓'}
          </span>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
