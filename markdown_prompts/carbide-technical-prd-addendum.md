# Carbide CRM - Technical PRD Addendum

**Version:** 1.1  
**Last Updated:** December 2024  
**Status:** Best Practices Integration Update  
**Companion To:** carbide-technical-prd.md (v1.0)

---

## Overview

This addendum integrates updates from the latest React + TypeScript Best Practices Guide and QoL-UX Best Practices Guide. All items below should be incorporated into the main technical PRD.

---

## Table of Contents

1. [AI-Assisted Development Rules](#1-ai-assisted-development-rules)
2. [Modern React Patterns](#2-modern-react-patterns)
3. [Enhanced Component Architecture](#3-enhanced-component-architecture)
4. [Forms & Validation Enhancements](#4-forms--validation-enhancements)
5. [Internationalization (i18n)](#5-internationalization-i18n)
6. [Dark Mode Implementation](#6-dark-mode-implementation)
7. [Animation System](#7-animation-system)
8. [UX Patterns & Quality of Life](#8-ux-patterns--quality-of-life)
9. [Enhanced Accessibility](#9-enhanced-accessibility)
10. [Advanced Table Features](#10-advanced-table-features)
11. [Navigation Enhancements](#11-navigation-enhancements)
12. [Mobile & Safe Area Support](#12-mobile--safe-area-support)
13. [Updated Dependencies](#13-updated-dependencies)

---

## 1. AI-Assisted Development Rules

### The 10 Commandments for AI-Generated Code

All AI-assisted development (Claude, Cursor, Copilot) must follow these rules:

| # | Rule | Enforcement |
|---|------|-------------|
| 1 | Functional components with hooks only | ESLint rule: no class components |
| 2 | Explicit prop typing (never `any`) | `@typescript-eslint/no-explicit-any: error` |
| 3 | Semantic HTML + accessibility attributes | ESLint jsx-a11y plugin |
| 4 | Handle all async states (loading/error/success) | Code review checklist |
| 5 | Memoize only when measured performance issues exist | Avoid premature optimization |
| 6 | Keep components <150 lines | ESLint max-lines-per-function |
| 7 | Discriminated unions for complex state | TypeScript pattern enforcement |
| 8 | Composition over prop drilling (Context at 3+ levels) | Architecture review |
| 9 | Always clean up effects | ESLint exhaustive-deps |
| 10 | Use absolute imports | tsconfig paths |

### Standard Import Order

Enforce via ESLint `import/order`:

```typescript
// 1. React and core libraries
import React, { useState, useEffect, useId } from 'react';

// 2. Third-party libraries
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

// 3. Internal modules (absolute imports)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { contactService } from '@/features/contacts/services/contactService';

// 4. Types
import type { Contact, CreateContactPayload } from '@/types';

// 5. Styles and assets
import './ContactForm.css';
```

---

## 2. Modern React Patterns

### Discriminated Unions for Complex State

Replace multiple boolean flags with discriminated unions:

```typescript
// ❌ Avoid: Multiple booleans
interface BadState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data: Contact | null;
  error: Error | null;
}

// ✅ Use: Discriminated union
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Usage in component
function ContactDetail({ contactId }: { contactId: string }) {
  const [state, setState] = useState<RequestState<Contact>>({ status: 'idle' });

  // TypeScript narrows types automatically
  switch (state.status) {
    case 'idle':
      return <EmptyState message="Select a contact" />;
    case 'loading':
      return <ContactSkeleton />;
    case 'success':
      return <ContactView contact={state.data} />;
    case 'error':
      return <ErrorState error={state.error} onRetry={refetch} />;
  }
}
```

### Modern Hooks

#### useId for Accessibility

```typescript
import { useId } from 'react';

function FormField({ label, error }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : descriptionId}
      />
      {error && (
        <span id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

#### useTransition for Non-Blocking Updates

```typescript
import { useTransition, useState } from 'react';

function ContactSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Contact[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    setQuery(value); // Urgent: update input immediately
    
    startTransition(() => {
      // Non-urgent: can be interrupted
      const filtered = filterContacts(value);
      setResults(filtered);
    });
  }

  return (
    <div>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner className="absolute right-2" />}
      <ContactList contacts={results} />
    </div>
  );
}
```

#### useDeferredValue for Expensive Renders

```typescript
import { useDeferredValue, useMemo } from 'react';

function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const deferredActivities = useDeferredValue(activities);
  const isStale = activities !== deferredActivities;

  const renderedActivities = useMemo(
    () => deferredActivities.map((a) => <ActivityItem key={a.id} activity={a} />),
    [deferredActivities]
  );

  return (
    <div className={isStale ? 'opacity-70' : ''}>
      {renderedActivities}
    </div>
  );
}
```

#### useSyncExternalStore for Browser APIs

```typescript
import { useSyncExternalStore } from 'react';

function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true // Server snapshot
  );
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
```

### Suspense with React Query

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

// Component uses suspense query
function ContactDetailContent({ contactId }: { contactId: string }) {
  const { data: contact } = useSuspenseQuery({
    queryKey: ['contact', contactId],
    queryFn: () => contactService.getById(contactId),
  });

  return <ContactView contact={contact} />;
}

// Parent provides Suspense boundary
function ContactDetailPage({ contactId }: { contactId: string }) {
  return (
    <ErrorBoundary fallback={<ContactErrorState />}>
      <Suspense fallback={<ContactSkeleton />}>
        <ContactDetailContent contactId={contactId} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 3. Enhanced Component Architecture

### Component Size Limits

- Maximum 150 lines per component
- Extract custom hooks for logic > 30 lines
- Use composition for complex UIs

### Composition Pattern

```typescript
// ✅ Composable Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-card shadow-sm', className)}>
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-4 p-4 border-b">{children}</div>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 p-4 border-t bg-muted/50">{children}</div>;
}

// Usage
<Card>
  <CardHeader>
    <Avatar user={contact} />
    <div>
      <h3>{contact.name}</h3>
      <p className="text-muted-foreground">{contact.title}</p>
    </div>
  </CardHeader>
  <CardContent>
    <ContactDetails contact={contact} />
  </CardContent>
  <CardFooter>
    <Button variant="outline">Edit</Button>
    <Button>Message</Button>
  </CardFooter>
</Card>
```

### Context at 3+ Levels

When props pass through 3+ component levels, use Context:

```typescript
// ✅ Use Context for deeply nested data
interface ContactContextType {
  contact: Contact;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  activities: Activity[];
  refetchActivities: () => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export function useContactContext() {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContactContext must be used within ContactProvider');
  }
  return context;
}

export function ContactProvider({ 
  contactId, 
  children 
}: { 
  contactId: string; 
  children: React.ReactNode;
}) {
  const { data: contact } = useContact(contactId);
  const { data: activities, refetch: refetchActivities } = useContactActivities(contactId);
  const [isEditing, setIsEditing] = useState(false);

  if (!contact) return <ContactSkeleton />;

  return (
    <ContactContext.Provider
      value={{ contact, isEditing, setIsEditing, activities: activities ?? [], refetchActivities }}
    >
      {children}
    </ContactContext.Provider>
  );
}

// Deep child can access without prop drilling
function ContactActivityList() {
  const { activities, refetchActivities } = useContactContext();
  // ...
}
```

---

## 4. Forms & Validation Enhancements

### Enhanced Zod Schemas with Transforms

```typescript
// src/lib/validators/contact.ts

import { z } from 'zod';

export const phoneSchema = z.object({
  value: z
    .string()
    .min(1, 'Phone number is required')
    .transform((val) => val.replace(/\D/g, '')) // Strip non-digits
    .refine((val) => val.length >= 10, 'Phone must be at least 10 digits'),
  label: z.string().min(1, 'Label is required'),
  is_primary: z.boolean().default(false),
});

export const emailSchema = z.object({
  value: z.string().email('Invalid email address'),
  label: z.string().min(1, 'Label is required'),
  is_primary: z.boolean().default(false),
});

export const contactFormSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long')
    .transform((val) => val.trim()),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long')
    .transform((val) => val.trim()),
  emails: z.array(emailSchema).default([]).refine(
    (emails) => emails.filter((e) => e.is_primary).length <= 1,
    'Only one email can be primary'
  ),
  phones: z.array(phoneSchema).default([]).refine(
    (phones) => phones.filter((p) => p.is_primary).length <= 1,
    'Only one phone can be primary'
  ),
  job_title: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string()).default([]),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

### Blur-Based Validation

```typescript
// src/components/forms/ValidatedInput.tsx

import { useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ValidatedInputProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}

export function ValidatedInput({
  name,
  label,
  type = 'text',
  required = false,
  autoComplete,
  placeholder,
}: ValidatedInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  
  const {
    register,
    formState: { errors, touchedFields },
    trigger,
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;
  const isTouched = touchedFields[name];
  const showError = isTouched && error;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-destructive ml-1">*</span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={showError ? 'true' : undefined}
        aria-describedby={showError ? errorId : undefined}
        className={cn(showError && 'border-destructive focus-visible:ring-destructive')}
        {...register(name, {
          onBlur: () => trigger(name), // Validate on blur
        })}
      />
      {showError && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Auto-Save Implementation

```typescript
// src/hooks/useAutoSave.ts

import { useEffect, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';

interface UseAutoSaveOptions {
  onSave: (data: unknown) => Promise<void>;
  interval?: number; // ms, default 30000 (30 seconds)
  debounceMs?: number; // ms, default 1000
}

export function useAutoSave({ 
  onSave, 
  interval = 30000, 
  debounceMs = 1000 
}: UseAutoSaveOptions) {
  const { watch, formState: { isDirty, isValid } } = useFormContext();
  const lastSavedRef = useRef<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const save = useCallback(async (data: unknown) => {
    const serialized = JSON.stringify(data);
    if (serialized === lastSavedRef.current) return;
    
    setSaveStatus('saving');
    try {
      await onSave(data);
      lastSavedRef.current = serialized;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Auto-save failed:', error);
    }
  }, [onSave]);

  const debouncedSave = useDebouncedCallback(save, debounceMs);

  // Watch form changes
  useEffect(() => {
    const subscription = watch((data) => {
      if (isDirty && isValid) {
        debouncedSave(data);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isDirty, isValid, debouncedSave]);

  // Interval-based save
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isDirty && isValid) {
        save(watch());
      }
    }, interval);
    return () => clearInterval(intervalId);
  }, [interval, isDirty, isValid, save, watch]);

  return { saveStatus };
}
```

### Auto-Save Status Indicator

```typescript
// src/components/forms/AutoSaveIndicator.tsx

import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div 
      className="flex items-center gap-2 text-sm text-muted-foreground"
      aria-live="polite"
      aria-atomic="true"
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
          <span>All changes saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
          <span>Failed to save</span>
        </>
      )}
    </div>
  );
}
```

### Unsaved Changes Warning

```typescript
// src/hooks/useUnsavedChangesWarning.ts

import { useEffect, useCallback } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

export function useUnsavedChangesWarning(isDirty: boolean) {
  // Browser navigation (refresh, close tab)
  useBeforeUnload(
    useCallback(
      (e) => {
        if (isDirty) {
          e.preventDefault();
          e.returnValue = '';
        }
      },
      [isDirty]
    )
  );

  // React Router navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  return blocker;
}

// Usage in form component
function ContactForm() {
  const { formState: { isDirty } } = useFormContext();
  const blocker = useUnsavedChangesWarning(isDirty);

  return (
    <>
      <form>...</form>
      
      {/* Unsaved changes dialog */}
      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Stay
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

---

## 5. Internationalization (i18n)

### Setup

Add to dependencies:
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### Configuration

```typescript
// src/lib/i18n/index.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Translation Files

```json
// src/lib/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "loading": "Loading...",
    "noResults": "No results found"
  },
  "contacts": {
    "title": "Contacts",
    "addNew": "Add Contact",
    "firstName": "First Name",
    "lastName": "Last Name",
    "email": "Email",
    "phone": "Phone",
    "jobTitle": "Job Title",
    "organization": "Organization",
    "deleteConfirm": "Are you sure you want to delete {{name}}?",
    "count": "{{count}} contact",
    "count_plural": "{{count}} contacts"
  },
  "tasks": {
    "title": "Tasks",
    "dueToday": "Due Today",
    "overdue": "Overdue",
    "upcoming": "Upcoming",
    "completed": "Completed"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email address",
    "networkError": "Unable to connect. Please check your internet connection."
  }
}
```

### RTL Support

```typescript
// src/lib/i18n/rtl.ts

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language);
}

