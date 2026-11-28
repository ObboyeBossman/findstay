import React from 'react';
import { ArrowLeft, Home, LogIn, RefreshCw, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { resolveHomeRoute, useAuth } from './AuthContext';

export interface AccessDeniedStateProps {
  /** Human-readable name of the blocked section or portal (e.g. "Admin Portal"). */
  areaName?: string;
  /** Plain-language explanation of why access was denied. */
  reason?: string;
  /** Optional retry handler when permissions failed to load due to a transient error. */
  onRetry?: () => void;
}

function formatRoleLabel(role: string | null): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'OWNER':
      return 'Property Owner';
    case 'STAFF':
      return 'Property Staff';
    case 'GUEST':
      return 'Guest';
    default:
      return 'Signed-in user';
  }
}

/**
 * Accessible, mobile-first Access Denied screen (S1-06-T4, BRL-02, FR-07, UR-AN01).
 * Uses icon + text label + border contrast (NFR-07) and only design-system tokens.
 */
export const AccessDeniedState: React.FC<AccessDeniedStateProps> = ({
  areaName,
  reason,
  onRetry,
}) => {
  const { session, sessionContext, role } = useAuth();
  const navigate = useNavigate();

  const homeRoute = resolveHomeRoute(sessionContext);
  const homeLabel =
    homeRoute === '/admin'
      ? 'Go to Admin Portal'
      : homeRoute === '/owner'
        ? 'Go to Owner Portal'
        : 'Back to Guest Home';

  const heading = areaName ? `Access denied to ${areaName}` : 'Access denied';
  const explanation =
    reason ??
    (areaName
      ? `Your current account does not have permission to view ${areaName}. If you believe this is a mistake, contact your organisation owner or a FindStay administrator.`
      : 'Your current account does not have permission to view this page.');

  return (
    <section
      role="alert"
      aria-labelledby="access-denied-heading"
      className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-status-error-border bg-surface-card px-5 py-10 text-center shadow-sm sm:px-8"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-status-error-border bg-status-error-bg text-status-error-fg">
        <ShieldAlert className="h-7 w-7" aria-hidden="true" />
      </div>

      <StatusBadge variant="error" label="403 · Access Denied" />

      <h1
        id="access-denied-heading"
        className="mt-4 font-display text-heading-3 font-bold text-earth"
      >
        {heading}
      </h1>

      <p className="mt-2 max-w-lg text-body-2 text-earth/80">{explanation}</p>

      {session ? (
        <div className="mt-4 rounded-xl border border-border-subtle bg-surface-muted px-4 py-2.5 text-caption text-earth/80">
          Signed in as{' '}
          <span className="font-semibold text-earth">
            {sessionContext?.profile.email ?? session.user.email ?? 'your account'}
          </span>
          {role ? (
            <>
              {' '}
              · Role:{' '}
              <span className="font-semibold text-earth">{formatRoleLabel(role)}</span>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-lg bg-olive px-5 py-2.5 text-caption font-semibold text-ivory transition-colors hover:bg-olive-hover"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Retry</span>
          </button>
        ) : (
          <Link
            to={homeRoute}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-lg bg-olive px-5 py-2.5 text-caption font-semibold text-ivory transition-colors hover:bg-olive-hover"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>{homeLabel}</span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-4 py-2.5 text-caption font-semibold text-earth transition-colors hover:bg-surface-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Go back</span>
        </button>

        <Link
          to="/auth/sign-in"
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-card px-4 py-2.5 text-caption font-semibold text-earth transition-colors hover:bg-surface-hover"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          <span>{session ? 'Switch account' : 'Sign in'}</span>
        </Link>
      </div>
    </section>
  );
};
