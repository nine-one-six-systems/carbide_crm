import { useState } from 'react';

import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  description = "We're sorry, but something unexpected happened. Please try again.",
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {resetErrorBoundary && (
              <Button onClick={resetErrorBoundary} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button variant="outline" asChild className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          {error && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-muted-foreground"
                onClick={() => setShowDetails(!showDetails)}
              >
                <span className="text-xs">Technical Details</span>
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showDetails && (
                <div className="mt-2 rounded-lg bg-muted p-3">
                  <p className="text-xs font-medium text-destructive">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre className="mt-2 max-h-40 overflow-auto text-xs text-muted-foreground whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Compact version for inline use
interface InlineErrorProps {
  error: Error | string | null;
  onRetry?: () => void;
}

export function InlineError({ error, onRetry }: InlineErrorProps) {
  const message = typeof error === 'string' ? error : error?.message || 'An error occurred';

  return (
    <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 p-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">{message}</span>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-destructive hover:text-destructive"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

