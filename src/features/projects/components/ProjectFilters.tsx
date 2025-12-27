import { Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Venture } from '@/types/database';
import {
  PROJECT_CATEGORY_LABELS,
  PROJECT_HEALTH_LABELS,
  PROJECT_SCOPE_LABELS,
  PROJECT_STATUS_LABELS,
  type ProjectFilters as ProjectFiltersType,
} from '../types/project.types';

interface ProjectFiltersProps {
  filters: ProjectFiltersType;
  onFiltersChange: (filters: Partial<ProjectFiltersType>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const VENTURES: Array<{ value: Venture; label: string }> = [
  { value: 'forge', label: 'Forge' },
  { value: 'hearth', label: 'Hearth' },
  { value: 'anvil', label: 'Anvil' },
  { value: 'crucible', label: 'Crucible' },
  { value: 'foundry', label: 'Foundry' },
  { value: 'carbide', label: 'Carbide' },
  { value: 'lucepta', label: 'Lucepta' },
  { value: 'meridian_44', label: 'Meridian 44' },
  { value: 'trade_stone_group', label: 'Trade Stone Group' },
];

export function ProjectFilters({
  filters,
  onFiltersChange,
  onReset,
  hasActiveFilters,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Scope Filter */}
      <Select
        value={filters.scope || 'all'}
        onValueChange={(value) =>
          onFiltersChange({ scope: value === 'all' ? undefined : (value as ProjectFiltersType['scope']) })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Scope" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Scopes</SelectItem>
          {Object.entries(PROJECT_SCOPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={filters.category || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            category: value === 'all' ? undefined : (value as ProjectFiltersType['category']),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {Object.entries(PROJECT_CATEGORY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            status: value === 'all' ? undefined : (value as ProjectFiltersType['status']),
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Health Filter */}
      <Select
        value={filters.health || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            health: value === 'all' ? undefined : (value as ProjectFiltersType['health']),
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Health" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Health</SelectItem>
          {Object.entries(PROJECT_HEALTH_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Venture Filter */}
      <Select
        value={filters.venture || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            venture: value === 'all' ? undefined : (value as Venture),
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Venture" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ventures</SelectItem>
          {VENTURES.map((venture) => (
            <SelectItem key={venture.value} value={venture.value}>
              {venture.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Filters Button */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onReset}>
          <X className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      )}
    </div>
  );
}

