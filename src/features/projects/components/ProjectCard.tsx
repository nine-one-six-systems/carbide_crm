import { Calendar, ExternalLink, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  PROJECT_CATEGORY_LABELS,
  PROJECT_HEALTH_COLORS,
  PROJECT_HEALTH_LABELS,
  PROJECT_SCOPE_LABELS,
  PROJECT_STATUS_LABELS,
  type ProjectWithStats,
} from '../types/project.types';

interface ProjectCardProps {
  project: ProjectWithStats;
  className?: string;
}

const healthIcons: Record<string, string> = {
  not_started: '⚪',
  on_track: '🟢',
  at_risk: '🟡',
  blocked: '🔴',
};

export function ProjectCard({ project, className }: ProjectCardProps) {
  const healthColor = PROJECT_HEALTH_COLORS[project.health];
  const healthIcon = healthIcons[project.health] || '⚪';

  return (
    <Link to={`/projects/${project.id}`} className={cn('block', className)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg" aria-label={PROJECT_HEALTH_LABELS[project.health]}>
                    {healthIcon}
                  </span>
                  <h3 className="font-semibold truncate">{project.name}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {PROJECT_SCOPE_LABELS[project.scope]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3" />
                <span>{PROJECT_CATEGORY_LABELS[project.category]}</span>
              </div>
              {project.ventures && project.ventures.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Ventures:</span>
                  <span>{project.ventures.join(', ')}</span>
                </div>
              )}
              {project.ownerName && (
                <div>
                  <span className="font-medium">Owner:</span> {project.ownerName}
                </div>
              )}
            </div>

            {/* Dates */}
            {(project.targetDate || project.startDate) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {project.targetDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Target: {new Date(project.targetDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Milestone Progress */}
            {project.totalMilestones > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Milestones</span>
                  <span className="font-medium">
                    {project.completedMilestones}/{project.totalMilestones} complete
                  </span>
                </div>
                <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full transition-all', {
                      'bg-green-500': project.health === 'on_track',
                      'bg-yellow-500': project.health === 'at_risk',
                      'bg-red-500': project.health === 'blocked',
                      'bg-gray-400': project.health === 'not_started',
                    })}
                    style={{
                      width: `${(project.completedMilestones / project.totalMilestones) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* GitHub Link */}
            {project.githubProjectUrl && (
              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open(project.githubProjectUrl || '', '_blank', 'noopener,noreferrer');
                  }}
                  className="flex items-center gap-1 text-sm text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on GitHub
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

