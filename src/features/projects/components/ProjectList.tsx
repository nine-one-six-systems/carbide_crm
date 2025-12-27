import { FolderKanban } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProjectListParams } from '../types/project.types';

import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  filters: ProjectListParams;
}

export function ProjectList({ filters }: ProjectListProps) {
  const { data, isLoading, error } = useProjects(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Error loading projects"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects found"
        description="Get started by creating your first project"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.data.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

