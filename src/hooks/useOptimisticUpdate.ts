import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for optimistic updates
 * Updates cache immediately, then reverts on error
 */
export function useOptimisticUpdate<TData, TVariables>(
  queryKey: string[],
  updateFn: (old: TData | undefined, variables: TVariables) => TData
) {
  const queryClient = useQueryClient();

  const optimisticUpdate = (variables: TVariables) => {
    // Cancel outgoing refetches
    queryClient.cancelQueries({ queryKey });

    // Snapshot previous value
    const previous = queryClient.getQueryData<TData>(queryKey);

    // Optimistically update
    queryClient.setQueryData<TData>(queryKey, (old) =>
      updateFn(old, variables)
    );

    return { previous };
  };

  const rollback = ({ previous }: { previous: TData | undefined }) => {
    queryClient.setQueryData(queryKey, previous);
  };

  return { optimisticUpdate, rollback };
}

