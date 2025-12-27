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

    // Parse filter to extract column and value for client-side filtering fallback
    let filterColumn: string | null = null;
    let filterValue: string | null = null;
    if (filter) {
      const match = filter.match(/^(\w+)=eq\.(.+)$/);
      if (match) {
        filterColumn = match[1];
        filterValue = match[2];
      }
    }

    // Build channel config - ensure proper typing for Supabase
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

    // Only add filter if provided and properly formatted
    if (filter) {
      channelConfig.filter = filter;
    }

    // Create subscription with client-side filtering fallback
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        channelConfig as {
          event: PostgresChangeEvent;
          schema: string;
          table: string;
          filter?: string;
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          // Client-side filtering fallback: if server-side filter fails, filter here
          if (filterColumn && filterValue) {
            let matches = false;
            
            // For INSERT events, check new record
            if (payload.eventType === 'INSERT' && payload.new) {
              const record = payload.new as Record<string, unknown>;
              matches = record[filterColumn] === filterValue;
            }
            // For UPDATE events, check if either old or new record matches
            else if (payload.eventType === 'UPDATE') {
              if (payload.new) {
                const newRecord = payload.new as Record<string, unknown>;
                matches = newRecord[filterColumn] === filterValue;
              }
              if (!matches && payload.old) {
                const oldRecord = payload.old as Record<string, unknown>;
                matches = oldRecord[filterColumn] === filterValue;
              }
            }
            // For DELETE events, check old record
            else if (payload.eventType === 'DELETE' && payload.old) {
              const record = payload.old as Record<string, unknown>;
              matches = record[filterColumn] === filterValue;
            }
            
            // Skip event if it doesn't match our filter
            if (!matches) {
              return;
            }
          }

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
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.debug(`Realtime subscription active: ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          // Handle filter mismatch errors gracefully
          if (err?.message?.includes('mismatch between server and client bindings')) {
            console.warn(
              `Realtime subscription using client-side filtering due to server filter mismatch: ${channelName}`,
              {
                table,
                schema,
                filter,
                note: 'Subscription will receive all changes and filter client-side.',
              }
            );
            // The subscription will still work with client-side filtering
            // The error is logged but doesn't prevent functionality
          } else {
            // Only log error if err exists and has meaningful content
            if (err) {
              console.error(`Realtime subscription error: ${channelName}`, err);
              console.warn('Realtime subscription details:', {
                table,
                schema,
                filter,
                error: err,
              });
            } else {
              // Log a warning without the error object if it's undefined
              console.warn(`Realtime subscription error (no error details): ${channelName}`, {
                table,
                schema,
                filter,
                status,
              });
            }
          }
        } else if (status === 'TIMED_OUT') {
          console.warn(`Realtime subscription timed out: ${channelName}`);
        } else if (status === 'CLOSED') {
          console.debug(`Realtime subscription closed: ${channelName}`);
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
    // Use specific event types instead of '*' when using filters for better compatibility
    event: '*',
    filter: userId ? `assigned_to=eq.${userId}` : undefined,
    enabled: !!userId, // Only enable when userId is available
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

