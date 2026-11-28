import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  LogIn,
  RefreshCw,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BrandMark } from '../../components/BrandMark';
import { StatusBadge } from '../../components/StatusBadge';
import { SkeletonCard, useToast } from '../../components/ui';
import { ApiClientError } from '../../lib/api';
import { useAuth } from '../identity';
import {
  acceptStaffInvitation,
  formatAccraDateTime,
  PENDING_INVITE_TOKEN_KEY,
  previewStaffInvitation,
} from './api';
import type { StaffInvitation } from './types';

/**
 * SCR-08B: Staff Invite Acceptance (`/owner/invitations/:token` and
 * `/owner/invitations?token=...`) — S1-07-T6.
 * Public token-authorised preview that preserves the token across sign-in/sign-up
 * and lets the invited user accept with one click once signed in.
 */
export const InviteAcceptancePage: React.FC = () => {
  const { token: paramToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const rawToken = (paramToken ?? searchParams.get('token') ?? '').trim();

  const { session, sessionContext, refreshSessionContext, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<StaffInvitation | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!rawToken) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setErrorMessage(null);
    try {
      const data = await previewStaffInvitation(rawToken);
      setInvitation(data);
      if (data.status === 'PENDING') {
        try {
          window.sessionStorage.setItem(PENDING_INVITE_TOKEN_KEY, rawToken);
        } catch {
          // Ignore storage restrictions
        }
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setNotFound(true);
      } else {
        setErrorMessage(
          err instanceof ApiClientError
            ? err.message
            : 'Unable to load this invitation right now. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [rawToken]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const currentEmail = (
    sessionContext?.profile.email ??
    session?.user.email ??
    ''
  )
    .trim()
    .toLowerCase();
  const invitedEmail = (invitation?.email ?? '').trim().toLowerCase();
  const isSignedIn = Boolean(session?.access_token);
  const emailMatches = isSignedIn && invitedEmail !== '' && currentEmail === invitedEmail;

  const redirectPath = `/owner/invitations/${encodeURIComponent(rawToken)}`;
  const authQuery = `?redirect=${encodeURIComponent(redirectPath)}&email=${encodeURIComponent(invitation?.email ?? '')}`;

  const handleAccept = async () => {
    if (!session?.access_token || !invitation) return;
    setAccepting(true);
    try {
      await acceptStaffInvitation(session.access_token, rawToken);
      try {
        window.sessionStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
      } catch {
        // Ignore storage restrictions
      }
      await refreshSessionContext(session.access_token).catch(() => null);
      showToast({
        variant: 'success',
        title: `Welcome to ${invitation.organizationDisplayName}!`,
        message: 'Your staff access is now active.',
      });
      navigate('/owner', { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Could not accept this invitation. Please try again.';
      showToast({ variant: 'error', title: 'Could not accept', message: msg });
      await loadPreview();
    } finally {
      setAccepting(false);
    }
  };

  const handleSwitchAccount = async () => {
    await signOut();
    navigate(`/auth/sign-in${authQuery}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-canvas px-4 py-10 text-earth">
      <div className="mb-6">
        <BrandMark />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm">
        {loading ? (
          <div aria-busy="true" aria-label="Loading invitation">
            <SkeletonCard />
          </div>
        ) : notFound ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-status-error-bg text-status-error-fg">
              <XCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="font-display text-heading-4 font-bold text-earth">
              Invitation Not Found
            </h1>
            <p className="mt-2 text-body-2 text-earth/75">
              This invitation link is invalid or incomplete. Check the link in your email.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex min-h-touch w-full items-center justify-center rounded-lg bg-olive px-4 py-2.5 text-caption font-semibold text-ivory hover:bg-olive-hover"
            >
              Go to Homepage
            </Link>
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center text-center">
            <StatusBadge variant="error" label="Connection Error" />
            <p className="mt-3 text-body-2 text-earth/80">{errorMessage}</p>
            <button
              type="button"
              onClick={loadPreview}
              className="mt-5 inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-olive px-4 py-2.5 text-caption font-semibold text-ivory hover:bg-olive-hover"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        ) : invitation?.status === 'EXPIRED' ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-status-warning-bg text-status-warning-fg">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <StatusBadge variant="error" label="Invitation Expired" />
            <h1 className="mt-3 font-display text-heading-4 font-bold text-earth">
              This invitation has expired
            </h1>
            <p className="mt-2 text-body-2 text-earth/75">
              This invitation expired on {formatAccraDateTime(invitation.expiresAt)}. Ask the
              property owner to send you a new invitation.
            </p>
            <Link
              to="/auth/sign-in"
              className="mt-5 inline-flex min-h-touch w-full items-center justify-center rounded-lg bg-olive px-4 py-2.5 text-caption font-semibold text-ivory hover:bg-olive-hover"
            >
              Go to Sign In
            </Link>
          </div>
        ) : invitation?.status === 'REVOKED' ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-status-error-bg text-status-error-fg">
              <XCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <StatusBadge variant="info" label="Invitation Revoked" />
            <h1 className="mt-3 font-display text-heading-4 font-bold text-earth">
              Invitation No Longer Active
            </h1>
            <p className="mt-2 text-body-2 text-earth/75">
              This invitation was revoked by the company owner.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex min-h-touch w-full items-center justify-center rounded-lg bg-olive px-4 py-2.5 text-caption font-semibold text-ivory hover:bg-olive-hover"
            >
              Go to Homepage
            </Link>
          </div>
        ) : invitation?.status === 'ACCEPTED' ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-status-success-bg text-status-success-fg">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <StatusBadge variant="success" label="Already Accepted" />
            <h1 className="mt-3 font-display text-heading-4 font-bold text-earth">
              Invitation Already Accepted
            </h1>
            <p className="mt-2 text-body-2 text-earth/75">
              This invitation has already been accepted. Sign in to access your assigned
              properties in {invitation.organizationDisplayName}.
            </p>
            <Link
              to="/owner"
              className="mt-5 inline-flex min-h-touch w-full items-center justify-center rounded-lg bg-olive px-4 py-2.5 text-caption font-semibold text-ivory hover:bg-olive-hover"
            >
              Go to Owner Portal
            </Link>
          </div>
        ) : invitation ? (
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-olive">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="text-caption font-semibold uppercase tracking-wide text-olive">
                Staff Invitation
              </p>
              <h1 className="mt-1 font-display text-heading-4 font-bold text-earth">
                Join {invitation.organizationDisplayName}
              </h1>
            </div>

            <dl className="space-y-2 rounded-xl border border-border-subtle bg-canvas p-4 text-caption">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-earth/70">Invited email</dt>
                <dd className="font-semibold text-earth">{invitation.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-earth/70">Role</dt>
                <dd>
                  <StatusBadge variant="info" label="Staff" />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-earth/70">Expires</dt>
                <dd className="font-medium text-earth">
                  {formatAccraDateTime(invitation.expiresAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-earth/70">Assigned properties</dt>
                <dd className="font-medium text-earth">
                  {invitation.propertyIds.length === 0
                    ? 'Assigned after onboarding'
                    : `${invitation.propertyIds.length} ${invitation.propertyIds.length === 1 ? 'property' : 'properties'}`}
                </dd>
              </div>
            </dl>

            {isSignedIn && emailMatches ? (
              <button
                type="button"
                disabled={accepting}
                onClick={handleAccept}
                className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-olive px-5 py-3 text-caption font-semibold text-ivory transition-colors hover:bg-olive-hover disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>
                  {accepting ? 'Accepting invitation…' : 'Accept Invitation & Open Dashboard'}
                </span>
              </button>
            ) : isSignedIn && !emailMatches ? (
              <div className="space-y-3 rounded-xl border border-status-warning-border bg-status-warning-bg p-4">
                <p className="text-caption font-medium text-status-warning-fg">
                  You are signed in as <span className="font-bold">{currentEmail}</span>, but
                  this invitation was sent to{' '}
                  <span className="font-bold">{invitation.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-earth px-4 py-2.5 text-caption font-semibold text-on-brand hover:bg-earth/90"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Switch Account</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to={`/auth/sign-up${authQuery}`}
                  className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-olive px-4 py-2.5 text-caption font-semibold text-ivory hover:bg-olive-hover"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  <span>Create Account to Accept</span>
                </Link>
                <Link
                  to={`/auth/sign-in${authQuery}`}
                  className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-4 py-2.5 text-caption font-semibold text-earth hover:bg-surface-hover"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Sign In to Accept</span>
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
