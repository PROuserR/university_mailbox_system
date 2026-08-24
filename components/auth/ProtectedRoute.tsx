// components/auth/ProtectedRoute.tsx
"use client";

import { ReactNode } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { UserRole } from "@/types/api/user";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  requireAll?: boolean;
  redirectTo?: string;
  unauthorizedPath?: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAll = true,
  redirectTo = "/auth/login",
  unauthorizedPath = "/unauthorized",
  fallback,
  loadingFallback,
}: ProtectedRouteProps) {
  const { isLoading, isAuthorized, isAuthenticated } = useAuthGuard({
    requiredRoles,
    requiredPermissions,
    requireAll,
    redirectTo,
    unauthorizedPath,
  });

  if (isLoading) {
    return (
      loadingFallback || (
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return fallback || null;
  }

  return <>{children}</>;
}
