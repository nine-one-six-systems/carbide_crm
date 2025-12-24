import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Saved Filter Types
export interface SavedFilter {
  id: string;
  name: string;
  page: 'contacts' | 'organizations' | 'tasks' | 'pipelines' | 'batch-tasks';
  filters: Record<string, unknown>;
  createdAt: string;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  savedFilters: SavedFilter[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addSavedFilter: (filter: Omit<SavedFilter, 'id' | 'createdAt'>) => void;
  removeSavedFilter: (id: string) => void;
  updateSavedFilter: (id: string, updates: Partial<Omit<SavedFilter, 'id' | 'createdAt'>>) => void;
  getSavedFiltersForPage: (page: SavedFilter['page']) => SavedFilter[];
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      savedFilters: [],
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      addSavedFilter: (filter) =>
        set((state) => ({
          savedFilters: [
            ...state.savedFilters,
            {
              ...filter,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeSavedFilter: (id) =>
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        })),
      updateSavedFilter: (id, updates) =>
        set((state) => ({
          savedFilters: state.savedFilters.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),
      getSavedFiltersForPage: (page) => get().savedFilters.filter((f) => f.page === page),
    }),
    {
      name: 'ui-storage',
    }
  )
);

