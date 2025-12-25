import { ReactNode } from 'react';

import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

interface CollapsibleSidebarProps {
  children: ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

export function CollapsibleSidebar({
  children,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  className,
}: CollapsibleSidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const isCollapsed = controlledCollapsed ?? sidebarCollapsed;
  const setIsCollapsed = onCollapsedChange ?? setSidebarCollapsed;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={cn('flex border-r bg-gray-50 transition-all duration-300', className)}>
      {/* Narrow icon bar when collapsed */}
      <div className="w-12 flex flex-col items-center py-2 border-r bg-white flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Expanded content when open */}
      {!isCollapsed && (
        <div className="w-64 bg-white flex-shrink-0 transition-all duration-300">
          {children}
        </div>
      )}
    </aside>
  );
}

