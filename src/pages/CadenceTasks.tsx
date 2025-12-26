import { useState } from 'react';

import { RefreshCw, Filter, Users as UsersIcon, ChevronDown, Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ContactList } from '@/features/contacts/components/ContactList';
import { ContactsSidebar } from '@/features/contacts/components/ContactsSidebar';
import type { ContactSearchParams } from '@/types/api';

export default function CadenceTasksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState<ContactSearchParams>({
    page: 1,
    pageSize: 20,
    hasActiveCadences: true,
  });

  const handleApplyFilter = (newFilters: ContactSearchParams) => {
    setFilters({
      ...newFilters,
      hasActiveCadences: true,
      query: debouncedQuery || undefined,
      page: 1,
      pageSize: 20,
    });
  };

  const handleRefresh = () => {
    setFilters((prev) => ({ ...prev }));
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      key !== 'page' &&
      key !== 'pageSize' &&
      key !== 'hasActiveCadences' &&
      filters[key as keyof ContactSearchParams] !== undefined
  ).length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Collapsible Sidebar */}
      <ContactsSidebar
        currentFilters={filters}
        onApplyFilter={handleApplyFilter}
        selectedListId="cadence-tasks"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Toolbar */}
        <div className="border-b bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold">In Cadence</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Contacts with active cadences
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Update List
              </Button>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Everyone
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Everyone</DropdownMenuItem>
                <DropdownMenuItem>Me</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          <ContactList
            searchParams={{
              ...filters,
              query: debouncedQuery || undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}

