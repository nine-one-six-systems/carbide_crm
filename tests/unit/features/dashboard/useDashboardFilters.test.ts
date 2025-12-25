import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Wrapper for BrowserRouter
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Wrapper with initial route
const createMemoryWrapper =
  (initialEntries: string[]) =>
  ({ children }: { children: React.ReactNode }) =>
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe('useDashboardFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('default values', () => {
    it('returns default filters when no URL params or localStorage', () => {
      const { result } = renderHook(() => useDashboardFilters(), { wrapper });

      expect(result.current.filters.view).toBe('pipeline');
      expect(result.current.filters.period).toBe('14d');
      expect(result.current.filters.venture).toBeUndefined();
      expect(result.current.filters.ownerId).toBeUndefined();
      expect(result.current.filters.pipelineType).toBeUndefined();
    });

    it('uses localStorage view preference when no URL param', () => {
      localStorageMock.getItem.mockImplementation((key: string) =>
        key === 'carbide-leadership-view' ? 'venture' : null
      );

      const { result } = renderHook(() => useDashboardFilters(), { wrapper });

      expect(result.current.filters.view).toBe('venture');
    });
  });

  describe('URL parameter parsing', () => {
    it('parses view from URL', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?view=venture']),
      });

      expect(result.current.filters.view).toBe('venture');
    });

    it('parses period from URL', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?period=30d']),
      });

      expect(result.current.filters.period).toBe('30d');
    });

    it('parses venture filter from URL', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?venture=forge']),
      });

      expect(result.current.filters.venture).toBe('forge');
    });

    it('parses owner filter from URL', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?owner=user-123']),
      });

      expect(result.current.filters.ownerId).toBe('user-123');
    });

    it('parses multiple parameters from URL', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?view=venture&period=7d&venture=anvil']),
      });

      expect(result.current.filters.view).toBe('venture');
      expect(result.current.filters.period).toBe('7d');
      expect(result.current.filters.venture).toBe('anvil');
    });
  });

  describe('setFilters', () => {
    it('updates view and saves to localStorage', () => {
      const { result } = renderHook(() => useDashboardFilters(), { wrapper });

      act(() => {
        result.current.setFilters({ view: 'venture' });
      });

      expect(result.current.filters.view).toBe('venture');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'carbide-leadership-view',
        'venture'
      );
    });

    it('updates period filter', () => {
      const { result } = renderHook(() => useDashboardFilters(), { wrapper });

      act(() => {
        result.current.setFilters({ period: '30d' });
      });

      expect(result.current.filters.period).toBe('30d');
    });

    it('updates venture filter', () => {
      const { result } = renderHook(() => useDashboardFilters(), { wrapper });

      act(() => {
        result.current.setFilters({ venture: 'foundry' });
      });

      expect(result.current.filters.venture).toBe('foundry');
    });

    it('clears filter when set to undefined', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?venture=forge']),
      });

      expect(result.current.filters.venture).toBe('forge');

      act(() => {
        result.current.setFilters({ venture: undefined });
      });

      expect(result.current.filters.venture).toBeUndefined();
    });
  });

  describe('resetFilters', () => {
    it('resets filters to defaults while preserving view preference', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?view=venture&period=30d&venture=forge']),
      });

      // Verify initial state
      expect(result.current.filters.venture).toBe('forge');
      expect(result.current.filters.period).toBe('30d');
      expect(result.current.filters.view).toBe('venture');

      act(() => {
        result.current.resetFilters();
      });

      // View should be preserved, other filters reset
      expect(result.current.filters.view).toBe('venture');
      expect(result.current.filters.period).toBe('14d');
      expect(result.current.filters.venture).toBeUndefined();
    });
  });

  describe('hasActiveFilters', () => {
    it('returns false when no filters active', () => {
      const { result } = renderHook(() => useDashboardFilters(), { wrapper });

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('returns true when venture filter is active', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?venture=forge']),
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('returns true when owner filter is active', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?owner=user-123']),
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('period parsing', () => {
    it('defaults to 14d for invalid period values', () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: createMemoryWrapper(['?period=invalid']),
      });

      expect(result.current.filters.period).toBe('14d');
    });

    it('accepts valid period values', () => {
      const periods = ['7d', '14d', '30d', 'quarter', 'all', 'custom'];

      periods.forEach((period) => {
        const { result } = renderHook(() => useDashboardFilters(), {
          wrapper: createMemoryWrapper([`?period=${period}`]),
        });

        expect(result.current.filters.period).toBe(period);
      });
    });
  });
});

