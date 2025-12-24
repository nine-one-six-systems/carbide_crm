import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { UnifiedTask } from '@/types/database';

interface TaskCardProps {
  task: UnifiedTask;
  onComplete?: (taskId: string, taskSource: 'cadence' | 'manual') => void;
  onTriage?: (taskId: string, taskSource: 'cadence' | 'manual') => void;
  onDismiss?: (taskId: string, taskSource: 'cadence' | 'manual') => void;
}

export function TaskCard({
  task,
  onComplete,
  onTriage,
  onDismiss,
}: TaskCardProps) {
  const dueDate = new Date(task.due_date);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const daysUntilDue = differenceInDays(dueDate, new Date());

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'triaged':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    if (task.status === 'completed') return 'bg-green-100 text-green-800';
    if (task.status === 'triaged') return 'bg-yellow-100 text-yellow-800';
    if (task.status === 'dismissed') return 'bg-gray-100 text-gray-800';
    if (isOverdue) return 'bg-red-100 text-red-800';
    if (daysUntilDue <= 1) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-md',
        task.status === 'dismissed' && 'opacity-60'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <h3 className="font-semibold truncate">{task.title}</h3>
            </div>
            {task.contact_name && (
              <Link
                to={`/contacts/${task.contact_id}`}
                className="text-sm text-primary hover:underline truncate block"
              >
                {task.contact_name}
              </Link>
            )}
            {task.cadence_name && (
              <p className="text-xs text-muted-foreground mt-1">
                From: {task.cadence_name}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge className={cn('text-xs', getStatusColor())}>
                {task.status}
              </Badge>
              {task.task_type && (
                <Badge variant="outline" className="text-xs">
                  {task.task_type}
                </Badge>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(dueDate, 'MMM d, yyyy')}</span>
                {isOverdue && (
                  <span className="text-red-600 font-medium">
                    ({Math.abs(daysUntilDue)} days overdue)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {task.status === 'pending' && (
          <div className="flex gap-2 mt-3">
            {onComplete && (
              <button
                onClick={() => onComplete(task.id, task.task_source)}
                className="text-xs text-green-600 hover:underline"
              >
                Complete
              </button>
            )}
            {onTriage && (
              <button
                onClick={() => onTriage(task.id, task.task_source)}
                className="text-xs text-yellow-600 hover:underline"
              >
                Triage
              </button>
            )}
            {onDismiss && (
              <button
                onClick={() => onDismiss(task.id, task.task_source)}
                className="text-xs text-gray-600 hover:underline"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

