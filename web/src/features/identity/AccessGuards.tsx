import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { SkeletonList } from '../../components/ui';
import { AccessDeniedState } from './AccessDeniedState';
import { useAuth } from './AuthContext';
import { meetsAccessRequirement } from './permissions';
import type { AccessRequirement } from './types';

export interface RequireAccessProps extends AccessRequirement {
  /** Human-readable name of the protected area, displayed in Access Denied feedback. */
  areaName?: string;
  /** Optional custom reason shown when a signed-in user lacks required access. */
  deniedReason?: string;
  /**
   * When true, renders the Access Denied state inside a padded standalone frame
   * (useful when guarding top-level portal layouts like /owner and /admin).
   */
  standalone?: boolean;
  children?: React.ReactNode;
}

/**
 * Route and section guard enforcing authentication, role, and permission checks
 * in React (S1-06-T4). Unauthenticated visitors are redirected to `/auth/sign-in`;
 * authenticated users without the required role or permission see a clear
 * Access Denied screen.
 *
 * Security note: UI guards improve user experience only; every API endpoint
 * independently enforces permissions via `@RequiresPermission` and `OrgScope`.
 */
export const RequireAccess: React.FC<RequireAccessProps> = ({
  requiredRoles,
  requiredPermissions,
  requireAllPermissions = false,
  areaName,
  deniedReason,
  standalone = false,
  children,
}) => {
  const { session, sessionContext, loading, contextError, refreshSessionContext } = useAuth();
  const location = useLocation();

  const wrap = (node: React.ReactNode) =>
    standalone ? (
      <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-4 py-10 text-earth">
        {node}
      </div>
    ) : (
      <div className="py-6">{node}</div>
    );

  if (loading) {
    return wrap(
      <div className="mx-auto w-full max-w-2xl space-y-3" aria-busy="true" aria-label="Checking permissions">
        <SkeletonList count={2} />
      </div>,
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/auth/sign-in"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (!sessionContext) {
    return wrap(
      <AccessDeniedState
        areaName={areaName}
        reason={
          contextError ??
          'We could not confirm your account permissions right now. Please retry or sign in again.'
        }
        onRetry={() => {
          refreshSessionContext().catch(() => {
            // contextError is updated by AuthProvider
          });
        }}
      />,
    );
  }

  const allowed = meetsAccessRequirement(sessionContext, {
    requiredRoles,
    requiredPermissions,
    requireAllPermissions,
  });

  if (!allowed) {
    return wrap(
      <AccessDeniedState
        areaName={areaName}
        reason={deniedReason}
      />,
    );
  }

  return <>{children ?? <Outlet />}</>;
};

export interface PermissionGateProps extends AccessRequirement {
  /** Optional replacement UI when access is not granted (defaults to hiding the control). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Inline permission gate that hides unauthorised buttons, panels, or controls
 * when the signed-in user lacks the required role or permission (S1-06-T4).
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  requiredRoles,
  requiredPermissions,
  requireAllPermissions = false,
  fallback = null,
  children,
}) => {
  const { sessionContext } = useAuth();
  const allowed = meetsAccessRequirement(sessionContext, {
    requiredRoles,
    requiredPermissions,
    requireAllPermissions,
  });
  return <>{allowed ? children : fallback}</>;
};
