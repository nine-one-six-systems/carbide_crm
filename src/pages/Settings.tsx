import { User, Settings2, Bell } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationSettings } from '@/features/settings/components/NotificationSettings';
import { PreferencesSettings } from '@/features/settings/components/PreferencesSettings';
import { ProfileSettings } from '@/features/settings/components/ProfileSettings';

export default function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Settings' },
      ]}
    >
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

