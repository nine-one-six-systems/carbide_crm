import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFieldService } from '../services/customFieldService';
import type {
  CustomFieldDefinitionCreatePayload,
  CustomFieldDefinitionUpdatePayload,
} from '@/types/api';

const QUERY_KEY = 'custom-field-definitions';

export function useCustomFields(entityType?: 'contact' | 'organization' | 'both') {
  return useQuery({
    queryKey: [QUERY_KEY, entityType],
    queryFn: () => customFieldService.getAll(entityType),
  });
}

export function useCustomFieldsByCategory(
  category: string,
  entityType?: 'contact' | 'organization' | 'both'
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'category', category, entityType],
    queryFn: () => customFieldService.getByCategory(category, entityType),
  });
}

export function useCustomField(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => customFieldService.getById(id),
    enabled: !!id,
  });
}

export function useCustomFieldCategories() {
  return useQuery({
    queryKey: [QUERY_KEY, 'categories'],
    queryFn: () => customFieldService.getCategories(),
  });
}

export function useCustomFieldMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CustomFieldDefinitionCreatePayload) =>
      customFieldService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CustomFieldDefinitionUpdatePayload) =>
      customFieldService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customFieldService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
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

