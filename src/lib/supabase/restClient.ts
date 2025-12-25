/**
 * Supabase REST Client
 *
 * A lightweight REST client for Supabase that bypasses the SDK.
 * This was created because the SDK v2.89.0 hangs on queries in React 19.
 * Direct fetch calls to the REST API work reliably.
 */

import { supabase } from './client';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ============================================================================
// Types
// ============================================================================

export interface RestQueryOptions {
  select?: string;
  order?: { column: string; ascending?: boolean };
  range?: { from: number; to: number };
  limit?: number;
  offset?: number;
  filters?: RestFilter[];
  count?: 'exact' | 'planned' | 'estimated';
  single?: boolean;
}

export interface RestFilter {
  column: string;
  operator: FilterOperator;
  value: unknown;
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'is'
  | 'in'
  | 'cs'
  | 'cd'
  | 'fts'
  | 'or';

export interface RestResponse<T> {
  data: T | null;
  error: RestError | null;
  count?: number | null;
}

export interface RestError {
  message: string;
  code?: string | number;
  details?: string;
  hint?: string;
}

export interface RpcOptions {
  args?: Record<string, unknown>;
  count?: 'exact' | 'planned' | 'estimated';
}

// ============================================================================
// Token Management
// ============================================================================

/**
 * Get access token from Supabase client session
 * This ensures we always get the current valid token
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    // Get session from Supabase client - this is the most reliable way
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    // Fallback to localStorage parsing if getSession fails
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
          const value = localStorage.getItem(key);
          if (value) {
            const data = JSON.parse(value);
            return data.access_token || null;
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }
  return null;
}

/**
 * Synchronous version that reads from localStorage
 * Use this only when you can't await (e.g., in non-async contexts)
 */
export function getAccessTokenSync(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
        const value = localStorage.getItem(key);
        if (value) {
          const data = JSON.parse(value);
          return data.access_token || null;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/**
 * Get current user ID from stored session
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
        const value = localStorage.getItem(key);
        if (value) {
          const data = JSON.parse(value);
          return data.user?.id || null;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// ============================================================================
// Request Helpers
// ============================================================================

function getHeaders(accessToken: string | null, prefer?: string): HeadersInit {
  const headers: HeadersInit = {
    apikey: supabaseKey,
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (prefer) {
    headers['Prefer'] = prefer;
  }

  return headers;
}

async function getHeadersAsync(prefer?: string): Promise<HeadersInit> {
  const accessToken = await getAccessToken();
  return getHeaders(accessToken, prefer);
}

function buildFilterParam(filter: RestFilter): string {
  const { column, operator, value } = filter;

  switch (operator) {
    case 'eq':
    case 'neq':
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
    case 'like':
    case 'ilike':
      return `${column}=${operator}.${value}`;
    case 'is':
      return `${column}=is.${value}`;
    case 'in':
      if (Array.isArray(value)) {
        return `${column}=in.(${value.join(',')})`;
      }
      return `${column}=in.(${value})`;
    case 'cs':
      if (Array.isArray(value)) {
        return `${column}=cs.{${value.join(',')}}`;
      }
      return `${column}=cs.${value}`;
    case 'cd':
      if (Array.isArray(value)) {
        return `${column}=cd.{${value.join(',')}}`;
      }
      return `${column}=cd.${value}`;
    case 'fts':
      return `${column}=fts.${value}`;
    case 'or':
      return `or=(${value})`;
    default:
      return `${column}=eq.${value}`;
  }
}

function extractCount(headers: Headers): number | null {
  const contentRange = headers.get('content-range');
  if (contentRange) {
    const match = contentRange.match(/\/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

async function handleResponse<T>(response: Response): Promise<RestResponse<T>> {
  const count = extractCount(response.headers);

  if (!response.ok) {
    let errorData: Record<string, unknown> = {};
    try {
      errorData = await response.json();
    } catch {
      // Response may not be JSON
    }

    return {
      data: null,
      error: {
        message: (errorData.message as string) || `Request failed with status ${response.status}`,
        code: (errorData.code as string) || response.status,
        details: errorData.details as string,
        hint: errorData.hint as string,
      },
      count,
    };
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return { data: null, error: null, count };
  }

  try {
    const data = await response.json();
    return { data, error: null, count };
  } catch {
    return { data: null, error: null, count };
  }
}

// ============================================================================
// REST Client Methods
// ============================================================================

/**
 * Perform a SELECT query on a table
 */
export async function query<T>(
  table: string,
  options: RestQueryOptions = {}
): Promise<RestResponse<T[]>> {
  const params = new URLSearchParams();

  // Select columns
  params.set('select', options.select || '*');

  // Order
  if (options.order) {
    const direction = options.order.ascending ? 'asc' : 'desc';
    params.set('order', `${options.order.column}.${direction}`);
  }

  // Pagination via range
  if (options.range) {
    params.set('offset', String(options.range.from));
    params.set('limit', String(options.range.to - options.range.from + 1));
  } else {
    // Or via limit/offset
    if (options.offset !== undefined) {
      params.set('offset', String(options.offset));
    }
    if (options.limit !== undefined) {
      params.set('limit', String(options.limit));
    }
  }

  // Filters
  if (options.filters) {
    for (const filter of options.filters) {
      const param = buildFilterParam(filter);
      const [key, value] = param.split('=');
      params.set(key, value);
    }
  }

  // Build prefer header
  const preferParts: string[] = [];
  if (options.count) {
    preferParts.push(`count=${options.count}`);
  }
  const prefer = preferParts.length > 0 ? preferParts.join(',') : undefined;

  const url = `${supabaseUrl}/rest/v1/${table}?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: await getHeadersAsync(prefer),
  });

  return handleResponse<T[]>(response);
}

/**
 * Perform a SELECT query that returns a single row
 */
export async function querySingle<T>(
  table: string,
  options: RestQueryOptions = {}
): Promise<RestResponse<T>> {
  const params = new URLSearchParams();

  params.set('select', options.select || '*');

  if (options.filters) {
    for (const filter of options.filters) {
      const param = buildFilterParam(filter);
      const [key, value] = param.split('=');
      params.set(key, value);
    }
  }

  params.set('limit', '1');

  const url = `${supabaseUrl}/rest/v1/${table}?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: await getHeadersAsync('return=representation'),
  });

  const result = await handleResponse<T[]>(response);

  if (result.error) {
    return { data: null, error: result.error };
  }

  if (!result.data || result.data.length === 0) {
    return {
      data: null,
      error: { message: 'No rows returned', code: 'PGRST116' },
    };
  }

  return { data: result.data[0], error: null };
}

/**
 * Insert data into a table
 */
export async function insert<T>(
  table: string,
  data: Record<string, unknown> | Record<string, unknown>[],
  options: { select?: string; returning?: boolean } = {}
): Promise<RestResponse<T>> {

  const preferParts: string[] = [];
  if (options.returning !== false) {
    preferParts.push('return=representation');
  }

  const params = new URLSearchParams();
  if (options.select) {
    params.set('select', options.select);
  }

  const url = `${supabaseUrl}/rest/v1/${table}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: await getHeadersAsync(preferParts.join(',')),
    body: JSON.stringify(data),
  });

  const result = await handleResponse<T | T[]>(response);

  // If array was inserted and we got an array back, return just the array
  // If single object was inserted, return the first item
  if (result.data && Array.isArray(result.data) && !Array.isArray(data)) {
    return { data: result.data[0] as T, error: null };
  }

  return result as RestResponse<T>;
}

/**
 * Update data in a table
 */
export async function update<T>(
  table: string,
  data: Record<string, unknown>,
  filters: RestFilter[],
  options: { select?: string; returning?: boolean } = {}
): Promise<RestResponse<T>> {

  const preferParts: string[] = [];
  if (options.returning !== false) {
    preferParts.push('return=representation');
  }

  const params = new URLSearchParams();
  if (options.select) {
    params.set('select', options.select);
  }

  // Add filters
  for (const filter of filters) {
    const param = buildFilterParam(filter);
    const [key, value] = param.split('=');
    params.set(key, value);
  }

  const url = `${supabaseUrl}/rest/v1/${table}?${params.toString()}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: await getHeadersAsync(preferParts.join(',')),
    body: JSON.stringify(data),
  });

  const result = await handleResponse<T | T[]>(response);

  // Return single item if we got an array back
  if (result.data && Array.isArray(result.data)) {
    return { data: result.data[0] as T, error: null };
  }

  return result as RestResponse<T>;
}

