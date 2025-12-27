import { QueryClient } from '@tanstack/react-query';

import { errorLogger } from './errorLogger';
import { getFriendlyMessage } from './errorMessages';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
      // Optimize for performance
      structuralSharing: true,
      onError: (error, query) => {
        errorLogger.log(error, {
          source: 'react-query',
          type: 'query',
          queryKey: query.queryKey,
          friendlyMessage: getFriendlyMessage(error),
        });
      },
    },
    mutations: {
      retry: 1,
      onError: (error, variables, context, mutation) => {
        errorLogger.log(error, {
          source: 'react-query',
          type: 'mutation',
          mutationKey: mutation.mutationKey,
          friendlyMessage: getFriendlyMessage(error),
        });
      },
    },
  },
});

