import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getPipelineTypeLabel } from '@/lib/constants';

import type { StageCount, BusinessRelationshipType } from '../types/leadershipDashboard.types';

interface StageDistributionBarProps {
  stages?: StageCount[];
  type: BusinessRelationshipType;
}

/**
 * Color mapping for stages
 * These colors are consistent across the dashboard
 */
const STAGE_COLORS: Record<string, string> = {
  // Early stages
  'Lead': 'bg-blue-500',
  'Qualified': 'bg-cyan-500',
  'Discovery': 'bg-teal-500',
  'Initial Contact': 'bg-sky-500',
  
  // Mid stages
  'Proposal': 'bg-yellow-500',
  'Negotiation': 'bg-orange-500',
  'Evaluation': 'bg-amber-500',
  'Due Diligence': 'bg-yellow-600',
  
  // Late stages
  'Commitment': 'bg-emerald-500',
  'Closing': 'bg-green-600',
  
  // Terminal/Win stages
  'Won': 'bg-green-500',
  'Closed': 'bg-green-600',
  'Invested': 'bg-emerald-600',
  'Committed': 'bg-green-700',
  'Active Partnership': 'bg-teal-600',
  'Active': 'bg-emerald-600',
  'Active Contributor': 'bg-teal-600',
  
  // Default fallback
  'default': 'bg-gray-400',
};

/**
 * Get color for a stage, with fallback
 */
function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || STAGE_COLORS.default;
}

/**
 * Horizontal bar showing stage distribution with colored segments
 */
export function StageDistributionBar({ stages = [], type }: StageDistributionBarProps) {
  if (stages.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        No stage data available for {getPipelineTypeLabel(type)}
      </div>
    );
  }

  const total = stages.reduce((sum, stage) => sum + stage.count, 0);
  
  if (total === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        No active opportunities in this pipeline
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bar visualization */}
      <div className="flex h-8 w-full overflow-hidden rounded-md border">
        {stages.map((stage, index) => {
          const percentage = (stage.count / total) * 100;
          const minWidth = stage.count > 0 ? 2 : 0; // Minimum 2px width for visibility
          const width = Math.max(percentage, minWidth);
          
          return (
            <TooltipProvider key={`${stage.stage}-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`${getStageColor(stage.stage)} transition-opacity hover:opacity-80`}
                    style={{ width: `${width}%` }}
                    aria-label={`${stage.stage}: ${stage.count} opportunities`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{stage.stage}</p>
                  <p className="text-sm text-muted-foreground">
                    {stage.count} {stage.count === 1 ? 'opportunity' : 'opportunities'} ({percentage.toFixed(1)}%)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {stages.map((stage, index) => (
          <div key={`${stage.stage}-${index}`} className="flex items-center gap-1.5">
            <div
              className={`h-3 w-3 rounded ${getStageColor(stage.stage)}`}
              aria-hidden="true"
            />
            <span className="font-medium">{stage.stage}</span>
            <span className="text-muted-foreground">({stage.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

