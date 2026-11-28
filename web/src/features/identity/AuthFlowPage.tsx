import React, { useMemo, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader, Mail, Phone, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormField, InlineError, useToast } from '../../components/ui';
import { ApiClientError, apiFetch } from '../../lib/api';
import { supabase, TURNSTILE_SITE_KEY } from '../../lib/supabase';
import { resolveHomeRoute, useAuth } from './AuthContext';
import { TurnstileWidget } from './TurnstileWidget';

type Props = {
  defaultIntent?: 'sign-in' | 'sign-up';
};

type AuthStep = 'choose-account' | 'email' | 'sign-in' | 'sign-up';

type KnownAccount = {
  email: string;
  displayName: string;
};

type LookupResponse = {
  exists: boolean;
  displayName: string | null;
};

const KNOWN_ACCOUNTS_KEY = 'findstay_known_accounts';

function loadKnownAccounts(): KnownAccount[] {
  try {
    const raw = window.localStorage.getItem(KNOWN_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is KnownAccount =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as KnownAccount).email === 'string' &&
        typeof (item as KnownAccount).displayName === 'string',
    );
  } catch {
    return [];
  }
}

function saveKnownAccount(account: KnownAccount): KnownAccount[] {
  const existing = loadKnownAccounts().filter(
    (a) => a.email.toLowerCase() !== account.email.toLowerCase(),
  );
  const next = [account, ...existing].slice(0, 3);
  try {
    window.localStorage.setItem(KNOWN_ACCOUNTS_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

function removeKnownAccount(emailToRemove: string): KnownAccount[] {
  const next = loadKnownAccounts().filter(
    (a) => a.email.toLowerCase() !== emailToRemove.toLowerCase(),
  );
  try {
    window.localStorage.setItem(KNOWN_ACCOUNTS_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

function getInitials(nameOrEmail: string): string {
  const parts = nameOrEmail.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return nameOrEmail.slice(0, 2).toUpperCase();
}

function normalizeGhanaPhone(raw: string): string | null {
  const cleaned = raw.replace(/\s+/g, '');
  if (!cleaned) return null;
  if (/^\+233\d{9}$/.test(cleaned)) return cleaned;
  if (/^0\d{9}$/.test(cleaned)) return `+233${cleaned.slice(1)}`;
  return null;
}

type BannerState =
  | { kind: 'error'; message: string }
  | { kind: 'unverified'; email: string }
  | { kind: 'suspended'; message: string };

export const AuthFlowPage: React.FC<Props> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const {
    loading: authLoading,
    provisionAccount,
    refreshSessionContext,
    sessionExpired,
    clearSessionExpired,
    signOut,
  } = useAuth();

  const [knownAccounts, setKnownAccounts] = useState<KnownAccount[]>(() =>
    loadKnownAccounts(),
  );
  const [matchedAccount, setMatchedAccount] = useState<KnownAccount | null>(null);
  const [step, setStep] = useState<AuthStep>(() =>
    sessionExpired ? 'sign-in' : 'email',
  );
  const [signUpStage, setSignUpStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [entryMethod, setEntryMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [entryPhone, setEntryPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const redirectParam = searchParams.get('redirect');
  const safeRedirect =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : null;

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      caseMix: /[A-Z]/.test(password) && /[a-z]/.test(password),
      digit: /\d/.test(password),
    }),
    [password],
  );
  const passwordValid =
    passwordChecks.length && passwordChecks.caseMix && passwordChecks.digit;

  const handleContinueEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    if (entryMethod === 'phone') {
      const digits = entryPhone.replace(/\D/g, '');
      if (!/^0\d{9}$/.test(digits)) {
        setFieldErrors({
          phone: 'Please enter a valid 10-digit Ghana phone number (e.g. 024 000 0000).',
        });
        return;
      }
      setFieldErrors({});
      setPhone(entryPhone);
      showToast({
        variant: 'info',
        title: 'SMS OTP launches after sender-ID approval',
        message: 'Your phone number is saved — continue with your email for R1.',
      });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setEmail(trimmedEmail);
    setFieldErrors({});
    setLookupLoading(true);

    const minDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 350);
    });

    try {
      const [result] = await Promise.all([
        apiFetch<LookupResponse>('/auth/lookup', {
          method: 'POST',
          body: JSON.stringify({ email: trimmedEmail }),
        }),
        minDelay,
      ]);

      const knownMatch = knownAccounts.find((a) => a.email === trimmedEmail);
      if (result.exists || knownMatch) {
        const displayName =
          result.displayName?.trim() ||
          knownMatch?.displayName ||
          trimmedEmail.split('@')[0] ||
          trimmedEmail;
        const found: KnownAccount = { email: trimmedEmail, displayName };
        setMatchedAccount(found);
        setKnownAccounts(saveKnownAccount(found));
        setStep('choose-account');
      } else {
        setMatchedAccount(null);
        setStep('sign-up');
      }
    } catch {
      await minDelay;
      setBanner({
        kind: 'error',
        message: 'Unable to check your account right now. Please try again.',
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setBanner(null);
    if (!supabase) {
      setBanner({
        kind: 'error',
        message:
          'Authentication is not configured yet (missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).',
      });
      return;
    }
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setOauthLoading(false);
      setBanner({ kind: 'error', message: error.message });
    }
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

  const validateCredentials = (mode: 'sign-in' | 'sign-up'): boolean => {
    const errors: Record<string, string> = {};
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (mode === 'sign-up') {
      const trimmedName = fullName.trim();
      if (trimmedName.length < 2 || trimmedName.length > 100) {
        errors.fullName = 'Please enter your full name (2–100 characters).';
      }
      if (phone.trim() && !normalizeGhanaPhone(phone)) {
        errors.phone = 'Use a Ghana number like +233241234567 or 0241234567.';
      }
      if (!passwordValid) {
        errors.password = 'Password must meet all requirements below.';
      }
      if (!acceptedTerms) {
        errors.terms =
          'You must agree to the privacy notice and terms to create an account.';
      }
    } else if (!password) {
      errors.password = 'Please enter your password.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    clearSessionExpired();

    if (!validateCredentials('sign-in')) return;

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
        options: {
          captchaToken: TURNSTILE_SITE_KEY ? turnstileToken : undefined,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
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
      let displayName = normalizedEmail.split('@')[0] || normalizedEmail;
      try {
        const ctx = await refreshSessionContext(token);
        homeRoute = resolveHomeRoute(ctx);
        if (ctx?.profile.fullName) {
          displayName = ctx.profile.fullName;
        }
      } catch (apiErr) {
        if (apiErr instanceof ApiClientError && apiErr.status === 403) {
          throw apiErr;
        }
      }
      saveKnownAccount({ email: normalizedEmail, displayName });
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

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    if (!validateCredentials('sign-up')) return;

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
      const normalizedPhone = normalizeGhanaPhone(phone);
      const trimmedName = fullName.trim();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken: TURNSTILE_SITE_KEY ? turnstileToken : undefined,
          data: {
            full_name: trimmedName,
            ...(normalizedPhone ? { phone: normalizedPhone } : {}),
          },
        },
      });

      if (error) {
        setBanner({ kind: 'error', message: error.message });
        return;
      }

      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        const displayName = trimmedName || normalizedEmail.split('@')[0];
        setKnownAccounts(saveKnownAccount({ email: normalizedEmail, displayName }));
        setBanner({
          kind: 'error',
          message: 'An account with this email already exists. Please sign in instead.',
        });
        setStep('choose-account');
        return;
      }

      saveKnownAccount({ email: normalizedEmail, displayName: trimmedName });

      if (data.session?.access_token) {
        let homeRoute = '/';
        try {
          const ctx = await provisionAccount(data.session.access_token);
          homeRoute = resolveHomeRoute(ctx);
        } catch (apiErr) {
          if (apiErr instanceof ApiClientError && apiErr.status === 403) {
            throw apiErr;
          }
        }
        showToast({ variant: 'success', title: 'Welcome to FindStay!' });
        navigate(homeRoute, { replace: true });
        return;
      }

      navigate('/auth/verify', {
        replace: true,
        state: { email: normalizedEmail },
      });
    } catch (err) {
      setBanner({
        kind: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Could not create your account. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const heading =
    step === 'choose-account'
      ? 'Welcome back'
      : step === 'sign-in'
        ? 'Enter your password'
        : step === 'sign-up'
          ? 'Create your account'
          : 'Log in or sign up';

  const subtitle =
    step === 'choose-account'
      ? 'Choose an account to continue to FindStay'
      : step === 'sign-in'
        ? 'Sign in to continue to FindStay.'
        : step === 'sign-up'
          ? signUpStage === 1
            ? 'Enter your email address to get started.'
            : signUpStage === 2
              ? 'Enter your full name.'
              : signUpStage === 3
                ? 'Add your phone number (optional).'
                : signUpStage === 4
                  ? 'Create a strong password.'
                  : 'Review and accept our terms to finish.'
          : 'Find verified stays across Ghana or manage your properties.';

  const emailStepBusy = authLoading || lookupLoading || oauthLoading;
  const emailPrimaryLoading = authLoading || lookupLoading;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-card px-4 py-8 text-earth">
      <div className="w-full max-w-xs text-center">
        <h1 className="font-display text-heading-4 font-semibold text-earth">
          {heading}
        </h1>
        <p className="mt-2 text-caption text-earth/75">{subtitle}</p>

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

        {step === 'choose-account' ? (
          <div
            className={`mt-7 transition-opacity ${
              authLoading ? 'pointer-events-none opacity-50' : ''
            }`}
            aria-busy={authLoading}
          >
            <div className="space-y-2.5">
              {(matchedAccount ? [matchedAccount] : knownAccounts).map((account) => (
                <div
                  key={account.email}
                  className="flex items-center justify-between rounded-2xl border border-olive/30 bg-surface-card p-2.5 text-left transition-colors hover:border-olive hover:bg-olive/5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setBanner(null);
                      setFieldErrors({});
                      setPassword('');
                      setEmail(account.email);
                      setStep('sign-in');
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive text-caption font-bold text-on-brand">
                      {getInitials(account.displayName || account.email)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-caption font-semibold text-earth">
                        Continue as {account.displayName}
                      </span>
                      <span className="block truncate text-micro text-earth/70">
                        {account.email}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${account.email}`}
                    onClick={() => {
                      const next = removeKnownAccount(account.email);
                      setKnownAccounts(next);
                      setMatchedAccount(null);
                      setEmail('');
                      setStep('email');
                    }}
                    className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-earth/55 transition-colors hover:bg-surface-muted hover:text-earth"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border-subtle" />
              <span className="text-micro font-semibold uppercase tracking-wider text-earth/60">
                OR
              </span>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setBanner(null);
                  setFieldErrors({});
                  setMatchedAccount(null);
                  setEmail('');
                  setStep('email');
                }}
                className="inline-flex min-h-touch w-full items-center justify-center rounded-full border border-terracotta/40 bg-surface-card px-6 py-3 text-caption font-medium text-terracotta-dark transition-colors hover:border-terracotta hover:bg-terracotta/5"
              >
                Use another account
              </button>

              <button
                type="button"
                onClick={() => {
                  setBanner(null);
                  setFieldErrors({});
                  setMatchedAccount(null);
                  setEmail('');
                  setStep('sign-up');
                }}
                className="inline-flex min-h-touch w-full items-center justify-center rounded-full bg-terracotta px-6 py-3 text-caption font-semibold text-on-brand transition-colors hover:bg-terracotta-dark"
              >
                Create account
              </button>
            </div>
          </div>
        ) : null}

        {step === 'email' ? (
          <div className="mt-7">
            <form onSubmit={handleContinueEmail} noValidate className="space-y-3.5 text-left">
              {entryMethod === 'email' ? (
                <div>
                  <label htmlFor="auth-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    disabled={emailStepBusy}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    aria-invalid={fieldErrors.email ? 'true' : undefined}
                    className={`min-h-touch w-full rounded-full border bg-surface-card px-5 py-3 text-caption text-earth transition-opacity placeholder:text-earth/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      fieldErrors.email
                        ? 'border-status-error-border bg-status-error-bg/40'
                        : 'border-border-subtle focus:border-olive'
                    }`}
                  />
                  <InlineError id="auth-email-error" message={fieldErrors.email} />
                </div>
              ) : (
                <div>
                  <label htmlFor="auth-phone" className="sr-only">
                    Phone number
                  </label>
                  <input
                    id="auth-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={12}
                    required
                    disabled={emailStepBusy}
                    value={entryPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      const formatted =
                        digits.length <= 3
                          ? digits
                          : digits.length <= 6
                            ? `${digits.slice(0, 3)} ${digits.slice(3)}`
                            : `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
                      setEntryPhone(formatted);
                    }}
                    placeholder="024 000 0000"
                    aria-invalid={fieldErrors.phone ? 'true' : undefined}
                    className={`min-h-touch w-full rounded-full border bg-surface-card px-5 py-3 text-caption text-earth transition-opacity placeholder:text-earth/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      fieldErrors.phone
                        ? 'border-status-error-border bg-status-error-bg/40'
                        : 'border-border-subtle focus:border-olive'
                    }`}
                  />
                  <InlineError id="auth-phone-error" message={fieldErrors.phone} />
                </div>
              )}

              <button
                type="submit"
                disabled={emailStepBusy}
                aria-busy={emailPrimaryLoading}
                className="inline-flex min-h-touch w-full items-center justify-center rounded-full bg-olive px-6 py-3 text-caption font-semibold text-on-brand transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emailPrimaryLoading ? (
                  <Loader
                    className="h-5 w-5 animate-spin"
                    aria-label={authLoading ? 'Loading authentication' : 'Checking account'}
                  />
                ) : (
                  'Continue'
                )}
              </button>
            </form>

            <div
              className={`my-5 flex items-center gap-3 transition-opacity ${
                emailStepBusy ? 'opacity-50' : ''
              }`}
            >
              <div className="h-px flex-1 bg-border-subtle" />
              <span className="text-micro font-semibold uppercase tracking-wider text-earth/60">
                OR
              </span>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={emailStepBusy}
                aria-busy={oauthLoading}
                className="inline-flex min-h-touch w-full items-center justify-center gap-2.5 rounded-full border border-border-subtle bg-surface-card px-6 py-3 text-caption font-medium text-earth transition-colors hover:bg-surface-hover/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {oauthLoading ? (
                  <Loader
                    className="h-4 w-4 animate-spin text-earth"
                    aria-label="Connecting to Google"
                  />
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      {/* theme-lint-ignore: official Google brand mark requires its trademarked 4-color hex palette */}
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                      {/* theme-lint-ignore: official Google brand mark requires its trademarked 4-color hex palette */}
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                      {/* theme-lint-ignore: official Google brand mark requires its trademarked 4-color hex palette */}
                      <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                      {/* theme-lint-ignore: official Google brand mark requires its trademarked 4-color hex palette */}
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={emailStepBusy}
                onClick={() => {
                  setBanner(null);
                  setFieldErrors({});
                  setEmail('');
                  setEntryPhone('');
                  setEntryMethod((prev) => (prev === 'email' ? 'phone' : 'email'));
                }}
                className="inline-flex min-h-touch w-full items-center justify-center gap-2.5 rounded-full border border-border-subtle bg-surface-card px-6 py-3 text-caption font-medium text-earth transition-colors hover:bg-surface-hover/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {entryMethod === 'email' ? (
                  <>
                    <Phone className="h-4 w-4 text-earth/75" aria-hidden="true" />
                    <span>Continue with Phone</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 text-earth/75" aria-hidden="true" />
                    <span>Continue with Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}

        {step === 'sign-in' ? (
          <form onSubmit={handleSignInSubmit} noValidate className="mt-6 space-y-4 text-left">
            {sessionExpired ? (
              <FormField
                id="auth-email-edit"
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
            ) : (
              <div className="flex items-center justify-between rounded-full border border-olive/25 bg-olive/5 px-4 py-2 text-caption">
                <span className="truncate font-medium text-earth">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setBanner(null);
                    setFieldErrors({});
                    setStep('email');
                  }}
                  className="ml-2 shrink-0 font-semibold text-terracotta-dark hover:underline"
                >
                  Change
                </button>
              </div>
            )}

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
                  state={{ email }}
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
                  disabled={submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={fieldErrors.password ? 'true' : undefined}
                  className={`min-h-touch w-full rounded-full border bg-surface-card px-4 py-2 pr-12 text-body-2 text-earth focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    fieldErrors.password
                      ? 'border-status-error-border bg-status-error-bg/40 focus:ring-status-error-border/20'
                      : 'border-border-subtle focus:border-olive focus:ring-olive/15'
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
              aria-busy={submitting}
              className="inline-flex min-h-touch w-full items-center justify-center rounded-full bg-olive px-6 py-3 text-caption font-semibold text-on-brand transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader className="h-5 w-5 animate-spin" aria-label="Signing in" />
              ) : (
                'Sign in'
              )}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setBanner(null);
                setFieldErrors({});
                setStep(matchedAccount ? 'choose-account' : 'email');
              }}
              className="inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-earth/75 transition-colors hover:bg-surface-hover/50 hover:text-earth disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>
          </form>
        ) : null}

        {step === 'sign-up' ? (
          <form
            onSubmit={(e) => {
              if (signUpStage < 5) {
                e.preventDefault();
                setBanner(null);
                setFieldErrors({});
                if (signUpStage === 1) {
                  const trimmedEmail = email.trim().toLowerCase();
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
                    setFieldErrors({ email: 'Please enter a valid email address.' });
                    return;
                  }
                  setEmail(trimmedEmail);
                  setSignUpStage(2);
                } else if (signUpStage === 2) {
                  if (!fullName.trim()) {
                    setFieldErrors({ fullName: 'Please enter your full name.' });
                    return;
                  }
                  setSignUpStage(3);
                } else if (signUpStage === 3) {
                  const digits = phone.replace(/\D/g, '');
                  if (digits && !/^0\d{9}$/.test(digits)) {
                    setFieldErrors({
                      phone: 'Enter a valid 10-digit Ghana phone number (e.g. 024 000 0000).',
                    });
                    return;
                  }
                  setSignUpStage(4);
                } else if (signUpStage === 4) {
                  if (!passwordValid) {
                    setFieldErrors({
                      password: 'Password must be at least 8 characters with upper/lowercase and a number.',
                    });
                    return;
                  }
                  if (password !== confirmPassword) {
                    setFieldErrors({
                      confirmPassword: 'Passwords do not match.',
                    });
                    return;
                  }
                  setSignUpStage(5);
                }
                return;
              }
              void handleSignUpSubmit(e);
            }}
            noValidate
            className="mt-6 space-y-4 text-left"
          >
            {signUpStage === 1 ? (
              <div>
                <input
                  id="signup-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  aria-label="Email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ama@example.com"
                  aria-invalid={fieldErrors.email ? 'true' : undefined}
                  className={`min-h-touch w-full rounded-full border bg-surface-card px-4 py-3 text-body-2 text-earth placeholder:text-earth/45 focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-status-error-border bg-status-error-bg/40 focus:ring-status-error-border/20'
                      : 'border-border-subtle focus:border-olive focus:ring-olive/15'
                  }`}
                />
                <InlineError id="signup-email-error" message={fieldErrors.email} />
              </div>
            ) : null}

            {signUpStage === 2 ? (
              <div>
                <input
                  id="signup-full-name"
                  type="text"
                  autoComplete="name"
                  aria-label="Full name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ama Mensah"
                  aria-invalid={fieldErrors.fullName ? 'true' : undefined}
                  className={`min-h-touch w-full rounded-full border bg-surface-card px-4 py-3 text-body-2 text-earth placeholder:text-earth/45 focus:outline-none focus:ring-2 ${
                    fieldErrors.fullName
                      ? 'border-status-error-border bg-status-error-bg/40 focus:ring-status-error-border/20'
                      : 'border-border-subtle focus:border-olive focus:ring-olive/15'
                  }`}
                />
                <InlineError id="signup-full-name-error" message={fieldErrors.fullName} />
              </div>
            ) : null}

            {signUpStage === 3 ? (
              <div>
                <input
                  id="signup-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  aria-label="Phone number (optional)"
                  maxLength={12}
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    const formatted =
                      digits.length <= 3
                        ? digits
                        : digits.length <= 6
                          ? `${digits.slice(0, 3)} ${digits.slice(3)}`
                          : `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
                    setPhone(formatted);
                  }}
                  placeholder="024 000 0000 (optional)"
                  aria-invalid={fieldErrors.phone ? 'true' : undefined}
                  className={`min-h-touch w-full rounded-full border bg-surface-card px-4 py-3 text-body-2 text-earth placeholder:text-earth/45 focus:outline-none focus:ring-2 ${
                    fieldErrors.phone
                      ? 'border-status-error-border bg-status-error-bg/40 focus:ring-status-error-border/20'
                      : 'border-border-subtle focus:border-olive focus:ring-olive/15'
                  }`}
                />
                <InlineError id="signup-phone-error" message={fieldErrors.phone} />
              </div>
            ) : null}

            {signUpStage === 4 ? (
              <div>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-label="Password"
                    placeholder="Enter a strong password"
                    required
                    disabled={submitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={fieldErrors.password ? 'true' : undefined}
                    className={`min-h-touch w-full rounded-full border px-4 py-3 pr-12 text-body-2 text-earth placeholder:text-earth/45 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${(() => {
                      if (fieldErrors.password) {
                        return 'border-status-error-border bg-status-error-bg/40 focus:ring-status-error-border/20';
                      }
                      if (password.length === 0) {
                        return 'border-border-subtle bg-surface-card focus:border-olive focus:ring-olive/15';
                      }
                      const score = [
                        passwordChecks.length,
                        passwordChecks.caseMix,
                        passwordChecks.digit,
                      ].filter(Boolean).length;
                      if (score === 3) {
                        return 'border-olive bg-status-success-bg/30 focus:border-olive focus:ring-olive/20';
                      }
                      if (score === 2) {
                        return 'border-status-warning-border bg-status-warning-bg/25 focus:border-status-warning-border focus:ring-status-warning-border/20';
                      }
                      return 'border-status-error-border bg-status-error-bg/20 focus:border-status-error-border focus:ring-status-error-border/20';
                    })()}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 inline-flex min-h-touch min-w-touch -translate-y-1/2 items-center justify-center rounded-full text-earth/70 hover:text-earth"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <InlineError id="signup-password-error" message={fieldErrors.password} />

                <div className="mt-3">
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-label="Confirm password"
                    placeholder="Confirm your password"
                    required
                    disabled={submitting}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={fieldErrors.confirmPassword ? 'true' : undefined}
                    className={`min-h-touch w-full rounded-full border px-4 py-3 text-body-2 text-earth placeholder:text-earth/45 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      fieldErrors.confirmPassword
                        ? 'border-status-error-border bg-status-error-bg/40 focus:ring-status-error-border/20'
                        : confirmPassword.length === 0
                          ? 'border-border-subtle bg-surface-card focus:border-olive focus:ring-olive/15'
                          : confirmPassword === password
                            ? 'border-olive bg-status-success-bg/30 focus:border-olive focus:ring-olive/20'
                            : 'border-status-error-border bg-status-error-bg/20 focus:border-status-error-border focus:ring-status-error-border/20'
                    }`}
                  />
                  <InlineError id="signup-confirm-password-error" message={fieldErrors.confirmPassword} />
                </div>
              </div>
            ) : null}

            {signUpStage === 5 ? (
              <>
                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-caption text-earth">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-border-subtle accent-olive"
                    />
                    <span>
                      I agree to the FindStay Terms of Service and consent to data processing
                      under the{' '}
                      <Link
                        to="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-olive underline"
                      >
                        Ghana Data Protection Act (Act 843) Privacy Notice
                      </Link>
                      .
                    </span>
                  </label>
                  <InlineError id="signup-terms-error" message={fieldErrors.terms} />
                </div>

                <TurnstileWidget
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                />
              </>
            ) : null}

            <button
              type="submit"
              disabled={signUpStage === 5 && (submitting || !turnstileToken)}
              aria-busy={submitting}
              className="inline-flex min-h-touch w-full items-center justify-center rounded-full bg-olive px-6 py-3 text-caption font-semibold text-on-brand transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader className="h-5 w-5 animate-spin" aria-label="Creating account" />
              ) : signUpStage < 5 ? (
                'Continue'
              ) : (
                'Create account'
              )}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setBanner(null);
                setFieldErrors({});
                if (signUpStage > 1) {
                  setSignUpStage((s) => (s - 1) as 1 | 2 | 3 | 4 | 5);
                } else {
                  setStep(matchedAccount ? 'choose-account' : 'email');
                }
              }}
              className="inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-earth/75 transition-colors hover:bg-surface-hover/50 hover:text-earth disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>
          </form>
        ) : null}

        {step !== 'sign-up' ? (
          <p className="mt-6 border-t border-border-subtle/60 pt-4 text-micro leading-relaxed text-earth/65">
            By continuing, you agree to FindStay&apos;s{' '}
            <span className="font-medium text-earth/85">Terms of Service</span> and{' '}
            <span className="font-medium text-earth/85">Privacy Notice</span> under the Ghana Data
            Protection Act (Act 843).
          </p>
        ) : null}
      </div>
    </div>
  );
};
