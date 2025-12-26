import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { getPipelineTypeLabel } from '@/lib/constants';

import { AttentionList } from './AttentionList';
import { PipelineBreakdownBadges } from './PipelineBreakdownBadges';
import { RecentMovementList } from './RecentMovementList';
import { StageDistributionBar } from './StageDistributionBar';

import type { PipelineSummary, BusinessRelationshipType } from '../types/leadershipDashboard.types';

interface PipelineSectionProps {
  type: BusinessRelationshipType;
  data?: PipelineSummary;
  isLoading: boolean;
  defaultExpanded?: boolean;
}

/**
 * Collapsible section for each pipeline type
 */
export function PipelineSection({
  type,
  data,
  isLoading,
  defaultExpanded = false,
}: PipelineSectionProps) {
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
        <div className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent">
          {/* Left: Chevron + Pipeline label + badges */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="font-semibold text-sm sm:text-base truncate">
              {getPipelineTypeLabel(type)}
            </span>
            <Badge variant="secondary" className="shrink-0">
              {activeCount} active
            </Badge>
            {hasAttention && (
              <Badge variant="destructive" className="shrink-0">
                Needs attention
              </Badge>
            )}
          </div>
          
          {/* Right: Venture breakdown badges */}
          <div className="ml-4 shrink-0">
            <PipelineBreakdownBadges ventures={data.ventureBreakdown} />
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="rounded-b-lg border-x border-b bg-card p-4 pt-4 space-y-4">
          {/* Stage distribution bar */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Stage Distribution
            </h4>
            <StageDistributionBar stages={data.stageDistribution} type={type} />
          </div>
          
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

