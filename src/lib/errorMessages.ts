import type { RestError } from './supabase/restClient';

/**
 * Maps Supabase error codes to user-friendly messages
 */
const ERROR_CODE_MAP: Record<string, string> = {
  // PostgREST errors
  PGRST116: 'Record not found',
  PGRST301: 'Multiple rows returned when one was expected',
  
  // PostgreSQL error codes
  '23505': 'This record already exists',
  '23503': 'Cannot delete: record is in use',
  '42501': "You don't have permission to perform this action",
  '42P01': 'Table does not exist',
  '42703': 'Column does not exist',
  
  // HTTP status codes (as strings for consistency)
  '401': 'Authentication required. Please sign in.',
  '403': "You don't have permission to perform this action",
  '404': 'Record not found',
  '409': 'This record already exists',
  '422': 'Invalid data provided',
  '500': 'An unexpected error occurred. Please try again.',
  '503': 'Service temporarily unavailable. Please try again later.',
};

/**
 * Get a user-friendly error message from an error object
 * 
 * @param error - Error object (Error, RestError, or unknown)
 * @returns User-friendly error message
 */
export function getFriendlyMessage(error: Error | RestError | unknown): string {
  // Handle RestError interface
  if (error && typeof error === 'object' && 'code' in error) {
    const restError = error as RestError;
    
    // Check if we have a mapped message for this code
    if (restError.code !== undefined) {
      const codeStr = String(restError.code);
      if (ERROR_CODE_MAP[codeStr]) {
        return ERROR_CODE_MAP[codeStr];
      }
    }
    
    // Fall back to error message if available
    if (restError.message) {
      return restError.message;
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    // Check if error message contains a known code
    for (const [code, message] of Object.entries(ERROR_CODE_MAP)) {
      if (error.message.includes(code)) {
        return message;
      }
    }
    
    // Return the error message if it's user-friendly
    if (error.message) {
      return error.message;
    }
  }
  
  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}