// App.tsx
function App() {
  const { i18n } = useTranslation();
  const dir = isRTL(i18n.language) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [dir, i18n.language]);

  return <RouterProvider router={router} />;
}
```

### Locale-Aware Formatting

```typescript
// src/lib/formatters.ts

export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatRelativeTime(
  date: Date | string,
  locale: string
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}
```

---

## 6. Dark Mode Implementation

### CSS Custom Properties

```css
/* src/index.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode (default) */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;

    color-scheme: light;
  }

  .dark {
    /* Dark mode */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 50.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;

    color-scheme: dark;
  }

  /* Dim images in dark mode */
  .dark img:not([data-no-dim]) {
    filter: brightness(0.9);
  }
}
```

### Theme Provider

```typescript
// src/components/theme/ThemeProvider.tsx

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
      setResolvedTheme(isDark ? 'dark' : 'light');
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Theme Toggle

```typescript
// src/components/theme/ThemeToggle.tsx

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {resolvedTheme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 7. Animation System

### Framer Motion Setup

Add to dependencies:
```bash
npm install framer-motion
```

### Animation Utilities

```typescript
// src/lib/animation.ts

import { Variants } from 'framer-motion';

// Standard timing
export const TIMING = {
  micro: 0.1,      // 100ms - micro-interactions
  small: 0.15,     // 150ms - small transitions
  medium: 0.2,     // 200ms - medium transitions
  large: 0.3,      // 300ms - large transitions
  slow: 0.5,       // 500ms - page transitions
};

