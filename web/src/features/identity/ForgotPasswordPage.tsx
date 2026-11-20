import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { InlineError, useToast } from '../../components/ui';
import { supabase } from '../../lib/supabase';

const COOLDOWN_SECONDS = 60;

export const ForgotPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const initialEmail = (location.state as { email?: string } | null)?.email ?? '';
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otp = otpDigits.join('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const passwordChecks = {
    length: password.length >= 8,
    caseMix: /[a-z]/.test(password) && /[A-Z]/.test(password),
    digit: /\d/.test(password),
  };
  const passwordValid =
    passwordChecks.length && passwordChecks.caseMix && passwordChecks.digit;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    setEmail(trimmed);
    setSubmitting(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
        if (error) {
          setErrors({ email: error.message });
          return;
        }
      }
      setCooldown(COOLDOWN_SECONDS);
      setStage(2);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || submitting) return;
    setSubmitting(true);
    try {
      if (supabase && email) {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'recovery',
        });
        if (error) {
          showToast({ variant: 'error', title: 'Invalid code', message: error.message });
          return;
        }
      }
      setStage(3);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!passwordValid) {
      setErrors({
        password: 'Password must be at least 8 characters with upper/lowercase and a number.',
      });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }
    setSubmitting(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setErrors({ password: error.message });
          return;
        }
      }
      showToast({ variant: 'success', title: 'Password updated', message: 'You can now sign in.' });
      navigate('/auth/sign-in', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    if (supabase) {
      await supabase.auth.resetPasswordForEmail(email);
    }
    showToast({ variant: 'success', title: 'Reset code sent' });
    setCooldown(COOLDOWN_SECONDS);
  };

  const heading =
    stage === 1
      ? 'Reset your password'
      : stage === 2
        ? 'Code Verification'
        : 'Create a new password';

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive/10 text-olive">
          <KeyRound className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="mt-5 font-display text-heading-3 text-earth">{heading}</h1>

        {stage === 1 ? (
          <>
            <p className="mt-2 text-caption text-earth/70">
              Enter your email address to receive a reset code.
            </p>
            <form onSubmit={handleSendCode} noValidate className="mt-6 space-y-4 text-left">
              <div>
                <input
                  id="forgot-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  aria-label="Email address"
                  placeholder="ama@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={errors.email ? 'true' : undefined}
                  className={`min-h-touch w-full rounded-full border bg-surface-card px-4 py-3 text-body-2 text-earth placeholder:text-earth/45 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-status-error-border bg-status-error-bg/40 focus:ring-status-error-border/20'
                      : 'border-border-subtle focus:border-olive focus:ring-olive/15'
                  }`}
                />
                <InlineError id="forgot-email-error" message={errors.email} />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-touch w-full items-center justify-center rounded-full bg-olive px-6 py-3 text-caption font-semibold text-on-brand transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader className="h-5 w-5 animate-spin" /> : 'Continue'}
              </button>

              <Link
                to="/auth/sign-in"
                className="inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-earth/75 transition-colors hover:bg-surface-hover/50 hover:text-earth"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </Link>
            </form>
          </>
        ) : null}

        {stage === 2 ? (
          <>
            <p className="mt-2 text-caption text-earth/70">
              We have sent a code to{' '}
              <span className="font-semibold text-olive">{email}</span>
            </p>
            <form onSubmit={handleVerifyCode} className="mt-6 space-y-5">
              <div className="grid grid-cols-6 gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${idx + 1}`}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(-1);
                      const next = [...otpDigits];
                      next[idx] = val;
                      setOtpDigits(next);
                      if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && idx > 0) {
                        otpRefs.current[idx - 1]?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      if (!pasted) return;
                      e.preventDefault();
                      const next = ['', '', '', '', '', ''];
                      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
                      setOtpDigits(next);
                      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
                    }}
                    className="min-h-touch w-full rounded-full border border-border-subtle bg-surface-card text-center text-body-2 font-semibold text-earth focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/15"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length !== 6}
                className="inline-flex min-h-touch w-full items-center justify-center rounded-full bg-olive px-6 py-3 text-caption font-semibold text-on-brand transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <p className="mt-8 text-caption text-earth/70">
              Didn&apos;t receive code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0}
                className="font-semibold text-olive hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
              </button>
            </p>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setStage(1)}
                className="inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-earth/75 transition-colors hover:bg-surface-hover/50 hover:text-earth"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </button>
            </div>
          </>
        ) : null}

        {stage === 3 ? (
          <>
            <p className="mt-2 text-caption text-earth/70">
              Choose a strong password for your account.
            </p>
            <form onSubmit={handleResetPassword} noValidate className="mt-6 space-y-4 text-left">
              <div>
                <div className="relative">
                  <input
                    id="forgot-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-label="New password"
                    placeholder="Enter a strong password"
                    required
                    disabled={submitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={errors.password ? 'true' : undefined}
                    className={`min-h-touch w-full rounded-full border px-4 py-3 pr-12 text-body-2 text-earth placeholder:text-earth/45 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${(() => {
                      if (errors.password) {
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
                <InlineError id="forgot-password-error" message={errors.password} />

                <div className="mt-3">
                  <input
                    id="forgot-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-label="Confirm new password"
                    placeholder="Confirm your password"
                    required
                    disabled={submitting}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={errors.confirmPassword ? 'true' : undefined}
                    className={`min-h-touch w-full rounded-full border px-4 py-3 text-body-2 text-earth placeholder:text-earth/45 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.confirmPassword
                        ? 'border-status-error-border bg-status-error-bg/40 focus:ring-status-error-border/20'
                        : confirmPassword.length === 0
                          ? 'border-border-subtle bg-surface-card focus:border-olive focus:ring-olive/15'
                          : confirmPassword === password
                            ? 'border-olive bg-status-success-bg/30 focus:border-olive focus:ring-olive/20'
                            : 'border-status-error-border bg-status-error-bg/20 focus:border-status-error-border focus:ring-status-error-border/20'
                    }`}
                  />
                  <InlineError
                    id="forgot-confirm-password-error"
                    message={errors.confirmPassword}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-touch w-full items-center justify-center rounded-full bg-olive px-6 py-3 text-caption font-semibold text-on-brand transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader className="h-5 w-5 animate-spin" /> : 'Reset password'}
              </button>

              <button
                type="button"
                onClick={() => setStage(2)}
                className="inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-earth/75 transition-colors hover:bg-surface-hover/50 hover:text-earth"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
};
