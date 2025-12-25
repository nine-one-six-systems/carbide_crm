import { format, formatDistanceToNow } from 'date-fns';
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Activity } from '@/types/database';

interface ActivityItemProps {
  activity: Activity;
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  call_inbound: Phone,
  call_outbound: Phone,
  email_inbound: Mail,
  email_outbound: Mail,
  text_inbound: MessageSquare,
  text_outbound: MessageSquare,
  meeting_in_person: Calendar,
  meeting_virtual: Calendar,
  note: FileText,
  stage_change: ArrowRight,
  relationship_created: ArrowRight,
  cadence_applied: Play,
  cadence_cleared: XCircle,
  cadence_paused: Pause,
  cadence_resumed: Play,
  task_completed: CheckCircle2,
  task_triaged: XCircle,
  task_dismissed: XCircle,
};

const activityLabels: Record<string, string> = {
  call_inbound: 'Inbound Call',
  call_outbound: 'Outbound Call',
  email_inbound: 'Inbound Email',
  email_outbound: 'Outbound Email',
  text_inbound: 'Inbound Text',
  text_outbound: 'Outbound Text',
  meeting_in_person: 'In-Person Meeting',
  meeting_virtual: 'Virtual Meeting',
  note: 'Note',
  stage_change: 'Stage Changed',
  relationship_created: 'Relationship Created',
  cadence_applied: 'Cadence Applied',
  cadence_cleared: 'Cadence Cleared',
  cadence_paused: 'Cadence Paused',
  cadence_resumed: 'Cadence Resumed',
  task_completed: 'Task Completed',
  task_triaged: 'Task Triaged',
  task_dismissed: 'Task Dismissed',
};

const getActivityColor = (type: string): string => {
  if (type === 'note') return 'bg-blue-100 text-blue-700';
  if (type.startsWith('call')) return 'bg-green-100 text-green-700';
  if (type.startsWith('email')) return 'bg-purple-100 text-purple-700';
  if (type.startsWith('text')) return 'bg-yellow-100 text-yellow-700';
  if (type.startsWith('meeting')) return 'bg-orange-100 text-orange-700';
  return 'bg-gray-100 text-gray-700';
};

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = activityIcons[activity.type] || FileText;
  const label = activityLabels[activity.type] || activity.type;
  const iconColor = getActivityColor(activity.type);

  const entity = activity.contact || activity.organization;
  const entityName = activity.contact
    ? `${activity.contact.first_name} ${activity.contact.last_name}`
    : activity.organization?.name || 'Unknown';

  const entityLink = activity.contact
    ? `/contacts/${activity.contact.id}`
    : activity.organization
      ? `/organizations/${activity.organization.id}`
      : null;

  const occurredAt = new Date(activity.occurred_at);
  const relativeTime = formatDistanceToNow(occurredAt, { addSuffix: true });

  return (
    <div className="flex gap-3 pb-4 border-b last:border-0 relative group">
      {/* Timeline connector line */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
      
      {/* Icon circle */}
      <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 relative z-10', iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{label}</span>
          {entityLink && (
            <Link
              to={entityLink}
              className="text-sm text-emerald-600 hover:underline truncate"
            >
              {entityName}
            </Link>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {relativeTime}
          </span>
        </div>
        {activity.subject && (
          <p className="text-sm font-medium mb-1">{activity.subject}</p>
        )}
        {activity.notes && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {activity.notes}
          </p>
        )}
        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {activity.metadata.stage_from && activity.metadata.stage_to && (
              <Badge variant="outline" className="text-xs">
                {activity.metadata.stage_from} → {activity.metadata.stage_to}
              </Badge>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-5 w-5">
            <AvatarImage
              src={activity.logged_by_user?.avatar_url || undefined}
              alt={activity.logged_by_user?.full_name || 'User'}
            />
            <AvatarFallback className="text-xs">
              {activity.logged_by_user?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {activity.logged_by_user && (
            <span className="text-xs text-muted-foreground">
              {activity.logged_by_user.full_name}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            • {format(occurredAt, 'MMM d, h:mm a')}
          </span>
        </div>
      </div>
    </div>
  );
}

