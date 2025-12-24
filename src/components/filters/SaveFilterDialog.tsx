import { useState } from 'react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUIStore, type SavedFilter } from '@/stores/uiStore';


interface SaveFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: SavedFilter['page'];
  filters: Record<string, unknown>;
}

export function SaveFilterDialog({
  open,
  onOpenChange,
  page,
  filters,
}: SaveFilterDialogProps) {
  const { addSavedFilter, savedFilters } = useUIStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    // Validate name
    if (!name.trim()) {
      setError('Filter name is required');
      return;
    }

    // Check for duplicate names on same page
    const isDuplicate = savedFilters.some(
      (f) => f.page === page && f.name.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      setError('A filter with this name already exists');
      return;
    }

    addSavedFilter({
      name: name.trim(),
      page,
      filters,
    });

    toast.success(`Filter "${name}" saved successfully`);
    setName('');
    setError('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setName('');
    setError('');
    onOpenChange(false);
  };

  // Get a preview of active filters
  const activeFilterCount = Object.entries(filters).filter(
    ([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value !== '';
      return value !== null && value !== undefined;
    }
  ).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Filter</DialogTitle>
          <DialogDescription>
            Save your current filter configuration for quick access later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filter-name">Filter Name</Label>
            <Input
              id="filter-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., High Priority Contacts"
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium mb-1">Filter Summary</p>
            <p className="text-sm text-muted-foreground">
              {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
            </p>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {Object.entries(filters).map(([key, value]) => {
                if (Array.isArray(value) && value.length === 0) return null;
                if (typeof value === 'string' && value === '') return null;
                if (value === null || value === undefined) return null;
                
                return (
                  <div key={key}>
                    <span className="font-medium">{key}:</span>{' '}
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

