import { useEffect, useState } from 'react';

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { QueryErrorBoundary } from '@/components/error/ErrorBoundary';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { ProjectActivity, ProjectContact, ProjectOrganization, ProjectRelationship } from '../types/project.types';
import { projectService } from '../services/projectService';
import { useProject } from '../hooks/useProject';
import { usePhases } from '../hooks/usePhases';
import { useMilestoneMutations } from '../hooks/useMilestones';
import { ProjectHeader } from './ProjectHeader';
import { PhaseList } from './PhaseList';
import { LinkedEntities } from './LinkedEntities';
import { ProjectActivityFeed } from './ProjectActivityFeed';

interface ProjectDetailProps {
  projectId: string;
}

function ProjectDetailContent({ projectId }: ProjectDetailProps) {
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(projectId);
  const { data: phases = [], isLoading: phasesLoading } = usePhases(projectId);
  const { update: updateMilestone } = useMilestoneMutations();
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [linkedEntities, setLinkedEntities] = useState<{
    contacts: ProjectContact[];
    organizations: ProjectOrganization[];
    relationships: ProjectRelationship[];
  }>({
    contacts: [],
    organizations: [],
    relationships: [],
  });

  // Load activities and linked entities
  useEffect(() => {
    if (projectId) {
      projectService.getActivities(projectId).then(setActivities);
      projectService.getLinkedEntities(projectId).then(setLinkedEntities);
    }
  }, [projectId]);

  const handleMilestoneToggle = async (milestoneId: string, completed: boolean) => {
    updateMilestone(milestoneId, { completed }, {
      onSuccess: () => {
        // Refetch activities to show the change
        projectService.getActivities(projectId).then(setActivities);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="border-b bg-white px-6 py-4">
          <Skeleton className="h-32" />
        </div>
        <div className="flex-1 overflow-auto p-6">
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <EmptyState
        title="Project not found"
        description="The project you're looking for doesn't exist or has been deleted"
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Back Button */}
      <div className="border-b bg-white px-6 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      {/* Header */}
      <ProjectHeader project={project} />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          {/* Description */}
          {project.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          <Separator />

          {/* Phases & Milestones */}
          {phasesLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <PhaseList
              phases={phases}
              onMilestoneToggle={handleMilestoneToggle}
            />
          )}

          <Separator />

          {/* Linked Entities */}
          <LinkedEntities
            contacts={linkedEntities.contacts}
            organizations={linkedEntities.organizations}
            relationships={linkedEntities.relationships}
          />

          <Separator />

          {/* Activity Feed */}
          <ProjectActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}

export function ProjectDetail(props: ProjectDetailProps) {
  return (
    <QueryErrorBoundary>
      <ProjectDetailContent {...props} />
    </QueryErrorBoundary>
  );
}

