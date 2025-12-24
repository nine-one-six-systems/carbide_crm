import { PageContainer } from '@/components/layout/PageContainer';
import { BatchTaskView } from '@/features/tasks/components/BatchTaskView';

export default function BatchTasksPage() {
  return (
    <PageContainer
      title="Batch Tasks"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Batch Tasks' },
      ]}
    >
      <BatchTaskView />
    </PageContainer>
  );
}

