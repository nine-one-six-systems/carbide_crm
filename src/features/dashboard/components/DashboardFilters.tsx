import { Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActiveVentures } from '@/features/ventures/hooks/useVentures';

import { formatPeriodLabel } from '../utils/periodUtils';

import type {
  DashboardFilters as Filters,
  DashboardPeriod,
} from '../types/leadershipDashboard.types';

interface DashboardFiltersProps {
  filters: Filters;
  onChange: (updates: Partial<Filters>) => void;
  onReset: () => void;
  hideVentureFilter?: boolean;
  hidePipelineFilter?: boolean;
}

const PERIODS: DashboardPeriod[] = ['7d', '14d', '30d', 'quarter', 'all'];

/**
 * Filter controls for the Leadership Dashboard
 */
export function DashboardFilters({
  filters,
  onChange,
  onReset,
  hideVentureFilter,
}: DashboardFiltersProps) {
  const { data: ventures } = useActiveVentures();
  const hasFilters = filters.venture || filters.ownerId || filters.pipelineType;

  return (
    <div className="flex items-center gap-2">
      {/* Period selector - always visible */}
      <Select
        value={filters.period}
        onValueChange={(value) => onChange({ period: value as DashboardPeriod })}
      >
        <SelectTrigger className="w-[140px]" aria-label="Time period">
          <SelectValue placeholder="Time period" />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((period) => (
            <SelectItem key={period} value={period}>
              {formatPeriodLabel(period)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Additional filters popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {
                  [filters.venture, filters.ownerId, filters.pipelineType].filter(
                    Boolean
                  ).length
                }
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium">Filter Dashboard</h4>

            {!hideVentureFilter && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Venture</label>
                <Select
                  value={filters.venture ?? 'all'}
                  onValueChange={(value) =>
                    onChange({
                      venture:
                        value === 'all'
                          ? undefined
                          : (value as Filters['venture']),
                    })
                  }
                >
                  <SelectTrigger aria-label="Filter by venture">
                    <SelectValue placeholder="All ventures" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ventures</SelectItem>
                    {ventures?.map((venture) => (
                      <SelectItem key={venture.slug} value={venture.slug}>
                        {venture.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="w-full gap-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

