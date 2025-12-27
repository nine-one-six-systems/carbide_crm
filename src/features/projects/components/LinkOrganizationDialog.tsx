import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { OrganizationCombobox } from '@/features/organizations/components/OrganizationCombobox';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';
import { projectService } from '../services/projectService';
import { toast } from '@/components/ui/use-toast';
import { Form } from '@/components/ui/form';

const linkOrganizationSchema = z.object({
  organizationId: z.string().uuid('Please select an organization'),
  role: z.string().optional(),
});

type LinkOrganizationFormValues = z.infer<typeof linkOrganizationSchema>;

interface LinkOrganizationDialogProps {
  projectId: string;
  linkedOrganizationIds: string[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LinkOrganizationDialog({
  projectId,
  linkedOrganizationIds,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: LinkOrganizationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const { data: organizationsData } = useOrganizations({
    page: 1,
    pageSize: 1000,
  });

  const form = useForm<LinkOrganizationFormValues>({
    resolver: zodResolver(linkOrganizationSchema),
    defaultValues: {
      organizationId: '',
      role: '',
    },
  });

  // Filter out already linked organizations
  const availableOrganizations = useMemo(() => {
    return (organizationsData?.data || []).filter(
      (org) => !linkedOrganizationIds.includes(org.id)
    );
  }, [organizationsData?.data, linkedOrganizationIds]);

  const onSubmit = async (values: LinkOrganizationFormValues) => {
    try {
      await projectService.linkOrganization(
        projectId,
        values.organizationId,
        values.role || undefined
      );
      toast({
        title: 'Success',
        description: 'Organization linked successfully',
      });
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to link organization',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Link Organization</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link Organization</DialogTitle>
          <DialogDescription>
            Associate an organization with this project and optionally specify their role.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization</label>
            <OrganizationCombobox
              value={form.watch('organizationId')}
              onChange={(value) => form.setValue('organizationId', value)}
              placeholder="Select an organization"
            />
            {form.formState.errors.organizationId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.organizationId.message}
              </p>
            )}
          </div>

          <ValidatedInput name="role" label="Role (optional)" />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={availableOrganizations.length === 0}>
              Link Organization
            </Button>
          </div>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

