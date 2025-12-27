import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getPipelineTypeLabel } from '@/lib/constants';

import { useVenturePipelineBreakdown, useVentureStats } from '../hooks/useVentureStats';

interface VenturePipelineSummaryProps {
  ventureSlug: string;
}

export function VenturePipelineSummary({ ventureSlug }: VenturePipelineSummaryProps) {
  const { data: breakdown, isLoading: breakdownLoading } = useVenturePipelineBreakdown(ventureSlug);
  const { data: stats, isLoading: statsLoading } = useVentureStats(ventureSlug);

  const isLoading = breakdownLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const totalActive = stats?.relationship_count || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Pipeline Summary
        </h3>
        <span className="text-sm font-medium">{totalActive} active</span>
      </div>

      <div className="space-y-2">
        {breakdown?.map((item) => (
          <div key={item.pipeline_type} className="flex items-center justify-between text-sm">
            <span>{getPipelineTypeLabel(item.pipeline_type as any)}</span>
            <span className="font-medium">{item.count}</span>
          </div>
        ))}

        {(!breakdown || breakdown.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No active relationships
          </p>
        )}
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link to={`/leadership?venture=${ventureSlug}`}>
          View in Leadership Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

