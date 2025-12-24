import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ManagerDashboard } from '@/features/dashboard/components/ManagerDashboard';
import { SalespersonDashboard } from '@/features/dashboard/components/SalespersonDashboard';

export default function DashboardPage() {
  const { profile } = useAuth();
  const isManager = profile?.role === 'manager' || profile?.role === 'admin';

  return (
    <PageContainer title="Dashboard" description="Welcome to Carbide CRM">
      {isManager ? <ManagerDashboard /> : <SalespersonDashboard />}
    </PageContainer>
  );
}