/**
 * Delete data from a table
 */
export async function remove(
  table: string,
  filters: RestFilter[],
  options: { returning?: boolean } = {}
): Promise<RestResponse<null>> {

  const preferParts: string[] = [];
  if (options.returning) {
    preferParts.push('return=representation');
  }

  const params = new URLSearchParams();
  for (const filter of filters) {
    const param = buildFilterParam(filter);
    const [key, value] = param.split('=');
    params.set(key, value);
  }

  const url = `${supabaseUrl}/rest/v1/${table}?${params.toString()}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: await getHeadersAsync(preferParts.length > 0 ? preferParts.join(',') : undefined),
  });

  return handleResponse<null>(response);
}

/**
 * Call a database function (RPC)
 */
export async function rpc<T>(
  functionName: string,
  options: RpcOptions = {}
): Promise<RestResponse<T>> {

  const preferParts: string[] = [];
  if (options.count) {
    preferParts.push(`count=${options.count}`);
  }

  const url = `${supabaseUrl}/rest/v1/rpc/${functionName}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: await getHeadersAsync(preferParts.length > 0 ? preferParts.join(',') : undefined),
    body: JSON.stringify(options.args || {}),
  });

  return handleResponse<T>(response);
}

// ============================================================================
// Fluent Query Builder (Optional, for complex queries)
// ============================================================================

