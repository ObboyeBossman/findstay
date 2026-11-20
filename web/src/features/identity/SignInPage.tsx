import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logoUrl from '../../assets/logo.jpeg';
import { FormField, InlineError, useToast } from '../../components/ui';
import { ApiClientError } from '../../lib/api';
import { supabase, TURNSTILE_SITE_KEY } from '../../lib/supabase';
import { resolveHomeRoute, useAuth } from './AuthContext';
import { TurnstileWidget } from './TurnstileWidget';

type SignInMode = 'landing' | 'password' | 'magic-link';

type BannerState =
  | { kind: 'error'; message: string }
  | { kind: 'unverified'; email: string }
  | { kind: 'suspended'; message: string }
  | { kind: 'magic-sent'; email: string };

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { refreshSessionContext, sessionExpired, clearSessionExpired, signOut } =
    useAuth();

  const [mode, setMode] = useState<SignInMode>(
    sessionExpired ? 'password' : 'landing',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const redirectParam = searchParams.get('redirect');
  const safeRedirect =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : null;

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Please enter your password.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEmailOnly = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResendVerification = async (targetEmail: string) => {
    if (!supabase || resending) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        showToast({ variant: 'error', title: 'Could not resend', message: error.message });
      } else {
        showToast({
          variant: 'success',
          title: 'Verification email sent',
          message: `Check ${targetEmail} for your confirmation link.`,
        });
      }
    } finally {
      setResending(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    clearSessionExpired();

    if (!validatePasswordForm()) return;

    if (!supabase) {
      setBanner({
        kind: 'error',
        message:
          'Authentication is not configured yet (missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).',
      });
      return;
    }

    if (!turnstileToken) {
      setBanner({
        kind: 'error',
        message: 'Please complete the verification check before signing in.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
        options: {
          captchaToken: TURNSTILE_SITE_KEY ? turnstileToken : undefined,
        },
      });

      if (error) {
        const lower = error.message.toLowerCase();
        if (lower.includes('email not confirmed')) {
          setBanner({ kind: 'unverified', email: normalizedEmail });
        } else {
          setBanner({
            kind: 'error',
            message: 'Invalid email or password. Please try again.',
          });
        }
        return;
      }

      const token = data.session?.access_token;
      if (!token) {
        setBanner({
          kind: 'error',
          message: 'Sign-in did not return a session. Please try again.',
        });
        return;
      }

      let homeRoute = '/';
      try {
        const ctx = await refreshSessionContext(token);
        homeRoute = resolveHomeRoute(ctx);
      } catch (apiErr) {
        if (apiErr instanceof ApiClientError && apiErr.status === 403) {
          throw apiErr;
        }
      }
      showToast({ variant: 'success', title: 'Signed in' });
      navigate(safeRedirect ?? homeRoute, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 403) {
        await signOut();
        setBanner({
          kind: 'suspended',
          message:
            'This account has been suspended by an administrator. Please contact support.',
        });
      } else {
        setBanner({
          kind: 'error',
          message:
            err instanceof Error ? err.message : 'Unable to sign in. Please try again.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!validateEmailOnly()) return;

    if (!supabase) {
      setBanner({
        kind: 'error',
        message:
          'Authentication is not configured yet (missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).',
      });
      return;
    }

    if (!turnstileToken) {
      setBanner({
        kind: 'error',
        message: 'Please complete the verification check before continuing.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken: TURNSTILE_SITE_KEY ? turnstileToken : undefined,
        },
      });
      if (error) {
        setBanner({ kind: 'error', message: error.message });
        return;
      }
      setBanner({ kind: 'magic-sent', email: normalizedEmail });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-card px-4 py-8 text-earth">
      <div className="w-full max-w-xs text-center">
        <Link
          to="/"
          aria-label="Back to FindStay home"
          className="inline-flex rounded-2xl p-2 transition-colors hover:bg-surface-hover/50"
        >
          <img
            src={logoUrl}
            alt="FindStay"
            className="h-12 w-12 rounded-xl object-cover"
          />
        </Link>

        <h1 className="mt-4 font-display text-heading-2 text-earth">
          Sign in to FindStay
        </h1>

        {sessionExpired ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-status-warning-border bg-status-warning-bg px-4 py-3 text-left text-body-2 text-status-warning-fg"
          >
            Your session has expired for your security. Please sign in again to continue.
          </div>
        ) : null}

        {banner?.kind === 'error' || banner?.kind === 'suspended' ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-status-error-border bg-status-error-bg px-4 py-3 text-left text-body-2 text-status-error-fg"
          >
            {banner.message}
          </div>
        ) : null}

        {banner?.kind === 'unverified' ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-status-warning-border bg-status-warning-bg px-4 py-3 text-left text-body-2 text-status-warning-fg"
          >
            <p>Your email has not been verified yet. Check your inbox to activate your account.</p>
            <button
              type="button"
              onClick={() => handleResendVerification(banner.email)}
              disabled={resending}
              className="mt-2 font-semibold underline hover:opacity-80 disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        ) : null}

        {banner?.kind === 'magic-sent' ? (
          <div
            role="status"
            className="mt-4 rounded-xl border border-status-success-border bg-status-success-bg px-4 py-3 text-left text-body-2 text-status-success-fg"
          >
            We sent a sign-in link to <span className="font-semibold">{banner.email}</span>.
            Check your inbox to continue.
          </div>
        ) : null}

        {mode === 'landing' ? (
          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setBanner(null);
                setFieldErrors({});
                setMode('password');
              }}
              className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-full bg-olive px-6 py-3 text-body-2 font-semibold text-on-brand transition-colors hover:bg-olive-hover"
            >
              Continue to sign in
            </button>

            <button
              type="button"
              onClick={() => {
                setBanner(null);
                setFieldErrors({});
                setMode('magic-link');
              }}
              className="inline-flex min-h-touch w-full items-center justify-center rounded-full border border-border-subtle bg-surface-card px-6 py-3 text-body-2 font-semibold text-earth transition-colors hover:bg-surface-hover/50"
            >
              Sign in another way
            </button>
          </div>
        ) : null}

        {mode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} noValidate className="mt-6 space-y-4 text-left">
            <FormField
              id="signin-email"
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ama@example.com"
              error={fieldErrors.email}
            />

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="signin-password"
                  className="block text-caption font-semibold text-earth"
                >
                  Password <span className="text-terracotta-dark" aria-hidden="true">*</span>
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-caption font-semibold text-terracotta hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={fieldErrors.password ? 'true' : undefined}
                  className={`min-h-touch w-full rounded-lg border bg-surface-card px-3 py-2 pr-11 text-body-2 text-earth focus:outline-none ${
                    fieldErrors.password
                      ? 'border-status-error-border bg-status-error-bg/40'
                      : 'border-border-subtle focus:border-olive'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 inline-flex min-h-touch min-w-touch -translate-y-1/2 items-center justify-center rounded-lg text-earth/70 hover:text-earth"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <InlineError id="signin-password-error" message={fieldErrors.password} />
            </div>

            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
            />

            <button
              type="submit"
              disabled={submitting || !turnstileToken}
              className="min-h-touch w-full rounded-full bg-olive px-6 py-3 text-body-2 font-semibold text-on-brand transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => {
                setBanner(null);
                setFieldErrors({});
                setMode('landing');
              }}
              className="inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-earth/75 transition-colors hover:bg-surface-hover/50 hover:text-earth"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>
          </form>
        ) : null}

        {mode === 'magic-link' ? (
          <form onSubmit={handleMagicLinkSubmit} noValidate className="mt-6 space-y-4 text-left">
            <FormField
              id="magic-email"
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ama@example.com"
              hint="We will email you a one-time sign-in link."
              error={fieldErrors.email}
            />

            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
            />

            <button
              type="submit"
              disabled={submitting || !turnstileToken}
              className="min-h-touch w-full rounded-full bg-olive px-6 py-3 text-body-2 font-semibold text-on-brand transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Sending link...' : 'Send sign-in link'}
            </button>

            <button
              type="button"
              onClick={() => {
                setBanner(null);
                setFieldErrors({});
                setMode('landing');
              }}
              className="inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-earth/75 transition-colors hover:bg-surface-hover/50 hover:text-earth"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>
          </form>
        ) : null}

        <p className="mt-6 text-caption text-earth/75">
          <Link to="/auth/sign-up" className="underline hover:text-earth">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
