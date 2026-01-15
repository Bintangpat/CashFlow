'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Public Route Wrapper (for login/register pages)
 * - Redirects to dashboard (/) if already authenticated
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Already authenticated, redirect to dashboard
      router.push('/');
    }
  }, [user, isLoading, router]);

  // If authenticated, show nothing (will redirect)
  if (user) {
    return null;
  }

  // Not authenticated or loading, render children
  return <>{children}</>;
}
