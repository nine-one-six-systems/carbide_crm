import { useState } from 'react';

import { Filter, Calendar, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { TaskType, TaskStatus } from '@/types/database';

export interface BatchTaskFilters {
  taskType: TaskType | 'all';
  dateRange: 'all' | '7days' | '30days' | 'custom';
  customDateFrom?: string;
  customDateTo?: string;
  showOverdue: boolean;
  showDueToday: boolean;
  showUpcoming: boolean;
  showTriaged: boolean;
  showDismissed: boolean;
  cadenceId?: string;
  assignedTo?: string;
}

interface BatchTaskToolbarProps {
  filters: BatchTaskFilters;
  onFiltersChange: (filters: BatchTaskFilters) => void;
  taskCounts: {
    overdue: number;
    dueToday: number;
    upcoming: number;
    triaged: number;
    dismissed: number;
  };
}

const TASK_TYPES: Array<{ value: TaskType | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'All Types', icon: '📋' },
  { value: 'call', label: 'Call', icon: '📞' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'text', label: 'Text', icon: '💬' },
  { value: 'meeting', label: 'Meeting', icon: '📅' },
  { value: 'send_mailer', label: 'Mailer', icon: '📬' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export function BatchTaskToolbar({
  filters,
  onFiltersChange,
  taskCounts,
}: BatchTaskToolbarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const activeFilterCount = [
    filters.taskType !== 'all',
    filters.dateRange !== 'all',
    !filters.showOverdue,
    !filters.showDueToday,
    !filters.showUpcoming,
    filters.showTriaged,
    filters.showDismissed,
  ].filter(Boolean).length;

  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      setShowDatePicker(true);
    } else {
      onFiltersChange({
        ...filters,
        dateRange: value as BatchTaskFilters['dateRange'],
        customDateFrom: undefined,
        customDateTo: undefined,
      });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      taskType: 'all',
      dateRange: 'all',
      showOverdue: true,
      showDueToday: true,
      showUpcoming: true,
      showTriaged: false,
      showDismissed: false,
      customDateFrom: undefined,
      customDateTo: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Main toolbar row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Task Type Filter */}
        <Select
          value={filters.taskType}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, taskType: value as BatchTaskFilters['taskType'] })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Task Type" />
          </SelectTrigger>
          <SelectContent>
            {TASK_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <span className="flex items-center gap-2">
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7days">Next 7 Days</SelectItem>
            <SelectItem value="30days">Next 30 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {/* Custom Date Range Inputs */}
        {filters.dateRange === 'custom' && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.customDateFrom || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, customDateFrom: e.target.value })
              }
              className="w-36"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={filters.customDateTo || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, customDateTo: e.target.value })
              }
              className="w-36"
            />
          </div>
        )}

        {/* Advanced Filters Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Visibility
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Show Tasks</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-overdue" className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="show-overdue"
                      checked={filters.showOverdue}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, showOverdue: !!checked })
                      }
                    />
                    <span className="flex items-center gap-2">
                      Overdue
                      <Badge variant="destructive" className="text-xs">
                        {taskCounts.overdue}
                      </Badge>
                    </span>
                  </Label>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-today" className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="show-today"
                      checked={filters.showDueToday}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, showDueToday: !!checked })
                      }
                    />
                    <span className="flex items-center gap-2">
                      Due Today
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        {taskCounts.dueToday}
                      </Badge>
                    </span>
                  </Label>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-upcoming" className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="show-upcoming"
                      checked={filters.showUpcoming}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, showUpcoming: !!checked })
                      }
                    />
                    <span className="flex items-center gap-2">
                      Upcoming
                      <Badge variant="secondary" className="text-xs">
                        {taskCounts.upcoming}
                      </Badge>
                    </span>
                  </Label>
                </div>

                <div className="border-t pt-3 mt-3" />

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-triaged" className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="show-triaged"
                      checked={filters.showTriaged}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, showTriaged: !!checked })
                      }
                    />
                    <span className="flex items-center gap-2">
                      Triaged
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        {taskCounts.triaged}
                      </Badge>
                    </span>
                  </Label>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-dismissed" className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="show-dismissed"
                      checked={filters.showDismissed}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, showDismissed: !!checked })
                      }
                    />
                    <span className="flex items-center gap-2">
                      Dismissed
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                        {taskCounts.dismissed}
                      </Badge>
                    </span>
                  </Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {filters.showOverdue && taskCounts.overdue > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            {taskCounts.overdue} overdue
          </span>
        )}
        {filters.showDueToday && taskCounts.dueToday > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
            {taskCounts.dueToday} due today
          </span>
        )}
        {filters.showUpcoming && taskCounts.upcoming > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            {taskCounts.upcoming} upcoming
          </span>
        )}
      </div>
    </div>
  );
}

