import { LayoutGrid, Building2 } from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import type { DashboardView } from '../types/leadershipDashboard.types';

interface DashboardViewToggleProps {
  view: DashboardView;
  onChange: (view: DashboardView) => void;
}

/**
 * Toggle component for switching between Pipeline and Venture views
 */
export function DashboardViewToggle({ view, onChange }: DashboardViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value) => value && onChange(value as DashboardView)}
      aria-label="Dashboard view"
      className="border rounded-lg"
    >
      <ToggleGroupItem
        value="pipeline"
        aria-label="View by pipeline"
        className="gap-2 px-3"
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">By Pipeline</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="venture"
        aria-label="View by venture"
        className="gap-2 px-3"
      >
        <Building2 className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">By Venture</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

