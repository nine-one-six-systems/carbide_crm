import { User, Settings2, Bell, ListPlus } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/context/AuthContext';
import { CustomFieldsSettings } from '@/features/settings/components/CustomFieldsSettings';
import { NotificationSettings } from '@/features/settings/components/NotificationSettings';
import { PreferencesSettings } from '@/features/settings/components/PreferencesSettings';
import { ProfileSettings } from '@/features/settings/components/ProfileSettings';

export default function SettingsPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <PageContainer
      title="Settings"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Settings' },
      ]}
    >
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full max-w-lg ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
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
          {isAdmin && (
            <TabsTrigger value="custom-fields" className="gap-2">
              <ListPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Fields</span>
            </TabsTrigger>
          )}
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

        {isAdmin && (
          <TabsContent value="custom-fields">
            <CustomFieldsSettings />
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  );
}

