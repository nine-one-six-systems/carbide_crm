import { PageContainer } from '@/components/layout/PageContainer';
import { ManagerDashboard } from '@/features/dashboard/components/ManagerDashboard';
import { SalespersonDashboard } from '@/features/dashboard/components/SalespersonDashboard';
import { useDashboardView } from '@/features/dashboard/hooks/useDashboardView';

export default function DashboardPage() {
  const { currentView } = useDashboardView();

  // Determine title based on current view
  const title = currentView === 'team' ? 'Team Dashboard' : 'Personal Dashboard';
  const description =
    currentView === 'team'
      ? 'Monitor team performance and task management'
      : 'Your tasks, activities, and quick actions';

  return (
    <PageContainer title={title} description={description}>
      {currentView === 'team' ? <ManagerDashboard /> : <SalespersonDashboard />}
    </PageContainer>
  );
}
