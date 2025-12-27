import { Calendar, Globe, FileText } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { Venture } from '../types/venture.types';
import { VentureTeamList } from './VentureTeamList';
import { VentureOrganizations } from './VentureOrganizations';

interface VentureInfoSidebarProps {
  venture: Venture;
}

export function VentureInfoSidebar({ venture }: VentureInfoSidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Description */}
        {venture.description && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              About
            </h3>
            <p className="text-sm">{venture.description}</p>
          </div>
        )}

        {/* Details */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Details</h3>
          <div className="space-y-2 text-sm">
            {venture.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={venture.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {venture.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {venture.founded_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Founded{' '}
                  {new Date(venture.founded_date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Team Members */}
        <VentureTeamList ventureId={venture.id} />

        <Separator />

        {/* Organizations */}
        <VentureOrganizations ventureId={venture.id} />
      </div>
    </ScrollArea>
  );
}

