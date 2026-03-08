import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  children?: React.ReactNode;
}

export function TopBar({ children }: TopBarProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
      <div className="flex items-center">
        {children}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-4.5 w-4.5" />
        </Button>
        {user && (
          <div className="flex items-center gap-2">
            <StatusBadge status={user.role} />
            <span className="text-sm font-medium text-foreground hidden sm:inline">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
