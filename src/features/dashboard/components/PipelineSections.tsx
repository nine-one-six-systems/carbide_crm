import { PIPELINE_DISPLAY_ORDER } from '@/lib/constants';

import { PipelineSection } from './PipelineSection';

import type { PipelineSummary } from '../types/leadershipDashboard.types';

interface PipelineSectionsProps {
  pipelines: PipelineSummary[];
  isLoading?: boolean;
}

/**
 * Pipeline sections displaying stage distribution for each pipeline type
 * Uses collapsible sections with full feature integration
 */
export function PipelineSections({ pipelines, isLoading = false }: PipelineSectionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <PipelineSection
            key={i}
            type="b2b_client"
            isLoading={true}
          />
        ))}
      </div>
    );
  }

  if (pipelines.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-muted-foreground text-center">
          No active opportunities in the selected time period.
        </p>
      </div>
    );
  }

  // Sort pipelines by display order
  const sortedPipelines = [...pipelines].sort((a, b) => {
    const aIndex = PIPELINE_DISPLAY_ORDER.indexOf(a.type);
    const bIndex = PIPELINE_DISPLAY_ORDER.indexOf(b.type);
    // If not in display order, put at end
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="space-y-4">
      {sortedPipelines.map((pipeline) => (
        <PipelineSection
          key={pipeline.type}
          type={pipeline.type}
          data={pipeline}
          isLoading={false}
          defaultExpanded={pipeline.attentionItems.length > 0}
        />
      ))}
    </div>
  );
}

