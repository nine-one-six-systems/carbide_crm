import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useRouteError } from 'react-router-dom';

import { ErrorFallback } from './ErrorFallback';

interface RouteErrorBoundaryProps {
  children?: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * RouteErrorBoundary - Class-based error boundary for route-level errors.
 * 
 * This component catches errors that occur during route rendering, lifecycle methods,
 * and constructors. It provides a fallback UI and error recovery options.
 * 
 * Usage in React Router:
 * ```tsx
 * {
 *   path: '/contacts',
 *   element: <ContactsPage />,
 *   errorElement: <RouteErrorBoundary />
 * }
 * ```
 */
export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  public state: RouteErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RouteErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    // Reset error state
    this.setState({ hasError: false, error: null });
    // Reload the page to ensure clean state
    window.location.reload();
  };


  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <ErrorFallback
            error={this.state.error}
            resetErrorBoundary={this.handleReset}
            title="Route Error"
            description="An error occurred while loading this page. You can try again or return to the dashboard."
          />
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * RouteErrorFallback - Functional component wrapper for React Router's errorElement.
 * 
 * This component uses React Router's useRouteError hook to get the error
 * and wraps it with proper error handling UI.
 * 
 * This is used as the errorElement in route configurations.
 */
export function RouteErrorFallback() {
  const error = useRouteError() as Error;

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorFallback
        error={error}
        resetErrorBoundary={handleReset}
        title="Route Error"
        description="An error occurred while loading this page. You can try again or return to the dashboard."
      />
    </div>
  );
}

