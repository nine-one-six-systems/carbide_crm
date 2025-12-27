import { useState } from 'react';

import { Calendar, ChevronDown, ChevronRight, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PHASE_STATUS_LABELS, type Phase } from '../types/project.types';

import { MilestoneItem } from './MilestoneItem';

interface PhaseItemProps {
  phase: Phase;
  onMilestoneToggle: (milestoneId: string, completed: boolean) => void;
  onAddMilestone?: () => void;
  disabled?: boolean;
}

export function PhaseItem({
  phase,
  onMilestoneToggle,
  onAddMilestone,
  disabled,
}: PhaseItemProps) {
  const [isOpen, setIsOpen] = useState(phase.status === 'in_progress');

  const statusColors: Record<string, string> = {
    not_started: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{phase.name}</h3>
                  <Badge className={cn('text-xs', statusColors[phase.status])}>
                    {PHASE_STATUS_LABELS[phase.status]}
                  </Badge>
                </div>
                {phase.description && (
                  <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                )}
                {(phase.startDate || phase.targetDate) && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {phase.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Start: {new Date(phase.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {phase.targetDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Target: {new Date(phase.targetDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
                {phase.milestones && phase.milestones.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {phase.milestones.filter((m) => m.completed).length}/
                    {phase.milestones.length} milestones complete
                  </div>
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 border-t">
            {phase.milestones && phase.milestones.length > 0 ? (
              <div className="mt-3 space-y-1">
                {phase.milestones.map((milestone) => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    onToggle={onMilestoneToggle}
                    disabled={disabled}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-muted-foreground">
                No milestones yet
              </div>
            )}
            {onAddMilestone && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMilestone();
                }}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

