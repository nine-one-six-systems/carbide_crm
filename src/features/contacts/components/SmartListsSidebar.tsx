import { useState } from 'react';

import { Clock, Sparkles, UserPlus, Users, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ContactSearchParams } from '@/types/api';

import { SaveFilterDialog } from '@/components/filters/SaveFilterDialog';
import { useSmartLists, useSmartListCount } from '../hooks/useSmartLists';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Users,
  Clock,
  UserPlus,
};

interface SmartListsSidebarProps {
  currentFilters: ContactSearchParams;
  onApplyFilter: (filters: ContactSearchParams) => void;
  selectedListId?: string;
}

function SmartListItem({
  list,
  isSelected,
  onClick,
}: {
  list: { id: string; name: string; icon?: string; filters: ContactSearchParams };
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = list.icon ? iconMap[list.icon] || Users : Users;
  const { count, isLoading } = useSmartListCount(list as any);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors',
        isSelected
          ? 'bg-emerald-50 text-emerald-700 font-medium'
          : 'hover:bg-muted text-muted-foreground'
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{list.name}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-8" />
      ) : (
        <span className="text-xs ml-2 shrink-0">{count || 0}</span>
      )}
    </button>
  );
}

export function SmartListsSidebar({
  currentFilters,
  onApplyFilter,
  selectedListId,
}: SmartListsSidebarProps) {
  const { smartLists } = useSmartLists();
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleListClick = (list: any) => {
    onApplyFilter(list.filters);
  };

  return (
    <>
      <div className="w-64 border-r bg-white flex-shrink-0 h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold mb-2">Smart Lists</h2>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowSaveDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create List
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {smartLists.map((list) => (
              <SmartListItem
                key={list.id}
                list={list}
                isSelected={selectedListId === list.id}
                onClick={() => handleListClick(list)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <SaveFilterDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        page="contacts"
        filters={currentFilters}
      />
    </>
  );
}