// Easing curves
export const EASING = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
};

// Reusable variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: TIMING.medium } },
  exit: { opacity: 0, transition: { duration: TIMING.small } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: TIMING.medium, ease: EASING.easeOut } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    transition: { duration: TIMING.small } 
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: TIMING.medium, ease: EASING.easeOut } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { duration: TIMING.small } 
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: TIMING.small, ease: EASING.easeOut },
  },
};
```

### Reduced Motion Support (REQUIRED)

```typescript
// src/hooks/useReducedMotion.ts

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getServerSnapshot() {
  return false;
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

```typescript
// src/components/motion/SafeMotion.tsx

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SafeMotionProps {
  children: React.ReactNode;
  variants: Variants;
  reducedVariants?: Variants;
  className?: string;
}

// Minimal variants for reduced motion
const reducedMotionFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};

export function SafeMotion({ 
  children, 
  variants, 
  reducedVariants = reducedMotionFade,
  className,
}: SafeMotionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? reducedVariants : variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### Page Transitions

```typescript
// src/components/layout/PageTransition.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.0, 0.0, 0.2, 1] },
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.15 },
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={prefersReducedMotion ? reducedVariants : pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### List Animations

```typescript
// src/components/motion/AnimatedList.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { staggerContainer, staggerItem } from '@/lib/animation';

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
}: AnimatedListProps<T>) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item)}
            variants={staggerItem}
            layout
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
```

---

## 8. UX Patterns & Quality of Life

### Scroll to Top on Route Change

```typescript
// src/hooks/useScrollToTop.ts

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
}

// Add to App.tsx or AppShell.tsx
function AppShell() {
  useScrollToTop();
  // ...
}
```

### Scroll Position Restoration

```typescript
// src/hooks/useScrollRestoration.ts

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestoration(key: string) {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(`scroll-${key}-${pathname}`);
    if (saved && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(saved, 10);
    }
  }, [pathname, key]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      sessionStorage.setItem(
        `scroll-${key}-${pathname}`,
        String(element.scrollTop)
      );
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [pathname, key]);

  return scrollRef;
}

// Usage
function ContactList() {
  const scrollRef = useScrollRestoration('contact-list');
  
  return (
    <div ref={scrollRef} className="h-[600px] overflow-auto">
      {/* content */}
    </div>
  );
}
```

### Toast Notification System

```typescript
// src/components/ui/toast-container.tsx

import { Toaster } from 'sonner';

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        className: 'bg-background text-foreground border',
      }}
      closeButton
      richColors
    />
  );
}

// src/lib/toast.ts
import { toast } from 'sonner';

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => {
    return toast.promise(promise, messages);
  },
};

// Usage
showToast.success('Contact saved', 'John Doe has been updated');
showToast.promise(saveContact(data), {
  loading: 'Saving contact...',
  success: 'Contact saved!',
  error: 'Failed to save contact',
});
```

### Confirmation Dialogs

```typescript
// src/components/ui/confirm-dialog.tsx

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### useConfirm Hook

```typescript
// src/hooks/useConfirm.ts

import { useState, useCallback } from 'react';

interface UseConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm(options: UseConfirmOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef?.(true);
    setIsOpen(false);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    resolveRef?.(false);
    setIsOpen(false);
  }, [resolveRef]);

  const ConfirmDialogComponent = useCallback(
    () => (
      <ConfirmDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleCancel()}
        title={options.title}
        description={options.description}
        confirmLabel={options.confirmLabel}
        cancelLabel={options.cancelLabel}
        variant={options.variant}
        onConfirm={handleConfirm}
      />
    ),
    [isOpen, options, handleConfirm, handleCancel]
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}

