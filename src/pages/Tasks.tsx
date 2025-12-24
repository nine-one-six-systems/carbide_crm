import { useState } from 'react';

import { Plus } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskForm } from '@/features/tasks/components/TaskForm';
import { TaskList } from '@/features/tasks/components/TaskList';

export default function TasksPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');

  return (
    <PageContainer
      title="Tasks"
      description="Manage your tasks and track progress"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              onSuccess={() => {
                setDialogOpen(false);
              }}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      }
    >
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'pending' | 'all')}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <TaskList
            searchParams={{ status: ['pending'] }}
            showActions={true}
          />
        </TabsContent>
        <TabsContent value="all">
          <TaskList showActions={true} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
