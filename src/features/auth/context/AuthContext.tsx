import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

import { supabase } from '@/lib/supabase/client';

import type { Profile } from '../types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const isSigningInRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet - that's okay for now
        console.warn('Profile fetch error (may not exist):', error.message);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let hasInitialized = false;

    const handleAuthChange = async (session: Session | null) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        if (mounted) setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      if (mounted) {
        setLoading(false);
        setInitialized(true);
      }
    };

    // Set up auth state change listener FIRST (Supabase recommended pattern)
    // This ensures we catch INITIAL_SESSION event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event);
      
      // Skip if we're in the middle of a signIn operation (it handles state updates directly)
      if (isSigningInRef.current && event === 'SIGNED_IN') {
        isSigningInRef.current = false;
        return;
      }
      
      // Handle INITIAL_SESSION or any other auth event
      if (event === 'INITIAL_SESSION' || !hasInitialized) {
        hasInitialized = true;
        await handleAuthChange(session);
      } else {
        // Handle subsequent auth changes
        await handleAuthChange(session);
      }
    });

    // Also try to get session directly as a fallback (with timeout)
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => {
      setTimeout(() => resolve({ data: { session: null } }), 3000);
    });

    Promise.race([sessionPromise, timeoutPromise])
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (!hasInitialized) {
          console.log('Initial session loaded (fallback):', session ? 'logged in' : 'no session');
          hasInitialized = true;
          handleAuthChange(session);
        }
      })
      .catch((err) => {
        console.error('Error getting initial session:', err);
        if (!mounted) return;
        if (!hasInitialized) {
          hasInitialized = true;
          setLoading(false);
          setInitialized(true);
        }
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    isSigningInRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        isSigningInRef.current = false;
        throw error;
      }

      // Directly update state instead of relying on onAuthStateChange race condition
      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
        setLoading(false);
        setInitialized(true);
        // Reset flag after a brief delay to allow state to propagate
        setTimeout(() => {
          isSigningInRef.current = false;
        }, 100);
      } else {
        isSigningInRef.current = false;
      }
    } catch (err) {
      isSigningInRef.current = false;
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const isAdmin = () => profile?.role === 'admin';
  const isManager = () => profile?.role === 'manager' || profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        initialized,
        signIn,
        signOut,
        isAdmin,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

