import { Badge } from '@/components/ui/badge';
import { getVentureLabel } from '@/lib/constants';

import type { VentureCount } from '../types/leadershipDashboard.types';

interface PipelineBreakdownBadgesProps {
  ventures?: VentureCount[];
  maxVisible?: number;
}

/**
 * Color mapping for ventures
 */
const VENTURE_COLORS: Record<string, string> = {
  'forge': 'bg-blue-100 text-blue-700 border-blue-200',
  'hearth': 'bg-red-100 text-red-700 border-red-200',
  'anvil': 'bg-gray-100 text-gray-700 border-gray-200',
  'crucible': 'bg-purple-100 text-purple-700 border-purple-200',
  'foundry': 'bg-green-100 text-green-700 border-green-200',
  'carbide': 'bg-orange-100 text-orange-700 border-orange-200',
  'lucepta': 'bg-pink-100 text-pink-700 border-pink-200',
  'meridian_44': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'trade_stone_group': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'default': 'bg-muted text-muted-foreground border-border',
};

/**
 * Get color classes for a venture
 */
function getVentureColorClasses(venture: string): string {
  return VENTURE_COLORS[venture.toLowerCase()] || VENTURE_COLORS.default;
}

/**
 * Mini badges showing venture distribution within a pipeline
 */
export function PipelineBreakdownBadges({ 
  ventures = [], 
  maxVisible = 3 
}: PipelineBreakdownBadgesProps) {
  if (ventures.length === 0) {
    return null;
  }

  const visibleVentures = ventures.slice(0, maxVisible);
  const remainingCount = Math.max(0, ventures.length - maxVisible);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visibleVentures.map((venture) => {
        const ventureKey = typeof venture.venture === 'string' ? venture.venture : venture.venture;
        return (
          <Badge
            key={ventureKey}
            variant="outline"
            className={`text-xs ${getVentureColorClasses(ventureKey)}`}
          >
            {getVentureLabel(ventureKey as any)}: {venture.count}
          </Badge>
        );
      })}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}