// Usage
function ContactActions({ contact }: { contact: Contact }) {
  const { confirm, ConfirmDialog } = useConfirm({
    title: 'Delete Contact',
    description: `Are you sure you want to delete ${contact.first_name} ${contact.last_name}? This action cannot be undone.`,
    confirmLabel: 'Delete',
    variant: 'destructive',
  });

  const handleDelete = async () => {
    const confirmed = await confirm();
    if (confirmed) {
      await deleteContact(contact.id);
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
      <ConfirmDialog />
    </>
  );
}
```

### Empty States

```typescript
// src/components/ui/empty-state.tsx

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage
<EmptyState
  icon={Users}
  title="No contacts yet"
  description="Get started by adding your first contact to the CRM."
  action={{
    label: 'Add Contact',
    onClick: () => setShowCreateDialog(true),
  }}
/>
```

### Skeleton Loading Components

```typescript
// src/components/ui/skeletons.tsx

import { Skeleton } from '@/components/ui/skeleton';

export function ContactCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function ContactListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ContactCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ContactDetailSkeleton() {
  return (
    <div className="grid grid-cols-[300px_1fr_300px] gap-6">
      {/* Left sidebar */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      {/* Main content */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      {/* Right sidebar */}
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 10, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="border rounded-lg">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-muted/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 9. Enhanced Accessibility

### Skip Links

```typescript
// src/components/layout/SkipLinks.tsx

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-0 left-0 z-50 bg-primary text-primary-foreground px-4 py-2 focus:outline-none"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className="absolute top-0 left-32 z-50 bg-primary text-primary-foreground px-4 py-2 focus:outline-none"
      >
        Skip to navigation
      </a>
    </div>
  );
}
```

### Live Regions

```typescript
// src/components/ui/live-region.tsx

import { createContext, useContext, useState, useCallback } from 'react';

interface LiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveRegionContext = createContext<LiveRegionContextType | undefined>(undefined);

export function LiveRegionProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage('');
      setTimeout(() => setAssertiveMessage(message), 100);
    } else {
      setPoliteMessage('');
      setTimeout(() => setPoliteMessage(message), 100);
    }
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}

export function useAnnounce() {
  const context = useContext(LiveRegionContext);
  if (!context) {
    throw new Error('useAnnounce must be used within LiveRegionProvider');
  }
  return context.announce;
}

// Usage
function ContactList() {
  const announce = useAnnounce();
  const { data: contacts } = useContacts(params);

  useEffect(() => {
    if (contacts) {
      announce(`${contacts.length} contacts found`);
    }
  }, [contacts, announce]);
}
```

### Focus Management

```typescript
// src/hooks/useFocusTrap.ts

import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
```

### Keyboard Shortcuts

```typescript
// src/hooks/useKeyboardShortcut.ts

import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

export function useKeyboardShortcut(
  config: ShortcutConfig,
  callback: () => void,
  enabled = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target.isContentEditable) return;

      const matchesKey = event.key.toLowerCase() === config.key.toLowerCase();
      const matchesCtrl = config.ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const matchesMeta = config.metaKey ? event.metaKey : !event.metaKey;
      const matchesShift = config.shiftKey ? event.shiftKey : !event.shiftKey;
      const matchesAlt = config.altKey ? event.altKey : !event.altKey;

      if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
        event.preventDefault();
        callback();
      }
    },
    [config, callback, enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Usage
function ContactsPage() {
  const [showSearch, setShowSearch] = useState(false);
  
  // Cmd/Ctrl + K to open search
  useKeyboardShortcut({ key: 'k', metaKey: true }, () => setShowSearch(true));
  useKeyboardShortcut({ key: 'k', ctrlKey: true }, () => setShowSearch(true));
  
  // N to create new contact
  useKeyboardShortcut({ key: 'n' }, () => navigate('/contacts/new'));
}
```

### Keyboard Shortcut Help

```typescript
// src/components/ui/keyboard-shortcut-help.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open search' },
  { keys: ['N'], description: 'New contact' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close dialog / Cancel' },
  { keys: ['⌘', 'S'], description: 'Save' },
];

export function KeyboardShortcutHelp({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map(({ keys, description }) => (
            <div key={description} className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">{description}</span>
              <div className="flex gap-1">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-1 bg-muted rounded text-sm font-mono"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 10. Advanced Table Features

### Enhanced DataTable Component

```typescript
// src/components/data-display/DataTable.tsx

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import { useState } from 'react';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onRowSelectionChange?: (selected: TData[]) => void;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  stickyHeader?: boolean;
}

export function DataTable<TData>({
  data,
  columns,
  onRowSelectionChange,
  enableSorting = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  enableRowSelection = false,
  enablePagination = true,
  pageSize = 25,
  stickyHeader = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: { pageSize },
    },
  });

  // Notify parent of selection changes
  useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, onRowSelectionChange, table]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <DataTableToolbar
        table={table}
        enableColumnVisibility={enableColumnVisibility}
        enableFiltering={enableFiltering}
      />

      {/* Selection info */}
      {enableRowSelection && Object.keys(rowSelection).length > 0 && (
        <div className="bg-muted px-4 py-2 rounded-md flex items-center justify-between">
          <span className="text-sm">
            {Object.keys(rowSelection).length} of {data.length} selected
          </span>
          <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <div className={cn('overflow-auto', stickyHeader && 'max-h-[600px]')}>
          <table className="w-full">
            <thead className={cn(stickyHeader && 'sticky top-0 bg-background z-10')}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-medium"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center gap-2',
                            header.column.getCanSort() && 'cursor-pointer select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          aria-sort={
                            header.column.getIsSorted()
                              ? header.column.getIsSorted() === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : 'none'
                          }
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() && (
                            <span aria-hidden="true">
                              {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b hover:bg-muted/50 transition-colors',
                      row.getIsSelected() && 'bg-muted'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {enablePagination && <DataTablePagination table={table} />}
    </div>
  );
}
```

### Column Visibility Toggle

```typescript
// src/components/data-display/DataTableColumnToggle.tsx

import { Table } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

interface DataTableColumnToggleProps<TData> {
  table: Table<TData>;
}

export function DataTableColumnToggle<TData>({
  table,
}: DataTableColumnToggleProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Bulk Actions

```typescript
// src/components/data-display/DataTableBulkActions.tsx

interface DataTableBulkActionsProps<TData> {
  selectedItems: TData[];
  actions: {
    label: string;
    icon?: LucideIcon;
    onClick: (items: TData[]) => void;
    variant?: 'default' | 'destructive';
  }[];
  onClearSelection: () => void;
}

export function DataTableBulkActions<TData>({
  selectedItems,
  actions,
  onClearSelection,
}: DataTableBulkActionsProps<TData>) {
  if (selectedItems.length === 0) return null;

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 flex items-center justify-between shadow-lg">
      <span className="text-sm font-medium">
        {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear selection
        </Button>
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant || 'default'}
            size="sm"
            onClick={() => action.onClick(selectedItems)}
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

---

## 11. Navigation Enhancements

### Breadcrumbs Component

```typescript
// src/components/navigation/Breadcrumbs.tsx

import { Link, useMatches } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbHandle {
  crumb: (data?: unknown) => { label: string; href?: string };
}

export function Breadcrumbs() {
  const matches = useMatches();
  
  const crumbs = matches
    .filter((match) => (match.handle as BreadcrumbHandle)?.crumb)
    .map((match) => {
      const handle = match.handle as BreadcrumbHandle;
      return handle.crumb(match.data);
    });

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" aria-label="Home" />
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <li>
              {index === crumbs.length - 1 ? (
                <span className="font-medium" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.href || '#'}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

// Route configuration
const routes = [
  {
    path: '/contacts',
    element: <Contacts />,
    handle: {
      crumb: () => ({ label: 'Contacts', href: '/contacts' }),
    },
  },
  {
    path: '/contacts/:id',
    element: <ContactDetail />,
    loader: contactLoader,
    handle: {
      crumb: (data: { contact: Contact }) => ({
        label: `${data.contact.first_name} ${data.contact.last_name}`,
      }),
    },
  },
];
```

### Active Link Indicator

```typescript
// src/components/navigation/NavLink.tsx

import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CustomNavLinkProps extends NavLinkProps {
  icon?: LucideIcon;
}

export function NavLink({ className, icon: Icon, children, ...props }: CustomNavLinkProps) {
  return (
    <RouterNavLink
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          className
        )
      }
      {...props}
    >
      {({ isActive }) => (
        <>
          {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
          {children}
          {isActive && <span className="sr-only">(current page)</span>}
        </>
      )}
    </RouterNavLink>
  );
}
```

### Deep Linking Support

```typescript
// src/hooks/useFilterParams.ts (enhanced)

import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { z } from 'zod';

export function useFilterParams<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  defaultValues: z.infer<T>
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const params: Record<string, unknown> = {};
    
    searchParams.forEach((value, key) => {
      // Handle arrays
      if (searchParams.getAll(key).length > 1) {
        params[key] = searchParams.getAll(key);
      } else {
        params[key] = value;
      }
    });

    // Parse and validate with Zod
    const result = schema.safeParse({ ...defaultValues, ...params });
    return result.success ? result.data : defaultValues;
  }, [searchParams, schema, defaultValues]);

  const setFilters = useCallback(
    (newFilters: Partial<z.infer<T>>) => {
      setSearchParams((prev) => {
        const updated = new URLSearchParams(prev);

        Object.entries(newFilters).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            updated.delete(key);
          } else if (Array.isArray(value)) {
            updated.delete(key);
            value.forEach((v) => updated.append(key, String(v)));
          } else if (value !== defaultValues[key]) {
            updated.set(key, String(value));
          } else {
            updated.delete(key); // Don't include default values in URL
          }
        });

        return updated;
      });
    },
    [setSearchParams, defaultValues]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return { filters, setFilters, resetFilters };
}

