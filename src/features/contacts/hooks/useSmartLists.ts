import { useMemo } from 'react';

import { useContacts } from './useContacts';
import { predefinedSmartLists, type SmartList } from '../types/smartLists';
import { useUIStore } from '@/stores/uiStore';

export function useSmartLists() {
  const { savedFilters } = useUIStore();

  // Get saved filters for contacts page
  const savedContactFilters = useMemo(() => {
    return savedFilters
      .filter((f) => f.page === 'contacts')
      .map((f) => ({
        id: f.id,
        name: f.name,
        filters: f.filters as SmartList['filters'],
        isPredefined: false,
      }));
  }, [savedFilters]);

  // Combine predefined and saved lists
  const allSmartLists = useMemo(() => {
    return [...predefinedSmartLists, ...savedContactFilters];
  }, [savedContactFilters]);

  return {
    smartLists: allSmartLists,
    predefinedLists: predefinedSmartLists,
    customLists: savedContactFilters,
  };
}

export function useSmartListCount(list: SmartList) {
  const { data } = useContacts(list.filters);

  return {
    count: data?.count || 0,
    isLoading: !data,
  };
}

