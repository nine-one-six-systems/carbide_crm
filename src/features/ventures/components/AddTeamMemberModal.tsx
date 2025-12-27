import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserCombobox } from '@/features/users/components/UserCombobox';
import { ContactCombobox } from '@/features/contacts/components/ContactCombobox';
import { useAuth } from '@/features/auth/context/AuthContext';

import { useAddTeamMember } from '../hooks/useVentureTeam';

const addTeamMemberSchema = z
  .object({
    member_type: z.enum(['user', 'contact']),
    user_id: z.string().nullable().optional(),
    contact_id: z.string().nullable().optional(),
    role: z.string().min(1, 'Role is required'),
    start_date: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.member_type === 'user') return !!data.user_id;
      if (data.member_type === 'contact') return !!data.contact_id;
      return false;
    },
    { message: 'Please select a team member', path: ['user_id'] }
  );

type AddTeamMemberFormValues = z.infer<typeof addTeamMemberSchema>;

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventureId: string;
}

export function AddTeamMemberModal({ open, onOpenChange, ventureId }: AddTeamMemberModalProps) {
  const { user } = useAuth();
  const addTeamMember = useAddTeamMember(ventureId);

  const form = useForm<AddTeamMemberFormValues>({
    resolver: zodResolver(addTeamMemberSchema),
    defaultValues: {
      member_type: 'user',
      user_id: null,
      contact_id: null,
      role: '',
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  const memberType = form.watch('member_type');

  const handleSubmit = (values: AddTeamMemberFormValues) => {
    if (!user?.id) return;

    addTeamMember.mutate(
      { values, userId: user.id },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add an internal user or external contact to this venture's team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="member_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="user" id="user" />
                        <Label htmlFor="user">Internal User</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="contact" id="contact" />
                        <Label htmlFor="contact">External Contact</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {memberType === 'user' ? (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User *</FormLabel>
                    <FormControl>
                      <UserCombobox value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact *</FormLabel>
                    <FormControl>
                      <ContactCombobox value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <FormControl>
                    <Input placeholder="CEO, Lead Developer, Advisor..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addTeamMember.isPending}>
                {addTeamMember.isPending ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

