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

/**
 * Get the full stored session data from localStorage.
 * Supabase stores sessions with keys like 'sb-<project-ref>-auth-token'
 */
function getStoredSessionData(): Record<string, unknown> | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
        const value = localStorage.getItem(key);
        if (value) {
          return JSON.parse(value);
        }
      }
    }
  } catch (e) {
    console.error('Error reading stored session:', e);
  }
  return null;
}

/**
 * Decode JWT to get payload without network calls
 */
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Create a minimal Session object from stored data
 */
function createSessionFromStored(storedData: Record<string, unknown>): Session {
  return {
    access_token: storedData.access_token,
    refresh_token: storedData.refresh_token,
    expires_in: storedData.expires_in || 3600,
    expires_at: storedData.expires_at,
    token_type: 'bearer',
    user: storedData.user,
  } as Session;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const isSigningInRef = useRef(false);
  const initializingRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Use the REST client for profile fetch since SDK queries hang
      const { restClient } = await import('@/lib/supabase/restClient');
      const { data, error } = await restClient.querySingle<Profile>('profiles', {
        filters: [{ column: 'id', operator: 'eq', value: userId }],
      });

      if (error) {
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
    // Prevent double-initialization in React strict mode
    if (initializingRef.current) return;
    initializingRef.current = true;
    
    let mounted = true;

    // IMMEDIATE session restoration from localStorage - no Supabase calls that might hang
    const storedData = getStoredSessionData();
    if (storedData?.access_token) {
      const jwtPayload = decodeJwt(storedData.access_token as string);
      if (jwtPayload) {
        const isExpired = (jwtPayload.exp as number) * 1000 < Date.now();
        
        if (!isExpired && storedData.user) {
          // Restore session immediately from localStorage
          const restoredUser = storedData.user as User;
          const restoredSession = createSessionFromStored(storedData);
          
          setUser(restoredUser);
          setSession(restoredSession);
          setLoading(false);
          setInitialized(true);
          
          // Fetch profile in background
          if (restoredUser.id) {
            fetchProfile(restoredUser.id).then(profileData => {
              if (mounted) setProfile(profileData);
            });
          }
          
          // Setup listener for future auth changes only
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            
            // Skip INITIAL_SESSION since we already handled it
            if (event === 'INITIAL_SESSION') return;
            
            // Handle sign out
            if (event === 'SIGNED_OUT') {
              setUser(null);
              setSession(null);
              setProfile(null);
              return;
            }
            
            // Handle token refresh
            if (event === 'TOKEN_REFRESHED' && session) {
              setSession(session);
              setUser(session.user);
            }
          });
          
          return () => {
            mounted = false;
            initializingRef.current = false;
            subscription.unsubscribe();
          };
        }
      }
    }
    
    // No valid stored session - set up normal listener and wait for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (isSigningInRef.current && event === 'SIGNED_IN') {
        isSigningInRef.current = false;
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          if (mounted) setProfile(profileData);
        });
      } else {
        setProfile(null);
      }
      
      setLoading(false);
      setInitialized(true);
    });
    
    // Fallback for no-session case - don't wait forever
    const fallbackTimer = setTimeout(() => {
      if (!mounted || initialized) return;
      setLoading(false);
      setInitialized(true);
    }, 2000);

    return () => {
      mounted = false;
      initializingRef.current = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile, initialized]);

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

      if (data.session && data.user) {
        // Session is already set on Supabase client by signInWithPassword
        setSession(data.session);
        setUser(data.user);
        
        fetchProfile(data.user.id).then(profileData => {
          setProfile(profileData);
        });
        
        setLoading(false);
        setInitialized(true);
        
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
    setUser(null);
    setSession(null);
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
