// hooks/useAuthGuard.ts
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { UserRole } from '@/types/api/user';

interface AuthGuardOptions {
  requiredPermissions?: string[];
  requiredRoles?: UserRole[];
  requireAll?: boolean;
  redirectTo?: string;
  unauthorizedPath?: string;
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const router = useRouter();
  const {
    initializeUser,
    isAuthenticated,
    isLoading: authLoading,
    isInitialized,
    hasPermission,
    hasRole
  } = useAuth();

  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const initializedRef = useRef(false);

  const {
    requiredPermissions = [],
    requiredRoles = [],
    requireAll = true,
    redirectTo = '/auth/login',
    unauthorizedPath = '/unauthorized'
  } = options;

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const checkAuth = async () => {
      setIsChecking(true);

      try {
        await initializeUser();

        const authenticated = isAuthenticated();
        setIsAuthenticatedState(authenticated);

        if (!authenticated) {
          router.push(redirectTo);
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        if (requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.some(role => hasRole(role));
          if (!hasRequiredRole) {
            router.push(unauthorizedPath);
            setIsAuthorized(false);
            setIsChecking(false);
            return;
          }
        }

        if (requiredPermissions.length === 0) {
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }

        const permissionResults = await Promise.all(
          requiredPermissions.map(p => hasPermission(p))
        );

        const grantedPermissions = requiredPermissions.filter((_, i) => permissionResults[i]);
        setUserPermissions(grantedPermissions);

        let hasAccess = false;

        if (requireAll) {
          hasAccess = permissionResults.every(Boolean);
        } else {
          hasAccess = permissionResults.some(Boolean);
        }

        if (!hasAccess) {
          router.push(unauthorizedPath);
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        router.push(redirectTo);
        setIsAuthorized(false);
        setIsAuthenticatedState(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [
    initializeUser,
    isAuthenticated,
    hasPermission,
    hasRole,
    requiredPermissions,
    requiredRoles,
    requireAll,
    redirectTo,
    unauthorizedPath,
    router
  ]);

  return {
    isLoading: authLoading || isChecking || !isInitialized,
    isAuthorized,
    isAuthenticated: isAuthenticatedState, 
    userPermissions,
    hasAllPermissions: requiredPermissions.every(p => userPermissions.includes(p)),
    hasAnyPermission: requiredPermissions.some(p => userPermissions.includes(p)),
  };
}