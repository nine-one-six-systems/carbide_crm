import { useParams } from 'react-router-dom';

import { PageContainer } from '@/components/layout/PageContainer';
import { OrganizationDetail } from '@/features/organizations/components/OrganizationDetail';

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <PageContainer title="Organization Not Found">
        <p>Invalid organization ID</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <OrganizationDetail organizationId={id} />
    </PageContainer>
  );
}

