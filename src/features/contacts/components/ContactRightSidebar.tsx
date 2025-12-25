import { CheckCircle2, Clock, Eye, Globe, Pause, Play, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Contact, UnifiedTask, BusinessRelationship, AppliedCadence } from '@/types/database';

import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useRelationships } from '@/features/relationships/hooks/useRelationships';
import { useAppliedCadences } from '@/features/cadences/hooks/useAppliedCadences';
import { useContactActivities } from '../hooks/useContactActivities';
import { useAuth } from '@/features/auth/context/AuthContext';
import { CustomAttributesCard } from './CustomAttributesCard';

interface ContactRightSidebarProps {
  contact: Contact;
}

const taskTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Clock,
  email: Clock,
  text: Clock,
  meeting: Clock,
  send_mailer: Clock,
  other: Clock,
};

const getTaskDueDateColor = (dueDate: string) => {
  const date = new Date(dueDate);
  if (isPast(date) && !isToday(date)) return 'text-red-600';
  if (isToday(date)) return 'text-amber-600';
  if (isTomorrow(date)) return 'text-blue-600';
  return 'text-muted-foreground';
};

const formatTaskDueDate = (dueDate: string) => {
  const date = new Date(dueDate);
  if (isPast(date) && !isToday(date)) return 'Overdue';
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
};

export function ContactRightSidebar({ contact }: ContactRightSidebarProps) {
  const { user } = useAuth();
  const { data: tasks, isLoading: tasksLoading } = useTasks({
    contactId: contact.id,
    status: ['pending'],
  });
  const { data: relationshipsData, isLoading: relationshipsLoading } = useRelationships({
    contactId: contact.id,
    page: 1,
    pageSize: 10,
  });
  const { data: appliedCadences, isLoading: cadencesLoading } = useAppliedCadences(contact.id);
  const { data: activities } = useContactActivities(contact.id, 50);

  const pendingTasks = tasks?.filter((t) => t.status === 'pending') || [];
  const overdueTasks = pendingTasks.filter((t) => {
    const dueDate = new Date(t.due_date);
    return isPast(dueDate) && !isToday(dueDate);
  });
  const relationships = relationshipsData?.data || [];
  const activeCadences = appliedCadences?.filter(
    (c) => c.status === 'active' || c.status === 'paused'
  ) || [];

  // Calculate activity metrics
  const lastActivity = activities && activities.length > 0 ? activities[0] : null;
  const lastActivityTime = lastActivity ? new Date(lastActivity.occurred_at) : null;
  const hoursSinceActivity = lastActivityTime
    ? Math.floor((Date.now() - lastActivityTime.getTime()) / (1000 * 60 * 60))
    : null;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Tasks Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tasks</CardTitle>
              <div className="flex items-center gap-2">
                {overdueTasks.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {overdueTasks.length} overdue
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {pendingTasks.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending tasks</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.slice(0, 5).map((task) => {
                  const TaskIcon = taskTypeIcons[task.task_type || 'other'] || Clock;
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <TaskIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{task.title}</p>
                        <p className={`text-xs ${getTaskDueDateColor(task.due_date)}`}>
                          {formatTaskDueDate(task.due_date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {pendingTasks.length > 5 && (
                  <Link
                    to={`/tasks?contactId=${contact.id}`}
                    className="text-sm text-emerald-600 hover:underline block text-center pt-2"
                  >
                    View all {pendingTasks.length} tasks
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointments Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Appointments</CardTitle>
              <Badge variant="secondary" className="text-xs">0</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No upcoming appointments, view past
            </p>
          </CardContent>
        </Card>

        {/* Deals Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Deals</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {relationships.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {relationshipsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : relationships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deals</p>
            ) : (
              <div className="space-y-2">
                {relationships.slice(0, 5).map((rel) => (
                  <div key={rel.id} className="p-2 rounded-md hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{rel.type}</p>
                      <Badge variant="outline" className="text-xs">
                        {rel.stage}
                      </Badge>
                    </div>
                    {rel.ventures && rel.ventures.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rel.ventures.map((venture) => (
                          <Badge key={venture} variant="secondary" className="text-xs">
                            {venture}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {relationships.length > 5 && (
                  <Link
                    to={`/relationships?contactId=${contact.id}`}
                    className="text-sm text-emerald-600 hover:underline block text-center pt-2"
                  >
                    View all {relationships.length} deals
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cadences Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Cadences</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {activeCadences.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {cadencesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16" />
              </div>
            ) : activeCadences.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active cadences</p>
            ) : (
              <div className="space-y-2">
                {activeCadences.map((cadence) => {
                  const cadenceName =
                    (cadence as any).cadence_template?.name || 'Unknown Cadence';
                  return (
                    <div
                      key={cadence.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {cadence.status === 'active' ? (
                            <Play className="h-3 w-3 text-emerald-600 shrink-0" />
                          ) : (
                            <Pause className="h-3 w-3 text-amber-600 shrink-0" />
                          )}
                          <p className="text-sm font-medium truncate">{cadenceName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {cadence.status === 'active' ? 'Active' : 'Paused'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastActivityTime && hoursSinceActivity !== null && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Seen {hoursSinceActivity < 24 ? `${hoursSinceActivity} hours` : `${Math.floor(hoursSinceActivity / 24)} days`} ago
                </p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {activities?.length || 0}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total activities</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Link
                to={`/contacts/${contact.id}#activity`}
                className="text-xs text-emerald-600 hover:underline"
              >
                SEE ALL
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activities && activities.length > 0 ? (
              <div className="space-y-2">
                {activities.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.subject || activity.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.occurred_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Custom Attributes */}
        {contact.custom_attributes && Object.keys(contact.custom_attributes).length > 0 && (
          <CustomAttributesCard customAttributes={contact.custom_attributes} />
        )}

        {/* Keyboard Navigation Hint */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground text-center">
              Press{' '}
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-background border border-border rounded">
                ←
              </kbd>{' '}
              to view next lead or{' '}
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-background border border-border rounded">
                →
              </kbd>{' '}
              to view previous lead
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

