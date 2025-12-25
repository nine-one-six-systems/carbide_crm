import { formatDistanceToNow } from 'date-fns';
import { Mail, Phone, MessageSquare, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Activity } from '@/types/database';

interface RecentActivityTableProps {
  activities: Activity[];
  limit?: number;
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
};

export function RecentActivityTable({ activities, limit = 20 }: RecentActivityTableProps) {
  const displayActivities = activities.slice(0, limit);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Assigned</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayActivities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No recent activity
              </TableCell>
            </TableRow>
          ) : (
            displayActivities.map((activity) => {
              const contact = activity.contact;
              if (!contact) return null;

              const fullName = `${contact.first_name} ${contact.last_name}`;
              const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();
              const primaryEmail = contact.emails?.find((e) => e.is_primary);
              const primaryPhone = contact.phones?.find((p) => p.is_primary);
              const Icon = activityIcons[activity.type] || FileText;
              const occurredAt = new Date(activity.occurred_at);
              const relativeTime = formatDistanceToNow(occurredAt, { addSuffix: true });

              return (
                <TableRow key={activity.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link
                      to={`/contacts/${contact.id}`}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contact.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{fullName}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {primaryEmail ? (
                      <span className="text-sm">{primaryEmail.value}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {primaryPhone ? (
                      <span className="text-sm">{primaryPhone.value}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{activity.subject || activity.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{relativeTime}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">—</span>
                  </TableCell>
                  <TableCell>
                    {activity.logged_by_user ? (
                      <span className="text-sm text-muted-foreground">
                        {activity.logged_by_user.full_name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

