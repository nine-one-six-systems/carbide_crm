import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';
import type { ContactOrganizationLink } from '@/types/database';

import { contactOrgLinkService } from '../services/contactOrgLinkService';

export function useContactOrgLinks(contactId: string | undefined) {
  return useQuery<ContactOrganizationLink[]>({
    queryKey: ['contact-org-links', contactId],
    queryFn: () =>
      contactId
        ? contactOrgLinkService.getByContact(contactId)
        : Promise.resolve([]),
    enabled: !!contactId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useOrganizationContacts(organizationId: string | undefined) {
  return useQuery<ContactOrganizationLink[]>({
    queryKey: ['org-contact-links', organizationId],
    queryFn: () =>
      organizationId
        ? contactOrgLinkService.getByOrganization(organizationId)
        : Promise.resolve([]),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useContactOrgLinkMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: contactOrgLinkService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['contact-org-links', data.contact_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['org-contact-links', data.organization_id],
      });
      queryClient.invalidateQueries({ queryKey: ['contact', data.contact_id] });
      queryClient.invalidateQueries({
        queryKey: ['organization', data.organization_id],
      });
      toast({
        title: 'Success',
        description: 'Contact linked to organization',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to link contact',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<ContactOrganizationLink>) =>
      contactOrgLinkService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['contact-org-links', data.contact_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['org-contact-links', data.organization_id],
      });
      toast({
        title: 'Success',
        description: 'Link updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update link',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, contactId, organizationId }: { id: string; contactId: string; organizationId: string }) =>
      contactOrgLinkService.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['contact-org-links', variables.contactId],
      });
      queryClient.invalidateQueries({
        queryKey: ['org-contact-links', variables.organizationId],
      });
      toast({
        title: 'Success',
        description: 'Link removed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove link',
        variant: 'destructive',
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

