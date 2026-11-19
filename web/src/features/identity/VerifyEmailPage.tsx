import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui';
import { supabase } from '../../lib/supabase';

const COOLDOWN_SECONDS = 60;

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const stateEmail =
    (location.state as { email?: string } | null)?.email ?? '';
  const [email] = useState(stateEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otp = otpDigits.join('');
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || verifying) return;
    setVerifying(true);
    try {
      if (supabase && email) {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'signup',
        });
        if (error) {
          showToast({ variant: 'error', title: 'Invalid code', message: error.message });
          return;
        }
      } else if (import.meta.env.DEV) {
        await new Promise((r) => window.setTimeout(r, 400));
      }
      showToast({ variant: 'success', title: 'Email verified' });
      navigate('/', { replace: true });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!supabase || !email || cooldown > 0) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        showToast({ variant: 'error', title: 'Could not resend', message: error.message });
      } else {
        showToast({ variant: 'success', title: 'Verification email sent' });
        setCooldown(COOLDOWN_SECONDS);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive/10 text-olive">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="mt-5 font-display text-heading-2 text-earth">
          Code Verification
        </h1>
        <p className="mt-2 text-caption text-earth/70">
          We have sent a code to{' '}
          <span className="font-semibold text-olive">
            {email || 'your email'}
          </span>
        </p>

        <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
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
                  if (val && idx < 5) {
                    otpRefs.current[idx + 1]?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && idx > 0) {
                    otpRefs.current[idx - 1]?.focus();
                  }
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData
                    .getData('text')
                    .replace(/\D/g, '')
                    .slice(0, 6);
                  if (!pasted) return;
                  e.preventDefault();
                  const next = ['', '', '', '', '', ''];
                  for (let i = 0; i < pasted.length; i++) {
                    next[i] = pasted[i];
                  }
                  setOtpDigits(next);
                  const focusIdx = Math.min(pasted.length, 5);
                  otpRefs.current[focusIdx]?.focus();
                }}
                className="min-h-touch w-full rounded-full border border-border-subtle bg-surface-card text-center text-body-2 font-semibold text-earth focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/15"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={verifying || otp.length !== 6}
            className="min-h-touch w-full rounded-full bg-olive px-6 py-3 text-caption font-semibold text-on-brand transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <p className="mt-10 text-caption text-earth/70">
          Didn&apos;t receive code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0 || !email}
            className="font-semibold text-olive hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend (${cooldown}s)` : resending ? 'Sending...' : 'Resend'}
          </button>
        </p>

        <div className="mt-4">
          <Link
            to="/auth/sign-in"
            className="inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-earth/75 transition-colors hover:bg-surface-hover/50 hover:text-earth"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
