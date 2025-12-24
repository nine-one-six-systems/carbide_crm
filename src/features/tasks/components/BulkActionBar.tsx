import { useState } from 'react';

import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface SelectedTask {
  taskId: string;
  taskSource: 'cadence' | 'manual';
}

interface BulkActionBarProps {
  selectedTasks: SelectedTask[];
  totalTasks: number;
  onClearSelection: () => void;
  onBulkComplete: (notes: string) => void;
  onBulkTriage: () => void;
  onBulkDismiss: () => void;
  isLoading?: boolean;
}

export function BulkActionBar({
  selectedTasks,
  totalTasks,
  onClearSelection,
  onBulkComplete,
  onBulkTriage,
  onBulkDismiss,
  isLoading = false,
}: BulkActionBarProps) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showTriageDialog, setShowTriageDialog] = useState(false);
  const [showDismissDialog, setShowDismissDialog] = useState(false);
  const [bulkNotes, setBulkNotes] = useState('');

  const handleBulkComplete = () => {
    if (bulkNotes.trim()) {
      onBulkComplete(bulkNotes);
      setBulkNotes('');
      setShowCompleteDialog(false);
    }
  };

  const handleBulkTriage = () => {
    onBulkTriage();
    setShowTriageDialog(false);
  };

  const handleBulkDismiss = () => {
    onBulkDismiss();
    setShowDismissDialog(false);
  };

  if (selectedTasks.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg',
          'transform transition-transform duration-200',
          'safe-bottom'
        )}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedTasks.length} of {totalTasks} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCompleteDialog(true)}
              disabled={isLoading}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTriageDialog(true)}
              disabled={isLoading}
              className="gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              <AlertCircle className="h-4 w-4" />
              Triage All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDismissDialog(true)}
              disabled={isLoading}
              className="gap-2 border-gray-500 text-gray-700 hover:bg-gray-50"
            >
              <XCircle className="h-4 w-4" />
              Dismiss All
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete {selectedTasks.length} Tasks</DialogTitle>
            <DialogDescription>
              Add notes that will be applied to all selected tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-notes">Notes (required)</Label>
              <Textarea
                id="bulk-notes"
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                placeholder="Enter notes for completing these tasks..."
                rows={4}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This note will be added to each task individually.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCompleteDialog(false);
                setBulkNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkComplete}
              disabled={!bulkNotes.trim() || isLoading}
            >
              {isLoading ? 'Completing...' : 'Complete All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Triage Dialog */}
      <Dialog open={showTriageDialog} onOpenChange={setShowTriageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Triage {selectedTasks.length} Tasks</DialogTitle>
            <DialogDescription>
              Are you sure you want to triage all selected tasks? Triaged tasks are
              intentionally skipped and will be hidden from default task views.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTriageDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleBulkTriage}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isLoading ? 'Processing...' : 'Triage All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Dismiss Dialog */}
      <Dialog open={showDismissDialog} onOpenChange={setShowDismissDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss {selectedTasks.length} Tasks</DialogTitle>
            <DialogDescription>
              Are you sure you want to dismiss all selected tasks? Dismissed tasks
              will be hidden from all views by default.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDismissDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDismiss}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Dismiss All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

