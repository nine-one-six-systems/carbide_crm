import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Phase, Milestone } from '../types/project.types';

import { PhaseItem } from './PhaseItem';

interface PhaseListProps {
  phases: Phase[];
  onMilestoneToggle: (milestoneId: string, completed: boolean) => void;
  onAddPhase?: () => void;
  onAddMilestone?: (phaseId: string) => void;
  disabled?: boolean;
}

export function PhaseList({
  phases,
  onMilestoneToggle,
  onAddPhase,
  onAddMilestone,
  disabled,
}: PhaseListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Phases & Milestones</h2>
        {onAddPhase && (
          <Button variant="outline" size="sm" onClick={onAddPhase} disabled={disabled}>
            <Plus className="h-4 w-4 mr-2" />
            Add Phase
          </Button>
        )}
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No phases yet. Add your first phase to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {phases.map((phase) => (
            <PhaseItem
              key={phase.id}
              phase={phase}
              onMilestoneToggle={onMilestoneToggle}
              onAddMilestone={onAddMilestone ? () => onAddMilestone(phase.id) : undefined}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

