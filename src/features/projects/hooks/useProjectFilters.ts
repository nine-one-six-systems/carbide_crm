import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'react-router-dom';
import type { ProjectFilters, ProjectListParams } from '../types/project.types';

const defaultFilters: ProjectListParams = {
  page: 1,
  pageSize: 20,
  sortBy: 'updated_at',
  sortOrder: 'desc',
};

const STORAGE_KEY = 'carbide_project_filters';

/**
 * Load filters from localStorage
 */
function loadFiltersFromStorage(): Partial<ProjectFilters> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load filters from localStorage:', error);
  }
  return {};
}

/**
 * Save filters to localStorage
 */
function saveFiltersToStorage(filters: Partial<ProjectFilters>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn('Failed to save filters to localStorage:', error);
  }
}

export function useProjectFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState<ProjectFilters>(() => {
    // Initialize from localStorage if no URL params are present
    if (searchParams.toString() === '') {
      return loadFiltersFromStorage();
    }
    return {};
  });

  // Parse filters from URL params
  const filters = useMemo<ProjectListParams>(() => {
    const params: ProjectListParams = { ...defaultFilters };

    // Parse URL params
    const scope = searchParams.get('scope');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const health = searchParams.get('health');
    const venture = searchParams.get('venture');
    const ownerId = searchParams.get('ownerId');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    if (scope) params.scope = scope as ProjectFilters['scope'];
    if (category) params.category = category as ProjectFilters['category'];
    if (status) params.status = status as ProjectFilters['status'];
    if (health) params.health = health as ProjectFilters['health'];
    if (venture) params.venture = venture as ProjectFilters['venture'];
    if (ownerId) params.ownerId = ownerId;
    if (page) params.page = parseInt(page, 10);
    if (pageSize) params.pageSize = parseInt(pageSize, 10);
    if (sortBy) params.sortBy = sortBy as ProjectListParams['sortBy'];
    if (sortOrder) params.sortOrder = sortOrder as 'asc' | 'desc';

    // Merge with local filters (for UI state that doesn't need URL persistence)
    return { ...params, ...localFilters };
  }, [searchParams, localFilters]);

  // Update filters and sync to URL and localStorage
  const setFilters = useCallback(
    (newFilters: Partial<ProjectListParams>) => {
      const merged = { ...filters, ...newFilters };

      // Update URL params for persistent filters
      const newParams = new URLSearchParams();

      if (merged.scope && merged.scope !== defaultFilters.scope) {
        newParams.set('scope', merged.scope);
      }
      if (merged.category && merged.category !== defaultFilters.category) {
        newParams.set('category', merged.category);
      }
      if (merged.status && merged.status !== defaultFilters.status) {
        newParams.set('status', merged.status);
      }
      if (merged.health && merged.health !== defaultFilters.health) {
        newParams.set('health', merged.health);
      }
      if (merged.venture && merged.venture !== defaultFilters.venture) {
        newParams.set('venture', merged.venture);
      }
      if (merged.ownerId && merged.ownerId !== defaultFilters.ownerId) {
        newParams.set('ownerId', merged.ownerId);
      }
      if (merged.page && merged.page !== defaultFilters.page) {
        newParams.set('page', String(merged.page));
      }
      if (merged.pageSize && merged.pageSize !== defaultFilters.pageSize) {
        newParams.set('pageSize', String(merged.pageSize));
      }
      if (merged.sortBy && merged.sortBy !== defaultFilters.sortBy) {
        newParams.set('sortBy', merged.sortBy);
      }
      if (merged.sortOrder && merged.sortOrder !== defaultFilters.sortOrder) {
        newParams.set('sortOrder', merged.sortOrder);
      }

      setSearchParams(newParams, { replace: true });

      // Save filter state to localStorage (excluding pagination/sorting)
      const filtersToSave: Partial<ProjectFilters> = {
        scope: merged.scope,
        category: merged.category,
        status: merged.status,
        health: merged.health,
        venture: merged.venture,
        ownerId: merged.ownerId,
      };
      // Only save non-default values
      const nonDefaultFilters: Partial<ProjectFilters> = {};
      Object.entries(filtersToSave).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          nonDefaultFilters[key as keyof ProjectFilters] = value;
        }
      });
      if (Object.keys(nonDefaultFilters).length > 0) {
        saveFiltersToStorage(nonDefaultFilters);
      } else {
        // Clear storage if all filters are default
        localStorage.removeItem(STORAGE_KEY);
      }

      // Update local filters for non-URL state
      const localOnlyFilters: Partial<ProjectFilters> = {};
      Object.keys(newFilters).forEach((key) => {
        if (!['page', 'pageSize', 'sortBy', 'sortOrder', 'scope', 'category', 'status', 'health', 'venture', 'ownerId'].includes(key)) {
          localOnlyFilters[key as keyof ProjectFilters] = newFilters[key as keyof ProjectListParams] as any;
        }
      });
      if (Object.keys(localOnlyFilters).length > 0) {
        setLocalFilters((prev) => ({ ...prev, ...localOnlyFilters }));
      }
    },
    [filters, setSearchParams]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setLocalFilters({});
    localStorage.removeItem(STORAGE_KEY);
  }, [setSearchParams]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.scope ||
      filters.category ||
      filters.status ||
      filters.health ||
      filters.venture ||
      filters.ownerId
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
}

