import type { ErrorInfo } from 'react';

import { getCurrentUserId } from './supabase/restClient';

export interface ErrorContext {
  [key: string]: unknown;
}

export interface ErrorLogPayload {
  error: {
    message: string;
    name?: string;
    stack?: string;
    code?: string | number;
  };
  context: ErrorContext;
  user: {
    id: string | null;
  };
  environment: {
    mode: string;
    route: string;
    timestamp: string;
  };
  browser: {
    userAgent: string;
    language: string;
    screenWidth: number;
    screenHeight: number;
  };
}

/**
 * Centralized error logging service
 * 
 * Logs errors with rich context metadata including:
 * - User ID (if authenticated)
 * - Current route
 * - Timestamp
 * - Browser information
 * 
 * In development: logs to console with formatted output
 * In production: outputs structured JSON ready for Sentry integration
 */
class ErrorLogger {
  /**
   * Collect browser and environment context
   */
  private getContext(): {
    user: { id: string | null };
    environment: { mode: string; route: string; timestamp: string };
    browser: {
      userAgent: string;
      language: string;
      screenWidth: number;
      screenHeight: number;
    };
  } {
    const userId = typeof window !== 'undefined' ? getCurrentUserId() : null;
    const route = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
    const timestamp = new Date().toISOString();
    const mode = import.meta.env.MODE || 'unknown';

    const browser = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
      screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
      screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
    };

    return {
      user: { id: userId },
      environment: { mode, route, timestamp },
      browser,
    };
  }

  /**
   * Extract error information from various error types
   */
  private extractErrorInfo(error: Error | unknown): {
    message: string;
    name?: string;
    stack?: string;
    code?: string | number;
  } {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const restError = error as { code?: string | number; message?: string };
      return {
        message: restError.message || String(error),
        code: restError.code,
      };
    }

    return {
      message: String(error),
    };
  }

  /**
   * Log an error with optional context
   * 
   * @param error - The error to log (Error, RestError, or unknown)
   * @param context - Additional context to include in the log
   */
  log(error: Error | unknown, context: ErrorContext = {}): void {
    const baseContext = this.getContext();
    const errorInfo = this.extractErrorInfo(error);

    const payload: ErrorLogPayload = {
      error: errorInfo,
      context,
      ...baseContext,
    };

    if (import.meta.env.DEV) {
      // Development: formatted console output
      console.error('🚨 Error logged:', {
        error: {
          message: errorInfo.message,
          name: errorInfo.name,
          code: errorInfo.code,
        },
        context,
        user: baseContext.user,
        environment: baseContext.environment,
        browser: baseContext.browser,
      });
      
      // Also log stack trace if available
      if (errorInfo.stack) {
        console.error('Stack trace:', errorInfo.stack);
      }
    } else {
      // Production: structured JSON (ready for Sentry)
      console.error(JSON.stringify(payload, null, 2));
    }
  }

  /**
   * Capture an exception from ErrorBoundary
   * 
   * @param error - The error that was caught
   * @param errorInfo - React error info (component stack, etc.)
   */
  captureException(error: Error, errorInfo?: ErrorInfo): void {
    const context: ErrorContext = {
      source: 'error-boundary',
    };

    if (errorInfo) {
      context.componentStack = errorInfo.componentStack;
    }

    this.log(error, context);
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

