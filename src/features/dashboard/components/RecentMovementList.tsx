import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Trophy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { getPipelineTypeLabel } from '@/lib/constants';

import type { StageMovement } from '../types/leadershipDashboard.types';

interface RecentMovementListProps {
  movements?: StageMovement[];
  maxItems?: number;
  title?: string;
}

/**
 * Get navigation path for a movement item
 */
function getEntityPath(movement: StageMovement): string {
  // Navigate to relationship detail page
  return `/pipelines/${movement.id}`;
}

/**
 * List of recent stage changes
 */
export function RecentMovementList({ 
  movements = [], 
  maxItems = 5,
  title = 'Recent Movement'
}: RecentMovementListProps) {
  if (movements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">No recent movement</p>
        <p className="text-xs text-muted-foreground mt-1">
          No stage changes in the selected period
        </p>
      </div>
    );
  }

  const displayMovements = movements.slice(0, maxItems);
  const hasMore = movements.length > maxItems;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {hasMore && (
          <span className="text-xs text-muted-foreground">
            {movements.length - maxItems} more
          </span>
        )}
      </div>
      
      <div className="space-y-1.5">
        {displayMovements.map((movement) => {
          const isWin = movement.isWin;
          
          return (
            <Link
              key={movement.id}
              to={getEntityPath(movement)}
              className={`flex items-start gap-2 rounded-md border p-2.5 transition-colors group ${
                isWin
                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                  : 'bg-card hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${
                isWin ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                {isWin ? (
                  <Trophy className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate group-hover:underline ${
                      isWin ? 'text-green-900' : ''
                    }`}>
                      {movement.entityName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          isWin ? 'border-green-300 text-green-700' : ''
                        }`}
                      >
                        {movement.fromStage}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge 
                        variant={isWin ? 'default' : 'outline'}
                        className={`text-xs ${
                          isWin ? 'bg-green-600 text-white' : ''
                        }`}
                      >
                        {movement.toStage}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getPipelineTypeLabel(movement.pipelineType, true)}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 ${
                    isWin ? 'text-green-600' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${
                    isWin ? 'text-green-700' : 'text-muted-foreground'
                  }`}>
                    {formatDistanceToNow(movement.movedAt, { addSuffix: true })}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {movement.ownerName}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

