import { Check, Loader2, AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  className?: string;
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  className,
}: AutoSaveIndicatorProps) {
  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs text-muted-foreground">Saving...</span>
          </>
        );
      case 'saved':
        return (
          <>
            <Check className="h-3 w-3 text-green-600" />
            <span className="text-xs text-muted-foreground">
              {lastSaved
                ? `Saved ${lastSaved.toLocaleTimeString()}`
                : 'Saved'}
            </span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="h-3 w-3 text-destructive" />
            <span className="text-xs text-destructive">Save failed</span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        status === 'idle' && 'opacity-0',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {getStatusContent()}
    </div>
  );
}

