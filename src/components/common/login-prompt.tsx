'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

interface LoginPromptProps {
  featureName: string;
  message?: string;
}

export function LoginPrompt({ featureName, message }: LoginPromptProps) {
  return (
    <Card className="my-8 text-center shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <LogIn className="h-6 w-6 text-primary" />
          Login Required
        </CardTitle>
        <CardDescription>
          {message || `Please log in to use the ${featureName} feature.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Accessing this feature requires an active account. Please sign in to continue.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/login">
            <LogIn className="mr-2 h-5 w-5" />
            Login to Continue
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

