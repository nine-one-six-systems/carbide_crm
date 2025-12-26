import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { getVentureLabel, getPipelineTypeLabel } from '@/lib/constants';

import { AttentionList } from './AttentionList';
import { RecentMovementList } from './RecentMovementList';

import type { VentureSummary, Venture } from '../types/leadershipDashboard.types';

interface VentureSectionProps {
  venture: Venture;
  data?: VentureSummary;
  isLoading: boolean;
  defaultExpanded?: boolean;
}

/**
 * Color mapping for ventures (matching PipelineBreakdownBadges)
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

function getVentureColorClasses(venture: Venture): string {
  return VENTURE_COLORS[venture] || VENTURE_COLORS.default;
}

/**
 * Collapsible section for each venture (venture-centric view)
 */
export function VentureSection({
  venture,
  data,
  isLoading,
  defaultExpanded = false,
}: VentureSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  
  const hasAttention = (data?.attentionItems?.length ?? 0) > 0;
  const activeCount = data?.activeCount ?? 0;

  // Auto-expand if has attention items
  useEffect(() => {
    if (hasAttention && !isOpen) {
      setIsOpen(true);
    }
  }, [hasAttention, isOpen]);

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse bg-muted rounded" />
          <div className="h-6 w-16 animate-pulse bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!data || activeCount === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={`flex items-center justify-between rounded-lg border p-4 transition-colors hover:opacity-90 ${
          getVentureColorClasses(venture)
        }`}>
          {/* Left: Chevron + Venture label + badges */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            <span className="font-semibold text-sm sm:text-base truncate">
              {getVentureLabel(venture)}
            </span>
            <Badge variant="secondary" className="shrink-0 bg-white/50">
              {activeCount} active
            </Badge>
            {hasAttention && (
              <Badge variant="destructive" className="shrink-0">
                Needs attention
              </Badge>
            )}
          </div>
          
          {/* Right: Pipeline breakdown badges */}
          <div className="ml-4 shrink-0 flex items-center gap-1.5 flex-wrap">
            {data.pipelineBreakdown.slice(0, 3).map((pipeline) => (
              <Badge key={pipeline.type} variant="outline" className="text-xs bg-white/50">
                {getPipelineTypeLabel(pipeline.type, true)}: {pipeline.count}
              </Badge>
            ))}
            {data.pipelineBreakdown.length > 3 && (
              <Badge variant="outline" className="text-xs bg-white/50">
                +{data.pipelineBreakdown.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="rounded-b-lg border-x border-b bg-card p-4 pt-4 space-y-4">
          {/* Pipeline breakdown */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Pipeline Breakdown
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.pipelineBreakdown.map((pipeline) => (
                <Badge key={pipeline.type} variant="outline" className="text-sm">
                  {getPipelineTypeLabel(pipeline.type)}: {pipeline.count}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stage distribution (simplified) */}
          {data.stageDistribution.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Stage Distribution
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.stageDistribution.map((stage) => (
                  <Badge key={stage.category} variant="outline" className="text-sm">
                    {stage.category}: {stage.count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Two-column layout: Recent movements + Attention items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <RecentMovementList 
                movements={data.recentMovements} 
                maxItems={5}
              />
            </div>
            <div>
              <AttentionList 
                items={data.attentionItems} 
                maxItems={5}
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

