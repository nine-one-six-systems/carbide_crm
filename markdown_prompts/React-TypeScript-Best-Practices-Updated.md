# React + TypeScript Best Practices Guide

A comprehensive guide to writing clean, scalable, and maintainable React applications with TypeScript.

---

## 🤖 Key Rules for AI-Assisted Development

**When generating React/TypeScript code, always apply these rules:**

1. **Use functional components with hooks** - Never generate class components unless specifically requested.

2. **Always type props explicitly** - Define interface for component props, never use `any`.
   ```tsx
   interface ButtonProps {
     variant?: 'primary' | 'secondary';
     children: React.ReactNode;
   }
   ```

3. **Use semantic HTML and accessibility attributes** - Buttons for actions, links for navigation. Include `aria-*` attributes where needed.

4. **Handle all async states** - Every data fetch needs loading, error, and success states.

5. **Memoize expensive operations only when needed** - Don't pre-optimize. Use `useMemo`/`useCallback` only for measured performance issues.

6. **Keep components small and focused** - If a component exceeds ~150 lines, split it.

7. **Use TypeScript discriminated unions for complex state** - Not multiple boolean flags.
   ```tsx
   type State = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: Error };
   ```

8. **Prefer composition over prop drilling** - Use Context or composition patterns when props pass through 3+ levels.

9. **Always clean up effects** - Return cleanup function from `useEffect` for subscriptions, timers, and async operations.

10. **Use absolute imports** - Configure path aliases (`@components/*`, `@hooks/*`) in `tsconfig.json`.

**Standard imports order:**
```tsx
// 1. React and core libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal modules (absolute imports)
import { Button } from '@components/Button';
import { useAuth } from '@hooks/useAuth';

// 4. Types
import type { User } from '@types/user';

// 5. Styles
import './Component.css';
```

---

## Table of Contents

