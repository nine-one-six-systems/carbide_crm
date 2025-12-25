import { BarChart3, User, Users } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type DashboardType = 'personal' | 'team' | 'leadership';

const DASHBOARD_STORAGE_KEY = 'carbide-dashboard-preference';

interface DashboardSelectorProps {
  className?: string;
}

/**
 * Global dashboard selector for switching between Personal, Team, and Leadership views.
 * Displays in the header on dashboard routes.
 */
export function DashboardSelector({ className }: DashboardSelectorProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determine current dashboard type from route
  const getCurrentDashboard = (): DashboardType => {
    if (location.pathname === '/leadership') {
      return 'leadership';
    }
    const viewParam = searchParams.get('view');
    if (viewParam === 'team') {
      return 'team';
    }
    return 'personal';
  };

  const currentDashboard = getCurrentDashboard();

  const handleDashboardChange = (value: string) => {
    if (!value) return;

    const dashboardType = value as DashboardType;

    // Persist preference to localStorage
    localStorage.setItem(DASHBOARD_STORAGE_KEY, dashboardType);

    // Navigate to the appropriate route
    switch (dashboardType) {
      case 'personal':
        navigate('/dashboard?view=personal');
        break;
      case 'team':
        navigate('/dashboard?view=team');
        break;
      case 'leadership':
        navigate('/leadership');
        break;
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={currentDashboard}
      onValueChange={handleDashboardChange}
      aria-label="Select dashboard view"
      className={className}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem
            value="personal"
            aria-label="Personal dashboard"
            className="gap-1.5 px-3"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline text-sm">Personal</span>
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Your tasks, activities & quick actions</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem
            value="team"
            aria-label="Team dashboard"
            className="gap-1.5 px-3"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline text-sm">Team</span>
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Team health & member stats</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem
            value="leadership"
            aria-label="Leadership dashboard"
            className="gap-1.5 px-3"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline text-sm">Leadership</span>
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Cross-venture business overview</p>
        </TooltipContent>
      </Tooltip>
    </ToggleGroup>
  );
}

