import { useState } from 'react';

import { Plus } from 'lucide-react';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ContactForm } from '@/features/contacts/components/ContactForm';
import { ContactList } from '@/features/contacts/components/ContactList';


export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <PageContainer
      title="Contacts"
      description="Manage your contacts and relationships"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Contact</DialogTitle>
            </DialogHeader>
            <ContactForm
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
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <ContactList
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

