import { Calendar, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Milestone } from '../types/project.types';

interface MilestoneItemProps {
  milestone: Milestone;
  onToggle: (milestoneId: string, completed: boolean) => void;
  disabled?: boolean;
}

export function MilestoneItem({ milestone, onToggle, disabled }: MilestoneItemProps) {
  const handleToggle = () => {
    if (!disabled) {
      onToggle(milestone.id, !milestone.completed);
    }
  };

  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={milestone.completed}
        onCheckedChange={handleToggle}
        disabled={disabled}
        className="mt-0.5"
        aria-label={`Mark "${milestone.name}" as ${milestone.completed ? 'incomplete' : 'complete'}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn('text-sm', {
              'line-through text-muted-foreground': milestone.completed,
              'font-medium': !milestone.completed,
            })}
          >
            {milestone.name}
          </span>
          {milestone.completed && milestone.completedAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(milestone.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {milestone.description && (
          <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
        )}
        {milestone.targetDate && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

