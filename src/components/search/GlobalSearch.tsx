import { useState, useEffect } from 'react';

import { Search, User, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useContacts } from '@/features/contacts/hooks/useContacts';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const navigate = useNavigate();

  // Search contacts
  const { data: contactsData } = useContacts({
    query: debouncedQuery || undefined,
    page: 1,
    pageSize: 5,
  });

  // Search organizations
  const { data: organizationsData } = useOrganizations({
    query: debouncedQuery || undefined,
    page: 1,
    pageSize: 5,
  });

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useKeyboardShortcut(['meta', 'k'], () => {
    onOpenChange(true);
  });
  useKeyboardShortcut(['ctrl', 'k'], () => {
    onOpenChange(true);
  });

  useEffect(() => {
    if (open) {
      setQuery('');
    }
  }, [open]);

  const handleSelect = (type: 'contact' | 'organization', id: string) => {
    if (type === 'contact') {
      navigate(`/contacts/${id}`);
    } else {
      navigate(`/organizations/${id}`);
    }
    onOpenChange(false);
    setQuery('');
  };

  const contacts = contactsData?.data || [];
  const organizations = organizationsData?.data || [];
  const hasResults = contacts.length > 0 || organizations.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <Command className="rounded-lg border-0">
          <CommandInput
            placeholder="Search contacts, organizations..."
            value={query}
            onValueChange={setQuery}
            className="h-12"
          />
          <CommandList>
            {debouncedQuery && (
              <>
                {contacts.length > 0 && (
                  <CommandGroup heading="Contacts">
                    {contacts.map((contact) => (
                      <CommandItem
                        key={contact.id}
                        value={`contact-${contact.id}`}
                        onSelect={() => handleSelect('contact', contact.id)}
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {contact.first_name} {contact.last_name}
                        </span>
                        {contact.job_title && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {contact.job_title}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {organizations.length > 0 && (
                  <CommandGroup heading="Organizations">
                    {organizations.map((org) => (
                      <CommandItem
                        key={org.id}
                        value={`org-${org.id}`}
                        onSelect={() => handleSelect('organization', org.id)}
                        className="flex items-center gap-2"
                      >
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{org.name}</span>
                        {org.industry && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {org.industry}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {!hasResults && debouncedQuery && (
                  <CommandEmpty>No results found.</CommandEmpty>
                )}
              </>
            )}
            {!debouncedQuery && (
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Start typing to search contacts and organizations
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">⌘K</kbd> or{' '}
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Ctrl+K</kbd> to open
                    this search
                  </p>
                </div>
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