export class QueryBuilder<T> {
  private table: string;
  private selectStr: string = '*';
  private filters: RestFilter[] = [];
  private orderConfig?: { column: string; ascending: boolean };
  private limitNum?: number;
  private offsetNum?: number;
  private countType?: 'exact' | 'planned' | 'estimated';

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string): this {
    this.selectStr = columns;
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string): this {
    this.filters.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string): this {
    this.filters.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  is(column: string, value: null | boolean): this {
    this.filters.push({ column, operator: 'is', value });
    return this;
  }

  in(column: string, values: unknown[]): this {
    this.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  contains(column: string, value: unknown[] | Record<string, unknown>): this {
    this.filters.push({ column, operator: 'cs', value });
    return this;
  }

  containedBy(column: string, value: unknown[]): this {
    this.filters.push({ column, operator: 'cd', value });
    return this;
  }

  textSearch(column: string, query: string): this {
    this.filters.push({ column, operator: 'fts', value: query });
    return this;
  }

  or(filterString: string): this {
    this.filters.push({ column: 'or', operator: 'or', value: filterString });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}): this {
    this.orderConfig = { column, ascending: options.ascending ?? true };
    return this;
  }

  limit(count: number): this {
    this.limitNum = count;
    return this;
  }

  range(from: number, to: number): this {
    this.offsetNum = from;
    this.limitNum = to - from + 1;
    return this;
  }

  count(type: 'exact' | 'planned' | 'estimated' = 'exact'): this {
    this.countType = type;
    return this;
  }

  async execute(): Promise<RestResponse<T[]>> {
    return query<T>(this.table, {
      select: this.selectStr,
      filters: this.filters,
      order: this.orderConfig,
      limit: this.limitNum,
      offset: this.offsetNum,
      count: this.countType,
    });
  }

  async single(): Promise<RestResponse<T>> {
    return querySingle<T>(this.table, {
      select: this.selectStr,
      filters: this.filters,
    });
  }
}

/**
 * Create a query builder for a table
 */
export function from<T>(table: string): QueryBuilder<T> {
  return new QueryBuilder<T>(table);
}

// ============================================================================
// Export everything as a namespace-like object
// ============================================================================

export const restClient = {
  query,
  querySingle,
  insert,
  update,
  remove,
  rpc,
  from,
  getAccessToken,
  getAccessTokenSync,
  getCurrentUserId,
};

export default restClient;

