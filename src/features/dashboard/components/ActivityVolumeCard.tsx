import { Phone, Mail, Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import type { ActivityVolume } from '../types/leadershipDashboard.types';

interface ActivityVolumeCardProps {
  volume?: ActivityVolume;
  isLoading: boolean;
}

const metrics = [
  { key: 'calls' as const, label: 'Calls', icon: Phone },
  { key: 'emails' as const, label: 'Emails', icon: Mail },
  { key: 'meetings' as const, label: 'Meetings', icon: Calendar },
];

/**
 * Card displaying activity volume metrics (calls, emails, meetings)
 */
export function ActivityVolumeCard({ volume, isLoading }: ActivityVolumeCardProps) {
  const total = volume
    ? (volume.calls ?? 0) + (volume.emails ?? 0) + (volume.meetings ?? 0)
    : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Activity This Period
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </>
        ) : (
          <>
            {metrics.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </div>
                <span className="font-medium">
                  {(volume?.[key] ?? 0).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-bold text-lg">{total.toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

