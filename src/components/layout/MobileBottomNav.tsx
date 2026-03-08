import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Table2, ShoppingCart, ChefHat, Receipt,
  Truck, UtensilsCrossed, BarChart3, Users, Settings, MoreHorizontal,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const allNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CASHIER'] },
  { title: 'Tables', url: '/tables', icon: Table2, roles: ['ADMIN', 'WAITER'] },
  { title: 'Orders', url: '/orders', icon: ShoppingCart, roles: ['ADMIN', 'WAITER', 'CASHIER'] },
  { title: 'Kitchen', url: '/kitchen', icon: ChefHat, roles: ['ADMIN', 'KITCHEN'] },
  { title: 'Menu', url: '/menu', icon: UtensilsCrossed, roles: ['ADMIN'] },
  { title: 'Billing', url: '/billing', icon: Receipt, roles: ['ADMIN', 'CASHIER'] },
  { title: 'Deliveries', url: '/deliveries', icon: Truck, roles: ['ADMIN', 'WAITER', 'CASHIER'] },
  { title: 'Reports', url: '/reports', icon: BarChart3, roles: ['ADMIN', 'CASHIER'] },
  { title: 'Staff', url: '/staff', icon: Users, roles: ['ADMIN'] },
  { title: 'Settings', url: '/settings', icon: Settings, roles: ['ADMIN'] },
];

function isActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(url + '/');
}

export function MobileBottomNav() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const filteredItems = allNavItems.filter(item =>
    user ? item.roles.includes(user.role) : false
  );

  // Show first 4 items in the tab bar, rest in "More" menu
  const MAX_TABS = 4;
  const primaryTabs = filteredItems.slice(0, MAX_TABS);
  const overflowTabs = filteredItems.slice(MAX_TABS);
  const hasOverflow = overflowTabs.length > 0;
  const isOverflowActive = overflowTabs.some(i => isActive(location.pathname, i.url));

  return (
    <>
      {/* More overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed bottom-16 left-3 right-3 z-50 bg-card border border-border rounded-2xl p-2 shadow-lg"
              style={{ boxShadow: 'var(--shadow-lg)' }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-3 gap-1">
                {overflowTabs.map((item) => {
                  const active = isActive(location.pathname, item.url);
                  return (
                    <button
                      key={item.url}
                      onClick={() => { navigate(item.url); setMoreOpen(false); }}
                      className={cn(
                        'flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium leading-tight">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex items-stretch justify-around h-16">
          {primaryTabs.map((item) => {
            const active = isActive(location.pathname, item.url);
            return (
              <button
                key={item.url}
                onClick={() => { navigate(item.url); setMoreOpen(false); }}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-tight">{item.title}</span>
              </button>
            );
          })}
          {hasOverflow && (
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors',
                isOverflowActive || moreOpen ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {isOverflowActive && !moreOpen && (
                <motion.span
                  layoutId="mobile-tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">More</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
