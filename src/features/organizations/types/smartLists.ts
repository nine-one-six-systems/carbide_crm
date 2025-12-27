import type { OrganizationSearchParams } from '@/types/api';

export interface OrganizationSmartList {
  id: string;
  name: string;
  icon?: string;
  filters: OrganizationSearchParams;
  count?: number;
  isPredefined?: boolean;
}

export const predefinedSmartLists: OrganizationSmartList[] = [
  {
    id: 'all-organizations',
    name: 'All Organizations',
    icon: 'Building2',
    filters: {
      page: 1,
      pageSize: 20,
    },
    isPredefined: true,
  },
  {
    id: 'clients',
    name: 'Clients',
    icon: 'Users',
    filters: {
      page: 1,
      pageSize: 20,
      tags: ['client'],
    },
    isPredefined: true,
  },
  {
    id: 'recent-organizations',
    name: 'Recent Organizations',
    icon: 'Building2',
    filters: {
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    isPredefined: true,
  },
];

