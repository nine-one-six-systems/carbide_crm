import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShieldX className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight">403</CardTitle>
          <CardDescription className="text-lg">
            Access Denied
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            You don't have permission to access this page. Please contact your administrator
            if you believe this is an error.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button asChild className="gap-2">
              <Link to="/dashboard">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

