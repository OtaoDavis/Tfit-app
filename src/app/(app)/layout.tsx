
'use client'; // Required for hooks like useAuth

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/services/notifications';


export default function ApplicationGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const performInitialSetup = async () => {
      if (!Capacitor.isNativePlatform()) {
        console.log("Running on web, skipping native setup.");
        return;
      }
      
      // Setup Notifications
      try {
        await NotificationService.initialize();
      } catch (e) {
        console.error("Notification setup failed", e);
      }

      // Check for App Update
      try {
        const result = await AppUpdate.getAppUpdateInfo();
        console.log('App Update Info:', result);
        if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE && result.immediateUpdateAllowed) {
            console.log('Immediate update available, attempting to perform update...');
            await AppUpdate.performImmediateUpdate();
        } else {
             console.log('No immediate update available or allowed.', result);
        }
      } catch (error) {
        console.error('Error checking for app update:', error);
        // Toast for update check failure has been removed as it is not relevant to the user.
      }
    };

    performInitialSetup();
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