1. [Project Structure & Organization](#1-project-structure--organization)
2. [Component Design & Architecture](#2-component-design--architecture)
3. [State Management](#3-state-management)
4. [Performance Optimization](#4-performance-optimization)
5. [TypeScript Best Practices](#5-typescript-best-practices)
6. [Error Handling](#6-error-handling)
7. [Testing](#7-testing)
8. [Security](#8-security)
9. [Code Style & Conventions](#9-code-style--conventions)
10. [Accessibility](#10-accessibility)
11. [Forms & Validation](#11-forms--validation)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Dark Mode & Theming](#13-dark-mode--theming)
14. [Animation](#14-animation)
15. [React 19+ & Server Components](#15-react-19--server-components)

---

## 1. Project Structure & Organization

### Recommended Folder Structure

```
└── /src
    ├── /assets          # Static files: images, fonts, icons
    ├── /components      # Reusable UI components
    │   ├── /Button
    │   │   ├── Button.tsx
    │   │   ├── Button.styles.ts
    │   │   ├── Button.test.tsx
    │   │   └── index.ts
    │   └── /Input
    │       └── ...
    ├── /features        # Feature-based modules
    │   ├── /auth
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── services/
    │   │   └── authSlice.ts
    │   └── /dashboard
    │       └── ...
    ├── /hooks           # Reusable custom hooks
    ├── /services        # API and external service integrations
    ├── /store           # Global state management (Redux, Zustand)
    ├── /types           # Shared TypeScript types/interfaces
    ├── /utils           # Helper functions and utilities
    ├── /pages           # Route-level components (if not using features)
    ├── App.tsx
    ├── index.tsx
    └── index.css
```

### Key Principles

**Group by Feature, Not Type**

Organize files by what they do, not what they are. This keeps related code together and makes features self-contained.

```
# ✅ Good - Feature-based
/features/auth/
  ├── AuthForm.tsx
  ├── useAuth.ts
  ├── authService.ts
  └── auth.types.ts

# ❌ Avoid - Type-based (harder to maintain at scale)
/components/AuthForm.tsx
/hooks/useAuth.ts
/services/authService.ts
```

**Avoid Deep Nesting**

Keep folder structure relatively flat (3-4 levels max). Deep nesting makes navigation difficult and complicates imports.

**Use Absolute Imports**

Configure `tsconfig.json` for cleaner imports:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@components/*": ["components/*"],
      "@hooks/*": ["hooks/*"],
      "@utils/*": ["utils/*"],
      "@features/*": ["features/*"],
      "@types/*": ["types/*"]
    }
  }
}
```

```tsx
// ✅ Clean absolute import
import { Button } from '@components/Button';
import { useAuth } from '@features/auth/hooks/useAuth';

// ❌ Messy relative import
import { Button } from '../../../components/Button';
```

### Import Order Convention

Maintain consistent import ordering for readability:

```tsx
// 1. React and core libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal modules (absolute imports)
import { Button } from '@components/Button';
import { useAuth } from '@hooks/useAuth';

// 4. Types
import type { User } from '@types/user';

// 5. Styles
import './MyComponent.styles.css';
```

---

## 2. Component Design & Architecture

### Single Responsibility Principle

Each component should do one thing well. If a component grows too complex, split it.

```tsx
// ❌ Bad - Component doing too much
const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch('/api/user').then(/* ... */);
    fetch('/api/posts').then(/* ... */);
  }, []);

  // Handles user data, posts, editing, rendering...
  return (/* 200+ lines of JSX */);
};

// ✅ Good - Separated concerns
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setIsLoading(false));
  }, [userId]);

  return { user, isLoading };
};

const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const { user, isLoading } = useUserData(userId);

  if (isLoading) return <Spinner />;
  if (!user) return <NotFound />;

  return (
    <div>
      <UserHeader user={user} />
      <UserPosts userId={userId} />
    </div>
  );
};
```

### Functional Components with Hooks

Always use functional components. Class components are outdated for most use cases.

```tsx
// ✅ Modern functional component
interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
  const handleClick = () => onSelect?.(user);

  return (
    <div onClick={handleClick}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};
```

### Container vs. Presentational Components

Separate logic from UI when complexity warrants it:

```tsx
// Presentational - Pure UI, receives data via props
interface UserListProps {
  users: User[];
  isLoading: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, isLoading }) => {
  if (isLoading) return <Spinner />;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

// Container - Handles data fetching and state
const UserListContainer: React.FC = () => {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  return <UserList users={users} isLoading={isLoading} />;
};
```

### Component Composition

Build complex UIs from simple, reusable pieces:

```tsx
// ✅ Composable design
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`card ${className ?? ''}`}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="card-header">{children}</div>
);

const CardBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="card-body">{children}</div>
);

// Usage
<Card>
  <CardHeader>User Profile</CardHeader>
  <CardBody>
    <p>Content here...</p>
  </CardBody>
</Card>
```

### Avoid Excessive Component Creation

Reuse components with props instead of creating near-duplicates:

```tsx
// ❌ Bad - Separate components for each user type
const AdminUserCard = () => { /* ... */ };
const RegularUserCard = () => { /* ... */ };
const GuestUserCard = () => { /* ... */ };

// ✅ Good - One flexible component
interface UserCardProps {
  user: User;
  variant?: 'admin' | 'regular' | 'guest';
}

const UserCard: React.FC<UserCardProps> = ({ user, variant = 'regular' }) => {
  return (
    <div className={`user-card user-card--${variant}`}>
      <h3>{user.name}</h3>
      {variant === 'admin' && <Badge>Admin</Badge>}
    </div>
  );
};
```

---

## 3. State Management

### Local State with useState

Use local state for data that only one component needs:

```tsx
const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

### Avoid Unnecessary State

Don't store derived values in state:

```tsx
// ❌ Bad - Storing derived data
const [items, setItems] = useState<Item[]>([]);
const [filteredItems, setFilteredItems] = useState<Item[]>([]);
const [filter, setFilter] = useState('');

useEffect(() => {
  setFilteredItems(items.filter(item => item.name.includes(filter)));
}, [items, filter]);

// ✅ Good - Compute derived values directly
const [items, setItems] = useState<Item[]>([]);
const [filter, setFilter] = useState('');

const filteredItems = useMemo(
  () => items.filter(item => item.name.includes(filter)),
  [items, filter]
);
```

### Avoid Prop Drilling with Context

When props pass through many layers, use Context:

```tsx
// ❌ Prop drilling
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserAvatar user={user} />
    </Sidebar>
  </Layout>
</App>

// ✅ Context API
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

// Usage in any nested component
const UserAvatar: React.FC = () => {
  const { user } = useUser();
  return <img src={user?.avatarUrl} alt={user?.name} />;
};
```

### Global State Libraries

For complex applications, consider dedicated state management:

| Library | Best For |
| ------- | -------- |
| **Redux Toolkit** | Large apps with complex state logic, middleware needs |
| **Zustand** | Simple global state without boilerplate |
| **Jotai/Recoil** | Atomic state, fine-grained reactivity |
| **TanStack Query** | Server state (API data caching, synchronization) |

```tsx
// Zustand example - minimal boilerplate
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### useEffect Best Practices

Handle side effects properly:

```tsx
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const data = await fetchUser(userId);
        if (!cancelled) {
          setUser(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load user:', error);
        }
      }
    };

    loadUser();

    // Cleanup prevents state updates on unmounted components
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return user ? <div>{user.name}</div> : <Spinner />;
};
```

### Using Suspense for Data Fetching

Modern approach with React Suspense and TanStack Query:

```tsx
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

