import { PageHeader } from '@/components/common/page-header';
import { ProfileForm } from '@/components/profile/profile-form';
import { AccountSettings } from '@/components/profile/account-settings';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Your Profile"
        description="Manage your personal information and account settings."
      />
      <div className="space-y-12">
        <section id="profile-details">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Profile Details</h2>
          <ProfileForm />
        </section>

        <Separator />

        <section id="account-settings">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Account Settings</h2>
          <AccountSettings />
        </section>
      </div>
    </div>
  );
}
