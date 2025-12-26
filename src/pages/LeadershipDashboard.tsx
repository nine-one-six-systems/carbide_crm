import { AlertCircle, RefreshCw } from 'lucide-react';

import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ActivityVolumeCard } from '@/features/dashboard/components/ActivityVolumeCard';
import { ColdOpportunitiesCard } from '@/features/dashboard/components/ColdOpportunitiesCard';
import { DashboardFilters } from '@/features/dashboard/components/DashboardFilters';
import { DashboardSummaryCards } from '@/features/dashboard/components/DashboardSummaryCards';
import { DashboardViewToggle } from '@/features/dashboard/components/DashboardViewToggle';
import { PipelineSections } from '@/features/dashboard/components/PipelineSections';
import { RecentActivityCard } from '@/features/dashboard/components/RecentActivityCard';
import { VentureSection } from '@/features/dashboard/components/VentureSection';
import { ActivityFeedSkeleton } from '@/features/dashboard/components/skeletons/ActivityFeedSkeleton';
import { PipelineSectionSkeleton } from '@/features/dashboard/components/skeletons/PipelineSectionSkeleton';
import { SummaryCardsSkeleton } from '@/features/dashboard/components/skeletons/SummaryCardsSkeleton';
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters';
import { useLeadershipDashboard } from '@/features/dashboard/hooks/useLeadershipDashboard';

export function LeadershipDashboard() {
  const { filters, setFilters, resetFilters } = useDashboardFilters();
  const {
    summary,
    activityVolume,
    pipelineSummaries,
    ventureSummaries,
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
          <ErrorBoundary fallback={<SummaryCardsSkeleton />}>
            {isLoading ? (
              <SummaryCardsSkeleton />
            ) : (
              <DashboardSummaryCards summary={summary} isLoading={false} />
            )}
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-1">
          <ErrorBoundary fallback={<ActivityFeedSkeleton />}>
            <ActivityVolumeCard volume={activityVolume} isLoading={isLoading} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Pipeline/Venture Sections */}
      <div className="space-y-4">
        {isPipelineView ? (
          <PipelineSections pipelines={pipelineSummaries ?? []} isLoading={isLoading} />
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <>
                <PipelineSectionSkeleton />
                <PipelineSectionSkeleton />
                <PipelineSectionSkeleton />
              </>
            ) : ventureSummaries && ventureSummaries.length > 0 ? (
              ventureSummaries.map((venture) => (
                <VentureSection
                  key={venture.venture}
                  venture={venture.venture}
                  data={venture}
                  isLoading={false}
                  defaultExpanded={venture.attentionItems.length > 0}
                />
              ))
            ) : (
              <div className="rounded-lg border p-6">
                <p className="text-muted-foreground text-center">
                  No active opportunities in the selected time period.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cold Opportunities */}
      {coldOpportunities && coldOpportunities.length > 0 && (
        <ColdOpportunitiesCard opportunities={coldOpportunities} />
      )}

      {/* Recent Activity */}
      {isLoading ? (
        <ActivityFeedSkeleton />
      ) : (
        recentActivity && recentActivity.length > 0 && (
          <RecentActivityCard activities={recentActivity} />
        )
      )}
    </div>
  );
}

export default LeadershipDashboard;
