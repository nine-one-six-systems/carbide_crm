import { Snowflake } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPipelineTypeLabel } from '@/lib/constants';

import type { ColdOpportunity } from '../types/leadershipDashboard.types';

interface ColdOpportunitiesCardProps {
  opportunities: ColdOpportunity[];
  maxItems?: number;
}

/**
 * Card displaying opportunities that haven't had recent activity
 */
export function ColdOpportunitiesCard({
  opportunities,
  maxItems = 5,
}: ColdOpportunitiesCardProps) {
  if (opportunities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Snowflake className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg">Opportunities Going Cold</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {opportunities.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {opportunities.slice(0, maxItems).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="font-medium">{item.entityName}</span>
                <span className="text-xs text-muted-foreground">
                  {getPipelineTypeLabel(item.pipelineType)} · {item.stage} ·{' '}
                  {item.ownerName}
                </span>
              </div>
              <Badge variant="outline" className="text-blue-600">
                {item.daysSinceActivity} days
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

