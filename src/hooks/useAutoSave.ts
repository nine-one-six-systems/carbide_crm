import { useEffect, useRef, useState, useCallback } from 'react';

import { useDebouncedCallback } from 'use-debounce';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: Error | null;
  saveNow: () => Promise<void>;
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const previousDataRef = useRef<T>(data);
  const isInitialMount = useRef(true);

  const save = useCallback(async (dataToSave: T) => {
    if (!enabled) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(dataToSave);
      setLastSavedAt(new Date());
      previousDataRef.current = dataToSave;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Auto-save failed'));
    } finally {
      setIsSaving(false);
    }
  }, [onSave, enabled]);

  const debouncedSave = useDebouncedCallback(save, debounceMs);

  useEffect(() => {
    // Skip first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only save if data has changed
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      debouncedSave(data);
    }
  }, [data, debouncedSave]);

  const saveNow = useCallback(async () => {
    debouncedSave.cancel();
    await save(data);
  }, [data, save, debouncedSave]);

  return {
    isSaving,
    lastSavedAt,
    error,
    saveNow,
  };
}

// Hook for tracking form dirty state
export function useFormDirty<T>(initialData: T, currentData: T): boolean {
  return JSON.stringify(initialData) !== JSON.stringify(currentData);
}