// Component that fetches data
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  return <div>{user.name}</div>;
};

// Parent with Suspense boundary
const UserPage: React.FC<{ userId: string }> = ({ userId }) => {
  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile userId={userId} />
    </Suspense>
  );
};
```

---

## 4. Performance Optimization

### Prevent Unnecessary Re-renders

**React.memo** - Memoize components that receive stable props:

```tsx
interface ExpensiveListProps {
  items: Item[];
}

const ExpensiveList: React.FC<ExpensiveListProps> = React.memo(({ items }) => {
  console.log('ExpensiveList rendered');
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

**useCallback** - Memoize callback functions:

```tsx
const Parent: React.FC = () => {
  const [count, setCount] = useState(0);

  // Without useCallback, this creates a new function every render
  // causing Child to re-render unnecessarily
  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <MemoizedChild onClick={handleClick} />
    </div>
  );
};
```

**useMemo** - Memoize expensive computations:

```tsx
const DataTable: React.FC<{ data: Row[]; sortKey: string }> = ({ data, sortKey }) => {
  const sortedData = useMemo(() => {
    console.log('Sorting data...');
    return [...data].sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
  }, [data, sortKey]);

  return <table>{/* render sortedData */}</table>;
};
```

**Warning**: Don't over-memoize. Only memoize when you have measured performance issues. Unnecessary memoization adds complexity without benefit.

### Code Splitting & Lazy Loading

Load components only when needed:

```tsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

const App: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </Suspense>
);
```

### Virtualization for Large Lists

Render only visible items in long lists:

```tsx
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps {
  items: Item[];
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({ items }) => (
  <List
    height={500}
    itemCount={items.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index].name}
      </div>
    )}
  </List>
);
```

### Use Production Builds

Always deploy production builds:

```shell
npm run build  # Creates optimized production bundle
```

Development builds include extra warnings and debugging tools that slow performance.

---

## 5. TypeScript Best Practices

### Define Explicit Types

```tsx
// ✅ Explicit interface definitions
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// ✅ Type component props explicitly
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}) => (
  <button
    className={`btn btn--${variant} btn--${size}`}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);
```

### Type Custom Hooks

```tsx
interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Request failed');
      const json = await response.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
```

### Use Type Inference Wisely

Let TypeScript infer when it's obvious:

```tsx
// ✅ Let TS infer simple types
const [count, setCount] = useState(0);  // inferred as number
const [name, setName] = useState('');   // inferred as string

// ✅ Explicit type when inference isn't enough
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
```

### Discriminated Unions for State

Handle complex state variations safely:

```tsx
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const [state, setState] = useState<RequestState<User>>({ status: 'idle' });

  // TypeScript narrows the type based on status
  switch (state.status) {
    case 'idle':
      return <p>Enter a user ID</p>;
    case 'loading':
      return <Spinner />;
    case 'success':
      return <div>{state.data.name}</div>;  // data is available
    case 'error':
      return <p>Error: {state.error.message}</p>;  // error is available
  }
};
```

### Modern React Hooks

**useId** - Generate unique IDs for accessibility:

```tsx
const FormField: React.FC<{ label: string }> = ({ label }) => {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
};

// Generates unique IDs like ":r0:", ":r1:", etc.
// Perfect for forms rendered multiple times
```

**useSyncExternalStore** - Subscribe to external stores:

```tsx
import { useSyncExternalStore } from 'react';

// For subscribing to browser APIs or external state
const useOnlineStatus = () => {
  return useSyncExternalStore(
    // Subscribe function
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // Get snapshot (client)
    () => navigator.onLine,
    // Get server snapshot (SSR)
    () => true
  );
};
```

---

## 6. Error Handling

### Error Boundaries

Catch rendering errors and display fallback UI. Use the `react-error-boundary` library for a hooks-friendly API:

```tsx
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

// Fallback component
const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => (
  <div role="alert" className="error-fallback">
    <h2>Something went wrong</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

// Usage
const App: React.FC = () => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={(error, info) => {
      // Log to error tracking service (e.g., Sentry)
      console.error('Error caught:', error, info);
    }}
    onReset={() => {
      // Reset app state if needed
    }}
  >
    <Dashboard />
  </ErrorBoundary>
);
```

For class-based error boundaries (when needed):

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ClassErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Async Error Handling

Handle errors in async operations gracefully:

```tsx
const useAsyncAction = <T,>(asyncFn: () => Promise<T>) => {
  const [state, setState] = useState<{
    isLoading: boolean;
    error: Error | null;
    data: T | null;
  }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(async () => {
    setState({ isLoading: true, error: null, data: null });
    try {
      const result = await asyncFn();
      setState({ isLoading: false, error: null, data: result });
      return result;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error');
      setState({ isLoading: false, error, data: null });
      throw error;
    }
  }, [asyncFn]);

  return { ...state, execute };
};
```

---

## 7. Testing

### Test Behavior, Not Implementation

Focus on what users see and do:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('displays error message for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data when valid', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

**Note**: With `@testing-library/user-event` v14+, all methods are async. Always use `await` with user interactions and call `userEvent.setup()` at the start of each test.

### Custom Render with Providers

Wrap tests with necessary context providers:

```tsx
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Testing Hooks

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

---

## 8. Security

### Prevent XSS Attacks

React escapes content by default, but be careful with `dangerouslySetInnerHTML`:

```tsx
// ❌ Dangerous - Never do this with user input
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ Safe - Sanitize if you must use raw HTML
import DOMPurify from 'dompurify';

const SafeHTML: React.FC<{ html: string }> = ({ html }) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
);
```

### Secure Authentication

```tsx
// ✅ Use established auth libraries
// - Auth0, Firebase Auth, NextAuth.js

// ✅ Store tokens in httpOnly cookies (server-side)
// ❌ Don't store sensitive tokens in localStorage

// ✅ Implement auto-logout for idle sessions
const useIdleTimeout = (timeout: number, onIdle: () => void) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(onIdle, timeout);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [timeout, onIdle]);
};
```

### Audit Dependencies

Regularly check for vulnerabilities:

```shell
npm audit
npm audit fix

