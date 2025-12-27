import {
  LayoutDashboard,
  Users,
  Building2,
  GitBranch,
  FolderKanban,
  CheckSquare,
  ListChecks,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  Rocket,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/context/AuthContext';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Contacts', href: '/contacts', icon: Users },
  { title: 'Organizations', href: '/organizations', icon: Building2 },
  { title: 'Ventures', href: '/ventures', icon: Rocket },
  { title: 'Pipelines', href: '/pipelines', icon: GitBranch },
  { title: 'Projects', href: '/projects', icon: FolderKanban },
  { title: 'Tasks', href: '/tasks', icon: CheckSquare },
  { title: 'Batch Tasks', href: '/batch-tasks', icon: ListChecks },
  { title: 'Cadences', href: '/cadences', icon: Calendar },
  { title: 'Leadership', href: '/leadership', icon: BarChart3 },
  { title: 'Settings', href: '/settings', icon: Settings },
];

function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
  const { sidebarCollapsed, setSidebarCollapsed, setSidebarOpen } = useUIStore();
  const { profile, user, isManager, isAdmin } = useAuth();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    // Leadership dashboard is only visible to managers and admins
    if (item.href === '/leadership') {
      return isManager();
    }
    // Admin routes are only visible to admins
    if (item.href.startsWith('/admin')) {
      return isAdmin();
    }
    // Manager routes are only visible to managers and admins
    if (item.href.startsWith('/manager')) {
      return isManager();
    }
    return true;
  });

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <span className="text-sm font-bold">C</span>
          </div>
          {!sidebarCollapsed && !isMobile && (
            <span className="font-semibold">Carbide CRM</span>
          )}
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-4" aria-label="Main navigation">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground',
                    sidebarCollapsed && !isMobile && 'justify-center'
                  )
                }
                end={item.href === '/dashboard'}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {(!sidebarCollapsed || isMobile) && (
                  <span className="truncate">{item.title}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>
      {!isMobile && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email || ''}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DesktopSidebar() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        'hidden border-r bg-background transition-all duration-300 md:block',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Sidebar navigation"
    >
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="md:hidden">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">C</span>
                </div>
                <span className="font-semibold">Carbide CRM</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent isMobile />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Keep Sidebar export for backward compatibility, but it now only renders desktop sidebar
export function Sidebar() {
  return <DesktopSidebar />;
}

