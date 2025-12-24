import { useState } from 'react';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Workflow } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { BusinessRelationship } from '@/types/database';

import { useRelationshipsByStages, useRelationshipMutations } from '../hooks';

import { SortableRelationshipCard } from './SortableRelationshipCard';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

interface PipelineKanbanProps {
  type: string;
  stages: Array<{ value: string; label: string }>;
}

export function PipelineKanban({ type, stages }: PipelineKanbanProps) {
  const stageValues = stages.map((s) => s.value);
  const { data: relationshipsByStage, isLoading } =
    useRelationshipsByStages(type, stageValues);
  const { updateStage } = useRelationshipMutations();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const relationshipId = active.id as string;
    const newStage = over.id as string;

    try {
      await updateStage({
        id: relationshipId,
        stage: newStage,
        metadata: {
          dragged: true,
          changed_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => (
          <Card key={stage.value}>
            <CardHeader>
              <CardTitle>{stage.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const activeRelationship = activeId
    ? Object.values(relationshipsByStage || {})
        .flat()
        .find((r) => r.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const relationships = relationshipsByStage?.[stage.value] || [];

          return (
            <Card key={stage.value} className="min-w-[300px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stage.label}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {relationships.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SortableContext
                  items={relationships.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {relationships.length === 0 ? (
                        <EmptyState
                          icon={Workflow}
                          title="No relationships"
                          description="Drag relationships here"
                          className="py-8"
                        />
                      ) : (
                        relationships.map((relationship) => (
                          <SortableRelationshipCard
                            key={relationship.id}
                            relationship={relationship}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </SortableContext>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <DragOverlay>
        {activeRelationship ? (
          <div className="opacity-50">
            <SortableRelationshipCard relationship={activeRelationship} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

