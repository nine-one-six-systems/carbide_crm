import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { format, subDays, isToday } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppliedCadences } from '@/features/cadences/hooks/useAppliedCadences';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

interface TeamMemberStats {
  userId: string;
  userName: string;
  overdueCount: number;
  dueTodayCount: number;
  completedCount: number;
  cadencesAddedCount: number;
}

export function ManagerDashboard() {
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  const daysBack = parseInt(dateRange);

  // Get all team members
  const { data: teamMembers } = useQuery<Profile[]>({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return (data || []) as Profile[];
    },
  });

  // Get stats for each team member
  const { data: teamStats } = useQuery<TeamMemberStats[]>({
    queryKey: ['team-stats', dateRange],
    queryFn: async () => {
      if (!teamMembers) return [];

      const stats: TeamMemberStats[] = [];

      for (const member of teamMembers) {
        // Get tasks for this user
        const { data: userTasks } = await supabase.rpc('get_user_tasks', {
          p_user_id: member.id,
          p_status: ['pending'],
        });

        const overdueCount =
          userTasks?.filter((task: any) => {
            const dueDate = new Date(task.due_date);
            return dueDate < new Date() && !isToday(dueDate);
          }).length || 0;

        const dueTodayCount =
          userTasks?.filter((task: any) => {
            return isToday(new Date(task.due_date));
          }).length || 0;

        // Get completed tasks count
        const { data: completedTasks } = await supabase.rpc('get_user_tasks', {
          p_user_id: member.id,
          p_status: ['completed'],
          p_from_date: format(subDays(new Date(), daysBack), 'yyyy-MM-dd'),
        });

        const completedCount = completedTasks?.length || 0;

        // Get cadences added count
        const { data: cadences } = await supabase
          .from('applied_cadences')
          .select('id', { count: 'exact', head: true })
          .eq('applied_by', member.id)
          .gte('applied_at', format(subDays(new Date(), daysBack), 'yyyy-MM-dd'));

        const cadencesAddedCount = cadences?.length || 0;

        stats.push({
          userId: member.id,
          userName: member.full_name,
          overdueCount,
          dueTodayCount,
          completedCount,
          cadencesAddedCount,
        });
      }

      return stats;
    },
    enabled: !!teamMembers,
  });

  const getOverdueBadge = (count: number) => {
    if (count === 0) {
      return <Badge className="bg-green-100 text-green-800">0 🟢</Badge>;
    }
    if (count < 5) {
      return <Badge className="bg-yellow-100 text-yellow-800">{count} 🟡</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">{count} 🔴</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Overview</h2>
          <p className="text-muted-foreground">Monitor team performance and task management</p>
        </div>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as '7' | '30' | '90')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Health</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead>Due Today</TableHead>
                <TableHead>Completed ({dateRange}d)</TableHead>
                <TableHead>Cadences Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamStats?.map((stat) => (
                <TableRow key={stat.userId}>
                  <TableCell className="font-medium">{stat.userName}</TableCell>
                  <TableCell>{getOverdueBadge(stat.overdueCount)}</TableCell>
                  <TableCell>{stat.dueTodayCount}</TableCell>
                  <TableCell>{stat.completedCount}</TableCell>
                  <TableCell>{stat.cadencesAddedCount}</TableCell>
                </TableRow>
              ))}
              {(!teamStats || teamStats.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No team members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamStats?.reduce((sum, stat) => sum + stat.overdueCount, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamStats?.reduce((sum, stat) => sum + stat.dueTodayCount, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamStats?.reduce((sum, stat) => sum + stat.completedCount, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


