import { useState } from 'react';

import { format, formatDistanceToNow } from 'date-fns';
import {
  Users,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { ActivityType } from '@/types/database';

import { useHouseholdActivities, useHouseholdMembers } from '../hooks/useHouseholdActivities';

interface HouseholdTimelineProps {
  contactId: string;
}

const activityTypeConfig: Record<string, { icon: typeof Phone; color: string; label: string }> = {
  call_inbound: { icon: Phone, color: 'text-green-600', label: 'Inbound Call' },
  call_outbound: { icon: Phone, color: 'text-blue-600', label: 'Outbound Call' },
  email_inbound: { icon: Mail, color: 'text-green-600', label: 'Email Received' },
  email_outbound: { icon: Mail, color: 'text-blue-600', label: 'Email Sent' },
  text_inbound: { icon: MessageSquare, color: 'text-green-600', label: 'Text Received' },
  text_outbound: { icon: MessageSquare, color: 'text-blue-600', label: 'Text Sent' },
  meeting_in_person: { icon: Calendar, color: 'text-purple-600', label: 'In-Person Meeting' },
  meeting_virtual: { icon: Calendar, color: 'text-purple-600', label: 'Virtual Meeting' },
  note: { icon: FileText, color: 'text-gray-600', label: 'Note' },
  stage_change: { icon: ArrowRightLeft, color: 'text-orange-600', label: 'Stage Change' },
};

export function HouseholdTimeline({ contactId }: HouseholdTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'combined' | 'individual'>('combined');

  const { data: householdData, isLoading: loadingHousehold } = useHouseholdMembers(contactId);
  const { data: activities, isLoading: loadingActivities } = useHouseholdActivities(
    householdData?.groupId,
    !!householdData?.groupId
  );

  if (loadingHousehold) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!householdData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Household Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="No Household"
            description="This contact is not part of a household group."
          />
        </CardContent>
      </Card>
    );
  }

  const displayedActivities = showAll ? activities : activities?.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Household Timeline
          </CardTitle>
          <div className="flex gap-2">
            {householdData.members.map((member) => (
              <Link
                key={member.contact_id}
                to={`/contacts/${member.contact_id}`}
                className="group"
              >
                <Avatar className="h-8 w-8 border-2 border-background group-hover:border-primary transition-colors">
                  <AvatarFallback className="text-xs">
                    {member.contact_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Combined activity for {householdData.members.length} household member
          {householdData.members.length !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'combined' | 'individual')}>
          <TabsList className="mb-4">
            <TabsTrigger value="combined">Combined</TabsTrigger>
            <TabsTrigger value="individual">By Member</TabsTrigger>
          </TabsList>

          <TabsContent value="combined">
            {loadingActivities ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : !displayedActivities || displayedActivities.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Activities"
                description="No activities recorded for this household yet."
              />
            ) : (
              <div className="space-y-4">
                {displayedActivities.map((activity) => {
                  const config = activityTypeConfig[activity.type] || {
                    icon: FileText,
                    color: 'text-gray-600',
                    label: activity.type,
                  };
                  const Icon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={cn('mt-1', config.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{config.label}</span>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {activity.member_name}
                          </Badge>
                        </div>
                        {activity.subject && (
                          <p className="text-sm text-foreground mt-1">{activity.subject}</p>
                        )}
                        {activity.notes && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {activity.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(activity.occurred_at), { addSuffix: true })}
                          {' · '}
                          {format(new Date(activity.occurred_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {activities && activities.length > 10 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show All ({activities.length} activities)
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="individual">
            {loadingActivities ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : (
              <div className="space-y-6">
                {householdData.members.map((member) => {
                  const memberActivities = activities?.filter(
                    (a) => a.contact_id === member.contact_id
                  );

                  return (
                    <div key={member.contact_id}>
                      <div className="flex items-center gap-2 mb-3">
                        <Link
                          to={`/contacts/${member.contact_id}`}
                          className="font-medium hover:underline"
                        >
                          {member.contact_name}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {memberActivities?.length || 0} activities
                        </Badge>
                      </div>

                      {memberActivities && memberActivities.length > 0 ? (
                        <div className="space-y-2 pl-4 border-l-2">
                          {memberActivities.slice(0, 5).map((activity) => {
                            const config = activityTypeConfig[activity.type] || {
                              icon: FileText,
                              color: 'text-gray-600',
                              label: activity.type,
                            };
                            const Icon = config.icon;

                            return (
                              <div key={activity.id} className="flex items-center gap-2 py-1">
                                <Icon className={cn('h-4 w-4', config.color)} />
                                <span className="text-sm truncate flex-1">
                                  {activity.subject || config.label}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatDistanceToNow(new Date(activity.occurred_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground pl-4">No activities</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

