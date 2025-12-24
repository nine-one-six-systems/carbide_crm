import { lazy, Suspense, useMemo } from 'react';

import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom';

import { ErrorFallback } from '@/components/error/ErrorFallback';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/pages/Login').then((m) => ({ default: m.default })));
const DashboardPage = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.default })));
const ContactsPage = lazy(() => import('@/pages/Contacts').then((m) => ({ default: m.default })));
const ContactDetailPage = lazy(() => import('@/pages/ContactDetail').then((m) => ({ default: m.default })));
const OrganizationsPage = lazy(() => import('@/pages/Organizations').then((m) => ({ default: m.default })));
const OrganizationDetailPage = lazy(() => import('@/pages/OrganizationDetail').then((m) => ({ default: m.default })));
const PipelinesPage = lazy(() => import('@/pages/Pipelines').then((m) => ({ default: m.default })));
const TasksPage = lazy(() => import('@/pages/Tasks').then((m) => ({ default: m.default })));
const BatchTasksPage = lazy(() => import('@/pages/BatchTasks').then((m) => ({ default: m.default })));
const CadencesPage = lazy(() => import('@/pages/Cadences').then((m) => ({ default: m.default })));
const SettingsPage = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.default })));
const NotFoundPage = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.default })));

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

function RouteErrorBoundary() {
  const error = useRouteError() as Error;
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorFallback
        error={error}
        resetErrorBoundary={() => window.location.reload()}
      />
    </div>
  );
}

export function AppRouter() {
  const router = useMemo(() => createBrowserRouter(
    [
      {
        path: '/login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <DashboardPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <DashboardPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '/contacts',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <ContactsPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '/contacts/:id',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <ContactDetailPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '/organizations',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <OrganizationsPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '/organizations/:id',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <OrganizationDetailPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '/pipelines',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <PipelinesPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '/tasks',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <TasksPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '/batch-tasks',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <BatchTasksPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '/cadences',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <CadencesPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<LoadingFallback />}>
                <SettingsPage />
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  ), []);

  return <RouterProvider router={router} />;
}
