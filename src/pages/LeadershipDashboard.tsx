import { AlertCircle, RefreshCw } from 'lucide-react';

import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityVolumeCard } from '@/features/dashboard/components/ActivityVolumeCard';
import { ColdOpportunitiesCard } from '@/features/dashboard/components/ColdOpportunitiesCard';
import { DashboardFilters } from '@/features/dashboard/components/DashboardFilters';
import { DashboardSummaryCards } from '@/features/dashboard/components/DashboardSummaryCards';
import { DashboardViewToggle } from '@/features/dashboard/components/DashboardViewToggle';
import { PipelineSections } from '@/features/dashboard/components/PipelineSections';
import { RecentActivityCard } from '@/features/dashboard/components/RecentActivityCard';
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters';
import { useLeadershipDashboard } from '@/features/dashboard/hooks/useLeadershipDashboard';

export function LeadershipDashboard() {
  const { filters, setFilters, resetFilters } = useDashboardFilters();
  const {
    summary,
    activityVolume,
    pipelineSummaries,
    coldOpportunities,
    recentActivity,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeadershipDashboard(filters);

  const isPipelineView = filters.view === 'pipeline';

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leadership Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Cross-venture business opportunity overview
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardViewToggle
            view={filters.view}
            onChange={(view) => setFilters({ view })}
          />
          <DashboardFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            hideVentureFilter={!isPipelineView}
            hidePipelineFilter={isPipelineView}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data.{' '}
            {error instanceof Error ? error.message : 'Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-4">
          <ErrorBoundary fallback={<SummaryCardsFallback />}>
            <DashboardSummaryCards summary={summary} isLoading={isLoading} />
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-1">
          <ErrorBoundary fallback={<ActivityVolumeFallback />}>
            <ActivityVolumeCard volume={activityVolume} isLoading={isLoading} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Pipeline/Venture Sections */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : isPipelineView ? (
          <PipelineSections pipelines={pipelineSummaries ?? []} />
        ) : (
          <div className="rounded-lg border p-6">
            <p className="text-muted-foreground text-center">
              Venture view coming soon. Switch to Pipeline view to see data.
            </p>
          </div>
        )}
      </div>

      {/* Cold Opportunities */}
      {coldOpportunities && coldOpportunities.length > 0 && (
        <ColdOpportunitiesCard opportunities={coldOpportunities} />
      )}

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <RecentActivityCard activities={recentActivity} />
      )}
    </div>
  );
}

// Fallback components
function SummaryCardsFallback() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

function ActivityVolumeFallback() {
  return <Skeleton className="h-32 w-full" />;
}

export default LeadershipDashboard;
