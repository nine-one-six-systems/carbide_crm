import { Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';


import { useCadenceTemplates } from '../hooks/useCadenceTemplates';

export function CadenceList() {
  const { data: templates, isLoading, error } = useCadenceTemplates();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Workflow}
        title="Error loading cadences"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <EmptyState
        icon={Workflow}
        title="No cadences found"
        description="Create your first cadence template to get started"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Link key={template.id} to={`/cadences/${template.id}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{template.name}</span>
                {template.is_active && <Badge>Active</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              )}
              {template.relationship_types &&
                template.relationship_types.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.relationship_types.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

