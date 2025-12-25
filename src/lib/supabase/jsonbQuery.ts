/**
 * Utility functions for building JSONB filter queries in Supabase
 */

import type { CustomAttributeFilter } from '@/types/api';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Build a JSONB path expression for custom attributes
 * @example buildJsonbPath('personal', 'birthday') => "custom_attributes->'personal'->>'birthday'"
 */
export function buildJsonbPath(category: string, key: string): string {
  return `custom_attributes->'${category}'->>'${key}'`;
}

/**
 * Apply a single custom attribute filter to a Supabase query
 */
export function applyCustomAttributeFilter<T extends Record<string, unknown>>(
  query: PostgrestFilterBuilder<T, T, T[]>,
  filter: CustomAttributeFilter
): PostgrestFilterBuilder<T, T, T[]> {
  const path = buildJsonbPath(filter.category, filter.key);
  const operator = filter.operator || 'contains';

  switch (operator) {
    case 'equals':
      // For exact match, use the raw filter
      return query.filter(path, 'eq', filter.value);
    
    case 'contains':
      // For partial match (case-insensitive)
      return query.filter(path, 'ilike', `%${filter.value}%`);
    
    case 'gt':
      return query.filter(path, 'gt', filter.value);
    
    case 'lt':
      return query.filter(path, 'lt', filter.value);
    
    case 'gte':
      return query.filter(path, 'gte', filter.value);
    
    case 'lte':
      return query.filter(path, 'lte', filter.value);
    
    default:
      return query;
  }
}

/**
 * Apply multiple custom attribute filters to a Supabase query
 */
export function applyCustomAttributeFilters<T extends Record<string, unknown>>(
  query: PostgrestFilterBuilder<T, T, T[]>,
  filters: CustomAttributeFilter[]
): PostgrestFilterBuilder<T, T, T[]> {
  let filteredQuery = query;
  
  for (const filter of filters) {
    filteredQuery = applyCustomAttributeFilter(filteredQuery, filter);
  }
  
  return filteredQuery;
}

/**
 * Build a raw PostgreSQL filter string for custom attribute queries
 * This is useful for more complex queries that can't be expressed with Supabase's filter builder
 */
export function buildRawCustomAttributeFilter(
  category: string,
  key: string,
  value: string,
  operator: CustomAttributeFilter['operator'] = 'contains'
): string {
  const path = `custom_attributes->'${category}'->>'${key}'`;
  
  switch (operator) {
    case 'equals':
      return `${path} = '${value}'`;
    case 'contains':
      return `${path} ILIKE '%${value}%'`;
    case 'gt':
      return `(${path})::numeric > ${value}`;
    case 'lt':
      return `(${path})::numeric < ${value}`;
    case 'gte':
      return `(${path})::numeric >= ${value}`;
    case 'lte':
      return `(${path})::numeric <= ${value}`;
    default:
      return `${path} ILIKE '%${value}%'`;
  }
}

/**
 * Build a filter for finding contacts/orgs with a specific custom attribute present
 */
export function buildHasAttributeFilter(category: string, key: string): string {
  return `custom_attributes->'${category}'->>'${key}' IS NOT NULL`;
}

/**
 * Build a filter for finding contacts/orgs within a geographic bounding box
 */
export function buildGeoBoundingBoxFilter(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
): string {
  return `
    (custom_attributes->'geo'->>'lat')::numeric BETWEEN ${minLat} AND ${maxLat}
    AND (custom_attributes->'geo'->>'lng')::numeric BETWEEN ${minLng} AND ${maxLng}
  `.trim();
}

/**
 * Build a filter for finding contacts with birthdays in a specific month
 */
export function buildBirthdayMonthFilter(month: number): string {
  return `EXTRACT(MONTH FROM (custom_attributes->'personal'->>'birthday')::date) = ${month}`;
}

/**
 * Build a filter for finding contacts with upcoming birthdays
 * @param daysAhead Number of days to look ahead
 */
export function buildUpcomingBirthdaysFilter(daysAhead: number = 30): string {
  return `
    custom_attributes->'personal'->>'birthday' IS NOT NULL
    AND (
      (
        DATE_PART('month', (custom_attributes->'personal'->>'birthday')::date) = DATE_PART('month', CURRENT_DATE)
        AND DATE_PART('day', (custom_attributes->'personal'->>'birthday')::date) >= DATE_PART('day', CURRENT_DATE)
      )
      OR (
        DATE_PART('month', (custom_attributes->'personal'->>'birthday')::date) = DATE_PART('month', CURRENT_DATE + INTERVAL '${daysAhead} days')
        AND DATE_PART('day', (custom_attributes->'personal'->>'birthday')::date) <= DATE_PART('day', CURRENT_DATE + INTERVAL '${daysAhead} days')
      )
    )
  `.trim();
}