# Or use Snyk for deeper analysis
npx snyk test
```

### Environment Variables

Never expose secrets in client-side code:

```tsx
// ✅ Only VITE_* or REACT_APP_* prefixed vars are bundled
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ Never include secrets in frontend code
// API keys, database credentials, etc. belong on the server
```

---

## 9. Code Style & Conventions

### Naming Conventions

| Type | Convention | Example |
| ---- | ---------- | ------- |
| Components | PascalCase | `UserProfile`, `NavBar` |
| Hooks | camelCase with `use` prefix | `useAuth`, `useFetch` |
| Functions | camelCase | `handleClick`, `formatDate` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |
| Types/Interfaces | PascalCase | `User`, `ApiResponse` |
| Files (components) | PascalCase | `UserCard.tsx` |
| Files (utilities) | camelCase | `formatters.ts` |

### Event Handler Naming

```tsx
// ✅ Prefix handlers with "handle"
const handleSubmit = () => { /* ... */ };
const handleInputChange = () => { /* ... */ };

// ✅ Prefix props with "on"
interface ButtonProps {
  onClick?: () => void;
  onHover?: () => void;
}
```

### Use ESLint & Prettier

Configure consistent code formatting:

```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Use Fragments

Avoid unnecessary wrapper divs:

```tsx
// ❌ Unnecessary wrapper
return (
  <div>
    <Header />
    <Main />
  </div>
);

// ✅ Use fragments
return (
  <>
    <Header />
    <Main />
  </>
);
```

