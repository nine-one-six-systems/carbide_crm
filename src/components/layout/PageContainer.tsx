import { ReactNode } from 'react';

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  title,
  description,
  actions,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('flex flex-1 flex-col', className)} id="main-content">
      <div className="container mx-auto flex-1 space-y-4 p-6">
        {(title || description || actions) && (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        <Breadcrumbs />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

