import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

interface UserComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UserCombobox({
  value,
  onChange,
  placeholder = 'Select user...',
  disabled = false,
}: UserComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data: users, isLoading } = useQuery<Profile[]>({
    queryKey: ['profiles', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return (data || []) as Profile[];
    },
  });

  const selectedUser = users?.find((user) => user.id === value);

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
          {selectedUser ? (
            <span className="truncate">{selectedUser.full_name || selectedUser.email}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {users?.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.full_name || user.email || ''}
                  onSelect={() => {
                    onChange(user.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === user.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{user.full_name || user.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

