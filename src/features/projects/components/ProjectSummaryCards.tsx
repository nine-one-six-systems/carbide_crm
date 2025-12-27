import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProjectWithStats } from '../types/project.types';

interface ProjectSummaryCardsProps {
  projects: ProjectWithStats[];
}

export function ProjectSummaryCards({ projects }: ProjectSummaryCardsProps) {
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const onTrackCount = projects.filter((p) => p.health === 'on_track').length;
  const atRiskCount = projects.filter((p) => p.health === 'at_risk').length;
  const blockedCount = projects.filter((p) => p.health === 'blocked').length;

  const cards = [
    {
      title: 'Active',
      value: activeCount,
      icon: Clock,
      description: 'Projects in progress',
      className: 'text-blue-600',
    },
    {
      title: 'On Track',
      value: onTrackCount,
      icon: CheckCircle2,
      description: 'Projects on schedule',
      className: 'text-green-600',
    },
    {
      title: 'At Risk',
      value: atRiskCount,
      icon: AlertCircle,
      description: 'Projects needing attention',
      className: 'text-yellow-600',
    },
    {
      title: 'Blocked',
      value: blockedCount,
      icon: XCircle,
      description: 'Projects blocked',
      className: 'text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={card.className} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

