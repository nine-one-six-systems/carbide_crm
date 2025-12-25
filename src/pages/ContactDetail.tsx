import { useParams } from 'react-router-dom';

import { PageContainer } from '@/components/layout/PageContainer';
import { ContactDetail } from '@/features/contacts/components/ContactDetail';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <PageContainer title="Contact Not Found">
        <p>Invalid contact ID</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer fullWidth>
      <ContactDetail contactId={id} />
    </PageContainer>
  );
}

