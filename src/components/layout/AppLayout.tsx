import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuthStore } from '@/store/auth-store';
import { useSocket } from '@/hooks/useSocket';
import { authService } from '@/services/auth.service';
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function AppLayout() {
  const { token, setUser, logout, setLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      authService.me()
        .then(setUser)
        .catch(() => logout());
    } else {
      setLoading(false);
    }
  }, [token]);

  useSocket();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar>
            <SidebarTrigger className="mr-2 hidden md:inline-flex" />
          </TopBar>
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
