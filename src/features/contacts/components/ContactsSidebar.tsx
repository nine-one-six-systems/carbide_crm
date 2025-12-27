import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { Settings, Target, Users, Workflow } from 'lucide-react';

import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ContactSearchParams } from '@/types/api';

import { useSmartLists } from '../hooks/useSmartLists';
import { SmartListItem } from './SmartListItem';

interface ContactsSidebarProps {
  currentFilters: ContactSearchParams;
  onApplyFilter: (filters: ContactSearchParams) => void;
  selectedListId?: string;
  onSelectedListIdChange?: (listId: string | undefined) => void;
}

export function ContactsSidebar({
  currentFilters,
  onApplyFilter,
  selectedListId: controlledSelectedListId,
  onSelectedListIdChange,
}: ContactsSidebarProps) {
  const location = useLocation();
  const { smartLists } = useSmartLists();
  const [internalSelectedListId, setInternalSelectedListId] = useState<string | undefined>();
  const selectedListId = controlledSelectedListId ?? internalSelectedListId;

  const handleListClick = (list: { id: string; filters: ContactSearchParams }) => {
    // Update parent if callback provided, otherwise update internal state
    if (onSelectedListIdChange) {
      onSelectedListIdChange(list.id);
    } else if (controlledSelectedListId === undefined) {
      setInternalSelectedListId(list.id);
    }
    onApplyFilter(list.filters);
  };

  const isPeopleRoute = location.pathname === '/contacts';
  const isProspectingTasksRoute = location.pathname === '/contacts/prospecting-tasks';
  const isCadenceTasksRoute = location.pathname === '/contacts/cadence-tasks';

  return (
    <CollapsibleSidebar>
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* People Section */}
            <div>
              <h2 className="text-sm font-semibold mb-2 text-muted-foreground">People</h2>
              <nav className="space-y-1">
                <NavLink
                  to="/contacts"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive || isPeopleRoute
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    )
                  }
                >
                  <Users className="h-4 w-4" />
                  <span>All People</span>
                </NavLink>
                <NavLink
                  to="/contacts/prospecting-tasks"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive || isProspectingTasksRoute
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    )
                  }
                >
                  <Target className="h-4 w-4" />
                  <span>Prospecting Tasks</span>
                </NavLink>
                <NavLink
                  to="/contacts/cadence-tasks"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive || isCadenceTasksRoute
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    )
                  }
                >
                  <Workflow className="h-4 w-4" />
                  <span>In Cadence</span>
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

