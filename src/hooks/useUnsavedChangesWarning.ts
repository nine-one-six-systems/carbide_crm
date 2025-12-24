import { useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UseUnsavedChangesWarningOptions {
  isDirty: boolean;
  message?: string;
}

export function useUnsavedChangesWarning({
  isDirty,
  message = 'You have unsaved changes. Are you sure you want to leave?',
}: UseUnsavedChangesWarningOptions) {
  // Handle browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  // Handle React Router navigation
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) => {
        return isDirty && currentLocation.pathname !== nextLocation.pathname;
      },
      [isDirty]
    )
  );

  const confirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  return {
    isBlocked: blocker.state === 'blocked',
    confirmNavigation,
    cancelNavigation,
    message,
  };
}

// Component wrapper for unsaved changes dialog
interface UnsavedChangesDialogProps {
  isBlocked: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
}

export function UnsavedChangesDialog({
  isBlocked,
  onConfirm,
  onCancel,
  message = 'You have unsaved changes. Are you sure you want to leave this page?',
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={isBlocked}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Stay on Page</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Leave Page</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Combined hook that provides both the warning logic and dialog
export function useUnsavedChangesDialog(isDirty: boolean) {
  const warning = useUnsavedChangesWarning({ isDirty });

  const DialogComponent = () => (
    <UnsavedChangesDialog
      isBlocked={warning.isBlocked}
      onConfirm={warning.confirmNavigation}
      onCancel={warning.cancelNavigation}
      message={warning.message}
    />
  );

  return {
    ...warning,
    UnsavedChangesDialog: DialogComponent,
  };
}
