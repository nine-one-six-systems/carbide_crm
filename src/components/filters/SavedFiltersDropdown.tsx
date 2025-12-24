import { useState } from 'react';

import { Bookmark, ChevronDown, Trash2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore, type SavedFilter } from '@/stores/uiStore';

import { SaveFilterDialog } from './SaveFilterDialog';


interface SavedFiltersDropdownProps {
  page: SavedFilter['page'];
  currentFilters: Record<string, unknown>;
  onApplyFilter: (filters: Record<string, unknown>) => void;
}

export function SavedFiltersDropdown({
  page,
  currentFilters,
  onApplyFilter,
}: SavedFiltersDropdownProps) {
  const { savedFilters, removeSavedFilter } = useUIStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState<string | null>(null);

  const pageFilters = savedFilters.filter((f) => f.page === page);

  const handleDeleteFilter = () => {
    if (filterToDelete) {
      removeSavedFilter(filterToDelete);
      setFilterToDelete(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Filters
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {pageFilters.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No saved filters yet
            </div>
          ) : (
            pageFilters.map((filter) => (
              <DropdownMenuItem
                key={filter.id}
                className="flex items-center justify-between"
                onSelect={() => onApplyFilter(filter.filters)}
              >
                <span className="truncate">{filter.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterToDelete(filter.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowSaveDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Save Current Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SaveFilterDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        page={page}
        filters={currentFilters}
      />

      <ConfirmDialog
        open={!!filterToDelete}
        onOpenChange={(open) => !open && setFilterToDelete(null)}
        title="Delete Saved Filter"
        description="Are you sure you want to delete this saved filter? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteFilter}
      />
    </>
  );
}

