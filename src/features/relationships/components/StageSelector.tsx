import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BusinessRelationship } from '@/types/database';

import { useRelationshipMutations } from '../hooks/useRelationshipMutations';

interface StageSelectorProps {
  relationship: BusinessRelationship;
  stages: Array<{ value: string; label: string }>;
  onStageChange?: (stage: string) => void;
}

export function StageSelector({
  relationship,
  stages,
  onStageChange,
}: StageSelectorProps) {
  const { updateStage } = useRelationshipMutations();

  const handleChange = async (newStage: string) => {
    try {
      await updateStage({
        id: relationship.id,
        stage: newStage,
        metadata: {
          previous_stage: relationship.stage,
          changed_at: new Date().toISOString(),
        },
      });
      onStageChange?.(newStage);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  return (
    <Select value={relationship.stage} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {stages.map((stage) => (
          <SelectItem key={stage.value} value={stage.value}>
            {stage.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

