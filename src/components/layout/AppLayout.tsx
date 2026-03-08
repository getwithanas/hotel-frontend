import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { useAuthStore } from '@/store/auth-store';
import { useSocket } from '@/hooks/useSocket';
import { authService } from '@/services/auth.service';

export function AppLayout() {
  const { token, setUser, logout, setLoading } = useAuthStore();

  // Fetch user on mount
  useEffect(() => {
    if (token) {
      authService.me()
        .then(setUser)
        .catch(() => logout());
    } else {
      setLoading(false);
    }
  }, [token]);

  // Connect socket
  useSocket();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar>
            <SidebarTrigger className="mr-2" />
          </TopBar>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
