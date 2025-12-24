import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Configure when you receive email notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-tasks">Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get email reminders for upcoming tasks
              </p>
            </div>
            <Switch id="email-tasks" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-overdue">Overdue Task Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when tasks become overdue
              </p>
            </div>
            <Switch id="email-overdue" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-activity">Activity Updates</Label>
              <p className="text-sm text-muted-foreground">
                Weekly summary of activities
              </p>
            </div>
            <Switch id="email-activity" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Digest Time</Label>
              <p className="text-sm text-muted-foreground">
                When to send daily task summary
              </p>
            </div>
            <Select defaultValue="8am">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6am">6:00 AM</SelectItem>
                <SelectItem value="7am">7:00 AM</SelectItem>
                <SelectItem value="8am">8:00 AM</SelectItem>
                <SelectItem value="9am">9:00 AM</SelectItem>
                <SelectItem value="off">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>
            Configure in-app notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-tasks">Task Due Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Show alerts when tasks are due
              </p>
            </div>
            <Switch id="push-tasks" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-updates">Real-time Updates</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications for new activities
              </p>
            </div>
            <Switch id="push-updates" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-sound">Sound</Label>
              <p className="text-sm text-muted-foreground">
                Play a sound for notifications
              </p>
            </div>
            <Switch id="push-sound" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cadence Notifications</CardTitle>
          <CardDescription>
            Configure cadence-related notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cadence-start">Cadence Started</Label>
              <p className="text-sm text-muted-foreground">
                Notify when a cadence is applied
              </p>
            </div>
            <Switch id="cadence-start" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cadence-complete">Cadence Completed</Label>
              <p className="text-sm text-muted-foreground">
                Notify when all cadence tasks are done
              </p>
            </div>
            <Switch id="cadence-complete" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cadence-stale">Stale Cadence Alert</Label>
              <p className="text-sm text-muted-foreground">
                Alert when cadence tasks haven't been completed in 30+ days
              </p>
            </div>
            <Switch id="cadence-stale" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

