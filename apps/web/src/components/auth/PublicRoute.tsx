'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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
      router.push('/admin/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth or redirecting
  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated, render children
  return <>{children}</>;
}
