import { AlertTriangle, Snowflake, CheckCircle2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { getPipelineTypeLabel } from '@/lib/constants';

import type { OpportunityAttentionItem } from '../types/leadershipDashboard.types';

interface AttentionListProps {
  items?: OpportunityAttentionItem[];
  maxItems?: number;
  title?: string;
}

/**
 * Get the primary attention icon based on reasons
 */
function getAttentionIcon(reasons?: Array<{ type: string }>) {
  if (!reasons || reasons.length === 0) return null;
  
  const primaryReason = reasons[0].type;
  if (primaryReason === 'ice_cold' || primaryReason === 'cold') {
    return <Snowflake className="h-4 w-4 text-blue-500" />;
  }
  if (primaryReason === 'very_stuck' || primaryReason === 'stuck') {
    return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  }
  return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
}

/**
 * Get attention label text
 */
function getAttentionLabel(reasons?: Array<{ type: string; days: number }>) {
  if (!reasons || reasons.length === 0) return '';
  
  const primaryReason = reasons[0];
  switch (primaryReason.type) {
    case 'ice_cold':
      return `${primaryReason.days} days cold`;
    case 'cold':
      return `${primaryReason.days} days cold`;
    case 'very_stuck':
      return `${primaryReason.days} days stuck`;
    case 'stuck':
      return `${primaryReason.days} days stuck`;
    default:
      return 'Needs attention';
  }
}

/**
 * Get navigation path for an attention item
 */
function getEntityPath(item: OpportunityAttentionItem): string {
  // Navigate to relationship detail page
  return `/pipelines/${item.id}`;
}

/**
 * List of opportunities needing attention (stuck or cold)
 */
export function AttentionList({ 
  items = [], 
  maxItems = 5,
  title = 'Needs Attention'
}: AttentionListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground">No items need attention</p>
        <p className="text-xs text-muted-foreground mt-1">All opportunities are active</p>
      </div>
    );
  }

  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {hasMore && (
          <span className="text-xs text-muted-foreground">
            {items.length - maxItems} more
          </span>
        )}
      </div>
      
      <div className="space-y-1.5">
        {displayItems.map((item) => {
          const icon = getAttentionIcon(item.attentionReasons);
          const label = getAttentionLabel(item.attentionReasons);
          
          return (
            <Link
              key={item.id}
              to={getEntityPath(item)}
              className="flex items-start gap-2 rounded-md border bg-card p-2.5 transition-colors hover:bg-accent hover:text-accent-foreground group"
            >
              <div className="mt-0.5 shrink-0">
                {icon || <AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:underline">
                      {item.entityName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {item.stage}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getPipelineTypeLabel(item.pipelineType, true)}
                      </span>
                      {label && (
                        <span className="text-xs font-medium text-orange-600">
                          {label}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Owner: {item.ownerName}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