### Destructure Props

```tsx
// ✅ Clean destructuring
const UserCard: React.FC<UserCardProps> = ({ name, email, avatarUrl }) => (
  <div>
    <img src={avatarUrl} alt={name} />
    <h3>{name}</h3>
    <p>{email}</p>
  </div>
);

// ❌ Repetitive props access
const UserCard: React.FC<UserCardProps> = (props) => (
  <div>
    <img src={props.avatarUrl} alt={props.name} />
    <h3>{props.name}</h3>
    <p>{props.email}</p>
  </div>
);
```

---

## 10. Accessibility

Build inclusive applications:

```tsx
// ✅ Use semantic HTML
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
</main>

// ✅ Provide alt text for images
<img src={user.avatar} alt={`${user.name}'s profile picture`} />

// ✅ Ensure keyboard navigation
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  Click me
</button>

// ✅ Use ARIA attributes when needed
<div
  role="alert"
  aria-live="polite"
>
  {errorMessage}
</div>

// ✅ Label form inputs
<label htmlFor="email">Email</label>
<input id="email" type="email" name="email" />

// ✅ Use useId for dynamic IDs
const FormField: React.FC<{ label: string }> = ({ label }) => {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
};
```

---

## 11. Forms & Validation

### React Hook Form with Zod

The recommended approach for form handling and validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type UserFormData = z.infer<typeof userSchema>;

const UserForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    await submitUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <span role="alert">{errors.password.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
        />
        {errors.confirmPassword && (
          <span role="alert">{errors.confirmPassword.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

### Reusable Form Components

```tsx
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, children }) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <span id={errorId} className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
```

---

## 12. Internationalization (i18n)

### Setup with react-i18next

```tsx
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: 'Welcome, {{name}}!',
        items: {
          one: '{{count}} item',
          other: '{{count}} items',
        },
      },
    },
    es: {
      translation: {
        welcome: '¡Bienvenido, {{name}}!',
        items: {
          one: '{{count}} artículo',
          other: '{{count}} artículos',
        },
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

### Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

const Greeting: React.FC<{ name: string; itemCount: number }> = ({ name, itemCount }) => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('welcome', { name })}</h1>
      <p>{t('items', { count: itemCount })}</p>
      
      <button onClick={() => i18n.changeLanguage('es')}>
        Español
      </button>
    </div>
  );
};
```

### RTL Support

```tsx
// Detect and apply RTL direction
const useDirection = () => {
  const { i18n } = useTranslation();
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  
  return rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr';
};

const App: React.FC = () => {
  const dir = useDirection();
  
  return (
    <div dir={dir}>
      {/* App content */}
    </div>
  );
};
```

### Formatting

```tsx
// Use Intl APIs for locale-aware formatting
const formatters = {
  date: (date: Date, locale: string) =>
    new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date),

  number: (num: number, locale: string) =>
    new Intl.NumberFormat(locale).format(num),

  currency: (amount: number, locale: string, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount),

  relativeTime: (date: Date, locale: string) => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const diff = date.getTime() - Date.now();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return rtf.format(days, 'day');
  },
};
```

---

## 13. Dark Mode & Theming

### CSS Custom Properties Approach

```tsx
// Theme configuration
const themes = {
  light: {
    '--color-bg': '#ffffff',
    '--color-bg-secondary': '#f5f5f5',
    '--color-text': '#1a1a1a',
    '--color-text-secondary': '#666666',
    '--color-primary': '#0066cc',
    '--color-border': '#e0e0e0',
  },
  dark: {
    '--color-bg': '#1a1a1a',
    '--color-bg-secondary': '#2d2d2d',
    '--color-text': '#ffffff',
    '--color-text-secondary': '#a0a0a0',
    '--color-primary': '#66b3ff',
    '--color-border': '#404040',
  },
} as const;

