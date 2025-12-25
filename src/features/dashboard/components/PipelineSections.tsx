import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPipelineTypeLabel } from '@/lib/constants';

import type { PipelineSummary } from '../types/leadershipDashboard.types';

interface PipelineSectionsProps {
  pipelines: PipelineSummary[];
}

/**
 * Pipeline sections displaying stage distribution for each pipeline type
 */
export function PipelineSections({ pipelines }: PipelineSectionsProps) {
  if (pipelines.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-muted-foreground text-center">
          No active opportunities in the selected time period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pipelines.map((pipeline) => (
        <Card key={pipeline.type}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {getPipelineTypeLabel(pipeline.type)}
              </CardTitle>
              <Badge>{pipeline.activeCount} active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pipeline.stageDistribution.map((stage) => (
                <Badge key={stage.stage} variant="outline">
                  {stage.stage}: {stage.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

