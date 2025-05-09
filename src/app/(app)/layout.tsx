'use client'; // Required for hooks like useAuth

import type { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function ApplicationGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { loading } = useAuth(); // User object is available via useAuth in child components

  if (loading) {
    // Show a loader only while auth state is initially loading
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // AppLayout is always rendered if not loading.
  // Child pages/components will handle feature-specific authentication prompts.
  return <AppLayout>{children}</AppLayout>;
}
