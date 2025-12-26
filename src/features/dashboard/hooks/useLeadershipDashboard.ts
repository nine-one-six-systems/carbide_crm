import { useQuery } from '@tanstack/react-query';

import { leadershipDashboardService } from '../services/leadershipDashboardService';

import type { DashboardFilters, VentureSummary } from '../types/leadershipDashboard.types';

const STALE_TIME = 1000 * 60 * 2; // 2 minutes
const ACTIVITY_STALE_TIME = 1000 * 60; // 1 minute for activity feed

/**
 * Main hook for fetching Leadership Dashboard data.
 * Uses conditional queries based on view mode (pipeline vs venture).
 */
export function useLeadershipDashboard(filters: DashboardFilters) {
  // Summary KPIs (always fetched)
  const summaryQuery = useQuery({
    queryKey: ['leadership-dashboard', 'summary', filters],
    queryFn: () => leadershipDashboardService.getSummary(filters),
    staleTime: STALE_TIME,
  });

  // Activity volume (always fetched)
  const activityVolumeQuery = useQuery({
    queryKey: ['leadership-dashboard', 'activity-volume', filters],
    queryFn: () => leadershipDashboardService.getActivityVolume(filters),
    staleTime: STALE_TIME,
  });

  // Pipeline summaries (only for pipeline view)
  const pipelinesQuery = useQuery({
    queryKey: ['leadership-dashboard', 'pipelines', filters],
    queryFn: () => leadershipDashboardService.getPipelineSummaries(filters),
    staleTime: STALE_TIME,
    enabled: filters.view === 'pipeline',
  });

  // Venture summaries (only for venture view)
  const venturesQuery = useQuery<VentureSummary[]>({
    queryKey: ['leadership-dashboard', 'ventures', filters],
    queryFn: () => leadershipDashboardService.getVentureSummaries(filters),
    staleTime: STALE_TIME,
    enabled: filters.view === 'venture',
  });

  // Cold opportunities (always fetched)
  const coldQuery = useQuery({
    queryKey: ['leadership-dashboard', 'cold', filters],
    queryFn: () => leadershipDashboardService.getColdOpportunities(filters, 10),
    staleTime: STALE_TIME,
  });

  // Recent activity feed (always fetched, more frequent refresh)
  const activityQuery = useQuery({
    queryKey: ['leadership-dashboard', 'activity', filters],
    queryFn: () => leadershipDashboardService.getRecentActivity(filters, 10),
    staleTime: ACTIVITY_STALE_TIME,
  });

  // Determine loading state based on view
  const isLoading =
    summaryQuery.isLoading ||
    activityVolumeQuery.isLoading ||
    (filters.view === 'pipeline' && pipelinesQuery.isLoading) ||
    (filters.view === 'venture' && venturesQuery.isLoading);

  // Determine error state
  const isError =
    summaryQuery.isError ||
    activityVolumeQuery.isError ||
    (filters.view === 'pipeline' && pipelinesQuery.isError) ||
    (filters.view === 'venture' && venturesQuery.isError) ||
    coldQuery.isError ||
    activityQuery.isError;

  const error =
    summaryQuery.error ||
    activityVolumeQuery.error ||
    (filters.view === 'pipeline' ? pipelinesQuery.error : null) ||
    (filters.view === 'venture' ? venturesQuery.error : null) ||
    coldQuery.error ||
    activityQuery.error;

  // Refetch all queries
  const refetch = () => {
    summaryQuery.refetch();
    activityVolumeQuery.refetch();
    pipelinesQuery.refetch();
    venturesQuery.refetch();
    coldQuery.refetch();
    activityQuery.refetch();
  };

  return {
    // Data
    summary: summaryQuery.data,
    activityVolume: activityVolumeQuery.data,
    pipelineSummaries: pipelinesQuery.data,
    ventureSummaries: venturesQuery.data,
    coldOpportunities: coldQuery.data,
    recentActivity: activityQuery.data,

    // State
    isLoading,
    isError,
    error,

    // Actions
    refetch,

    // Individual query states (for fine-grained control)
    queries: {
      summary: summaryQuery,
      activityVolume: activityVolumeQuery,
      pipelines: pipelinesQuery,
      ventures: venturesQuery,
      cold: coldQuery,
      activity: activityQuery,
    },
  };
}

