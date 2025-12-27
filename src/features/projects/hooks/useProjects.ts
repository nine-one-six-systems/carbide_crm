import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/context/AuthContext';
import type { ProjectListParams } from '../types/project.types';
import type { PaginatedResponse, ProjectWithStats } from '../types/project.types';

import { projectService } from '../services/projectService';

export function useProjects(params: ProjectListParams) {
  const { initialized, user } = useAuth();

  const queryResult = useQuery<PaginatedResponse<ProjectWithStats>>({
    queryKey: ['projects', params],
    queryFn: () => projectService.search(params),
    enabled: initialized && !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return queryResult;
}

