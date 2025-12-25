import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useContacts } from '@/features/contacts/hooks/useContacts';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useContactNavigation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: contactsData } = useContacts({ page: 1, pageSize: 1000 });

  const contacts = contactsData?.data || [];
  const currentIndex = contacts.findIndex((c) => c.id === id);

  const navigateToContact = (index: number) => {
    if (index >= 0 && index < contacts.length) {
      navigate(`/contacts/${contacts[index].id}`);
    }
  };

  useKeyboardShortcut({ key: 'ArrowLeft' }, () => {
    if (currentIndex > 0) {
      navigateToContact(currentIndex - 1);
    }
  });

  useKeyboardShortcut({ key: 'ArrowRight' }, () => {
    if (currentIndex >= 0 && currentIndex < contacts.length - 1) {
      navigateToContact(currentIndex + 1);
    }
  });

  return {
    currentIndex,
    totalContacts: contacts.length,
    hasPrevious: currentIndex > 0,
    hasNext: currentIndex >= 0 && currentIndex < contacts.length - 1,
    navigateToPrevious: () => navigateToContact(currentIndex - 1),
    navigateToNext: () => navigateToContact(currentIndex + 1),
  };
}

