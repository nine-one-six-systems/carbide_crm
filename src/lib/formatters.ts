import { format, formatDistanceToNow, formatRelative, isValid, parseISO } from 'date-fns';

/**
 * Format a date string to a human-readable format
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr = 'MMM d, yyyy'
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatStr);
}

/**
 * Format a date with time
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  formatStr = 'MMM d, yyyy h:mm a'
): string {
  return formatDate(date, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a date as a relative date (e.g., "yesterday", "last Monday")
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return formatRelative(dateObj, new Date());
}

/**
 * Format a currency value
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency = 'USD',
  locale = 'en-US'
): string {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  value: number | null | undefined,
  locale = 'en-US'
): string {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a percentage
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals = 0,
  locale = 'en-US'
): string {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format a phone number to a standard format
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Handle US numbers with country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return as-is for international numbers
  return phone;
}

/**
 * Format a file size
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format a name to title case
 */
export function formatName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ');
}

/**
 * Get initials from a name
 */
export function getInitials(name: string | null | undefined, maxLength = 2): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, maxLength)
    .join('')
    .toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Format a list of items with proper grammar
 */
export function formatList(items: string[], conjunction = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(` ${conjunction} `);
  
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

/**
 * Format count with label (e.g., "5 tasks", "1 contact")
 */
export function formatCount(count: number, singular: string, plural?: string): string {
  return `${formatNumber(count)} ${pluralize(count, singular, plural)}`;
}

