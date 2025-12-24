import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { BusinessRelationship } from '@/types/database';

import { RelationshipCard } from './RelationshipCard';

interface SortableRelationshipCardProps {
  relationship: BusinessRelationship;
}

export function SortableRelationshipCard({
  relationship,
}: SortableRelationshipCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: relationship.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <RelationshipCard relationship={relationship} />
    </div>
  );
}

