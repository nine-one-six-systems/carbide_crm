import { Building2, Clock, Sparkles, Target, UserPlus, Users } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useSmartListCount } from '../hooks/useSmartLists';
import type { OrganizationSmartList } from '../types/smartLists';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Users,
  Clock,
  UserPlus,
  Target,
  Building2,
};

interface SmartListItemProps {
  list: OrganizationSmartList;
  isSelected: boolean;
  onClick: () => void;
}

export function SmartListItem({ list, isSelected, onClick }: SmartListItemProps) {
  const Icon = list.icon ? iconMap[list.icon] || Building2 : Building2;
  const { count, isLoading } = useSmartListCount(list);

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

