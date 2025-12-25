import { useCallback, useEffect } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export type DashboardViewType = 'personal' | 'team' | 'leadership';

const DASHBOARD_STORAGE_KEY = 'carbide-dashboard-preference';

/**
 * Hook to manage dashboard view state with URL params and localStorage persistence.
 *
 * - Reads view from URL params on /dashboard routes
 * - Detects /leadership route for leadership view
 * - Persists preference to localStorage for returning users
 * - Provides navigation functions to switch views
 */
export function useDashboardView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine current view from URL
  const getCurrentView = useCallback((): DashboardViewType => {
    if (location.pathname === '/leadership') {
      return 'leadership';
    }
    const viewParam = searchParams.get('view');
    if (viewParam === 'team') {
      return 'team';
    }
    if (viewParam === 'personal') {
      return 'personal';
    }
    // Check localStorage for saved preference when no URL param
    const savedPreference = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (savedPreference === 'team' || savedPreference === 'personal') {
      return savedPreference;
    }
    return 'personal';
  }, [location.pathname, searchParams]);

  const currentView = getCurrentView();

  // Sync URL with localStorage preference on initial load (only on /dashboard without params)
  useEffect(() => {
    if (
      location.pathname === '/dashboard' &&
      !searchParams.has('view')
    ) {
      const savedPreference = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (savedPreference === 'team' || savedPreference === 'personal') {
        setSearchParams({ view: savedPreference }, { replace: true });
      } else {
        setSearchParams({ view: 'personal' }, { replace: true });
      }
    }
  }, [location.pathname, searchParams, setSearchParams]);

  // Navigate to a specific view
  const setView = useCallback(
    (view: DashboardViewType) => {
      // Save preference to localStorage
      localStorage.setItem(DASHBOARD_STORAGE_KEY, view);

      switch (view) {
        case 'personal':
          navigate('/dashboard?view=personal');
          break;
        case 'team':
          navigate('/dashboard?view=team');
          break;
        case 'leadership':
          navigate('/leadership');
          break;
      }
    },
    [navigate]
  );

  // Check if we're on a dashboard page
  const isDashboardPage =
    location.pathname === '/dashboard' ||
    location.pathname === '/leadership' ||
    location.pathname === '/';

  return {
    currentView,
    setView,
    isDashboardPage,
  };
}

