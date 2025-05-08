"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, WifiOff } from 'lucide-react';

interface CoursesWebViewProps {
  src: string;
}

export function CoursesWebView({ src }: CoursesWebViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true); // Assume online initially
  const [iframeKey, setIframeKey] = useState(Date.now()); // To force iframe reload

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIframeKey(Date.now()); // Force reload iframe when back online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial online status
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }


    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle>Our Courses</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video w-full min-h-[500px] bg-muted">
          {isLoading && isOnline && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/80 z-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Loading courses...</p>
            </div>
          )}
          {!isOnline && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive bg-background/80 z-10 p-4">
              <WifiOff className="h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-semibold">You are offline</p>
              <p className="text-sm text-center">Please check your internet connection to view courses.</p>
            </div>
          )}
          {isOnline && (
            <iframe
              key={iframeKey}
              src={src}
              title="Kajabi Courses"
              className="absolute inset-0 h-full w-full border-0"
              onLoad={handleLoad}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
