import { useState } from 'react';

import { Plus } from 'lucide-react';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { OrganizationForm } from '@/features/organizations/components/OrganizationForm';
import { OrganizationList } from '@/features/organizations/components/OrganizationList';


export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <PageContainer
      title="Organizations"
      description="Manage organizations and their relationships"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Add a new organization to your CRM. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <OrganizationForm
              onSuccess={() => {
                setDialogOpen(false);
              }}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <OrganizationList
          searchParams={{
            query: debouncedQuery || undefined,
            page: 1,
            pageSize: 20,
          }}
        />
      </div>
    </PageContainer>
  );
}

