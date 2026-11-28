import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ApiClientError, apiFetch, setUnauthorizedHandler } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import {
  canAccessAdminPortal,
  canAccessOwnerPortal,
  getEffectiveRole,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRole,
} from './permissions';
import type { PlatformRole, SessionContext } from './types';

type AuthContextValue = {
  session: Session | null;
  sessionContext: SessionContext | null;
  loading: boolean;
  sessionExpired: boolean;
  contextError: string | null;
  role: PlatformRole | null;
  permissions: readonly string[];
  hasRole: (allowedRoles: readonly PlatformRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: readonly string[]) => boolean;
  hasAllPermissions: (permissions: readonly string[]) => boolean;
  canAccessOwnerPortal: boolean;
  canAccessAdminPortal: boolean;
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
  const [contextError, setContextError] = useState<string | null>(null);

  const loadMe = useCallback(async (accessToken: string): Promise<SessionContext> => {
    try {
      const ctx = await apiFetch<SessionContext>('/me', { accessToken });
      setSessionContext(ctx);
      setContextError(null);
      return ctx;
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 403) {
        setSessionContext(null);
        setContextError(err.message || 'Your account does not have access to FindStay.');
      } else {
        setContextError('Unable to verify your permissions right now. Please try again.');
      }
      throw err;
    }
  }, []);

  const provisionAccount = useCallback(async (accessToken: string): Promise<SessionContext> => {
    const ctx = await apiFetch<SessionContext>('/auth/provision', {
      method: 'POST',
      accessToken,
    });
    setSessionContext(ctx);
    setContextError(null);
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
    setContextError(null);
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
      .then(async ({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        if (data.session?.access_token) {
          try {
            await loadMe(data.session.access_token);
          } catch {
            // Handled via unauthorizedHandler or contextError state
          }
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
        setContextError(null);
      } else if (nextSession.access_token) {
        loadMe(nextSession.access_token).catch(() => {
          // Handled via unauthorizedHandler or contextError state
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadMe]);

  const role = getEffectiveRole(sessionContext);
  const permissions = sessionContext?.permissions ?? [];

  const checkRole = useCallback(
    (allowedRoles: readonly PlatformRole[]) => hasRole(sessionContext, allowedRoles),
    [sessionContext],
  );
  const checkPermission = useCallback(
    (permission: string) => hasPermission(sessionContext, permission),
    [sessionContext],
  );
  const checkAnyPermission = useCallback(
    (required: readonly string[]) => hasAnyPermission(sessionContext, required),
    [sessionContext],
  );
  const checkAllPermissions = useCallback(
    (required: readonly string[]) => hasAllPermissions(sessionContext, required),
    [sessionContext],
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        sessionContext,
        loading,
        sessionExpired,
        contextError,
        role,
        permissions,
        hasRole: checkRole,
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        canAccessOwnerPortal: canAccessOwnerPortal(sessionContext),
        canAccessAdminPortal: canAccessAdminPortal(sessionContext),
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
  if (canAccessAdminPortal(context)) return '/admin';
  if (canAccessOwnerPortal(context)) return '/owner';
  return '/';
}
