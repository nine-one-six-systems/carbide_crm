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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { OrganizationCombobox } from '@/features/organizations/components/OrganizationCombobox';
import { useAuth } from '@/features/auth/context/AuthContext';

import { useLinkOrganization } from '../hooks/useVentureOrganizations';
import { VENTURE_ORG_RELATIONSHIP_OPTIONS } from '../types/venture.types';

const linkOrganizationSchema = z.object({
  organization_id: z.string().min(1, 'Organization is required'),
  relationship_type: z.enum(['owns', 'subsidiary', 'client', 'partner', 'vendor', 'other']),
  is_primary: z.boolean(),
  notes: z.string().nullable().optional(),
});

type LinkOrganizationFormValues = z.infer<typeof linkOrganizationSchema>;

interface LinkOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventureId: string;
}

export function LinkOrganizationModal({
  open,
  onOpenChange,
  ventureId,
}: LinkOrganizationModalProps) {
  const { user } = useAuth();
  const linkOrganization = useLinkOrganization(ventureId);

  const form = useForm<LinkOrganizationFormValues>({
    resolver: zodResolver(linkOrganizationSchema),
    defaultValues: {
      organization_id: '',
      relationship_type: 'other',
      is_primary: false,
      notes: '',
    },
  });

  const handleSubmit = (values: LinkOrganizationFormValues) => {
    if (!user?.id) return;

    linkOrganization.mutate(
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
          <DialogTitle>Link Organization</DialogTitle>
          <DialogDescription>
            Connect an organization to this venture with a specific relationship type.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization *</FormLabel>
                  <FormControl>
                    <OrganizationCombobox
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationship_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VENTURE_ORG_RELATIONSHIP_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div>{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Primary Organization</FormLabel>
                    <FormDescription>
                      This is the legal entity for this venture
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional context..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={linkOrganization.isPending}>
                {linkOrganization.isPending ? 'Linking...' : 'Link Organization'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

