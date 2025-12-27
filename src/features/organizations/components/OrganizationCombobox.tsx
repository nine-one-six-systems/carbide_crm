import { useState } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';

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

import { useOrganizations } from '../hooks/useOrganizations';

interface OrganizationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function OrganizationCombobox({
  value,
  onChange,
  placeholder = 'Select organization...',
  disabled = false,
}: OrganizationComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data: organizationsData, isLoading } = useOrganizations({
    page: 1,
    pageSize: 100,
  });

  const organizations = organizationsData?.data || [];
  const selectedOrg = organizations.find((org) => org.id === value);

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
          {selectedOrg ? (
            <span className="truncate">{selectedOrg.name}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => {
                    onChange(org.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === org.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{org.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

