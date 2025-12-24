import { useQuery } from '@tanstack/react-query';

import type { CadenceTemplate } from '@/types/database';

import { cadenceService } from '../services/cadenceService';

export function useCadenceTemplates() {
  return useQuery<CadenceTemplate[]>({
    queryKey: ['cadence-templates'],
    queryFn: () => cadenceService.getTemplates(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCadenceTemplate(id: string | undefined) {
  return useQuery<CadenceTemplate | null>({
    queryKey: ['cadence-template', id],
    queryFn: () => (id ? cadenceService.getTemplateById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

