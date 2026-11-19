import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { apiFetch, setUnauthorizedHandler } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import type { SessionContext } from './types';

type AuthContextValue = {
  session: Session | null;
  sessionContext: SessionContext | null;
  loading: boolean;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  provisionAccount: (accessToken: string) => Promise<SessionContext>;
  refreshSessionContext: (accessToken?: string) => Promise<SessionContext | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(supabase));
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const loadMe = useCallback(async (accessToken: string): Promise<SessionContext> => {
    const ctx = await apiFetch<SessionContext>('/me', { accessToken });
    setSessionContext(ctx);
    return ctx;
  }, []);

  const provisionAccount = useCallback(async (accessToken: string): Promise<SessionContext> => {
    const ctx = await apiFetch<SessionContext>('/auth/provision', {
      method: 'POST',
      accessToken,
    });
    setSessionContext(ctx);
    return ctx;
  }, []);

  const refreshSessionContext = useCallback(
    async (explicitToken?: string): Promise<SessionContext | null> => {
      const token = explicitToken ?? session?.access_token;
      if (!token) return null;
      return loadMe(token);
    },
    [loadMe, session?.access_token],
  );

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setSessionContext(null);
    setSessionExpired(false);
  }, []);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSessionExpired(true);
      setSessionContext(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        if (data.session?.access_token) {
          loadMe(data.session.access_token).catch(() => {
            // Handled via unauthorizedHandler or sign-in flow
          });
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) {
        setSessionContext(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadMe]);

  return (
    <AuthContext.Provider
      value={{
        session,
        sessionContext,
        loading,
        sessionExpired,
        clearSessionExpired,
        provisionAccount,
        refreshSessionContext,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

export function resolveHomeRoute(context: SessionContext | null): string {
  const roles = context?.memberships.map((m) => m.role) ?? [];
  if (roles.includes('ADMIN')) return '/admin';
  if (roles.includes('OWNER') || roles.includes('STAFF')) return '/owner';
  return '/';
}
