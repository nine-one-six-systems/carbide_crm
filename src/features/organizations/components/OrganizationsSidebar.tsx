import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { Building2, Settings } from 'lucide-react';

import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { OrganizationSearchParams } from '@/types/api';

import { useSmartLists } from '../hooks/useSmartLists';
import { SmartListItem } from './SmartListItem';

interface OrganizationsSidebarProps {
  currentFilters: OrganizationSearchParams;
  onApplyFilter: (filters: OrganizationSearchParams) => void;
  selectedListId?: string;
  onSelectedListIdChange?: (listId: string | undefined) => void;
}

export function OrganizationsSidebar({
  currentFilters,
  onApplyFilter,
  selectedListId: controlledSelectedListId,
  onSelectedListIdChange,
}: OrganizationsSidebarProps) {
  const location = useLocation();
  const { smartLists } = useSmartLists();
  const [internalSelectedListId, setInternalSelectedListId] = useState<string | undefined>();
  const selectedListId = controlledSelectedListId ?? internalSelectedListId;

  const handleListClick = (list: { id: string; filters: OrganizationSearchParams }) => {
    // Update parent if callback provided, otherwise update internal state
    if (onSelectedListIdChange) {
      onSelectedListIdChange(list.id);
    } else if (controlledSelectedListId === undefined) {
      setInternalSelectedListId(list.id);
    }
    onApplyFilter(list.filters);
  };

  const isOrganizationsRoute = location.pathname === '/organizations';

  return (
    <CollapsibleSidebar>
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Organizations Section */}
            <div>
              <h2 className="text-sm font-semibold mb-2 text-muted-foreground">Organizations</h2>
              <nav className="space-y-1">
                <NavLink
                  to="/organizations"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive || isOrganizationsRoute
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    )
                  }
                >
                  <Building2 className="h-4 w-4" />
                  <span>All Organizations</span>
                </NavLink>
              </nav>
            </div>

            {/* Smart Lists Section */}
            <div>
              <h2 className="text-sm font-semibold mb-2 text-muted-foreground uppercase">
                Smart Lists
              </h2>
              <nav className="space-y-1">
                {smartLists.map((list) => (
                  <SmartListItem
                    key={list.id}
                    list={list}
                    isSelected={selectedListId === list.id}
                    onClick={() => handleListClick(list)}
                  />
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>

        {/* Manage Link */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            asChild
          >
            <NavLink to="/settings">
              <Settings className="h-4 w-4 mr-2" />
              <span>Manage</span>
            </NavLink>
          </Button>
        </div>
      </div>
    </CollapsibleSidebar>
  );
}

