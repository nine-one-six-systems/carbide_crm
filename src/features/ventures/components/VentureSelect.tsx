import { Check, ChevronsUpDown } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { useActiveVentures } from '../hooks/useVentures';

interface VentureSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function VentureSelect({
  value,
  onChange,
  placeholder = 'Select ventures...',
  disabled = false,
  className,
}: VentureSelectProps) {
  const { data: ventures, isLoading } = useActiveVentures();

  const selectedVentures = ventures?.filter((v) => value.includes(v.slug)) || [];

  const toggleVenture = (slug: string) => {
    if (value.includes(slug)) {
      onChange(value.filter((v) => v !== slug));
    } else {
      onChange([...value, slug]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled || isLoading}
          className={cn('w-full justify-between', className)}
        >
          {selectedVentures.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedVentures.map((venture) => (
                <Badge
                  key={venture.slug}
                  variant="secondary"
                  className="mr-1"
                  style={{
                    backgroundColor: venture.primary_color
                      ? `${venture.primary_color}20`
                      : undefined,
                    borderColor: venture.primary_color || undefined,
                  }}
                >
                  {venture.name}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search ventures..." />
          <CommandList>
            <CommandEmpty>No ventures found.</CommandEmpty>
            <CommandGroup>
              {ventures?.map((venture) => (
                <CommandItem
                  key={venture.slug}
                  value={venture.name}
                  onSelect={() => toggleVenture(venture.slug)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(venture.slug) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: venture.primary_color || '#6B7280' }}
                  />
                  {venture.name}
                  {venture.status !== 'active' && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {venture.status}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

