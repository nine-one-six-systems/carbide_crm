import { Component, type ErrorInfo, type ReactNode } from 'react';

import { errorLogger } from '@/lib/errorLogger';

import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using centralized error logger
    errorLogger.captureException(error, errorInfo);
    
    // Keep existing console.error for backward compatibility
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom onError handler if provided
    this.props.onError?.(error, errorInfo);
  }

  public resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary wrapper
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

interface QueryErrorBoundaryProps {
  children: ReactNode;
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary onReset={reset}>
      {children}
    </ErrorBoundary>
  );
}

