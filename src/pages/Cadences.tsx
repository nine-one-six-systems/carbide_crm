import { useState } from 'react';

import { Plus } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CadenceBuilder } from '@/features/cadences/components/CadenceBuilder';
import { CadenceList } from '@/features/cadences/components/CadenceList';

export default function CadencesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <PageContainer
      title="Cadences"
      description="Manage cadence templates for automated task sequences"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Cadence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Cadence</DialogTitle>
              <DialogDescription>
                Build a new cadence template to automate your outreach workflow.
              </DialogDescription>
            </DialogHeader>
            <CadenceBuilder
              onSuccess={() => {
                setDialogOpen(false);
              }}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      }
    >
      <CadenceList />
    </PageContainer>
  );
}
