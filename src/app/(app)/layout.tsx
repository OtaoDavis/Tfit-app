'use client'; // Required for hooks like useAuth and useRouter

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function ApplicationGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || (!loading && !user)) {
    // Show a loader while checking auth state or if about to redirect
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // User is authenticated, render the AppLayout and children
  return <AppLayout>{children}</AppLayout>;
}
