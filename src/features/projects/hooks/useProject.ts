import { useQuery } from '@tanstack/react-query';

import type { Project } from '../types/project.types';

import { projectService } from '../services/projectService';

export function useProject(id: string | undefined) {
  return useQuery<Project | null>({
    queryKey: ['project', id],
    queryFn: () => (id ? projectService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

