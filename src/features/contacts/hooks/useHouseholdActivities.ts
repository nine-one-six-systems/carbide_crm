import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';
import type { Activity } from '@/types/database';

interface HouseholdMember {
  contact_id: string;
  contact_name: string;
  role: string;
}

interface HouseholdActivity extends Activity {
  member_name: string;
}

export function useHouseholdActivities(groupId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['household-activities', groupId],
    queryFn: async (): Promise<HouseholdActivity[]> => {
      if (!groupId) return [];

      // First, get all members of the household
      const { data: members, error: membersError } = await supabase
        .from('primary_relationship_members')
        .select(`
          contact_id,
          role,
          contact:contacts(first_name, last_name)
        `)
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      const memberIds = members?.map((m) => m.contact_id) || [];
      
      if (memberIds.length === 0) return [];

      // Get activities for all household members
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .in('contact_id', memberIds)
        .order('occurred_at', { ascending: false })
        .limit(50);

      if (activitiesError) throw activitiesError;

      // Map activities with member names
      const memberMap = new Map<string, string>();
      members?.forEach((m) => {
        const contact = m.contact as { first_name: string; last_name: string } | null;
        if (contact) {
          memberMap.set(m.contact_id, `${contact.first_name} ${contact.last_name}`);
        }
      });

      return (activities || []).map((activity) => ({
        ...activity,
        member_name: memberMap.get(activity.contact_id || '') || 'Unknown',
      }));
    },
    enabled: enabled && !!groupId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useHouseholdMembers(contactId: string | undefined) {
  return useQuery({
    queryKey: ['household-members', contactId],
    queryFn: async (): Promise<{ groupId: string; members: HouseholdMember[] } | null> => {
      if (!contactId) return null;

      // Find the household group for this contact
      const { data: membership, error: membershipError } = await supabase
        .from('primary_relationship_members')
        .select('group_id')
        .eq('contact_id', contactId)
        .single();

      if (membershipError) {
        if (membershipError.code === 'PGRST116') {
          // No household found
          return null;
        }
        throw membershipError;
      }

      if (!membership) return null;

      // Get all members of this household
      const { data: members, error: membersError } = await supabase
        .from('primary_relationship_members')
        .select(`
          contact_id,
          role,
          contact:contacts(first_name, last_name)
        `)
        .eq('group_id', membership.group_id);

      if (membersError) throw membersError;

      return {
        groupId: membership.group_id,
        members: (members || []).map((m) => {
          const contact = m.contact as { first_name: string; last_name: string } | null;
          return {
            contact_id: m.contact_id,
            contact_name: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown',
            role: m.role,
          };
        }),
      };
    },
    enabled: !!contactId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

