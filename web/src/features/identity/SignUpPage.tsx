import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/logo.jpeg';
import { FormField, InlineError, useToast } from '../../components/ui';
import { ApiClientError } from '../../lib/api';
import { supabase, TURNSTILE_SITE_KEY } from '../../lib/supabase';
import { resolveHomeRoute, useAuth } from './AuthContext';
import { TurnstileWidget } from './TurnstileWidget';

function normalizeGhanaPhone(raw: string): string | null {
  const cleaned = raw.replace(/\s+/g, '');
  if (!cleaned) return null;
  if (/^\+233\d{9}$/.test(cleaned)) return cleaned;
  if (/^0\d{9}$/.test(cleaned)) return `+233${cleaned.slice(1)}`;
  return null;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { provisionAccount } = useAuth();

  const [step, setStep] = useState<'email' | 'details'>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const handleContinueEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    setEmail(trimmedEmail);
    setFieldErrors({});
    setStep('details');
  };

  const handleGoogleSignUp = async () => {
    setFormError(null);
    if (!supabase) {
      setFormError(
        'Authentication is not configured yet (missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).',
      );
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setFormError(error.message);
    }
  };

  const validateDetails = (): boolean => {
    const errors: Record<string, string> = {};
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateDetails()) return;

    if (!supabase) {
      setFormError(
        'Authentication is not configured yet (missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).',
      );
      return;
    }

    if (!turnstileToken) {
      setFormError('Please complete the verification check before continuing.');
      return;
    }

    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPhone = normalizeGhanaPhone(phone);

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken: TURNSTILE_SITE_KEY ? turnstileToken : undefined,
          data: {
            full_name: fullName.trim(),
            ...(normalizedPhone ? { phone: normalizedPhone } : {}),
          },
        },
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setFormError(
          'An account with this email already exists. Try signing in instead.',
        );
        return;
      }

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
      setFormError(
        err instanceof Error ? err.message : 'Could not create your account. Please try again.',
      );
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
          Create your account
        </h1>
        <p className="mt-2 text-body-2 text-earth/75">
          Book verified stays across Ghana or manage your properties.
        </p>

        {formError ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-status-error-border bg-status-error-bg px-4 py-3 text-left text-body-2 text-status-error-fg"
          >
            {formError}
          </div>
        ) : null}

        {step === 'email' ? (
          <div className="mt-6">
            <form onSubmit={handleContinueEmail} noValidate className="space-y-4 text-left">
              <div>
                <label htmlFor="signup-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  aria-invalid={fieldErrors.email ? 'true' : undefined}
                  className={`min-h-touch w-full rounded-full border bg-surface-card px-5 py-3 text-body-2 text-earth placeholder:text-earth/50 focus:outline-none ${
                    fieldErrors.email
                      ? 'border-status-error-border bg-status-error-bg/40'
                      : 'border-border-subtle focus:border-olive'
                  }`}
                />
                <InlineError id="signup-email-error" message={fieldErrors.email} />
              </div>

              <button
                type="submit"
                className="min-h-touch w-full rounded-full bg-olive px-6 py-3 text-body-2 font-semibold text-on-brand transition-colors hover:bg-olive-hover"
              >
                Continue
              </button>
            </form>

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
                onClick={handleGoogleSignUp}
                className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-card px-6 py-3 text-body-2 font-medium text-earth transition-colors hover:bg-surface-hover/50"
              >
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  showToast({
                    variant: 'info',
                    title: 'Email sign-up is active for R1',
                    message: 'Enter your email above; optional Ghana phone number is added on the next step.',
                  })
                }
                className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-card px-6 py-3 text-body-2 font-medium text-earth transition-colors hover:bg-surface-hover/50"
              >
                <Phone className="h-4 w-4 text-earth/75" aria-hidden="true" />
                <span>Continue with phone</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 text-left">
            <div className="flex items-center justify-between rounded-full border border-border-subtle bg-surface-muted px-4 py-2 text-caption">
              <span className="truncate font-medium text-earth">{email}</span>
              <button
                type="button"
                onClick={() => {
                  setFieldErrors({});
                  setStep('email');
                }}
                className="ml-2 shrink-0 font-semibold text-terracotta hover:underline"
              >
                Change
              </button>
            </div>

            <FormField
              id="signup-full-name"
              label="Full name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ama Mensah"
              error={fieldErrors.fullName}
            />

            <FormField
              id="signup-phone"
              label="Phone number (optional)"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 24 123 4567"
              hint="Ghana E.164 (+233XXXXXXXXX) or local 0XXXXXXXXX."
              error={fieldErrors.phone}
            />

            <div>
              <label
                htmlFor="signup-password"
                className="mb-1 block text-caption font-semibold text-earth"
              >
                Password <span className="text-terracotta-dark" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
              <InlineError id="signup-password-error" message={fieldErrors.password} />

              <ul className="mt-2 space-y-1 text-caption">
                {[
                  { ok: passwordChecks.length, text: 'At least 8 characters' },
                  { ok: passwordChecks.caseMix, text: 'Uppercase & lowercase letters' },
                  { ok: passwordChecks.digit, text: 'At least 1 number' },
                ].map((item) => (
                  <li
                    key={item.text}
                    className={`flex items-center gap-1.5 ${
                      item.ok ? 'font-medium text-status-success-fg' : 'text-earth/70'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

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
                  under the Ghana Data Protection Act (Act 843).
                </span>
              </label>
              <InlineError id="signup-terms-error" message={fieldErrors.terms} />
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
              {submitting ? 'Creating account...' : 'Create account'}
            </button>

            <button
              type="button"
              onClick={() => {
                setFieldErrors({});
                setStep('email');
              }}
              className="inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-earth/75 transition-colors hover:bg-surface-hover/50 hover:text-earth"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>
          </form>
        )}

        <p className="mt-6 text-caption text-earth/75">
          Already have an account?{' '}
          <Link to="/auth/sign-in" className="underline hover:text-earth">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-micro text-earth/60">
          By continuing, you agree to FindStay&apos;s Terms of Service and Privacy Notice
          under the Ghana Data Protection Act (Act 843).
        </p>
      </div>
    </div>
  );
};
