import { format, isPast, isToday as isTodayDate, addDays, startOfDay } from 'date-fns';
import { Plus, AlertCircle, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

import { QueryErrorBoundary } from '@/components/error/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ActivityFeed } from '@/features/activities/components/ActivityFeed';
import { LogActivityDialog } from '@/features/activities/components/LogActivityDialog';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ContactCadences } from '@/features/cadences/components/ContactCadences';
import { useAppliedCadences } from '@/features/cadences/hooks/useAppliedCadences';
import { TaskForm } from '@/features/tasks/components/TaskForm';
import { TaskList } from '@/features/tasks/components/TaskList';
import { useTasks } from '@/features/tasks/hooks/useTasks';

function SalespersonDashboardContent() {
  const { profile } = useAuth();
  const today = startOfDay(new Date());
  const sevenDaysFromNow = addDays(today, 7);

  // Get tasks
  const { data: allTasks } = useTasks({ status: ['pending'] });
  
  // Calculate task counts
  const overdueTasks = allTasks?.filter((task) => {
    const dueDate = new Date(task.due_date);
    return isPast(dueDate) && !isTodayDate(dueDate);
  }) || [];

  const dueTodayTasks = allTasks?.filter((task) => {
    return isTodayDate(new Date(task.due_date));
  }) || [];

  const upcomingTasks = allTasks?.filter((task) => {
    const dueDate = new Date(task.due_date);
    return dueDate > today && dueDate <= sevenDaysFromNow;
  }) || [];

  // Get recent activities
  const { data: recentActivities } = useActivities({
    page: 1,
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Good {getTimeOfDay()}, {profile?.full_name?.split(' ')[0] || 'User'}
          </h2>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Today's Focus & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium">{overdueTasks.length} Overdue Tasks</span>
              </div>
              <Link to="/tasks?status=pending">
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">{dueTodayTasks.length} Due Today</span>
              </div>
              <Link to="/tasks?status=pending">
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  {upcomingTasks.length} Upcoming (7 days)
                </span>
              </div>
              <Link to="/tasks?status=pending">
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link to="/contacts/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                New Contact
              </Button>
            </Link>
            <LogActivityDialog
              trigger={
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Log Activity
                </Button>
              }
            />
            <Link to="/cadences">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Apply Cadence
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                  <DialogDescription>
                    Create a new task to track your work.
                  </DialogDescription>
                </DialogHeader>
                <TaskForm />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Tasks & Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList
              searchParams={{
                status: ['pending'],
              }}
              showActions={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities?.data && recentActivities.data.length > 0 ? (
              <ActivityFeed activities={recentActivities.data} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function SalespersonDashboard() {
  return (
    <QueryErrorBoundary>
      <SalespersonDashboardContent />
    </QueryErrorBoundary>
  );
}

