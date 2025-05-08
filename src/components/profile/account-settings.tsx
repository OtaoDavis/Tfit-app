"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Trash2, Bell, ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function AccountSettings() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = React.useState(false);

  const handleChangePassword = () => {
    // Placeholder for change password logic
    toast({
      title: "Password Change Requested",
      description: "If this email is associated with an account, a password reset link will be sent.",
    });
  };

  const handleDeleteAccount = () => {
    // Placeholder for delete account logic
    // This should be a destructive action with confirmation
    console.log('Account deletion initiated');
    toast({
      title: "Account Deletion Processed",
      description: "Your account deletion request has been processed. It may take some time to complete.",
      variant: "destructive",
    });
  };

  const handleNotificationToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    toast({
      title: "Notification Settings Updated",
      description: `Email notifications ${checked ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorAuth(checked);
    toast({
      title: "Security Settings Updated",
      description: `Two-factor authentication ${checked ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          Security & Preferences
        </CardTitle>
        <CardDescription>Manage your account security and notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label htmlFor="email-notifications" className="text-base font-medium flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              Email Notifications
            </Label>
            <p className="text-sm text-muted-foreground">Receive updates and news via email.</p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={handleNotificationToggle}
            aria-label="Toggle email notifications"
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label htmlFor="two-factor-auth" className="text-base font-medium flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              Two-Factor Authentication (2FA)
            </Label>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
          </div>
          <Switch
            id="two-factor-auth"
            checked={twoFactorAuth}
            onCheckedChange={handleTwoFactorToggle}
            aria-label="Toggle two-factor authentication"
          />
        </div>
        
        <div className="space-y-4 pt-4 border-t">
           <Button onClick={handleChangePassword} variant="outline" className="w-full sm:w-auto">
            <Lock className="mr-2 h-4 w-4" /> Change Password
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                  Yes, delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Please be careful with these actions. Account deletion is permanent.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}
