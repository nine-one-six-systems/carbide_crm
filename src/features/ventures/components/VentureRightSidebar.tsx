import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { Venture } from '../types/venture.types';
import { VenturePipelineSummary } from './VenturePipelineSummary';

interface VentureRightSidebarProps {
  venture: Venture;
}

export function VentureRightSidebar({ venture }: VentureRightSidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <VenturePipelineSummary ventureSlug={venture.slug} />

        <Separator />

        {/* Additional sections can be added here */}
        {/* - Needs Attention */}
        {/* - Recent Wins */}
        {/* - Quick Actions */}
      </div>
    </ScrollArea>
  );
}

