import { useAuthStore } from '@/store/auth-store';
import { useNotificationStore, type Notification } from '@/store/notification-store';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Bell, Sun, Moon, ShoppingCart, ChefHat, Table2, Receipt, Truck,
  CheckCheck, Trash2, LogOut, Settings, User, BarChart3, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const notifIcon: Record<Notification['type'], React.ElementType> = {
  order_new: ShoppingCart,
  order_updated: ShoppingCart,
  order_ready: ChefHat,
  table_updated: Table2,
  bill_generated: Receipt,
  delivery_updated: Truck,
};

const notifColor: Record<Notification['type'], string> = {
  order_new: 'text-primary',
  order_updated: 'text-info',
  order_ready: 'text-success',
  table_updated: 'text-warning',
  bill_generated: 'text-success',
  delivery_updated: 'text-info',
};

interface TopBarProps {
  children?: React.ReactNode;
}

export function TopBar({ children }: TopBarProps) {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { notifications, markAllRead, markRead, clearAll, unreadCount } = useNotificationStore();
  const count = unreadCount();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
      <div className="flex items-center">
        {children}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notification bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-4 w-4" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground"
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-1">
                {count > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={markAllRead}>
                    <CheckCheck className="h-3 w-3 mr-1" /> Read all
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearAll}>
                    <Trash2 className="h-3 w-3 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => {
                    const Icon = notifIcon[n.type];
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          'flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50',
                          !n.read && 'bg-primary/5'
                        )}
                        onClick={() => markRead(n.id)}
                      >
                        <div className={cn('mt-0.5 shrink-0', notifColor[n.type])}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn('text-xs font-medium text-foreground truncate', !n.read && 'font-semibold')}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User profile dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-medium text-foreground leading-tight">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{user.role}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/orders/new')} className="cursor-pointer">
                <ShoppingCart className="h-4 w-4 mr-2" /> New Order
              </DropdownMenuItem>
              {hasRole('ADMIN') && (
                <DropdownMenuItem onClick={() => navigate('/reports')} className="cursor-pointer">
                  <BarChart3 className="h-4 w-4 mr-2" /> Reports
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {hasRole('ADMIN') && (
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <User className="h-4 w-4 mr-2" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
