import { useState, useEffect, startTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useAuth } from '../context/AuthContext';


const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user, initialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Navigate when user becomes authenticated after sign in
  useEffect(() => {
    if (user && initialized && isSubmitting) {
      console.log('User authenticated, navigating to dashboard');
      setIsSubmitting(false);
      // Use startTransition and delay to ensure navigation happens after React state updates
      // and context is fully propagated
      startTransition(() => {
        setTimeout(() => {
          const from = (location.state as { from?: Location })?.from;
          const targetPath = from?.pathname || '/dashboard';
          console.log('Navigating to:', targetPath);
          navigate(targetPath, { replace: true });
        }, 100);
      });
    }
  }, [user, initialized, navigate, location, isSubmitting]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setError(null);
      setIsSubmitting(true);
      console.log('Starting sign in...');
      await signIn(values.email, values.password);
      console.log('Sign in completed, user:', user);
      // Don't navigate here - let useEffect handle it when user state updates
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isSubmitting}>
          {(form.formState.isSubmitting || isSubmitting) ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}

