import { useMemo } from 'react';

import { useOrganizations } from './useOrganizations';
import { predefinedSmartLists, type OrganizationSmartList } from '../types/smartLists';
import { useUIStore } from '@/stores/uiStore';

export function useSmartLists() {
  const { savedFilters } = useUIStore();

  // Get saved filters for organizations page
  const savedOrganizationFilters = useMemo(() => {
    return savedFilters
      .filter((f) => f.page === 'organizations')
      .map((f) => ({
        id: f.id,
        name: f.name,
        filters: f.filters as OrganizationSmartList['filters'],
        isPredefined: false,
      }));
  }, [savedFilters]);

  // Combine predefined and saved lists
  const allSmartLists = useMemo(() => {
    return [...predefinedSmartLists, ...savedOrganizationFilters];
  }, [savedOrganizationFilters]);

  return {
    smartLists: allSmartLists,
    predefinedLists: predefinedSmartLists,
    customLists: savedOrganizationFilters,
  };
}

export function useSmartListCount(list: OrganizationSmartList) {
  const { data } = useOrganizations(list.filters);

  return {
    count: data?.count || 0,
    isLoading: !data,
  };
}

