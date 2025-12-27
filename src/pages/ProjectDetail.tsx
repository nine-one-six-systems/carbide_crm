import { useParams } from 'react-router-dom';

import { PageContainer } from '@/components/layout/PageContainer';
import { ProjectDetail } from '@/features/projects/components/ProjectDetail';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <PageContainer title="Project Not Found">
        <p>Invalid project ID</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer fullWidth>
      <ProjectDetail projectId={id} />
    </PageContainer>
  );
}

