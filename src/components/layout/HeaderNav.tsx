import { useState } from 'react';

import {
  Users,
  CheckSquare,
  Calendar,
  GitBranch,
  BarChart3,
  Settings,
  Search,
  Mail,
  Phone,
  MessageSquare,
  Bell,
  User,
  LogOut,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { GlobalSearch } from '@/components/search/GlobalSearch';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/features/auth/context/AuthContext';
import { cn } from '@/lib/utils';

import { DashboardSelector } from './DashboardSelector';
import { MobileSidebar } from './Sidebar';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: 'Contacts', href: '/contacts', icon: Users },
  { title: 'Tasks', href: '/tasks', icon: CheckSquare },
  { title: 'Cadences', href: '/cadences', icon: Calendar },
  { title: 'Pipelines', href: '/pipelines', icon: GitBranch },
  { title: 'Leadership', href: '/leadership', icon: BarChart3 },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function HeaderNav() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // Show dashboard selector on dashboard-related routes
  const isDashboardRoute =
    location.pathname === '/' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/leadership';

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const userInitials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background px-4">
      {/* Mobile Menu */}
      <div className="md:hidden">
        <MobileSidebar />
      </div>

      {/* Logo */}
      <NavLink
        to="/dashboard"
        className="flex items-center gap-2 mr-4 shrink-0"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
          <span className="text-sm font-bold">C</span>
        </div>
        <span className="hidden sm:inline font-semibold text-sm">Carbide CRM</span>
      </NavLink>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4">
        <Button
          variant="outline"
          className="relative w-full justify-start text-muted-foreground"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Search...</span>
          <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>

      {/* Dashboard Selector - visible on dashboard routes */}
      {isDashboardRoute && (
        <TooltipProvider delayDuration={300}>
          <DashboardSelector className="hidden lg:flex border rounded-lg" />
        </TooltipProvider>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        {/* Email Quick Action */}
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Send Email">
          <Mail className="h-4 w-4" />
        </Button>

        {/* Call Quick Action */}
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Make Call">
          <Phone className="h-4 w-4" />
        </Button>

        {/* Chat Quick Action */}
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Send Message">
          <MessageSquare className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

