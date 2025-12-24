import { format } from 'date-fns';
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

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = activityIcons[activity.type] || FileText;
  const label = activityLabels[activity.type] || activity.type;

  const entity = activity.contact || activity.organization;
  const entityName = activity.contact
    ? `${activity.contact.first_name} ${activity.contact.last_name}`
    : activity.organization?.name || 'Unknown';

  const entityLink = activity.contact
    ? `/contacts/${activity.contact.id}`
    : activity.organization
      ? `/organizations/${activity.organization.id}`
      : null;

  return (
    <div className="flex gap-3 pb-4 border-b last:border-0">
      <Avatar className="h-8 w-8 shrink-0">
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">{label}</span>
          {entityLink && (
            <Link
              to={entityLink}
              className="text-sm text-primary hover:underline truncate"
            >
              {entityName}
            </Link>
          )}
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
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(activity.occurred_at), 'MMM d, yyyy h:mm a')}
          {activity.logged_by_user && (
            <> • by {activity.logged_by_user.full_name}</>
          )}
        </p>
      </div>
    </div>
  );
}