// Usage
const filterSchema = z.object({
  query: z.string().default(''),
  status: z.array(z.string()).default([]),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().default(1),
});

function ContactsPage() {
  const { filters, setFilters, resetFilters } = useFilterParams(filterSchema, {
    query: '',
    status: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
  });

  // URL: /contacts?query=john&status=active&status=lead&sortBy=name
  // Shareable and bookmarkable!
}
```

---

## 12. Mobile & Safe Area Support

### Safe Area CSS

```css
/* src/index.css - add to existing */

@layer utilities {
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }
  
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .safe-left {
    padding-left: env(safe-area-inset-left);
  }
  
  .safe-right {
    padding-right: env(safe-area-inset-right);
  }
  
  .safe-x {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
  
  .safe-y {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .safe-all {
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  }
}

/* Sticky header with safe area */
.sticky-header {
  position: sticky;
  top: 0;
  padding-top: max(1rem, env(safe-area-inset-top));
  z-index: 40;
}

/* Bottom action bar with safe area */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Mobile Navigation

```typescript
// src/components/layout/MobileNav.tsx

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/navigation/NavLink';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 safe-all">
        <nav className="flex flex-col gap-2 mt-8">
          <NavLink to="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/contacts" onClick={() => setOpen(false)}>
            Contacts
          </NavLink>
          <NavLink to="/organizations" onClick={() => setOpen(false)}>
            Organizations
          </NavLink>
          <NavLink to="/pipelines" onClick={() => setOpen(false)}>
            Pipelines
          </NavLink>
          <NavLink to="/tasks" onClick={() => setOpen(false)}>
            Tasks
          </NavLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

### Touch-Friendly Targets

```css
/* Ensure minimum 44x44px touch targets */
@layer components {
  .touch-target {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Icon buttons should have padding to meet touch target size */
  .icon-button {
    width: 44px;
    height: 44px;
    padding: 10px;
  }
}
```

---

## 13. Updated Dependencies

### New Dependencies to Add

```json
{
  "dependencies": {
    // Existing dependencies...
    
    // Animation
    "framer-motion": "^11.0.0",
    
    // i18n
    "i18next": "^23.7.0",
    "react-i18next": "^14.0.0",
    "i18next-browser-languagedetector": "^7.2.0",
    
    // Form utilities
    "use-debounce": "^10.0.0"
  }
}
```

### ESLint Configuration Updates

```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    'react-app',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended', // Add accessibility linting
    'prettier',
  ],
  plugins: ['jsx-a11y', 'import'],
  rules: {
    // Enforce import order
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'type',
        ],
        pathGroups: [
          { pattern: 'react', group: 'builtin', position: 'before' },
          { pattern: '@/**', group: 'internal', position: 'before' },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    
    // No explicit any
    '@typescript-eslint/no-explicit-any': 'error',
    
    // Accessibility
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/anchor-is-valid': 'error',
    
    // Max lines per function (components)
    'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
  },
};
```

---

## Integration Checklist

Use this checklist when integrating updates into the main PRD:

### Section 1: Tech Stack
- [ ] Add Framer Motion to Key Libraries
- [ ] Add i18next to Key Libraries
- [ ] Add jsx-a11y to Development Tools

### Section 2: Project Structure
- [ ] Add `src/lib/i18n/` folder
- [ ] Add `src/lib/animation.ts`
- [ ] Add `src/components/theme/` folder
- [ ] Add `src/components/motion/` folder
- [ ] Add `src/components/navigation/` folder

### Section 6: State Management
- [ ] Add discriminated unions pattern examples
- [ ] Add modern hooks section (useId, useTransition, etc.)
- [ ] Add Suspense patterns

### Section 8: Component Architecture
- [ ] Add AI development rules
- [ ] Add standard import order
- [ ] Add composition patterns
- [ ] Add Context usage guidelines
- [ ] Add component size limits

### New Sections to Add
- [ ] Add Section 17: Forms & Validation Enhancements
- [ ] Add Section 18: Internationalization
- [ ] Add Section 19: Dark Mode
- [ ] Add Section 20: Animation System
- [ ] Add Section 21: UX Patterns & QoL
- [ ] Add Section 22: Navigation Enhancements
- [ ] Add Section 23: Mobile Support

### Appendices Updates
- [ ] Update dependencies list
- [ ] Update ESLint configuration
- [ ] Add CSS utilities to install

---

**Document Version History:**
- v1.1 (Dec 2024): Best practices integration addendum
