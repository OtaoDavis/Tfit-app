import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from '@/components/layout/mode-toggle'; // Assuming ModeToggle is already created
import { Button } from '@/components/ui/button';
import { Languages, Bell, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Settings"
        description="Customize your application experience."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Adjust the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Theme Mode</p>
              <ModeToggle />
            </div>
            <p className="text-sm text-muted-foreground">
              Switch between light, dark, or system default themes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Language & Region
            </CardTitle>
            <CardDescription>Set your preferred language and region.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Placeholder for language selection */}
            <p className="text-sm text-muted-foreground">Currently selected: English (US)</p>
            <Button variant="outline" disabled>Change Language (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for notification settings */}
            <p className="text-sm text-muted-foreground">
              Fine-tune your notification preferences in your profile settings.
            </p>
             <Button variant="link" className="p-0 h-auto" asChild>
                <a href="/profile#account-settings">Go to Notification Settings</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
