import { startOfDay, subDays, startOfQuarter, endOfDay } from 'date-fns';

import type { DashboardFilters, DashboardPeriod } from '../types/leadershipDashboard.types';

/**
 * Calculate start and end dates based on filter period settings
 */
export function getPeriodDates(filters: DashboardFilters): { start: Date; end: Date } {
  const now = new Date();
  const end = endOfDay(now);

  switch (filters.period) {
    case '7d':
      return { start: startOfDay(subDays(now, 7)), end };
    case '14d':
      return { start: startOfDay(subDays(now, 14)), end };
    case '30d':
      return { start: startOfDay(subDays(now, 30)), end };
    case 'quarter':
      return { start: startOfQuarter(now), end };
    case 'custom':
      return {
        start: filters.periodStart ?? startOfDay(subDays(now, 14)),
        end: filters.periodEnd ?? end,
      };
    case 'all':
    default:
      // Use a very old date for "all time"
      return { start: new Date('2020-01-01'), end };
  }
}

/**
 * Format period option to human-readable label
 */
export function formatPeriodLabel(period: DashboardPeriod): string {
  switch (period) {
    case '7d':
      return 'Last 7 days';
    case '14d':
      return 'Last 14 days';
    case '30d':
      return 'Last 30 days';
    case 'quarter':
      return 'This quarter';
    case 'all':
      return 'All time';
    case 'custom':
      return 'Custom range';
    default:
      return 'Last 14 days';
  }
}

/**
 * Get the default filters for the dashboard
 */
export function getDefaultFilters(): DashboardFilters {
  return {
    view: 'pipeline',
    period: '14d',
  };
}

/**
 * Parse period from URL string
 */
export function parsePeriod(value: string | null): DashboardPeriod {
  const validPeriods: DashboardPeriod[] = ['7d', '14d', '30d', 'quarter', 'all', 'custom'];
  if (value && validPeriods.includes(value as DashboardPeriod)) {
    return value as DashboardPeriod;
  }
  return '14d';
}

