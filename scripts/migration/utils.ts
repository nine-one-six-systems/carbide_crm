/**
 * Utility functions for data transformation
 */

/**
 * Normalize phone number to consistent format
 * Strips non-numeric characters but preserves extension indicators
 */
export function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  
  const trimmed = phone.trim();
  if (!trimmed) return undefined;
  
  // Remove common formatting but keep digits
  // Preserve extension indicators like 'x' or 'ext'
  const hasExtension = /(?:x|ext\.?)\s*(\d+)/i.exec(trimmed);
  let normalized = trimmed.replace(/[^\d+]/g, '');
  
  // Add back extension if present
  if (hasExtension) {
    normalized += ` x${hasExtension[1]}`;
  }
  
  return normalized || undefined;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normalize and validate email
 */
export function normalizeEmail(email: string | undefined): string | undefined {
  if (!email) return undefined;
  
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !isValidEmail(trimmed)) return undefined;
  
  return trimmed;
}

/**
 * Parse comma-separated tags into array
 */
export function parseTags(tags: string | undefined): string[] {
  if (!tags) return [];
  
  return tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Convert various date formats to ISO 8601
 */
export function normalizeDate(date: string | undefined): string | undefined {
  if (!date) return undefined;
  
  const trimmed = date.trim();
  if (!trimmed) return undefined;
  
  // Try parsing the date
  const parsed = new Date(trimmed);
  
  if (isNaN(parsed.getTime())) {
    // Try common formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
    ];
    
    for (const format of formats) {
      const match = trimmed.match(format);
      if (match) {
        if (format === formats[0] || format === formats[2]) {
          // MM/DD/YYYY or MM-DD-YYYY
          const [, month, day, year] = match;
          const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
          }
        } else {
          // YYYY-MM-DD
          return trimmed;
        }
      }
    }
    
    return undefined;
  }
  
  return parsed.toISOString().split('T')[0];
}

/**
 * Convert to boolean from various truthy values
 */
export function toBoolean(value: string | boolean | undefined): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  
  if (typeof value === 'boolean') return value;
  
  const normalized = value.toString().toLowerCase().trim();
  
  if (['true', 'yes', '1', 'y', 'on'].includes(normalized)) return true;
  if (['false', 'no', '0', 'n', 'off'].includes(normalized)) return false;
  
  return undefined;
}

/**
 * Safely parse number from string
 */
export function toNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  
  if (typeof value === 'number') return value;
  
  const parsed = parseFloat(value.toString().trim());
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Map legacy organization type to Carbide enum
 */
export function mapOrganizationType(
  legacyType: string | undefined
): 'company' | 'fund' | 'agency' | 'non_profit' | 'government' | 'other' | undefined {
  if (!legacyType) return undefined;
  
  const normalized = legacyType.toLowerCase().trim();
  
  const mapping: Record<string, 'company' | 'fund' | 'agency' | 'non_profit' | 'government' | 'other'> = {
    'company': 'company',
    'corporation': 'company',
    'llc': 'company',
    'inc': 'company',
    'fund': 'fund',
    'investment fund': 'fund',
    'venture fund': 'fund',
    'agency': 'agency',
    'non-profit': 'non_profit',
    'nonprofit': 'non_profit',
    'non profit': 'non_profit',
    '501c3': 'non_profit',
    'government': 'government',
    'gov': 'government',
    'public sector': 'government',
  };
  
  return mapping[normalized] || 'other';
}

/**
 * Clean and normalize URL
 */
export function normalizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  let trimmed = url.trim();
  if (!trimmed) return undefined;
  
  // Add https:// if no protocol
  if (!trimmed.match(/^https?:\/\//i)) {
    trimmed = `https://${trimmed}`;
  }
  
  try {
    const parsed = new URL(trimmed);
    return parsed.href;
  } catch {
    return undefined;
  }
}

/**
 * Map legacy phone label to Carbide format
 */
export function mapPhoneLabel(legacyField: string): string {
  const mapping: Record<string, string> = {
    'Mobile': 'mobile',
    'Phone': 'main',
    'Phone (work)': 'work',
    'Phone (other)': 'other',
    'Phone (Emergency)': 'emergency',
  };
  
  return mapping[legacyField] || 'other';
}

/**
 * Detect and remove duplicates based on key function
 */
export function deduplicateBy<T>(
  items: T[],
  keyFn: (item: T) => string
): { unique: T[]; duplicates: T[] } {
  const seen = new Map<string, T>();
  const duplicates: T[] = [];
  
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) {
      duplicates.push(item);
    } else {
      seen.set(key, item);
    }
  }
  
  return {
    unique: Array.from(seen.values()),
    duplicates,
  };
}

/**
 * Remove empty string values from object (keep nulls)
 */
export function removeEmptyStrings<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== '' && value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const cleaned = removeEmptyStrings(value as Record<string, unknown>);
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned;
        }
      } else {
        result[key] = value;
      }
    }
  }
  
  return result as Partial<T>;
}

/**
 * Generate a unique identifier for a contact (for deduplication)
 */
export function generateContactKey(
  firstName: string,
  lastName: string,
  email?: string
): string {
  const name = `${firstName.toLowerCase().trim()}_${lastName.toLowerCase().trim()}`;
  if (email) {
    return `${name}_${email.toLowerCase().trim()}`;
  }
  return name;
}

/**
 * Generate a unique identifier for an organization (for deduplication)
 */
export function generateOrgKey(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

