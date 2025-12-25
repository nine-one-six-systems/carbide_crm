import { TrendingUp, AlertTriangle, Snowflake, Activity } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import type { LeadershipSummary } from '../types/leadershipDashboard.types';

interface DashboardSummaryCardsProps {
  summary?: LeadershipSummary;
  isLoading: boolean;
}

const CARDS = [
  {
    key: 'activeCount' as const,
    label: 'Active',
    icon: Activity,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    key: 'advancedCount' as const,
    label: 'Advanced',
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    key: 'stuckCount' as const,
    label: 'Stuck (30+ days)',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    key: 'coldCount' as const,
    label: 'Going Cold',
    icon: Snowflake,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
];

/**
 * Summary KPI cards displaying Active, Advanced, Stuck, and Cold counts
 */
export function DashboardSummaryCards({
  summary,
  isLoading,
}: DashboardSummaryCardsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-4"
      role="region"
      aria-label="Dashboard summary"
    >
      {CARDS.map(({ key, label, icon: Icon, color, bgColor }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <div className={`p-2 rounded-lg ${bgColor}`}>
              <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" role="status" aria-label={`${label}: ${summary?.[key] ?? 0}`}>
                {(summary?.[key] ?? 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

