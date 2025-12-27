import { useState } from 'react';

import { Plus, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectFilters } from '@/features/projects/components/ProjectFilters';
import { ProjectList } from '@/features/projects/components/ProjectList';
import { ProjectSummaryCards } from '@/features/projects/components/ProjectSummaryCards';
import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectFilters } from '@/features/projects/hooks/useProjectFilters';

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { filters, setFilters, resetFilters, hasActiveFilters } = useProjectFilters();
  const { data: projectsData } = useProjects(filters);

  const handleRefresh = () => {
    // Trigger a refetch by updating filters slightly
    setFilters({ ...filters });
  };

  return (
    <div className="flex h-screen overflow-hidden flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {projectsData ? `Showing ${projectsData.data.length} of ${projectsData.count} projects` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to track initiatives across the NineOneSix ecosystem.
                  </DialogDescription>
                </DialogHeader>
                <ProjectForm
                  onSuccess={() => {
                    setDialogOpen(false);
                  }}
                  onCancel={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <ProjectFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-6">
          {/* Summary Cards */}
          {projectsData && projectsData.data.length > 0 && (
            <ProjectSummaryCards projects={projectsData.data} />
          )}

          {/* Project List */}
          <ProjectList filters={filters} />
        </div>
      </div>
    </div>
  );
}

