import type { ContactSearchParams } from '@/types/api';

export interface SmartList {
  id: string;
  name: string;
  icon?: string;
  filters: ContactSearchParams;
  count?: number;
  isPredefined?: boolean;
}

export const predefinedSmartLists: SmartList[] = [
  {
    id: 'todays-leads',
    name: "Today's Leads",
    icon: 'Sparkles',
    filters: {
      page: 1,
      pageSize: 20,
      // This would need to be implemented based on your lead tracking logic
      // For now, we'll use a placeholder
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
    id: 'stale-leads',
    name: 'Stale Leads',
    icon: 'Clock',
    filters: {
      page: 1,
      pageSize: 20,
      // Would filter by last activity date > 30 days
    },
    isPredefined: true,
  },
  {
    id: 'recent-contacts',
    name: 'Recent Contacts',
    icon: 'UserPlus',
    filters: {
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    isPredefined: true,
  },
  {
    id: 'prospecting-tasks',
    name: 'Prospecting Tasks',
    icon: 'Target',
    filters: {
      page: 1,
      pageSize: 20,
      hasPendingCadenceTasks: true,
    },
    isPredefined: true,
  },
  {
    id: 'cadence-tasks',
    name: 'Cadence Tasks',
    icon: 'Workflow',
    filters: {
      page: 1,
      pageSize: 20,
      hasActiveCadences: true,
    },
    isPredefined: true,
  },
];

