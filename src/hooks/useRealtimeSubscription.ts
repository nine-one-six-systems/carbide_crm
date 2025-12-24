import { useEffect, useCallback, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';

import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions<T extends Record<string, unknown>> {
  /**
   * The table name to subscribe to
   */
  table: string;
  /**
   * Schema name (defaults to 'public')
   */
  schema?: string;
  /**
   * Filter events (defaults to '*' for all events)
   */
  event?: PostgresChangeEvent;
  /**
   * Additional filter (e.g., 'user_id=eq.123')
   */
  filter?: string;
  /**
   * Query keys to invalidate on changes
   */
  queryKeys: string[][];
  /**
   * Callback when data changes
   */
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  /**
   * Whether subscription is enabled (defaults to true)
   */
  enabled?: boolean;
}

/**
 * Hook for subscribing to Supabase Realtime changes
 * Automatically invalidates React Query cache on changes
 */
export function useRealtimeSubscription<T extends Record<string, unknown>>({
  table,
  schema = 'public',
  event = '*',
  filter,
  queryKeys,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeSubscriptionOptions<T>) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const invalidateQueries = useCallback(() => {
    queryKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, queryKeys]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Create a unique channel name
    const channelName = `realtime:${schema}:${table}:${filter || 'all'}`;

    // Build channel config
    const channelConfig: {
      event: PostgresChangeEvent;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event,
      schema,
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    // Create subscription
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as const,
        channelConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          // Call specific callbacks
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload);
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload);
          }

          // Invalidate queries to refetch data
          invalidateQueries();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.debug(`Realtime subscription active: ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Realtime subscription error: ${channelName}`);
        }
      });

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, schema, event, filter, enabled, onInsert, onUpdate, onDelete, invalidateQueries]);

  // Note: We don't return the channel ref as accessing refs during render is not recommended
  // The channel is managed internally and cleaned up automatically
  return {};
}

/**
 * Hook for subscribing to activities realtime updates
 */
export function useActivitiesRealtime(contactId?: string) {
  return useRealtimeSubscription({
    table: 'activities',
    queryKeys: contactId
      ? [['activities', contactId], ['activities']]
      : [['activities']],
    filter: contactId ? `contact_id=eq.${contactId}` : undefined,
  });
}

/**
 * Hook for subscribing to tasks realtime updates
 */
export function useTasksRealtime(userId?: string) {
  return useRealtimeSubscription({
    table: 'cadence_tasks',
    queryKeys: [['tasks']],
    filter: userId ? `assigned_to=eq.${userId}` : undefined,
  });
}

/**
 * Hook for subscribing to contacts realtime updates
 */
export function useContactsRealtime() {
  return useRealtimeSubscription({
    table: 'contacts',
    queryKeys: [['contacts']],
  });
}

/**
 * Hook for subscribing to organizations realtime updates
 */
export function useOrganizationsRealtime() {
  return useRealtimeSubscription({
    table: 'organizations',
    queryKeys: [['organizations']],
  });
}

/**
 * Hook for subscribing to business relationships realtime updates
 */
export function useRelationshipsRealtime() {
  return useRealtimeSubscription({
    table: 'business_relationships',
    queryKeys: [['relationships']],
  });
}

