import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';
import type {
  PrimaryRelationshipGroup,
  PrimaryRelationshipMember,
  SecondaryRelationship,
} from '@/types/database';

import { interpersonalService } from '../services/interpersonalService';

export function usePrimaryGroups(contactId: string | undefined) {
  return useQuery<PrimaryRelationshipGroup[]>({
    queryKey: ['primary-groups', contactId],
    queryFn: () =>
      contactId
        ? interpersonalService.getPrimaryGroups(contactId)
        : Promise.resolve([]),
    enabled: !!contactId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGroupMembers(groupId: string | undefined) {
  return useQuery<PrimaryRelationshipMember[]>({
    queryKey: ['group-members', groupId],
    queryFn: () =>
      groupId
        ? interpersonalService.getGroupMembers(groupId)
        : Promise.resolve([]),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSecondaryRelationships(contactId: string | undefined) {
  return useQuery<SecondaryRelationship[]>({
    queryKey: ['secondary-relationships', contactId],
    queryFn: () =>
      contactId
        ? interpersonalService.getSecondaryRelationships(contactId)
        : Promise.resolve([]),
    enabled: !!contactId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useInterpersonalMutations() {
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: (name?: string) => interpersonalService.createPrimaryGroup(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['primary-groups'] });
      toast({
        title: 'Success',
        description: 'Relationship group created',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create group',
        variant: 'destructive',
      });
    },
  });

  const addToGroupMutation = useMutation({
    mutationFn: interpersonalService.addToPrimaryGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['primary-groups', data.contact_id] });
      queryClient.invalidateQueries({ queryKey: ['group-members', data.group_id] });
      toast({
        title: 'Success',
        description: 'Contact added to group',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add contact',
        variant: 'destructive',
      });
    },
  });

  const removeFromGroupMutation = useMutation({
    mutationFn: ({ groupId, contactId }: { groupId: string; contactId: string }) =>
      interpersonalService.removeFromPrimaryGroup(groupId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['primary-groups', variables.contactId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', variables.groupId] });
      toast({
        title: 'Success',
        description: 'Contact removed from group',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove contact',
        variant: 'destructive',
      });
    },
  });

  const createSecondaryMutation = useMutation({
    mutationFn: interpersonalService.createSecondaryRelationship,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['secondary-relationships', data.contact_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['secondary-relationships', data.related_contact_id],
      });
      toast({
        title: 'Success',
        description: 'Relationship created',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create relationship',
        variant: 'destructive',
      });
    },
  });

  const updateSecondaryMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; relationship_type?: string; notes?: string }) =>
      interpersonalService.updateSecondaryRelationship(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['secondary-relationships', data.contact_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['secondary-relationships', data.related_contact_id],
      });
      toast({
        title: 'Success',
        description: 'Relationship updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update relationship',
        variant: 'destructive',
      });
    },
  });

  const deleteSecondaryMutation = useMutation({
    mutationFn: (id: string) => interpersonalService.deleteSecondaryRelationship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secondary-relationships'] });
      toast({
        title: 'Success',
        description: 'Relationship removed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove relationship',
        variant: 'destructive',
      });
    },
  });

  return {
    createGroup: createGroupMutation.mutateAsync,
    addToGroup: addToGroupMutation.mutateAsync,
    removeFromGroup: removeFromGroupMutation.mutateAsync,
    createSecondary: createSecondaryMutation.mutateAsync,
    updateSecondary: updateSecondaryMutation.mutateAsync,
    deleteSecondary: deleteSecondaryMutation.mutateAsync,
    isCreatingGroup: createGroupMutation.isPending,
    isAddingToGroup: addToGroupMutation.isPending,
    isRemovingFromGroup: removeFromGroupMutation.isPending,
    isCreatingSecondary: createSecondaryMutation.isPending,
    isUpdatingSecondary: updateSecondaryMutation.isPending,
    isDeletingSecondary: deleteSecondaryMutation.isPending,
  };
}

