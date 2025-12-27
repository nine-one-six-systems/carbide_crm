import { Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '../context/AuthContext';

import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
  requireAdmin?: boolean;
  requireManager?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireAdmin,
  requireManager,
}: ProtectedRouteProps) {
  const { user, profile, loading, initialized, isAdmin, isManager } = useAuth();
  const location = useLocation();

  // Show loading state while auth is initializing
  if (loading || !initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireManager && !isManager()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Legacy requiredRole check for backward compatibility
  if (requiredRole && profile && !requiredRole.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
