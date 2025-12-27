import { useState } from 'react';

import { Plus, RefreshCw, Filter, Users as UsersIcon, ChevronDown, Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ContactForm } from '@/features/contacts/components/ContactForm';
import { ContactList } from '@/features/contacts/components/ContactList';
import { ContactsSidebar } from '@/features/contacts/components/ContactsSidebar';
import type { ContactSearchParams } from '@/types/api';

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ContactSearchParams>({
    page: 1,
    pageSize: 20,
  });
  const [selectedListId, setSelectedListId] = useState<string | undefined>();

  const handleApplyFilter = (newFilters: ContactSearchParams) => {
    setFilters({
      ...newFilters,
      query: debouncedQuery || undefined,
      page: 1,
      pageSize: 20,
    });
  };

  const handleRefresh = () => {
    // Trigger a refetch by updating filters slightly
    setFilters((prev) => ({ ...prev }));
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      key !== 'page' &&
      key !== 'pageSize' &&
      filters[key as keyof ContactSearchParams] !== undefined
  ).length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Collapsible Sidebar */}
      <ContactsSidebar
        currentFilters={filters}
        onApplyFilter={handleApplyFilter}
        selectedListId={selectedListId}
        onSelectedListIdChange={setSelectedListId}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Toolbar */}
        <div className="border-b bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold">All People</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Showing {filters.pageSize || 20} people
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Update List
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Contact</DialogTitle>
                    <DialogDescription>
                      Add a new contact to your CRM. Fill in the basic information below.
                    </DialogDescription>
                  </DialogHeader>
                  <ContactForm
                    onSuccess={() => {
                      setDialogOpen(false);
                    }}
                    onCancel={() => setDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
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
                  Columns
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Name</DropdownMenuItem>
                <DropdownMenuItem>Phone</DropdownMenuItem>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Last Activity</DropdownMenuItem>
                <DropdownMenuItem>Created</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
