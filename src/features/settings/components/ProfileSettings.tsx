import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/context/AuthContext';


const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      email: user?.email || '',
      phone: '',
      job_title: '',
      bio: '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Profile update would go here
      console.log('Updating profile:', data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Update your profile picture. Recommended size: 200x200 pixels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" className="gap-2">
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  name="full_name"
                  label="Full Name"
                  placeholder="John Doe"
                />
                <ValidatedInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  name="phone"
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                />
                <ValidatedInput
                  name="job_title"
                  label="Job Title"
                  placeholder="Sales Representative"
                />
              </div>

              <ValidatedTextarea
                name="bio"
                label="Bio"
                placeholder="Tell us a little about yourself..."
                rows={4}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