type Theme = keyof typeof themes;

// Theme context
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) return saved;
    
    // Then check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Apply theme variables to document
    const root = document.documentElement;
    Object.entries(themes[theme]).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Update color-scheme for native elements
    root.style.colorScheme = theme;
    
    // Persist preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### Using the Theme

```css
/* styles.css */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}

.link {
  color: var(--color-primary);
}
```

```tsx
// Theme toggle component
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
```

---

## 14. Animation

### When to Use Each Library

| Library | Best For |
| ------- | -------- |
| **CSS Transitions/Animations** | Simple hover effects, basic transitions |
| **Framer Motion** | Complex animations, gestures, layout animations |
| **React Spring** | Physics-based animations, natural movement |
| **CSS Keyframes** | Loading spinners, continuous animations |

### Respecting Motion Preferences

**Always** check for reduced motion preference:

```tsx
// Hook to detect reduced motion preference
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};
```

### Framer Motion Examples

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Fade in component
const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// List with staggered animation
const AnimatedList: React.FC<{ items: Item[] }> = ({ items }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.ul>
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.2,
            delay: prefersReducedMotion ? 0 : index * 0.1,
          }}
        >
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
};

// Exit animations
const Modal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose, children }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: prefersReducedMotion ? 1 : 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: prefersReducedMotion ? 1 : 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### CSS-Only Animation with Reduced Motion

```css
/* Base animation */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Disable for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .fade-in {
    animation: none;
  }
  
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 15. React 19+ & Server Components

### Understanding Server vs Client Components

```tsx
// Server Component (default in Next.js App Router)
// - Runs only on the server
// - Can directly access databases, file system
// - Cannot use hooks, event handlers, or browser APIs

// app/users/page.tsx (Server Component)
async function UsersPage() {
  const users = await db.users.findMany(); // Direct DB access

  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} />
    </div>
  );
}

// Client Component
// - Add 'use client' directive at top of file
// - Can use hooks, state, effects, event handlers

// components/UserSearch.tsx
'use client';

import { useState } from 'react';

export function UserSearch() {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search users..."
    />
  );
}
```

### When to Use Each

| Server Components | Client Components |
| ----------------- | ----------------- |
| Data fetching | Interactive UI (forms, buttons) |
| Access backend resources | Event handlers (onClick, onChange) |
| Sensitive data/API keys | Hooks (useState, useEffect) |
| Large dependencies | Browser APIs |
| Static content | Real-time updates |

### Composition Pattern

```tsx
// Server Component (parent)
async function ProductPage({ id }: { id: string }) {
  const product = await fetchProduct(id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {/* Client component for interactivity */}
      <AddToCartButton productId={id} />
    </div>
  );
}

// Client Component (child)
'use client';

function AddToCartButton({ productId }: { productId: string }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = async () => {
    setIsAdding(true);
    await addToCart(productId);
    setIsAdding(false);
  };

  return (
    <button onClick={handleClick} disabled={isAdding}>
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### Server Actions

```tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  await db.users.create({ data: { name, email } });
  
  revalidatePath('/users');
}

// Client component using server action
'use client';

import { createUser } from './actions';

function CreateUserForm() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Create User</button>
    </form>
  );
}
```

---

## Quick Reference Checklist

### Before Starting a Feature

- [ ] Plan component structure and data flow
- [ ] Identify shared state needs
- [ ] Consider reusability

### During Development

- [ ] Keep components small and focused
- [ ] Use TypeScript types for props and state
- [ ] Handle loading and error states
- [ ] Write tests for critical paths
- [ ] Check accessibility

### Before Committing

- [ ] Run linter and fix warnings
- [ ] Ensure tests pass
- [ ] Remove console.logs and commented code
- [ ] Review for unnecessary re-renders

### Before Deploying

- [ ] Build production bundle
- [ ] Run security audit on dependencies
- [ ] Verify error boundaries are in place
- [ ] Test on multiple browsers/devices

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [react-i18next](https://react.i18next.com/)
