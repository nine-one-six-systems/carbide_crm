import { useState } from 'react';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { BusinessRelationshipFormValues } from '@/lib/validators/relationship';

import { useRelationshipMutations } from '../hooks/useRelationshipMutations';

import { RelationshipForm } from './RelationshipForm';




interface CreateRelationshipDialogProps {
  defaultContactId?: string;
  defaultOrganizationId?: string;
  trigger?: React.ReactNode;
}

export function CreateRelationshipDialog({
  defaultContactId,
  defaultOrganizationId,
  trigger,
}: CreateRelationshipDialogProps) {
  const [open, setOpen] = useState(false);
  const { create } = useRelationshipMutations();

  const handleSubmit = async (data: BusinessRelationshipFormValues) => {
    try {
      await create({
        type: data.type,
        contact_id: data.contact_id || undefined,
        organization_id: data.organization_id || undefined,
        stage: data.stage,
        ventures: data.ventures,
        owner_id: data.owner_id,
        attributes: data.attributes,
      });
      toast.success('Relationship created successfully');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to create relationship');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Relationship
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Business Relationship</DialogTitle>
        </DialogHeader>
        <RelationshipForm
          defaultValues={{
            contact_id: defaultContactId,
            organization_id: defaultOrganizationId,
          }}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={create.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

