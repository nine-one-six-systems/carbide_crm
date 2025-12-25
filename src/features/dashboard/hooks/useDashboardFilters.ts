import { useCallback, useMemo, useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

import type { Venture, BusinessRelationshipType } from '@/types/database';

import { parsePeriod, getDefaultFilters } from '../utils/periodUtils';

import type {
  DashboardFilters,
  DashboardView,
  DashboardPeriod,
} from '../types/leadershipDashboard.types';

const VIEW_STORAGE_KEY = 'carbide-leadership-view';
const DEFAULT_VIEW: DashboardView = 'pipeline';
const DEFAULT_PERIOD: DashboardPeriod = '14d';

/**
 * Hook for managing dashboard filter state with URL and localStorage persistence.
 * - View preference is saved to localStorage for return visits
 * - All filter state is reflected in URL query parameters for sharing
 */
export function useDashboardFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get stored view preference from localStorage
  const storedView = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(VIEW_STORAGE_KEY) as DashboardView | null;
  }, []);

  // Parse current filters from URL search params
  const filters: DashboardFilters = useMemo(() => {
    const viewParam = searchParams.get('view') as DashboardView | null;
    const periodParam = searchParams.get('period');
    const periodStartParam = searchParams.get('period_start');
    const periodEndParam = searchParams.get('period_end');
    const ventureParam = searchParams.get('venture') as Venture | null;
    const ownerParam = searchParams.get('owner');
    const pipelineParam = searchParams.get('pipeline') as BusinessRelationshipType | null;

    return {
      view: viewParam || storedView || DEFAULT_VIEW,
      period: parsePeriod(periodParam),
      periodStart: periodStartParam ? new Date(periodStartParam) : undefined,
      periodEnd: periodEndParam ? new Date(periodEndParam) : undefined,
      venture: ventureParam || undefined,
      ownerId: ownerParam || undefined,
      pipelineType: pipelineParam || undefined,
    };
  }, [searchParams, storedView]);

  // Persist view preference to localStorage when it changes
  useEffect(() => {
    if (filters.view && typeof window !== 'undefined') {
      localStorage.setItem(VIEW_STORAGE_KEY, filters.view);
    }
  }, [filters.view]);

  // Update filters (partial update)
  const setFilters = useCallback(
    (updates: Partial<DashboardFilters>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null) {
              next.delete(key);
            } else if (value instanceof Date) {
              // Convert camelCase to snake_case for URL params
              const paramKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
              next.set(paramKey, value.toISOString().split('T')[0]);
            } else {
              next.set(key, String(value));
            }
          });

          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Reset filters to defaults (preserves view preference)
  const resetFilters = useCallback(() => {
    const defaults = getDefaultFilters();
    setSearchParams(
      {
        view: filters.view || defaults.view,
        period: DEFAULT_PERIOD,
      },
      { replace: true }
    );
  }, [setSearchParams, filters.view]);

  // Check if any filters are applied beyond defaults
  const hasActiveFilters = useMemo(() => {
    return !!(filters.venture || filters.ownerId || filters.pipelineType);
  }, [filters.venture, filters.ownerId, filters.pipelineType]);

  return {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
}

