import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link2 } from 'lucide-react';

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
import { useRelationships } from '@/features/relationships/hooks/useRelationships';
import { projectService } from '../services/projectService';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';

const linkRelationshipSchema = z.object({
  relationshipId: z.string().uuid('Please select a relationship'),
});

type LinkRelationshipFormValues = z.infer<typeof linkRelationshipSchema>;

interface LinkRelationshipDialogProps {
  projectId: string;
  linkedRelationshipIds: string[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function RelationshipCombobox({
  value,
  onChange,
  placeholder = 'Select relationship...',
  disabled = false,
  availableRelationships,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  availableRelationships: Array<{ id: string; type: string; stage: string }>;
}) {
  const [open, setOpen] = useState(false);
  const selectedRelationship = availableRelationships.find((rel) => rel.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {selectedRelationship ? (
            <span className="truncate">
              {selectedRelationship.type} - {selectedRelationship.stage}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search relationships..." />
          <CommandList>
            <CommandEmpty>No relationship found.</CommandEmpty>
            <CommandGroup>
              {availableRelationships.map((rel) => (
                <CommandItem
                  key={rel.id}
                  value={`${rel.type} ${rel.stage}`}
                  onSelect={() => {
                    onChange(rel.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === rel.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Link2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {rel.type} - {rel.stage}
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

export function LinkRelationshipDialog({
  projectId,
  linkedRelationshipIds,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: LinkRelationshipDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const { data: relationshipsData } = useRelationships({
    page: 1,
    pageSize: 1000,
  });

  const form = useForm<LinkRelationshipFormValues>({
    resolver: zodResolver(linkRelationshipSchema),
    defaultValues: {
      relationshipId: '',
    },
  });

  // Filter out already linked relationships
  const availableRelationships = useMemo(() => {
    return (relationshipsData?.data || []).filter(
      (rel) => !linkedRelationshipIds.includes(rel.id)
    );
  }, [relationshipsData?.data, linkedRelationshipIds]);

  const onSubmit = async (values: LinkRelationshipFormValues) => {
    try {
      await projectService.linkRelationship(projectId, values.relationshipId);
      toast({
        title: 'Success',
        description: 'Relationship linked successfully',
      });
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to link relationship',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Link Relationship</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link Business Relationship</DialogTitle>
          <DialogDescription>
            Associate a business relationship with this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Relationship</label>
            <RelationshipCombobox
              value={form.watch('relationshipId')}
              onChange={(value) => form.setValue('relationshipId', value)}
              placeholder="Select a relationship"
              availableRelationships={availableRelationships.map((rel) => ({
                id: rel.id,
                type: rel.type,
                stage: rel.stage,
              }))}
            />
            {form.formState.errors.relationshipId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.relationshipId.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={availableRelationships.length === 0}>
              Link Relationship
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

