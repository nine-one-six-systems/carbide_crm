import { useState } from 'react';

import { Pause, Play, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { AppliedCadence } from '@/types/database';

import { useAppliedCadenceMutations } from '../hooks/useCadenceMutations';


interface ActiveCadenceCardProps {
  appliedCadence: AppliedCadence;
}

export function ActiveCadenceCard({ appliedCadence }: ActiveCadenceCardProps) {
  const { pause, resume, clear } = useAppliedCadenceMutations();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handlePause = async () => {
    try {
      await pause(appliedCadence.id);
    } catch (error) {
      console.error('Error pausing cadence:', error);
    }
  };

  const handleResume = async () => {
    try {
      await resume(appliedCadence.id);
    } catch (error) {
      console.error('Error resuming cadence:', error);
    }
  };

  const handleClear = async () => {
    try {
      await clear({ id: appliedCadence.id });
      setShowClearDialog(false);
    } catch (error) {
      console.error('Error clearing cadence:', error);
    }
  };

  const cadenceName =
    appliedCadence.cadence_template?.name || 'Unknown Cadence';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{cadenceName}</CardTitle>
            <Badge
              variant={
                appliedCadence.status === 'active'
                  ? 'default'
                  : appliedCadence.status === 'paused'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {appliedCadence.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Started: {new Date(appliedCadence.start_date).toLocaleDateString()}
            </p>
            {appliedCadence.status === 'paused' && appliedCadence.paused_days > 0 && (
              <p className="text-sm text-muted-foreground">
                Paused for {appliedCadence.paused_days} days
              </p>
            )}
            <div className="flex gap-2">
              {appliedCadence.status === 'active' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePause}
                  className="flex-1"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              ) : appliedCadence.status === 'paused' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResume}
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowClearDialog(true)}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        title="Clear Cadence"
        description={`Are you sure you want to clear "${cadenceName}"? This will stop generating new tasks.`}
        confirmLabel="Clear"
        variant="destructive"
        onConfirm={handleClear}
      />
    </>
  );
}

