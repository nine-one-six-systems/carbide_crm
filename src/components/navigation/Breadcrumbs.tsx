import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  contacts: 'Contacts',
  organizations: 'Organizations',
  pipelines: 'Pipelines',
  tasks: 'Tasks',
  cadences: 'Cadences',
  settings: 'Settings',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/dashboard' },
    ...pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);
      return { label, href: index === pathnames.length - 1 ? undefined : to };
    }),
  ];

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href || index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {index === 0 ? (
                  <Home className="h-4 w-4" aria-hidden="true" />
                ) : (
                  crumb.label
                )}
              </Link>
            ) : (
              <span
                className={cn(
                  'font-medium',
                  index === 0 && 'flex items-center'
                )}
                aria-current="page"
              >
                {index === 0 ? (
                  <>
                    <Home className="mr-1 h-4 w-4" aria-hidden="true" />
                    {crumb.label}
                  </>
                ) : (
                  crumb.label
                )}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

