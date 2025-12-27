import { useState } from 'react';

import { Calendar, Edit, ExternalLink, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  PROJECT_CATEGORY_LABELS,
  PROJECT_HEALTH_COLORS,
  PROJECT_HEALTH_LABELS,
  PROJECT_SCOPE_LABELS,
  PROJECT_STATUS_LABELS,
  type Project,
  type ProjectHealth,
  type ProjectStatus,
} from '../types/project.types';

import { ProjectForm } from './ProjectForm';
import { useProjectMutations } from '../hooks/useProjectMutations';

interface ProjectHeaderProps {
  project: Project;
  onStatusChange?: (status: ProjectStatus) => void;
  onHealthChange?: (health: ProjectHealth) => void;
}

const healthIcons: Record<string, string> = {
  not_started: '⚪',
  on_track: '🟢',
  at_risk: '🟡',
  blocked: '🔴',
};

export function ProjectHeader({
  project,
  onStatusChange,
  onHealthChange,
}: ProjectHeaderProps) {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { update } = useProjectMutations();

  const healthColor = PROJECT_HEALTH_COLORS[project.health];
  const healthIcon = healthIcons[project.health] || '⚪';

  const handleStatusChange = (newStatus: ProjectStatus) => {
    update(project.id, { status: newStatus }, {
      onSuccess: () => {
        onStatusChange?.(newStatus);
      },
    });
  };

  const handleHealthChange = (newHealth: ProjectHealth) => {
    update(project.id, { health: newHealth }, {
      onSuccess: () => {
        onHealthChange?.(newHealth);
      },
    });
  };

  return (
    <>
      <div className="border-b bg-white px-6 py-4">
        <div className="space-y-4">
          {/* Title and Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl" aria-label={PROJECT_HEALTH_LABELS[project.health]}>
                  {healthIcon}
                </span>
                <h1 className="text-2xl font-semibold">{project.name}</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Status, Health, Owner */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={project.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Health:</span>
              <Select value={project.health} onValueChange={handleHealthChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_HEALTH_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {project.ownerName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Owner: {project.ownerName}</span>
              </div>
            )}
          </div>

          {/* Dates */}
          {(project.startDate || project.targetDate) && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {project.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.targetDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Target: {new Date(project.targetDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{PROJECT_SCOPE_LABELS[project.scope]}</Badge>
            <Badge variant="outline">{PROJECT_CATEGORY_LABELS[project.category]}</Badge>
            {project.ventures.map((venture) => (
              <Badge key={venture} variant="secondary">
                {venture}
              </Badge>
            ))}
          </div>

          {/* GitHub Link */}
          {project.githubProjectUrl && (
            <div>
              <a
                href={project.githubProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View on GitHub</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            project={project}
            onSuccess={() => setEditDialogOpen(false)}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

