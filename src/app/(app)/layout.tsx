'use client'; // Required for hooks like useAuth

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';


export default function ApplicationGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkForUpdate = async () => {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      try {
        const result = await AppUpdate.getAppUpdateInfo();

        // Log the result for debugging during testing
        console.log('App Update Info:', result);
        
        if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE && result.immediateUpdateAllowed) {
            console.log('Immediate update available, attempting to perform update...');
            // Start an immediate update
            await AppUpdate.performImmediateUpdate();
        } else {
             console.log('No immediate update available or allowed.', result);
        }
      } catch (error) {
        console.error('Error checking for app update:', error);
        toast({
          title: 'Update Check Failed',
          description: 'Could not check for app updates. Please check the Play Store manually.',
          variant: 'destructive',
        });
      }
    };

    checkForUpdate();
  }, [toast]);


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
