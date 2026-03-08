import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { ROLE_ROUTES } from '@/lib/constants';
import type { UserRole } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Check if we can find a matching route based on ROLE_ROUTES
    const defaultRoute = Object.entries(ROLE_ROUTES).find(([, roles]) =>
      roles.includes(user.role)
    );
    return <Navigate to={defaultRoute?.[0] || '/login'} replace />;
  }

  return <>{children}</>;
}
