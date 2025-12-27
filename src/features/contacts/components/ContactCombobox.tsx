import { useState } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { useContacts } from '../hooks/useContacts';

interface ContactComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ContactCombobox({
  value,
  onChange,
  placeholder = 'Select contact...',
  disabled = false,
}: ContactComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data: contactsData, isLoading } = useContacts({
    page: 1,
    pageSize: 100,
  });

  const contacts = contactsData?.data || [];
  const selectedContact = contacts.find((contact) => contact.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between"
        >
          {selectedContact ? (
            <span className="truncate">
              {selectedContact.first_name} {selectedContact.last_name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search contacts..." />
          <CommandList>
            <CommandEmpty>No contact found.</CommandEmpty>
            <CommandGroup>
              {contacts.map((contact) => (
                <CommandItem
                  key={contact.id}
                  value={`${contact.first_name} ${contact.last_name}`}
                  onSelect={() => {
                    onChange(contact.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === contact.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {contact.first_name} {contact.last_name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

